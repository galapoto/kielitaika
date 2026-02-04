import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import MicButton from '../components/MicButton';
import Background from '../components/ui/Background';
import SpeakingDebugPanel from '../components/dev/SpeakingDebugPanel';
import { useVoiceStreaming } from '../hooks/useVoiceStreaming';
import { useVoice } from '../hooks/useVoice';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { Audio } from 'expo-av';
import {
  loadSpeakingAttempts,
  persistSpeakingAttempt,
} from '../utils/speakingAttempts';
import {
  setSpeakingTurnUserTranscript,
  setSpeakingTurnAiTranscript,
  advanceSpeakingTurn,
  completeSpeakingSession,
} from '../utils/speakingAttempts';
import { useSpeakingSessionContext } from '../context/SpeakingSessionContext';
import { getRubricExplanation, getRubricLabel, normalizeRubricDimension } from '../utils/feedbackRubric';
import { generateSpeakingTurn } from '../utils/speakingTurnEngine';

const DURATIONS = [30000, 60000, 120000];
const TOPICS = [
  'Kuvaile viimeistä lomamatkaasi.',
  'Mitä ajattelet tekoälyn roolista kielten oppimisessa?',
  'Miten valmistautuisit tärkeään tapaamiseen työssä?',
];

const FILLER_WORDS = ['uh', 'um', 'niinku', 'no', 'tavallaan', 'tyyliin'];

const formatMs = (ms) => `${Math.floor(ms / 1000)} s`;

const buildFluencyTip = ({ paceWpm, fillerCount, pauseMarkers, lexicalVariety, durationMs }) => {
  if (paceWpm && paceWpm < 85) {
    return `Try slightly faster pace next time (pace ~${paceWpm} wpm).`;
  }
  if (fillerCount && fillerCount >= 4) {
    return `Reduce fillers (count ${fillerCount}) by pausing silently instead.`;
  }
  if (pauseMarkers && pauseMarkers >= 3) {
    return `Aim for fewer long pauses (markers ${pauseMarkers}).`;
  }
  if (lexicalVariety && lexicalVariety < 0.35) {
    return `Try more varied words (variety ${(lexicalVariety * 100).toFixed(0)}%).`;
  }
  if (durationMs && durationMs < 15000) {
    return 'Speak a bit longer before stopping.';
  }
  return '';
};

const pickFollowUpPrompt = ({ topic, paceWpm, fillerCount, pauseMarkers }) => {
  if (paceWpm && paceWpm < 85) {
    return 'Keskeytys: Kerro sama asia uudelleen kahdella lauseella, mutta hieman nopeammin.';
  }
  if (fillerCount && fillerCount >= 4) {
    return 'Keskeytys: Vastaa vielä kerran ilman täytesanoja (esim. “niinku”, “no”).';
  }
  if (pauseMarkers && pauseMarkers >= 3) {
    return 'Keskeytys: Vastaa uudestaan ja yritä yhdistää lauseet ilman pitkiä taukoja.';
  }
  return `Keskeytys: Voitko antaa yhden konkreettisen esimerkin aiheesta: ${topic}`;
};

export default function FluencyScreen() {
  // Get session from context (provided by SpeakingScreenWrapper)
  const { sessionId, session, status: sessionStatus, currentTurnIndex: turnIndex, currentTurn } = useSpeakingSessionContext();
  const transcript = currentTurn?.userSpeech?.transcript || '';
  const aiReply = currentTurn?.aiSpeech?.transcript || '';
  const [reviewTurnIndex, setReviewTurnIndex] = useState(0);

  const [topicIndex, setTopicIndex] = useState(0);
  const [durationIndex, setDurationIndex] = useState(0);
  const [status, setStatus] = useState('Hold to talk');
  const [feedback, setFeedback] = useState(null);
  const [feedbackExpanded, setFeedbackExpanded] = useState(false);
  const [phase, setPhase] = useState('monologue'); // monologue | followup
  const [followUpPrompt, setFollowUpPrompt] = useState('');
  const [pendingParentId, setPendingParentId] = useState(null);
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState(null);
  const [lexicalVariety, setLexicalVariety] = useState(0);
  const [totalWords, setTotalWords] = useState(0);
  const [fillerCount, setFillerCount] = useState(0);
  const [pauseMarkers, setPauseMarkers] = useState(0);
  const [paceWpm, setPaceWpm] = useState(0);
  const [history, setHistory] = useState([]);
  const [micPermission, setMicPermission] = useState('unknown');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isProcessingAttempt, setIsProcessingAttempt] = useState(false);
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
  const countdownRef = useRef(null);
  const recordingStartRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const { speak } = useVoice();

  const topic = useMemo(() => TOPICS[topicIndex], [topicIndex]);
  const targetDuration = useMemo(() => DURATIONS[durationIndex], [durationIndex]);

  const persistAttempt = useCallback(
    async (attempt) => {
      const updated = await persistSpeakingAttempt(attempt);
      if (Array.isArray(updated)) {
        setHistory(updated);
      }
    },
    [],
  );

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
        setDebugInfo((prev) => ({ ...prev, playbackState: 'error', errorLog: message }));
      }
    },
    [speak, sessionStatus],
  );

  const onTranscriptComplete = useCallback(
    async (sttText, sttMeta) => {
      if (sessionStatus === 'completed') return;
      const normalized = (sttText || '').trim();
      if (!normalized) return;
      setSpeakingTurnUserTranscript(sessionId, turnIndex, normalized);
      const words = normalized
        .split(/\s+/)
        .map((w) => w.replace(/[^A-Za-zÀ-ÖØ-öø-ÿÅåÄäÖö_/.-]/g, ''))
        .filter(Boolean);
      const total = words.length;
      const unique = new Set(words.map((w) => w.toLowerCase())).size;
      setTotalWords(total);
      setLexicalVariety(total ? unique / total : 0);
      setFillerCount(
        words.filter((word) => FILLER_WORDS.includes(word.toLowerCase())).length
      );
      const pauseMatches = normalized.match(/(\s{2,}|\.{2,}|-{2,})/g) ?? [];
      setPauseMarkers(pauseMatches.length);
      const attemptMs = Math.max(500, targetDuration - timer);
      const computedPace = Math.round((total / (attemptMs / 60000)) || 0);
      setPaceWpm(computedPace);
      const durationActualMs =
        recordingDuration || (Date.now() - (recordingStartRef.current || Date.now()));
      const metrics = {
        duration_target_ms: targetDuration,
        duration_actual_ms: durationActualMs,
        pace_wpm: computedPace,
        filler_count: words.filter((word) => FILLER_WORDS.includes(word.toLowerCase())).length,
        pause_markers: pauseMatches.length,
        lexical_variety: total ? unique / total : 0,
        total_words: total,
      };
      setStatus('Processing…');
      try {
        if (phase === 'followup') {
          const result = generateSpeakingTurn({
            user_transcript: normalized,
            level: 'B1',
            mode: 'fluency',
            user_state: {
              mode_tag: 'Mode C',
              target_text: followUpPrompt || topic,
              turn_tag: 'followup',
              metrics,
              history,
            },
          });
          setSpeakingTurnAiTranscript(sessionId, turnIndex, result.ai_reply_fi, {
            isConclusive: turnIndex >= 4,
          });
          setFeedback(result.feedback);
          setFeedbackExpanded(false);
          setError(null);
          setDebugInfo((prev) => ({
            ...prev,
            sttRequests: prev.sttRequests + 1,
            lastTranscript: normalized,
          }));
          await playAiReply(result.ai_reply_fi);
          await persistAttempt({
            id: `${Date.now()}-${topicIndex}-${durationIndex}-followup`,
            parent_attempt_id: pendingParentId,
            user_audio_url: '',
            transcript: normalized,
            stt: { text: normalized, meta: sttMeta },
            target_text: followUpPrompt || topic,
            ai_reply_text: result.ai_reply_fi,
            feedback: result.feedback,
            level_tag: 'B1',
            mode_tag: 'Mode C',
            duration_ms: durationActualMs,
            timestamp: Date.now(),
            low_confidence_stt: result.flags?.low_confidence_stt ?? false,
            needs_practice:
              result.level_adjustment === 'down' || result.flags?.low_confidence_stt,
            turn_tag: 'followup',
            metrics,
          });
          setStatus('Playing AI voice…');
          setPhase('monologue');
          setFollowUpPrompt('');
          setPendingParentId(null);
          if (turnIndex >= 4) {
            completeSpeakingSession(sessionId);
          }
          return;
        }

        const result = generateSpeakingTurn({
          user_transcript: normalized,
          level: 'B1',
          mode: 'fluency',
          user_state: {
            mode_tag: 'Mode C',
            target_text: topic,
            turn_tag: 'monologue',
            metrics,
            history,
          },
        });
        const fluencyTip = buildFluencyTip({
          paceWpm: computedPace,
          fillerCount: metrics.filler_count,
          pauseMarkers: metrics.pause_markers,
          lexicalVariety: metrics.lexical_variety,
          durationMs: durationActualMs,
        });
        const tunedFeedback = {
          ...(result.feedback || {}),
          one_fix_now: fluencyTip
            ? `${result?.feedback?.one_fix_now || ''} ${fluencyTip}`.trim()
            : result?.feedback?.one_fix_now,
        };
        const followUp = pickFollowUpPrompt({
          topic,
          paceWpm: computedPace,
          fillerCount: metrics.filler_count,
          pauseMarkers: metrics.pause_markers,
        });
        setSpeakingTurnAiTranscript(sessionId, turnIndex, `${result.ai_reply_fi}\n\n${followUp}`, {
          isConclusive: turnIndex >= 4,
        });
        setFeedback(tunedFeedback);
        setFeedbackExpanded(false);
        setError(null);
        setDebugInfo((prev) => ({
          ...prev,
          sttRequests: prev.sttRequests + 1,
          lastTranscript: normalized,
        }));
        const parentAttemptId = `${Date.now()}-${topicIndex}-${durationIndex}-monologue`;
        await playAiReply(result.ai_reply_fi);
        await playAiReply(followUp);
        await persistAttempt({
          id: parentAttemptId,
          user_audio_url: '',
          transcript: normalized,
          stt: { text: normalized, meta: sttMeta },
          target_text: topic,
          ai_reply_text: result.ai_reply_fi,
          feedback: tunedFeedback,
          level_tag: 'B1',
          mode_tag: 'Mode C',
          duration_ms: durationActualMs,
          timestamp: Date.now(),
          low_confidence_stt: result.flags?.low_confidence_stt ?? false,
          needs_practice:
            result.level_adjustment === 'down' || result.flags?.low_confidence_stt,
          turn_tag: 'monologue',
          followup_prompt: followUp,
          metrics,
        });
        setPhase('followup');
        setFollowUpPrompt(followUp);
        setPendingParentId(parentAttemptId);
        setStatus('Playing AI voice…');
        if (turnIndex >= 4) {
          completeSpeakingSession(sessionId);
        }
      } catch (err) {
        setError(err?.message || 'Palvelin ei vastannut.');
        setStatus('Error');
      } finally {
        setTimeout(() => setStatus('Hold to talk'), 600);
      }
    },
    [
      phase,
      followUpPrompt,
      pendingParentId,
      topic,
      topicIndex,
      durationIndex,
      history,
      targetDuration,
      timer,
      recordingDuration,
      persistAttempt,
      playAiReply,
      sessionId,
      sessionStatus,
      turnIndex,
    ]
  );

  const { startRecording, stopRecording, isRecording } = useVoiceStreaming({
    onStateChange: (state) => {
      if (state.isRecording) {
        setStatus('Listening…');
        setDebugInfo((prev) => ({ ...prev, recordingState: 'recording' }));
      } else if (state.isProcessing) {
        setStatus('Processing…');
        setDebugInfo((prev) => ({ ...prev, recordingState: 'processing' }));
      } else if (state.isSpeaking) {
        setStatus('Playing AI voice…');
        setDebugInfo((prev) => ({ ...prev, recordingState: 'playing' }));
      } else {
        setStatus('Hold to talk');
        setDebugInfo((prev) => ({ ...prev, recordingState: 'idle' }));
      }
    },
    onTranscriptComplete,
    vadSilenceThreshold: 2500,
  });

  useEffect(() => {
    if (sessionStatus !== 'completed') return;
    try {
      stopRecording?.();
    } catch (_) {
      // ignore
    }
  }, [sessionStatus, stopRecording]);

  useEffect(() => {
    if (isRecording) {
      recordingStartRef.current = Date.now();
      setRecordingDuration(0);
      setTimer(targetDuration);
      countdownRef.current = setInterval(() => {
        setTimer((prev) => Math.max(prev - 1000, 0));
        if (recordingStartRef.current) {
          setRecordingDuration(Date.now() - recordingStartRef.current);
        }
      }, 1000);
    } else if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [isRecording, targetDuration]);

  useEffect(() => {
    setDebugEntries([
      { label: 'Mic', value: micPermission },
      { label: 'Phase', value: phase },
      { label: 'Record', value: debugInfo.recordingState },
      { label: 'STT req', value: `${debugInfo.sttRequests}` },
      { label: 'TTS req', value: `${debugInfo.ttsRequests}` },
      { label: 'Transcript', value: debugInfo.lastTranscript || '—' },
      { label: 'Reply', value: debugInfo.lastReply || '—' },
      { label: 'Playback', value: debugInfo.playbackState },
      { label: 'Errors', value: debugInfo.errorLog || 'none' },
    ]);
  }, [debugInfo, micPermission, phase]);

  const handlePermissionStatus = useCallback(async () => {
    try {
      const { status } = await Audio.getPermissionsAsync();
      setMicPermission(status);
      setDebugInfo((prev) => ({ ...prev, micPermission: status }));
    } catch (err) {
      setDebugInfo((prev) => ({ ...prev, micPermission: 'unknown' }));
    }
  }, []);

  useEffect(() => {
    handlePermissionStatus();
  }, [handlePermissionStatus]);

  const loadHistory = useCallback(async () => {
    const attempts = await loadSpeakingAttempts();
    setHistory(Array.isArray(attempts) ? attempts : []);
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleNextTopic = () => {
    if (sessionStatus === 'completed') return;
    if (turnIndex >= 4) return;
    advanceSpeakingTurn(sessionId);
    setTopicIndex((prev) => (prev + 1) % TOPICS.length);
    setFeedback(null);
    setFeedbackExpanded(false);
    setPhase('monologue');
    setFollowUpPrompt('');
    setPendingParentId(null);
  };

  if (sessionStatus === 'completed') {
    const turns = session?.turns || [];
    const idx = Math.max(0, Math.min(turns.length - 1, reviewTurnIndex));
    const turn = turns[idx] || null;
    return (
      <Background module="practice" variant="brown" solidContentZone>
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
              style={[styles.nextButton, { flex: 1, opacity: idx === 0 ? 0.5 : 1 }]}
              disabled={idx === 0}
              onPress={() => setReviewTurnIndex((n) => Math.max(0, n - 1))}
            >
              <Text style={styles.nextButtonText}>Edellinen</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.nextButton, { flex: 1, opacity: idx >= turns.length - 1 ? 0.5 : 1 }]}
              disabled={idx >= turns.length - 1}
              onPress={() => setReviewTurnIndex((n) => Math.min(turns.length - 1, n + 1))}
            >
              <Text style={styles.nextButtonText}>Seuraava</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Background>
    );
  }

  const increaseDuration = () => {
    setDurationIndex((prev) => Math.min(prev + 1, DURATIONS.length - 1));
  };

  const decreaseDuration = () => {
    setDurationIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <Background module="practice" variant="brown" solidContentZone>
      <View style={styles.container}>
        <Text style={styles.title}>Fluency Builder</Text>
        <Text style={styles.topic}>{topic}</Text>
        <View style={styles.durationRow}>
          <TouchableOpacity onPress={decreaseDuration} style={styles.durationButton}>
            <Text style={styles.durationButtonText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.durationLabel}>{formatMs(targetDuration)}</Text>
          <TouchableOpacity onPress={increaseDuration} style={styles.durationButton}>
            <Text style={styles.durationButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.recorder}>
          <MicButton onPressIn={() => startRecording({ userInitiated: true, userGesture: true })} onPressOut={stopRecording} isActive={isRecording} />
          <Text style={styles.status}>{status}</Text>
          <Text style={styles.timer}>{timer > 0 ? formatMs(timer) : 'Ready'}</Text>
        </View>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Transcript</Text>
          <Text style={styles.panelText}>{transcript || 'Speak continuously until the timer finishes.'}</Text>
          <Text style={styles.panelTitle}>AI Suggestion</Text>
          <Text style={styles.panelText}>{aiReply || 'AI feedback will appear after your turn.'}</Text>
        </View>
        <View style={styles.metricRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Lexical variety</Text>
            <Text style={styles.metricValue}>{(lexicalVariety * 100).toFixed(0)}%</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Filler words</Text>
            <Text style={styles.metricValue}>{fillerCount}</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Pause markers</Text>
            <Text style={styles.metricValue}>{pauseMarkers}</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Pace (WPM)</Text>
            <Text style={styles.metricValue}>{paceWpm}</Text>
          </View>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.feedback}>
          {feedback ? (
            <>
              <Text style={styles.feedbackText}>{feedback.one_big_win}</Text>
              <Text style={styles.feedbackText}>{feedback.one_fix_now}</Text>
              <TouchableOpacity
                style={styles.whyButton}
                onPress={() => setFeedbackExpanded((prev) => !prev)}
              >
                <Text style={styles.whyLabel}>
                  {feedbackExpanded ? 'Hide' : 'Why this feedback?'} (
                  {getRubricLabel(normalizeRubricDimension(feedback.dimension))})
                </Text>
              </TouchableOpacity>
              {feedbackExpanded ? (
                <Text style={styles.feedbackText}>
                  {getRubricExplanation(feedback.dimension)}
                </Text>
              ) : null}
              <Text style={styles.feedbackText}>Micro drills:</Text>
              {feedback.micro_drill?.map((drill) => (
                <Text key={drill} style={styles.feedbackText}>
                  • {drill}
                </Text>
              ))}
            </>
          ) : (
            <Text style={styles.feedbackText}>Feedback appears after each attempt.</Text>
          )}
        </View>
        <TouchableOpacity style={styles.nextButton} onPress={handleNextTopic}>
          <Text style={styles.nextButtonText}>Next topic</Text>
        </TouchableOpacity>
        <FlatList
          data={history.filter((attempt) => attempt.mode_tag === 'Mode C')}
          keyExtractor={(item) => item.id}
          style={styles.historyList}
          ListEmptyComponent={() => (
            <Text style={[styles.panelText, { marginTop: spacing.small }]}>
              No fluency attempts saved yet.
            </Text>
          )}
          renderItem={({ item }) => (
            <View style={styles.historyRow}>
              <Text style={styles.historyTitle}>{item.transcript || '(no transcript)'}</Text>
              <Text style={styles.historyMeta}>
                {new Date(item.timestamp).toLocaleString()} · Level {item.level_tag}
              </Text>
              <Text style={styles.historyMeta}>
                Duration: {formatMs(item.duration_ms ?? 0)}
              </Text>
              <Text style={styles.historyMeta}>
                Confidence: {item.feedback?.flags?.low_confidence_stt ? 'low' : 'ok'}
              </Text>
            </View>
          )}
        />
        <SpeakingDebugPanel entries={debugEntries} visible={__DEV__} />
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.m,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.white,
  },
  topic: {
    marginTop: spacing.small,
    color: colors.surface,
    fontSize: 16,
  },
  durationRow: {
    marginTop: spacing.small,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: spacing.xsmall,
    marginHorizontal: spacing.small,
  },
  durationButtonText: {
    color: colors.primary,
    fontSize: 20,
  },
  durationLabel: {
    color: colors.surface,
  },
  recorder: {
    alignItems: 'center',
    marginVertical: spacing.small,
  },
  status: {
    marginTop: spacing.small,
    color: colors.surface,
  },
  timer: {
    color: '#8bd7ff',
  },
  metricRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: spacing.small,
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.s,
    borderRadius: 12,
  },
  metricItem: {
    width: '45%',
    marginBottom: spacing.xs,
  },
  metricLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },
  metricValue: {
    color: colors.textPrimary,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  panel: {
    backgroundColor: '#1f1c27',
    borderRadius: 14,
    padding: spacing.medium,
  },
  panelTitle: {
    color: colors.primary,
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  panelText: {
    color: colors.surface,
    marginTop: spacing.xsmall,
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
    color: colors.primary,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xsmall,
  },
  reviewCardText: {
    color: colors.surface,
    fontSize: 16,
    lineHeight: 22,
  },
  reviewControls: {
    flexDirection: 'row',
    gap: 10,
  },
  error: {
    color: '#ff8b8b',
    marginVertical: spacing.xsmall,
  },
  feedback: {
    marginTop: spacing.small,
    backgroundColor: '#0f1117',
    borderRadius: 12,
    padding: spacing.medium,
  },
  feedbackText: {
    color: colors.surface,
    marginBottom: spacing.xsmall,
  },
  whyButton: {
    marginBottom: spacing.xsmall,
    paddingVertical: spacing.xsmall,
    paddingHorizontal: spacing.small,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    alignSelf: 'flex-start',
  },
  whyLabel: {
    color: colors.primary,
    fontWeight: '600',
  },
  nextButton: {
    marginTop: spacing.small,
    alignItems: 'center',
    paddingVertical: spacing.small,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  nextButtonText: {
    color: '#fff',
  },
  historyList: {
    marginTop: spacing.medium,
  },
  historyRow: {
    marginTop: spacing.small,
    padding: spacing.small,
    backgroundColor: '#14121a',
    borderRadius: 10,
  },
  historyTitle: {
    color: colors.surface,
    fontWeight: '600',
  },
  historyMeta: {
    color: colors.textMuted,
    fontSize: 12,
  },
});
