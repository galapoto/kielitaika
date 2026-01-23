import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
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
import { getRubricExplanation, getRubricLabel, normalizeRubricDimension } from '../utils/feedbackRubric';
import { generateSpeakingTurn } from '../utils/speakingTurnEngine';

const TASKS = [
  { id: 'shop', title: 'Shop for coffee', prompt: 'Tilaa kahvi ja kysy, onko tarjouksia.', level: 'A2', goal: 'ask about deals' },
  { id: 'clinic', title: 'Clinic check-in', prompt: 'Kysy vastaanottoajasta ja mainitse oireesi.', level: 'B1', goal: 'describe issue' },
  { id: 'neighbor', title: 'Neighbor chat', prompt: 'Kerro naapuriin tervetulos ja sovi tapaamisesta.', level: 'A2', goal: 'suggest meetup' },
  { id: 'appointment', title: 'Doctor call', prompt: 'Soita lääkäriin ja peru varaamasi aika.', level: 'B2', goal: 'cancel appointment' },
];

const GOAL_RULES = {
  shop: {
    requiredAll: [[/kahvi/i], [/tarjous|alennus|tarjouksia/i]],
    hintFi: 'Mainitse kahvi + kysy tarjouksista (tarjous/alennus).',
  },
  clinic: {
    requiredAll: [[/aika|vastaanotto/i], [/kipu|kuume|ysk|flunss|oire/i]],
    hintFi: 'Kysy ajasta ja mainitse yksi oire (esim. kuume, yskä, kipu).',
  },
  neighbor: {
    requiredAll: [[/tervetuloa|moi|hei/i], [/kahville|tavata|tapaaminen|nähd/i]],
    hintFi: 'Tervehdi + ehdota tapaamista (esim. kahville / nähdään).',
  },
  appointment: {
    requiredAll: [[/peru|peruut/i], [/aika|ajan/i]],
    hintFi: 'Sano että peruutat ajan (peru/peruutan + aika).',
  },
};

const evaluateGoal = (taskId, transcript) => {
  const rules = GOAL_RULES[taskId];
  if (!rules) {
    return { met: true, hintFi: '' };
  }
  const normalized = (transcript || '').toLowerCase().trim();
  const met = rules.requiredAll.every((group) => group.some((rx) => rx.test(normalized)));
  return { met, hintFi: rules.hintFi };
};

const formatDuration = (ms = 0) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, '0')}`;
};

const formatFeedback = (feedback) =>
  feedback ? (
    <View>
      <Text style={styles.feedbackText}>{feedback.one_big_win}</Text>
      <Text style={styles.feedbackText}>{feedback.one_fix_now}</Text>
      <Text style={styles.feedbackText}>{feedback.better_version_fi}</Text>
      <Text style={styles.feedbackText}>Micro drills:</Text>
      {feedback.micro_drill?.map((drill) => (
        <Text key={drill} style={styles.feedbackText}>
          • {drill}
        </Text>
      ))}
      <Text style={styles.feedbackText}>Dimension: {feedback.dimension}</Text>
      <Text style={styles.feedbackText}>
        Level suggestion: {feedback.level_adjustment || 'stay'}
      </Text>
    </View>
  ) : (
    <Text style={styles.feedbackText}>No feedback yet.</Text>
  );

export default function RoleplayScreen() {
  const [taskIndex, setTaskIndex] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [aiReply, setAiReply] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [feedbackExpanded, setFeedbackExpanded] = useState(false);
  const [goalMet, setGoalMet] = useState(null);
  const [goalHintFi, setGoalHintFi] = useState('');
  const [history, setHistory] = useState([]);
  const [statusMessage, setStatusMessage] = useState('Hold to talk');
  const [micPermission, setMicPermission] = useState('unknown');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isProcessingAttempt, setIsProcessingAttempt] = useState(false);
  const [error, setError] = useState(null);
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
  const [waveformHeights, setWaveformHeights] = useState([24, 32, 28, 40, 30, 25]);
  const [ttsFailure, setTtsFailure] = useState(null);
  const recordingStartRef = useRef(null);
  const recordingTimerRef = useRef(null);

  const { speak } = useVoice();
  const currentTask = useMemo(() => TASKS[taskIndex], [taskIndex]);

  const handlePermissionStatus = useCallback(async () => {
    try {
      const status = await Audio.getPermissionsAsync();
      setMicPermission(status.status);
      setDebugInfo((prev) => ({ ...prev, micPermission: status.status }));
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

  const persistAttempt = useCallback(async (attempt) => {
    const updated = await persistSpeakingAttempt(attempt);
    if (Array.isArray(updated)) {
      setHistory(updated);
    }
  }, []);

  const playAiReply = useCallback(
    async (text) => {
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
    [speak],
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

  const handleTranscriptComplete = useCallback(
    async (value) => {
      const sttText = typeof value === 'string' ? value : value?.text;
      const sttMeta = typeof value === 'object' && value ? value.meta : null;
      const normalized = (sttText || '').trim();
      if (!normalized) return;
      setTranscript(normalized);
      setStatusMessage('Processing…');
      const goalEval = evaluateGoal(currentTask.id, normalized);
      setGoalMet(goalEval.met);
      setGoalHintFi(goalEval.hintFi);
      if (!goalEval.met) {
        setError(`Goal unmet. Try again: ${goalEval.hintFi}`);
      } else {
        setError(null);
      }
      const attemptDuration = recordingStartRef.current
        ? Date.now() - recordingStartRef.current
        : 0;
      setRecordingDuration(attemptDuration);
      setIsProcessingAttempt(true);
      try {
        const result = generateSpeakingTurn({
          user_transcript: normalized,
          level: currentTask.level,
          mode: 'roleplay',
          user_state: {
            mode_tag: 'Mode B',
            target_text: currentTask.prompt,
            task_id: currentTask.id,
            task_goal: currentTask.goal,
            history,
          },
        });
        setAiReply(result.ai_reply_fi);
        setFeedback(result.feedback);
        setFeedbackExpanded(false);
        setDebugInfo((prev) => ({
          ...prev,
          sttRequests: prev.sttRequests + 1,
          lastTranscript: normalized,
        }));
        const attemptId = `${Date.now()}-${currentTask.id}-${Math.random().toString(36).slice(2, 8)}`;
        const attemptRecord = {
          id: attemptId,
          user_audio_url: '',
          transcript: normalized,
          stt: { text: normalized, meta: sttMeta },
          target_text: currentTask.prompt,
          ai_reply_text: result.ai_reply_fi,
          feedback: result.feedback,
          level_tag: currentTask.level,
          mode_tag: 'Mode B',
          duration_ms: attemptDuration,
          timestamp: Date.now(),
          low_confidence_stt: result.flags?.low_confidence_stt ?? false,
          needs_practice:
            result.level_adjustment === 'down' || result.flags?.low_confidence_stt,
          audio_duration_ms: attemptDuration,
          recording_state: 'complete',
          task_id: currentTask.id,
          task_goal: currentTask.goal,
          goal_met: goalEval.met,
          remediation_required: !goalEval.met,
          remediation_hint_fi: goalEval.met ? '' : goalEval.hintFi,
        };
        await persistAttempt(attemptRecord);
        if (result.ai_reply_fi) {
          await playAiReply(result.ai_reply_fi);
        }
        if (!goalEval.met && goalEval.hintFi) {
          await playAiReply(`Yritä uudestaan. ${goalEval.hintFi}`);
        }
        setStatusMessage('Playing AI voice…');
      } catch (err) {
        const message = err?.message || 'Palvelinvirhe';
        setError(message);
        setDebugInfo((prev) => ({ ...prev, errorLog: message }));
        setStatusMessage('Error');
      } finally {
        setIsProcessingAttempt(false);
        setTimeout(() => setStatusMessage('Hold to talk'), 400);
      }
    },
    [currentTask, history, persistAttempt, playAiReply],
  );

  const { startRecording, stopRecording, isRecording } = useVoiceStreaming({
    onStateChange: handleVoiceState,
    onTranscriptComplete: handleTranscriptComplete,
    vadSilenceThreshold: 2200,
  });

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

  const filteredHistory = useMemo(
    () => history.filter((attempt) => attempt.mode_tag === 'Mode B'),
    [history],
  );

  useEffect(() => {
    setDebugEntries([
      { label: 'Mic', value: micPermission },
      { label: 'Record', value: debugInfo.recordingState },
      { label: 'STT', value: `${debugInfo.sttRequests}` },
      { label: 'TTS', value: `${debugInfo.ttsRequests}` },
      { label: 'Last transcript', value: debugInfo.lastTranscript || '—' },
      { label: 'Last reply', value: debugInfo.lastReply || '—' },
      { label: 'Playback', value: debugInfo.playbackState },
      { label: 'Errors', value: debugInfo.errorLog || 'none' },
    ]);
  }, [micPermission, debugInfo]);

  const nextTask = () => {
    if (goalMet === false) {
      setError('Goal not met — complete the remediation turn first.');
      return;
    }
    setTaskIndex((prev) => (prev + 1) % TASKS.length);
    setTranscript('');
    setAiReply('');
    setFeedback(null);
    setFeedbackExpanded(false);
    setGoalMet(null);
    setGoalHintFi('');
  };

  const renderWaveform = () => (
    <View style={styles.waveform}>
      {waveformHeights.map((height, index) => (
        <View key={`${height}-${index}`} style={[styles.waveformBar, { height }]} />
      ))}
    </View>
  );

  return (
    <Background>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Roleplay Conversation</Text>
          <Text style={styles.subtitle}>{currentTask.title}</Text>
          <Text style={styles.prompt}>{currentTask.prompt}</Text>
          <Text style={styles.goal}>Goal: {currentTask.goal}</Text>
          {goalMet === false ? (
            <Text style={styles.goalWarning}>Goal unmet · remediation required</Text>
          ) : goalMet === true ? (
            <Text style={styles.goalOk}>Goal met ✓</Text>
          ) : null}
        </View>

        <View style={styles.statusRow}>
          <Text style={[styles.statusLabel, { color: colors.primary }]}>Status</Text>
          <Text style={styles.statusMessage}>{statusMessage}</Text>
          <Text style={styles.statusLabel}>Mic {micPermission}</Text>
        </View>

        <View style={styles.recorder}>
          <Text style={styles.hintText}>Hold to talk · release to submit</Text>
          <MicButton
            onPressIn={handleRecordStart}
            onPressOut={handleRecordEnd}
            isActive={isRecording}
            disabled={isProcessingAttempt}
          />
          <Text style={styles.timerText}>{formatDuration(recordingDuration)}</Text>
          {renderWaveform()}
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Transcript</Text>
          <Text style={styles.panelText}>{transcript || 'Record to see the transcript.'}</Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>AI reply</Text>
          <Text style={styles.panelText}>{aiReply || 'AI reply will show here.'}</Text>
          {aiReply ? (
            <TouchableOpacity
              style={styles.replayButton}
              onPress={() => playAiReply(aiReply)}
            >
              <Text style={styles.replayLabel}>Replay AI voice</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.feedbackPanel}>
          <Text style={styles.panelTitle}>Feedback Rubric</Text>
          {formatFeedback(feedback)}
          {feedback ? (
            <>
              <TouchableOpacity
                style={styles.whyButton}
                onPress={() => setFeedbackExpanded((prev) => !prev)}
              >
                <Text style={styles.replayLabel}>
                  {feedbackExpanded ? 'Hide' : 'Why this feedback?'} (
                  {getRubricLabel(normalizeRubricDimension(feedback.dimension))})
                </Text>
              </TouchableOpacity>
              {feedbackExpanded ? (
                <Text style={styles.feedbackText}>
                  {getRubricExplanation(feedback.dimension)}
                </Text>
              ) : null}
            </>
          ) : null}
          {!goalMet && goalHintFi ? (
            <Text style={styles.feedbackText}>Remediation: {goalHintFi}</Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.nextButton, goalMet === false && styles.nextButtonDisabled]}
          onPress={nextTask}
          disabled={goalMet === false}
        >
          <Text style={styles.nextButtonText}>Next roleplay</Text>
        </TouchableOpacity>

        <View style={styles.historyHeader}>
          <Text style={styles.panelTitle}>Attempts (Mode B)</Text>
        </View>
        <FlatList
          data={filteredHistory}
          keyExtractor={(item) => item.id}
          style={styles.historyList}
          ListEmptyComponent={() => (
            <Text style={styles.panelText}>No attempts saved yet.</Text>
          )}
          renderItem={({ item }) => (
            <View style={styles.historyRow}>
              <Text style={styles.historyTitle}>{item.transcript}</Text>
              <Text style={styles.historyMeta}>
                {new Date(item.timestamp).toLocaleString()}
              </Text>
              <Text style={styles.historyMeta}>
                Duration: {formatDuration(item.duration_ms)} · Level {item.level_tag}
              </Text>
            </View>
          )}
        />

        {isProcessingAttempt && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.overlayText}>Saving & evaluating…</Text>
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
  header: {
    marginBottom: spacing.medium,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
  },
  subtitle: {
    fontSize: 16,
    marginTop: spacing.small,
    color: colors.surface,
  },
  prompt: {
    fontSize: 15,
    color: colors.surface,
    marginTop: spacing.small,
  },
  goal: {
    fontSize: 14,
    color: '#b2b6c0',
  },
  goalWarning: {
    marginTop: spacing.xsmall,
    color: '#ff6b6b',
    fontSize: 13,
  },
  goalOk: {
    marginTop: spacing.xsmall,
    color: '#8ac926',
    fontSize: 13,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.small,
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 12,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusMessage: {
    color: colors.surface,
    fontSize: 14,
  },
  recorder: {
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  hintText: {
    color: '#9ea3b7',
    marginBottom: spacing.small,
  },
  timerText: {
    marginTop: spacing.small,
    color: colors.surface,
  },
  waveform: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginTop: spacing.small,
  },
  waveformBar: {
    width: 6,
    marginHorizontal: 2,
    backgroundColor: '#ffffff55',
    borderRadius: 3,
  },
  panel: {
    backgroundColor: '#1E1B25',
    borderRadius: 14,
    padding: spacing.medium,
    marginVertical: spacing.small,
  },
  panelTitle: {
    fontSize: 12,
    color: colors.primary,
    textTransform: 'uppercase',
    marginBottom: spacing.xsmall,
    letterSpacing: 0.5,
  },
  panelText: {
    color: colors.surface,
  },
  feedbackPanel: {
    backgroundColor: '#11141d',
    borderRadius: 14,
    padding: spacing.medium,
  },
  feedbackText: {
    color: colors.surface,
    marginTop: spacing.xsmall,
  },
  replayButton: {
    marginTop: spacing.small,
    paddingVertical: spacing.xsmall,
    paddingHorizontal: spacing.small,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    alignSelf: 'flex-start',
  },
  replayLabel: {
    color: colors.primary,
  },
  whyButton: {
    marginTop: spacing.small,
    paddingVertical: spacing.xsmall,
    paddingHorizontal: spacing.small,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    alignSelf: 'flex-start',
  },
  nextButton: {
    marginTop: spacing.small,
    paddingVertical: spacing.small,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: '#fff',
  },
  historyHeader: {
    marginTop: spacing.small,
    marginBottom: spacing.xsmall,
  },
  historyList: {
    flexGrow: 0,
    maxHeight: 180,
  },
  historyRow: {
    backgroundColor: '#171820',
    borderRadius: 12,
    padding: spacing.small,
    marginBottom: spacing.xsmall,
  },
  historyTitle: {
    color: colors.surface,
    fontWeight: '600',
  },
  historyMeta: {
    color: '#777',
    fontSize: 12,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayText: {
    marginTop: spacing.small,
    color: '#fff',
  },
});
