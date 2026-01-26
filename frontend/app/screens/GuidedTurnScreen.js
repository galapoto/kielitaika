import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import SpeakingDebugPanel from '../components/dev/SpeakingDebugPanel';
import Background from '../components/ui/Background';
import MicButton from '../components/MicButton';
import { useVoiceStreaming } from '../hooks/useVoiceStreaming';
import { useVoice } from '../hooks/useVoice';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';
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
import { getRubricExplanation, getRubricLabel, normalizeRubricDimension } from '../utils/feedbackRubric';
import { generateSpeakingTurn } from '../utils/speakingTurnEngine';

const LEVELS = ['All', 'A1', 'A2', 'B1', 'B2'];
const MODES = ['All', 'Mode A', 'Mode B', 'Mode C', 'Mode D'];
const DATE_FILTERS = ['All', 'Last 24h', 'Last 7d'];

const PROMPTS = [
  { id: 'greet', level: 'A1', text: 'Hei, kerro kuka olet ja mistä olet kotoisin.' },
  { id: 'introduction', level: 'A1', text: 'Mitä harrastuksia sinulla on?' },
  { id: 'ordering', level: 'A2', text: 'Tilaa kahvi ja kerro haluatko maidon kanssa.' },
  { id: 'directions', level: 'A2', text: 'Kerro miten pääset lähimpään apteekkiin.' },
  { id: 'work', level: 'B1', text: 'Kuvaile työpäiväsi kolme tärkeintä tehtävää.' },
  { id: 'future', level: 'B2', text: 'Mitä suunnitelmia sinulla on ensi kesäksi?' },
];

const formatDuration = (ms = 0) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, '0')}`;
};

const formatAttemptMode = (attempt) => {
  const raw = attempt?.mode_tag || attempt?.mode || '—';
  if (raw === 'shadowing') return 'Mode D (shadowing)';
  return raw;
};

const formatAttemptTimestamp = (ts) => {
  if (!ts) return '—';
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return '—';
  }
};

const generateFeedback = (transcript, prompt) => {
  const normalizedTranscript = transcript.toLowerCase();
  const target = prompt.text.toLowerCase();
  const containsTarget = normalizedTranscript.includes(target);
  const dimension = containsTarget ? 'clarity' : 'grammar';
  const oneBigWin = containsTarget
    ? 'You used the target phrase and kept a calm pace.'
    : 'You kept your voice steady; nice flow!';
  const oneFixNow = containsTarget
    ? 'Stress the last syllable so it sounds confident.'
    : `Repeat: "${prompt.text}" and focus on the key vocabulary.`;
  const betterVersion = containsTarget
    ? `Hyvä! Voit myös sanoa: ${prompt.text.replace('?', '').trim()}`
    : `Kuuntele: "${prompt.text}" ja toista perään.`;
  const microDrill = [
    `Say "${prompt.text}" slowly and record again.`,
    'Emphasize vowels (pitkä vs lyhyt) in the last word.'
  ];
  return {
    one_big_win: oneBigWin,
    one_fix_now: oneFixNow,
    better_version_fi: betterVersion,
    micro_drill: microDrill,
    level_adjustment: containsTarget ? 'stay' : 'down',
    flags: { low_confidence_stt: transcript.length < prompt.text.length * 0.6 },
    dimension,
  };
};

export default function GuidedTurnScreen({ route } = {}) {
  const source = route?.params?.source || 'unknown';
  const entrypoint = route?.params?.entrypoint || 'unknown';

  const sessionId = useMemo(
    () => `guided:${source}:${entrypoint}:${Date.now()}`,
    [source, entrypoint]
  );
  const session = useSpeakingSession(sessionId, { maxTurns: 5, autoStart: true });
  const sessionStatus = session?.status || 'idle';
  const promptIndex = session?.currentTurnIndex || 0;
  const currentTurn = session?.turns?.[promptIndex] || null;
  const transcript = currentTurn?.userSpeech?.transcript || '';
  const aiReply = currentTurn?.aiSpeech?.transcript || '';
  const [reviewTurnIndex, setReviewTurnIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Hold to talk');
  const [history, setHistory] = useState([]);
  const [levelFilter, setLevelFilter] = useState('All');
  const [modeFilter, setModeFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [historyFilter, setHistoryFilter] = useState('All');
  const [needsPractice, setNeedsPractice] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [feedbackExpanded, setFeedbackExpanded] = useState(false);
  const [error, setError] = useState(null);
  const [isProcessingAttempt, setIsProcessingAttempt] = useState(false);
  const [micPermission, setMicPermission] = useState('unknown');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [ttsFailure, setTtsFailure] = useState(null);
  const [debugInfo, setDebugInfo] = useState({
    micPermission: 'unknown',
    recordingState: 'idle',
    sttRequests: 0,
    ttsRequests: 0,
    lastTranscript: '',
    lastReply: '',
    playbackState: 'idle',
    errorLog: null,
  });
  const [debugEntries, setDebugEntries] = useState([]);
  const [waveformHeights, setWaveformHeights] = useState([32, 40, 28, 45, 34, 26]);
  const recordingStartRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const { speak } = useVoice();
  const currentPrompt = useMemo(() => PROMPTS[promptIndex], [promptIndex]);

  const handlePermissionStatus = useCallback(async () => {
    try {
      const status = await Audio.getPermissionsAsync();
      setMicPermission(status.status);
      setDebugInfo((prev) => ({ ...prev, micPermission: status.status }));
    } catch (err) {
      setMicPermission('unknown');
      setDebugInfo((prev) => ({ ...prev, micPermission: 'unknown' }));
    }
  }, []);

  useEffect(() => {
    handlePermissionStatus();
  }, [handlePermissionStatus]);

  const loadHistory = useCallback(async () => {
    const stored = await loadSpeakingAttempts();
    setHistory(Array.isArray(stored) ? stored : []);
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const persistAttempt = useCallback(
    async (attempt) => {
      const updated = await persistSpeakingAttempt(attempt);
      if (Array.isArray(updated)) {
        setHistory(updated);
      }
    },
    [history],
  );

  const handleVoiceState = useCallback((state) => {
    if (state.isRecording) {
      setStatusMessage('Listening…');
    } else if (state.isProcessing) {
      setStatusMessage('Processing…');
    } else if (state.isSpeaking) {
      setStatusMessage('Playing AI voice…');
    } else {
      setStatusMessage('Hold to talk');
    }
    setDebugInfo((prev) => ({
      ...prev,
      recordingState: state.isRecording
        ? 'recording'
        : state.isProcessing
        ? 'processing'
        : state.isSpeaking
        ? 'playing'
        : 'idle',
    }));
  }, []);

  const playAiReply = useCallback(
    async (text) => {
      if (sessionStatus === 'completed') return;
      setDebugInfo((prev) => ({
        ...prev,
        ttsRequests: prev.ttsRequests + 1,
        playbackState: 'playing',
      }));
      try {
        await speak(text, 'conversation');
        setDebugInfo((prev) => ({
          ...prev,
          playbackState: 'idle',
          lastReply: text,
        }));
      } catch (ttsError) {
        const message = ttsError?.message || 'TTS error';
        setError(message);
        setTtsFailure(ttsError);
        setDebugInfo((prev) => ({ ...prev, playbackState: 'error', errorLog: message }));
      }
    },
    [speak, sessionStatus],
  );

  const handleTranscriptComplete = useCallback(
    async (sttText, sttMeta) => {
      if (sessionStatus === 'completed') return;
      const normalized = (sttText || '').trim();
      if (!normalized) return;
      setStatusMessage('Transcribed');
      setError(null);
      setFeedbackExpanded(false);
      const attemptDuration = recordingStartRef.current
        ? Date.now() - recordingStartRef.current
        : 0;
      setRecordingDuration(attemptDuration);
      setIsProcessingAttempt(true);
      try {
        const answer = generateSpeakingTurn({
          user_transcript: normalized,
          level: currentPrompt.level,
          mode: 'guided',
          user_state: {
            source,
            entrypoint,
            mode_tag: 'Mode A',
            target_text: currentPrompt.text,
            history,
          },
        });
        setSpeakingTurnUserTranscript(sessionId, promptIndex, normalized);
        setSpeakingTurnAiTranscript(sessionId, promptIndex, answer.ai_reply_fi, {
          isConclusive: promptIndex >= 4,
        });
        setFeedback(answer.feedback);
        setDebugInfo((prev) => ({
          ...prev,
          sttRequests: prev.sttRequests + 1,
          lastTranscript: normalized,
          recordingState: 'stt-complete',
        }));
        const attemptRecord = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          user_audio_url: '',
          transcript: normalized,
          stt: { text: normalized, meta: sttMeta },
          target_text: currentPrompt.text,
          ai_reply_text: answer.ai_reply_fi,
          feedback: answer.feedback,
          level_tag: currentPrompt.level,
          mode_tag: 'Mode A',
          source_tag: source,
          duration_ms: attemptDuration,
          timestamp: Date.now(),
          low_confidence_stt: answer.flags?.low_confidence_stt ?? false,
          needs_practice: answer.level_adjustment === 'down' || answer.flags?.low_confidence_stt,
          audio_duration_ms: attemptDuration,
          recording_state: 'complete',
        };
        await persistAttempt(attemptRecord);
        if (answer.ai_reply_fi) {
          await playAiReply(answer.ai_reply_fi);
        }
        if (promptIndex >= 4) {
          completeSpeakingSession(sessionId);
        }
      } catch (err) {
        const message = err?.message || 'Kun en saanut yhteyttä palvelimeen.';
        setError(message);
        setDebugInfo((prev) => ({ ...prev, errorLog: message }));
      } finally {
        setIsProcessingAttempt(false);
      }
    },
    [currentPrompt, entrypoint, history, persistAttempt, playAiReply, promptIndex, sessionId, sessionStatus, source]
  );

  const { isRecording, isProcessing, isListening, isSpeaking, startRecording, stopRecording } =
    useVoiceStreaming({
      onStateChange: handleVoiceState,
      onTranscriptComplete: handleTranscriptComplete,
      vadSilenceThreshold: 2000,
    });

  useEffect(() => {
    if (sessionStatus !== 'completed') return;
    // Ensure mic/audio are off in review mode.
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
      <Background module="conversation" variant="blue">
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
              onPress={() => setReviewTurnIndex((n) => Math.max(0, n - 1))}
              disabled={idx === 0}
              style={[styles.promptButton, idx === 0 && { opacity: 0.5 }]}
            >
              <Text style={styles.promptButtonText}>Edellinen</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setReviewTurnIndex((n) => Math.min(turns.length - 1, n + 1))}
              disabled={idx >= turns.length - 1}
              style={[styles.promptButton, idx >= turns.length - 1 && { opacity: 0.5 }]}
            >
              <Text style={styles.promptButtonText}>Seuraava</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Background>
    );
  }

  const handleRecordStart = () => {
    recordingStartRef.current = Date.now();
    startRecording?.();
    setDebugInfo((prev) => ({ ...prev, recordingState: 'recording' }));
  };

  const handleRecordEnd = () => {
    stopRecording?.();
    setDebugInfo((prev) => ({ ...prev, recordingState: 'processing' }));
  };

  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        if (recordingStartRef.current) {
          setRecordingDuration(Date.now() - recordingStartRef.current);
        }
      }, 200);
    } else if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [isRecording]);

  const selectedLevelFilter = historyFilter !== 'All' ? historyFilter : levelFilter;
  const filteredHistory = useMemo(
    () =>
      filterAttempts(history, {
        level: selectedLevelFilter,
        mode: modeFilter,
        needsPractice,
        dateRange: dateFilter,
      }),
    [history, selectedLevelFilter, modeFilter, needsPractice, dateFilter],
  );

  const nextPrompt = () => {
    if (sessionStatus === 'completed') return;
    if (promptIndex >= 4) return;
    advanceSpeakingTurn(sessionId);
    setFeedback(null);
  };

  useEffect(() => {
    setDebugEntries([
      { label: 'Source', value: source },
      { label: 'Entry', value: entrypoint },
      { label: 'Mic perm', value: micPermission },
      { label: 'isRecording', value: isRecording ? 'true' : 'false' },
      { label: 'isListening', value: isListening ? 'true' : 'false' },
      { label: 'isProcessing', value: isProcessing ? 'true' : 'false' },
      { label: 'isSpeaking', value: isSpeaking ? 'true' : 'false' },
      { label: 'Record state', value: debugInfo.recordingState },
      { label: 'Transcript', value: transcript ? 'yes' : 'no' },
      { label: 'STT count', value: debugInfo.sttRequests.toString() },
      { label: 'AI reply', value: aiReply ? 'yes' : 'no' },
      { label: 'TTS count', value: debugInfo.ttsRequests.toString() },
      { label: 'Last transcript', value: debugInfo.lastTranscript || '—' },
      { label: 'Last reply', value: debugInfo.lastReply || '—' },
      { label: 'Playback', value: debugInfo.playbackState },
      { label: 'Errors', value: debugInfo.errorLog || 'none' },
    ]);
  }, [
    source,
    entrypoint,
    micPermission,
    isRecording,
    isListening,
    isProcessing,
    isSpeaking,
    transcript,
    aiReply,
    debugInfo,
  ]);

  const displayStatus = () => {
    if (isSpeaking) return 'Playing AI voice…';
    if (isProcessing) return 'Processing…';
    if (isListening) return 'Listening…';
    return 'Hold to talk';
  };

  const statusColor = () => {
    if (isSpeaking) return colors.primary;
    if (isProcessing) return '#ffd166';
    if (isListening) return '#8ac926';
    return colors.surface;
  };

  const renderWaveform = () => (
    <View style={styles.waveform}>
      {waveformHeights.map((height, index) => (
        <View key={`${height}-${index}`} style={[styles.waveformBar, { height }]} />
      ))}
    </View>
  );

  return (
    <Background module="conversation" variant="blue">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Guided Turn-Taking</Text>
          <Text style={styles.subtitle}>
            Level {currentPrompt.level} · Progress prompts to steer the AI conversation.
          </Text>
        </View>
        <View style={styles.promptCard}>
          <Text style={styles.promptLabel}>Current prompt</Text>
          <Text style={styles.promptText}>{currentPrompt.text}</Text>
          <View style={styles.row}>
            <TouchableOpacity onPress={nextPrompt} style={styles.promptButton}>
              <Text style={styles.promptButtonText}>Next prompt</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statusRow}>
          <View style={styles.statusBlock}>
            <Text style={styles.statusLabel}>Status</Text>
            <Text style={[styles.statusText, { color: statusColor() }]}>{displayStatus()}</Text>
          </View>
          <View style={styles.statusBlock}>
            <Text style={styles.statusLabel}>Mic</Text>
            <Text testID="mic-permission" style={styles.statusText}>
              {micPermission}
            </Text>
          </View>
          <View style={styles.statusBlock}>
            <Text style={styles.statusLabel}>Playback</Text>
            <Text style={styles.statusText}>{debugInfo.playbackState}</Text>
          </View>
        </View>

        <View style={styles.recorder}>
          <Text style={styles.hintText}>Hold to talk · release to stop</Text>
          <MicButton
            onPressIn={handleRecordStart}
            onPressOut={handleRecordEnd}
            isActive={isRecording}
            disabled={isProcessing || isSpeaking}
          />
          <Text style={styles.timerText}>{formatDuration(recordingDuration)}</Text>
          {renderWaveform()}
        </View>

        <View style={styles.transcriptPanel}>
          <Text style={styles.panelLabel}>Transcript</Text>
          <Text style={styles.panelValue}>{transcript || 'Record something to get started.'}</Text>
        </View>

        <View style={styles.replyPanel}>
          <Text style={styles.panelLabel}>AI reply</Text>
          <View style={styles.replyRow}>
            <Text style={styles.panelValue}>{aiReply || 'AI reply will appear here.'}</Text>
            {aiReply ? (
              <TouchableOpacity style={styles.replyButton} onPress={() => playAiReply(aiReply)}>
                <Text style={styles.replyButtonText}>Replay voice</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <Text style={styles.statusTextSmall}>
            {aiReply ? 'Transcript shown above, AI voice playing when ready.' : 'Waiting for AI reply…'}
          </Text>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <View style={styles.feedbackPanel}>
          <Text style={styles.panelLabel}>Feedback</Text>
          {feedback ? (
            <>
              <Text style={styles.panelValue}>{feedback.one_big_win}</Text>
              <Text style={styles.panelValue}>{feedback.one_fix_now}</Text>
              <TouchableOpacity
                onPress={() => setFeedbackExpanded((prev) => !prev)}
                style={styles.feedbackToggle}
              >
                <Text style={styles.feedbackToggleText}>Why this feedback? ({feedback.dimension})</Text>
              </TouchableOpacity>
              {feedbackExpanded && (
                <>
                  <Text style={styles.panelValue}>
                    {getRubricLabel(normalizeRubricDimension(feedback.dimension))}:{' '}
                    {getRubricExplanation(feedback.dimension)}
                  </Text>
                  <Text style={styles.panelValue}>{feedback.better_version_fi}</Text>
                  <Text style={styles.panelValue}>Micro drills:</Text>
                  {feedback.micro_drill.map((drill) => (
                    <Text key={drill} style={styles.panelValue}>
                      • {drill}
                    </Text>
                  ))}
                  <Text style={styles.panelValue}>Level suggestion: {feedback.level_adjustment}</Text>
                </>
              )}
            </>
          ) : (
              <Text style={styles.panelValue}>Feedback shows here after each attempt.</Text>
          )}
        </View>

        <View style={styles.historyHeader}>
          <Text style={styles.title}>History</Text>
          <View style={styles.filterRow}>
            {['All', 'A1', 'A2', 'B1', 'B2'].map((level) => (
              <TouchableOpacity
                key={level}
                onPress={() => setHistoryFilter(level)}
                style={[
                  styles.filterButton,
                  historyFilter === level && styles.filterButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    historyFilter === level && styles.filterTextActive,
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.filterRow}>
            {['All', 'Mode A', 'Mode B', 'Mode C', 'Mode D'].map((mode) => (
              <TouchableOpacity
                key={mode}
                onPress={() => setModeFilter(mode)}
                style={[
                  styles.filterButton,
                  modeFilter === mode && styles.filterButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    modeFilter === mode && styles.filterTextActive,
                  ]}
                >
                  {mode}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.filterRow}>
            {['All', 'Last 24h', 'Last 7d'].map((range) => (
              <TouchableOpacity
                key={range}
                onPress={() => setDateFilter(range)}
                style={[
                  styles.filterButton,
                  dateFilter === range && styles.filterButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    dateFilter === range && styles.filterTextActive,
                  ]}
                >
                  {range}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setNeedsPractice((prev) => !prev)}
              style={[
                styles.filterButton,
                needsPractice && styles.filterButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  needsPractice && styles.filterTextActive,
                ]}
              >
                Needs practice
              </Text>
            </TouchableOpacity>
          </View>
        </View>

          <FlatList
            data={filteredHistory}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.historyList}
            ListEmptyComponent={() => (
              <Text style={styles.panelValue}>No attempts yet. Speak to save one.</Text>
            )}
            renderItem={({ item }) => (
              <View style={styles.historyItem}>
                <View style={styles.historyRow}>
                  <Text style={styles.historyLabel}>{item.target_text}</Text>
                  <Text style={styles.historyMeta}>
                    {formatAttemptTimestamp(item.timestamp)} · {item.level_tag}
                  </Text>
                </View>
                <Text style={styles.historyMeta}>Mode: {formatAttemptMode(item)}</Text>
                <Text style={styles.panelValue}>You: {item.transcript}</Text>
                <Text style={styles.panelValue}>AI: {item.ai_reply_text}</Text>
                <View style={styles.feedbackRow}>
                  <Text style={styles.feedbackTag}>{item.feedback.dimension}</Text>
                  <Text style={styles.feedbackText}>{item.feedback.one_big_win}</Text>
                  <Text style={styles.feedbackText}>{item.feedback.one_fix_now}</Text>
                </View>
                <View style={styles.historyMetaRow}>
                  <Text style={styles.historyMeta}>
                    Duration: {formatDuration(item.duration_ms)} ·{' '}
                    {item.low_confidence_stt ? 'Low confidence' : 'Clear transcript'}
                  </Text>
                  {item.needs_practice && (
                    <Text style={styles.feedbackTag}>Needs practice</Text>
                  )}
                </View>
              </View>
            )}
          />

        {isProcessingAttempt && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.overlayText}>Saving attempt…</Text>
          </View>
        )}
        <SpeakingDebugPanel entries={debugEntries} visible={__DEV__} />
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.medium,
  },
  reviewContainer: {
    flex: 1,
    padding: spacing.medium,
  },
  reviewCard: {
    backgroundColor: '#0f1117',
    borderRadius: 16,
    padding: spacing.medium,
    marginBottom: spacing.medium,
  },
  reviewCardLabel: {
    fontSize: 12,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  reviewCardText: {
    color: colors.surface,
    fontSize: 16,
    lineHeight: 22,
  },
  reviewControls: {
    marginTop: spacing.small,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: spacing.small,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
  },
  subtitle: {
    fontSize: 14,
    color: colors.surface,
    marginTop: 4,
  },
  promptCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.medium,
    marginBottom: spacing.small,
  },
  promptLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 12,
    color: colors.primary,
  },
  promptText: {
    fontSize: 18,
    marginTop: spacing.small,
    color: colors.text,
  },
  promptButton: {
    marginTop: spacing.small,
    paddingVertical: spacing.xsmall,
    paddingHorizontal: spacing.small,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
  },
  promptButtonText: {
    color: colors.primary,
  },
  recorder: {
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  timerText: {
    marginTop: spacing.small,
    color: colors.surface,
  },
  transcriptPanel: {
    backgroundColor: '#1F1B24',
    borderRadius: 14,
    padding: spacing.medium,
    marginBottom: spacing.small,
  },
  panelLabel: {
    fontSize: 12,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  panelValue: {
    marginTop: 4,
    color: colors.surface,
  },
  errorText: {
    marginTop: spacing.small,
    color: '#ff6b6b',
  },
  feedbackPanel: {
    backgroundColor: '#0f1117',
    borderRadius: 14,
    padding: spacing.medium,
    marginBottom: spacing.small,
  },
  feedbackToggle: {
    marginTop: spacing.small,
  },
  feedbackToggleText: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  historyHeader: {
    marginTop: spacing.small,
    marginBottom: spacing.xsmall,
  },
  filterRow: {
    flexDirection: 'row',
    marginTop: spacing.small,
  },
  filterButton: {
    marginRight: spacing.xsmall,
    paddingVertical: spacing.xsmall,
    paddingHorizontal: spacing.small,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#555',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    color: '#aaa',
  },
  filterTextActive: {
    color: '#fff',
  },
  historyList: {
    paddingBottom: 120,
  },
  historyItem: {
    backgroundColor: '#1a1c24',
    borderRadius: 12,
    padding: spacing.medium,
    marginBottom: spacing.small,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyLabel: {
    fontWeight: '600',
    color: colors.surface,
  },
  historyMeta: {
    color: '#777',
  },
  historyMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xsmall,
  },
  feedbackRow: {
    marginTop: spacing.xsmall,
  },
  feedbackTag: {
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 10,
  },
  feedbackText: {
    marginTop: spacing.xsmall,
    color: colors.surface,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.small,
  },
  statusBlock: {
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.primary,
  },
  statusText: {
    color: colors.surface,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  hintText: {
    color: colors.surface,
    marginBottom: spacing.small,
  },
  waveform: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginTop: spacing.small,
    paddingHorizontal: spacing.small,
  },
  waveformBar: {
    width: 6,
    marginHorizontal: 2,
    backgroundColor: '#ffffff55',
    borderRadius: 3,
  },
  replyPanel: {
    backgroundColor: '#10131b',
    borderRadius: 14,
    padding: spacing.medium,
    marginBottom: spacing.small,
  },
  replyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  replyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.small,
    paddingVertical: spacing.xsmall,
    borderRadius: 10,
  },
  replyButtonText: {
    color: '#fff',
  },
  statusTextSmall: {
    color: '#8892a6',
    fontSize: 12,
    marginTop: spacing.xsmall,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 2, 5, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayText: {
    marginTop: spacing.small,
    color: '#fff',
  },
});
