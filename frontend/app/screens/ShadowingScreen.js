import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  ScrollView,
} from 'react-native';
import {
  loadSpeakingAttempts,
  persistSpeakingAttempt,
  filterAttempts,
  useSpeakingSession,
  setSpeakingTurnUserTranscript,
  setSpeakingTurnAiTranscript,
  advanceSpeakingTurn,
  completeSpeakingSession,
} from '../utils/speakingAttempts';
import { Audio } from 'expo-av';
import Background from '../components/ui/Background';
import MicButton from '../components/MicButton';
import { useVoiceStreaming } from '../hooks/useVoiceStreaming';
import { useVoice } from '../hooks/useVoice';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import SpeakingDebugPanel from '../components/dev/SpeakingDebugPanel';
import { extractTargetUtterance, splitIntoChunks, diffWords } from '../utils/shadowingDiff';
import { getRubricExplanation, getRubricLabel, normalizeRubricDimension } from '../utils/feedbackRubric';
import { generateSpeakingTurn } from '../utils/speakingTurnEngine';

const LEVELS = ['All', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const MODES = ['All', 'Mode A', 'Mode B', 'Mode C', 'Mode D'];
const DATE_FILTERS = ['All', 'Last 24h', 'Last 7d'];

const PROMPTS = [
  {
    id: 'shadow_greeting',
    level: 'A1',
    text: 'Hei! Toista perässä: "Minun nimeni on Alex ja olen valmistautumassa kokeeseen."',
  },
  {
    id: 'shadow_order',
    level: 'A1',
    text: 'Puhu: "Haluaisin ystävällisesti kupillisen kahvia ja pieneen valkoiseen maitoa."',
  },
  {
    id: 'shadow_directions',
    level: 'A2',
    text: 'Kerro: "Mene suoraan, käänny vasemmalle sillan jälkeen ja apteekki on oikealla."',
  },
  {
    id: 'shadow_shop',
    level: 'B1',
    text: 'Kuvaile: "Ostin uuden takin, koska vanha oli liian pieni, mutta myyjä auttoi hyvin."',
  },
  {
    id: 'shadow_story',
    level: 'B2',
    text: 'Kerro lyhyesti: "Kerro ystävälle, mitä teit viikonloppuna ja miksi se oli tärkeä."',
  },
  {
    id: 'shadow_reflect',
    level: 'C1',
    text: 'Puhu: "Kerro tilanteesta, jossa jouduit muuttamaan suunnitelmia ja mitä opit siitä."',
  },
];

// `extractTargetUtterance`, `splitIntoChunks`, `diffWords` live in `../utils/shadowingDiff` for testability.

const formatDuration = (ms = 0) => {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, '0')}`;
};

const formatTimestamp = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
};

const buildFeedbackLabel = (dimension) =>
  `${getRubricLabel(normalizeRubricDimension(dimension))} focus`;

export default function ShadowingScreen() {
  const sessionId = useMemo(() => `shadowing:${Date.now()}`, []);
  const session = useSpeakingSession(sessionId, { maxTurns: 5, autoStart: true });
  const sessionStatus = session?.status || 'idle';
  const promptIndex = session?.currentTurnIndex || 0;
  const currentTurn = session?.turns?.[promptIndex] || null;
  const transcript = currentTurn?.userSpeech?.transcript || '';
  const aiReply = currentTurn?.aiSpeech?.transcript || '';
  const [reviewTurnIndex, setReviewTurnIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Hold to talk');
  const [feedback, setFeedback] = useState(null);
  const [shadowingDiff, setShadowingDiff] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessingAttempt, setIsProcessingAttempt] = useState(false);
  const [feedbackExpanded, setFeedbackExpanded] = useState(false);
  const [history, setHistory] = useState([]);
  const [levelFilter, setLevelFilter] = useState('All');
  const [modeFilter, setModeFilter] = useState('Mode D');
  const [needsPractice, setNeedsPractice] = useState(false);
  const [dateFilter, setDateFilter] = useState('All');
  const [micPermission, setMicPermission] = useState('unknown');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [lowConfidenceWarning, setLowConfidenceWarning] = useState(false);
  const [aiPlaying, setAiPlaying] = useState(false);
  const [ttsFailure, setTtsFailure] = useState(null);
  const [debugInfo, setDebugInfo] = useState({
    micPermission: 'unknown',
    recordingState: 'idle',
    sttRequests: 0,
    ttsRequests: 0,
    lastTranscript: '',
    lastAiReply: '',
    playbackState: 'idle',
    errorLog: null,
  });

  const recordingStartRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const { speak, error: ttsError } = useVoice();

  const currentPrompt = useMemo(() => PROMPTS[promptIndex], [promptIndex]);
  const targetUtterance = useMemo(
    () => extractTargetUtterance(currentPrompt?.text),
    [currentPrompt?.text],
  );
  const targetChunks = useMemo(() => splitIntoChunks(targetUtterance), [targetUtterance]);

  const updateDebug = useCallback((updater) => {
    setDebugInfo((prev) =>
      typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
    );
  }, []);

  useEffect(() => {
    if (ttsError) {
      setTtsFailure(ttsError.message || 'TTS playback failed.');
      updateDebug({ errorLog: ttsError.message || 'TTS playback failed.' });
    } else {
      setTtsFailure(null);
      updateDebug({ errorLog: null });
    }
  }, [ttsError, updateDebug]);

  useEffect(() => {
    updateDebug({ errorLog: error });
  }, [error, updateDebug]);

  const handlePermissionStatus = useCallback(async () => {
    try {
      const status = await Audio.getPermissionsAsync();
      setMicPermission(status.status);
      updateDebug({ micPermission: status.status });
    } catch (err) {
      setMicPermission('unknown');
      updateDebug({ micPermission: 'unknown' });
    }
  }, []);

  useEffect(() => {
    handlePermissionStatus();
  }, [handlePermissionStatus]);

  useEffect(() => {
    (async () => {
      const stored = await loadSpeakingAttempts();
      setHistory(stored);
    })();
  }, []);

  const persistAttempt = useCallback(
    async (attempt) => {
      const updated = await persistSpeakingAttempt(attempt);
      if (updated) {
        setHistory(updated);
      }
    },
    []
  );

  const handleVoiceState = useCallback(
    (state) => {
      if (state.isRecording) {
        updateDebug({ recordingState: 'recording' });
        setStatusMessage('Listening…');
      } else if (state.isProcessing) {
        updateDebug({ recordingState: 'processing' });
        setStatusMessage('Transcribing…');
      } else if (state.isSpeaking || aiPlaying) {
        updateDebug({ recordingState: 'speaking', playbackState: 'playing' });
        setStatusMessage('Playing AI voice…');
      } else {
        updateDebug({ recordingState: 'idle', playbackState: 'idle' });
        setStatusMessage('Hold to talk');
      }
    },
    [aiPlaying, updateDebug]
  );

  const handleTranscriptComplete = useCallback(
    async (sttText, sttMeta) => {
      if (sessionStatus === 'completed') return;
      const normalized = (sttText || '').trim();
      if (!normalized) {
        setError('Käytät hiljaisuutta. Yritä uudestaan');
        return;
      }
      const diffResult = diffWords(targetUtterance, normalized);
      setShadowingDiff(diffResult);
      updateDebug((prev) => ({
        ...prev,
        sttRequests: prev.sttRequests + 1,
        lastTranscript: normalized,
      }));
      setStatusMessage('Transcribed');
      setError(null);
      setFeedbackExpanded(false);
      setLowConfidenceWarning(false);
      const attemptDuration = recordingStartRef.current
        ? Date.now() - recordingStartRef.current
        : 0;
      setRecordingDuration(attemptDuration);
      setIsProcessingAttempt(true);

      try {
        const answer = generateSpeakingTurn({
          user_transcript: normalized,
          level: currentPrompt.level,
          mode: 'shadowing',
          user_state: {
            mode_tag: 'shadowing',
            target_text: targetUtterance,
            prompt_id: currentPrompt.id,
            history,
          },
        });
        setSpeakingTurnUserTranscript(sessionId, promptIndex, normalized);
        setSpeakingTurnAiTranscript(sessionId, promptIndex, answer.ai_reply_fi, {
          isConclusive: promptIndex >= 4,
        });
        const tunedFeedback = {
          ...(answer.feedback || {}),
          better_version_fi: targetUtterance,
        };
        setFeedback(tunedFeedback);
        const lowConfidence = answer.flags?.low_confidence_stt ?? false;
        setLowConfidenceWarning(lowConfidence);
        updateDebug({ errorLog: lowConfidence ? 'low STT confidence' : null });
        const missingWords = diffResult?.targetOut
          ? diffResult.targetOut.filter((t) => t.status === 'missing').map((t) => t.word)
          : [];
        const extraWords = diffResult?.spokenOut
          ? diffResult.spokenOut.filter((t) => t.status === 'extra').map((t) => t.word)
          : [];
        const diffSummary = {
          score: diffResult?.score ?? 0,
          matches: diffResult?.matches ?? 0,
          targetCount: diffResult?.targetCount ?? 0,
          missingCount: missingWords.length,
          extraCount: extraWords.length,
          missingSample: missingWords.slice(0, 8),
          extraSample: extraWords.slice(0, 8),
        };
        const attemptRecord = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          user_audio_url: '',
          transcript: normalized,
          stt: { text: normalized, meta: sttMeta },
          target_text: targetUtterance,
          ai_reply_text: answer.ai_reply_fi,
          feedback: tunedFeedback,
          level_tag: currentPrompt.level,
          mode: 'shadowing',
          mode_tag: 'shadowing',
          diff_summary: diffSummary,
          duration_ms: attemptDuration,
          timestamp: Date.now(),
          low_confidence_stt: answer.flags?.low_confidence_stt ?? false,
          needs_practice:
            answer.level_adjustment === 'down' || (answer.flags?.low_confidence_stt ?? false),
          audio_duration_ms: attemptDuration,
          recording_state: 'complete',
          prompt_id: currentPrompt.id,
        };
        await persistAttempt(attemptRecord);
        if (answer.ai_reply_fi && sessionStatus !== 'completed') {
          setAiPlaying(true);
          await speakWithDebug(answer.ai_reply_fi, 'conversation');
          setAiPlaying(false);
        }
        if (promptIndex >= 4) {
          completeSpeakingSession(sessionId);
        }
      } catch (err) {
        setError(err?.message || 'Jokin meni pieleen. Yritä myöhemmin.');
      } finally {
        setIsProcessingAttempt(false);
      }
    },
    [currentPrompt, history, persistAttempt, promptIndex, sessionId, sessionStatus, speakWithDebug, targetUtterance]
  );

  const {
    isRecording,
    isProcessing,
    isListening,
    isSpeaking: isStreamingSpeaking,
    startRecording,
    stopRecording,
  } =
    useVoiceStreaming({
      onStateChange: handleVoiceState,
      onTranscriptComplete: handleTranscriptComplete,
      vadSilenceThreshold: 2000,
    });

  useEffect(() => {
    if (sessionStatus !== 'completed') return;
    try {
      stopRecording?.();
    } catch (_) {
      // ignore
    }
  }, [sessionStatus, stopRecording]);

  if (sessionStatus === 'completed') {
    const turns = session?.turns || [];
    const idx = Math.max(0, Math.min(turns.length - 1, reviewTurnIndex));
    const turn = turns[idx] || null;
    return (
      <Background module="practice" variant="brown">
        <View style={styles.reviewContainer}>
          <View style={styles.reviewCard}>
            <Text style={styles.reviewCardLabel}>Tekoäly</Text>
            <Text style={styles.reviewCardText}>{turn?.aiSpeech?.transcript || '—'}</Text>
          </View>
          <View style={styles.reviewCard}>
            <Text style={styles.reviewCardLabel}>Sinä</Text>
            <Text style={styles.reviewCardText}>{turn?.userSpeech?.transcript || '—'}</Text>
          </View>
          <View style={styles.reviewControls}>
            <TouchableOpacity
              style={[styles.nextButton, { flex: 1, marginRight: 8, opacity: idx === 0 ? 0.5 : 1 }]}
              disabled={idx === 0}
              onPress={() => setReviewTurnIndex((n) => Math.max(0, n - 1))}
            >
              <Text style={styles.nextLabel}>Edellinen</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.nextButton, { flex: 1, marginLeft: 8, opacity: idx >= turns.length - 1 ? 0.5 : 1 }]}
              disabled={idx >= turns.length - 1}
              onPress={() => setReviewTurnIndex((n) => Math.min(turns.length - 1, n + 1))}
            >
              <Text style={styles.nextLabel}>Seuraava</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Background>
    );
  }

  const speakWithDebug = useCallback(
    async (text, voice) => {
      updateDebug((prev) => ({
        ...prev,
        ttsRequests: prev.ttsRequests + 1,
        lastAiReply: text,
        playbackState: 'queued',
      }));
      await speak(text, voice);
      updateDebug({ playbackState: 'idle' });
    },
    [speak, updateDebug]
  );

  const handleRecordStart = () => {
    recordingStartRef.current = Date.now();
    recordingTimerRef.current = setInterval(() => {
      if (recordingStartRef.current) {
        setRecordingDuration(Date.now() - recordingStartRef.current);
      }
    }, 400);
    startRecording?.({ userInitiated: true, userGesture: true });
  };

  const handleRecordEnd = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    stopRecording?.();
  };

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  const playPrompt = useCallback(async () => {
    if (sessionStatus === 'completed') return;
    try {
      setStatusMessage('Playing AI voice…');
      setAiPlaying(true);
      for (const chunk of targetChunks) {
        // eslint-disable-next-line no-await-in-loop
        await speakWithDebug(chunk, 'shadowing');
      }
    } finally {
      setAiPlaying(false);
      setStatusMessage('Hold to talk');
    }
  }, [targetChunks, speakWithDebug, sessionStatus]);

  const filteredHistory = useMemo(
    () =>
      filterAttempts(history, {
        level: levelFilter,
        mode: modeFilter,
        needsPractice,
        dateRange: dateFilter,
      }),
    [history, levelFilter, modeFilter, needsPractice, dateFilter],
  );

  const handleNextPrompt = () => {
    if (sessionStatus === 'completed') return;
    if (promptIndex >= 4) return;
    advanceSpeakingTurn(sessionId);
    setFeedback(null);
  };

  const resetHistoryFilters = () => {
    setLevelFilter('All');
    setNeedsPractice(false);
    setModeFilter('All');
    setDateFilter('All');
  };

  const debugEntries = useMemo(
    () => [
      { label: 'Mic status', value: micPermission },
      { label: 'Recording state', value: debugInfo.recordingState },
      { label: 'STT calls', value: `${debugInfo.sttRequests}` },
      { label: 'TTS calls', value: `${debugInfo.ttsRequests}` },
      { label: 'Target', value: targetUtterance || '—' },
      { label: 'Last transcript', value: debugInfo.lastTranscript || '—' },
      { label: 'Last reply', value: debugInfo.lastAiReply || '—' },
      { label: 'Diff', value: shadowingDiff ? `${shadowingDiff.score}% (${shadowingDiff.matches}/${shadowingDiff.targetCount})` : '—' },
      { label: 'Play state', value: debugInfo.playbackState },
      { label: 'Status', value: statusMessage },
    ],
    [micPermission, debugInfo, statusMessage, targetUtterance, shadowingDiff]
  );

  return (
    <Background module="practice">
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Shadowing Practice</Text>
          <Text style={styles.subtitle}>Mode D · CEFR levels A1→B1</Text>
        </View>

        <View style={styles.promptCard}>
          <Text style={styles.promptLevel}>{currentPrompt.level}</Text>
          <Text style={styles.promptText}>{currentPrompt.text}</Text>
          <Text style={styles.promptTarget}>Target: “{targetUtterance}”</Text>
          <TouchableOpacity style={styles.playButton} onPress={playPrompt}>
            <Text style={styles.playLabel}>{aiPlaying ? 'Playing…' : 'Play target again'}</Text>
          </TouchableOpacity>
          <Text style={styles.aiDisclosure}>AI voice is generated. Replay as needed.</Text>
        </View>

        <View style={styles.controls}>
          <Text style={styles.status}>{statusMessage}</Text>
          <Text style={styles.duration}>{formatDuration(recordingDuration)} recording</Text>
          <MicButton
            disabled={isProcessingAttempt}
            onPressIn={handleRecordStart}
            onPressOut={handleRecordEnd}
            recording={isRecording}
          />
        </View>
        <View style={styles.stateRow}>
          <Text style={styles.stateLabel}>Recording {isRecording ? '●' : '○'}</Text>
          <Text style={styles.stateLabel}>Listening {isListening ? '●' : '○'}</Text>
          <Text style={styles.stateLabel}>Processing {isProcessing ? '●' : '○'}</Text>
          <Text style={styles.stateLabel}>
            Speaking {isStreamingSpeaking || aiPlaying ? '●' : '○'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Microphone</Text>
          <Text style={styles.infoValue}>{micPermission}</Text>
          <Text style={styles.infoLabel}>Permission</Text>
          <Text style={styles.infoValue}>{micPermission === 'granted' ? 'Granted' : 'Pending'}</Text>
        </View>

        <View style={styles.transcriptCard}>
          <Text style={styles.sectionTitle}>Transcript</Text>
          <Text style={styles.transcriptText}>{transcript || 'Your speech will appear here.'}</Text>
        </View>

        {shadowingDiff ? (
          <View style={styles.compareCard}>
            <View style={styles.compareHeader}>
              <Text style={styles.sectionTitle}>Shadowing match</Text>
              <Text style={styles.compareScore}>{shadowingDiff.score}%</Text>
            </View>
            <Text style={styles.compareHint}>Green = matches · Red = missing/extra</Text>
            <Text style={styles.compareLabel}>Target</Text>
            <Text style={styles.compareLine}>
              {shadowingDiff.targetOut.map((tok, index) => (
                <Text
                  key={`t-${tok.word}-${index}`}
                  style={[
                    styles.compareWord,
                    tok.status === 'match' ? styles.wordMatch : styles.wordMissing,
                  ]}
                >
                  {tok.word + ' '}
                </Text>
              ))}
            </Text>
            <Text style={styles.compareLabel}>You said</Text>
            <Text style={styles.compareLine}>
              {shadowingDiff.spokenOut.map((tok, index) => (
                <Text
                  key={`s-${tok.word}-${index}`}
                  style={[
                    styles.compareWord,
                    tok.status === 'match' ? styles.wordMatch : styles.wordExtra,
                  ]}
                >
                  {tok.word + ' '}
                </Text>
              ))}
            </Text>
          </View>
        ) : null}

        <View style={styles.responseCard}>
          <Text style={styles.sectionTitle}>AI reply</Text>
          <Text style={styles.aiReply}>{aiReply || 'Waiting for your attempt…'}</Text>
          {aiReply ? (
            <TouchableOpacity style={styles.playButton} onPress={() => aiReply && speakWithDebug(aiReply, 'conversation')}>
              <Text style={styles.playLabel}>Replay AI voice</Text>
            </TouchableOpacity>
          ) : null}
          {ttsFailure ? (
            <View style={styles.ttsErrorCard}>
              <Text style={styles.ttsErrorTitle}>Voice playback failed</Text>
              <Text style={styles.ttsErrorText}>{ttsFailure}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => aiReply && speakWithDebug(aiReply, 'conversation')}
              >
                <Text style={styles.retryLabel}>Retry TTS</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        {feedback ? (
          <View style={styles.feedbackCard}>
            <View style={styles.feedbackHeader}>
              <Text style={styles.sectionTitle}>Feedback</Text>
              <TouchableOpacity onPress={() => setFeedbackExpanded((prev) => !prev)}>
                <Text style={styles.expandLabel}>{feedbackExpanded ? 'Hide' : 'Why this feedback?'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.oneBigWin}>{feedback.one_big_win}</Text>
            <Text style={styles.oneFixNow}>{feedback.one_fix_now}</Text>
            <Text style={styles.dimensionLabel}>{buildFeedbackLabel(feedback.dimension)}</Text>
            {feedbackExpanded ? (
              <>
                <Text style={styles.suggestion}>
                  {getRubricExplanation(feedback.dimension)}
                </Text>
                <Text style={styles.suggestion}>Better: {feedback.better_version_fi}</Text>
                <View style={styles.drillList}>
                  {feedback.micro_drill.map((drill, index) => (
                    <Text key={drill + index} style={styles.drillItem}>
                      • {drill}
                    </Text>
                  ))}
                </View>
              </>
            ) : null}
            {lowConfidenceWarning ? (
              <Text style={styles.lowConfidence}>
                STT confidence was low. Speak slowly and clearly, then try again.
              </Text>
            ) : null}
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleNextPrompt}>
              <Text style={styles.retryLabel}>Try next prompt</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>History</Text>
          <TouchableOpacity onPress={resetHistoryFilters}>
            <Text style={styles.expandLabel}>Reset filters</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filtersRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {LEVELS.map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.filterButton,
                  levelFilter === level && styles.filterButtonActive,
                ]}
                onPress={() => setLevelFilter(level)}
              >
                <Text
                  style={[
                    styles.filterLabel,
                    levelFilter === level && styles.filterLabelActive,
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={[
              styles.filterButton,
              needsPractice && styles.filterButtonActive,
            ]}
            onPress={() => setNeedsPractice((prev) => !prev)}
          >
            <Text
              style={[
                styles.filterLabel,
                needsPractice && styles.filterLabelActive,
              ]}
            >
              Needs practice
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.filtersRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {MODES.map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.filterButton,
                  modeFilter === mode && styles.filterButtonActive,
                ]}
                onPress={() => setModeFilter(mode)}
              >
                <Text
                  style={[
                    styles.filterLabel,
                    modeFilter === mode && styles.filterLabelActive,
                  ]}
                >
                  {mode}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View style={styles.filtersRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {DATE_FILTERS.map((range) => (
              <TouchableOpacity
                key={range}
                style={[
                  styles.filterButton,
                  dateFilter === range && styles.filterButtonActive,
                ]}
                onPress={() => setDateFilter(range)}
              >
                <Text
                  style={[
                    styles.filterLabel,
                    dateFilter === range && styles.filterLabelActive,
                  ]}
                >
                  {range}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <FlatList
          data={filteredHistory}
          keyExtractor={(item) => item.id}
          style={styles.historyList}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.historyItem}>
              <View style={styles.historyRow}>
                <Text style={styles.historyLevel}>{item.level_tag}</Text>
                <Text style={styles.historyTime}>{formatTimestamp(item.timestamp)}</Text>
              </View>
              <Text style={styles.historyTranscript}>{item.transcript}</Text>
              <Text style={styles.historyTarget}>{item.target_text}</Text>
              <Text style={styles.historyFeedback} numberOfLines={2}>
                {item.feedback?.one_fix_now}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No shadowing attempts yet.</Text>
            </View>
          }
        />

        {isProcessingAttempt && (
          <View style={styles.processingOverlay}>
            <ActivityIndicator color="#fff" />
            <Text style={styles.processingLabel}>Processing attempt…</Text>
          </View>
        )}

        <TouchableOpacity style={styles.nextButton} onPress={handleNextPrompt}>
          <Text style={styles.nextLabel}>Next prompt</Text>
        </TouchableOpacity>
      </ScrollView>
      <SpeakingDebugPanel entries={debugEntries} visible={__DEV__} />
    </Background>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.l,
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.m,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  promptCard: {
    backgroundColor: colors.neutralDark,
    borderRadius: 18,
    padding: spacing.l,
    marginBottom: spacing.m,
  },
  reviewContainer: {
    flex: 1,
    padding: spacing.l,
  },
  reviewCard: {
    backgroundColor: '#0f1117',
    borderRadius: 16,
    padding: spacing.l,
    marginBottom: spacing.m,
  },
  reviewCardLabel: {
    color: colors.accentPrimary,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  reviewCardText: {
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 22,
  },
  reviewControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  promptLevel: {
    color: colors.accentPrimary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  promptText: {
    color: colors.textPrimary,
    fontSize: 16,
    marginBottom: spacing.s,
  },
  promptTarget: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: spacing.s,
  },
  aiDisclosure: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  playButton: {
    padding: spacing.s,
    backgroundColor: colors.accentSecondary,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  playLabel: {
    color: '#fff',
    fontWeight: '600',
  },
  controls: {
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  status: {
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  duration: {
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontSize: 12,
  },
  stateRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.m,
  },
  stateLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.m,
  },
  infoLabel: {
    color: colors.textMuted,
  },
  infoValue: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  transcriptCard: {
    backgroundColor: colors.neutralMedium,
    borderRadius: 16,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  sectionTitle: {
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontSize: 14,
  },
  transcriptText: {
    color: colors.textPrimary,
    fontSize: 16,
    minHeight: 40,
  },
  compareCard: {
    backgroundColor: colors.neutralMedium,
    borderRadius: 16,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  compareHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  compareScore: {
    color: colors.accentPrimary,
    fontWeight: '700',
  },
  compareHint: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: spacing.s,
  },
  compareLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  compareLine: {
    marginBottom: spacing.s,
  },
  compareWord: {
    fontSize: 14,
  },
  wordMatch: {
    color: '#6ee7a8',
  },
  wordMissing: {
    color: '#ff8b8b',
    textDecorationLine: 'underline',
  },
  wordExtra: {
    color: '#ff8b8b',
  },
  responseCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  aiReply: {
    color: colors.accentPrimary,
    fontSize: 16,
    minHeight: 40,
  },
  feedbackCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  expandLabel: {
    color: colors.accentPrimary,
    fontWeight: '600',
  },
  oneBigWin: {
    color: colors.textPrimary,
    fontSize: 16,
    marginTop: spacing.s,
  },
  oneFixNow: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  dimensionLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  suggestion: {
    color: colors.accentSecondary,
    marginTop: spacing.s,
  },
  drillList: {
    marginTop: spacing.s,
  },
  drillItem: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  lowConfidence: {
    color: colors.warning,
    marginTop: spacing.s,
  },
  errorCard: {
    backgroundColor: colors.accentError,
    borderRadius: 16,
    padding: spacing.l,
    marginBottom: spacing.m,
  },
  errorText: {
    color: '#fff',
    marginBottom: spacing.s,
  },
  retryButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: spacing.s,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  retryLabel: {
    color: '#fff',
    fontWeight: '600',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
    alignItems: 'center',
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  filterButton: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.divider,
    marginRight: spacing.s,
  },
  filterButtonActive: {
    borderColor: colors.accentPrimary,
  },
  filterLabel: {
    color: colors.textMuted,
  },
  filterLabelActive: {
    color: colors.accentPrimary,
  },
  historyList: {
    marginBottom: spacing.m,
  },
  historyItem: {
    borderBottomColor: colors.divider,
    borderBottomWidth: 1,
    paddingBottom: spacing.s,
    marginBottom: spacing.s,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyLevel: {
    color: colors.accentSecondary,
    fontWeight: '600',
  },
  historyTime: {
    color: colors.textSecondary,
  },
  historyTranscript: {
    color: colors.textPrimary,
    marginTop: spacing.xs,
    fontSize: 14,
  },
  historyTarget: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  historyFeedback: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  emptyState: {
    padding: spacing.l,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textMuted,
  },
  ttsErrorCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: spacing.s,
    borderRadius: 12,
    marginTop: spacing.s,
  },
  ttsErrorTitle: {
    color: colors.error,
    fontWeight: '600',
  },
  ttsErrorText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  processingOverlay: {
    marginTop: spacing.s,
    padding: spacing.m,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
  },
  processingLabel: {
    color: '#fff',
    marginTop: spacing.xs,
  },
  nextButton: {
    marginTop: spacing.l,
    backgroundColor: colors.accentPrimary,
    padding: spacing.m,
    borderRadius: 16,
    alignItems: 'center',
  },
  nextLabel: {
    color: '#fff',
    fontWeight: '600',
  },
});
