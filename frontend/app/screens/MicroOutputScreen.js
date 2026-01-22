import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { fetchMicroTask, submitMicroTask } from '../utils/api';
import { useVoiceStreaming } from '../hooks/useVoiceStreaming';
import MicButton from '../components/MicButton';
import WaveformVisualizer from '../components/features/ConversationUI/WaveformVisualizer';
import SceneBackground from '../components/SceneBackground';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';
import { radius } from '../styles/radius';
import { useSound } from '../hooks/useSound';
import { RukaButton, RukaCard } from '../ui';
import { IconLightning, IconPlay, IconPause } from '../ui/icons/IconPack';

export default function MicroOutputScreen() {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(10);
  const [timerActive, setTimerActive] = useState(false);
  const { playTap, playMicOn } = useSound();

  const {
    isRecording,
    isProcessing,
    isListening,
    transcript,
    startRecording,
    stopRecording,
  } = useVoiceStreaming({
    onTranscriptComplete: async (finalTranscript) => {
      if (task && finalTranscript.trim() && timerActive) {
        await handleSubmit(finalTranscript);
      }
    },
    vadSilenceThreshold: 3000,
  });

  useEffect(() => {
    let interval = null;
    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeRemaining === 0 && isRecording) {
      stopRecording();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timeRemaining, isRecording, stopRecording]);

  const loadTask = async () => {
    try {
      setLoading(true);
      setError(null);
      setFeedback(null);
      setTimeRemaining(10);
      setTimerActive(false);
      const data = await fetchMicroTask();
      setTask(data.task || data);
    } catch (err) {
      setError(err.message || 'Could not load a micro task. Pull to retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTask();
  }, []);

  const handleStartSpeaking = async () => {
    try {
      playMicOn();
      setTimeRemaining(task?.seconds || 10);
      setTimerActive(true);
      setFeedback(null);
      await startRecording();
    } catch (err) {
      setError(err.message || 'Failed to start recording');
      setTimerActive(false);
    }
  };

  const handleStopSpeaking = async () => {
    try {
      setTimerActive(false);
      await stopRecording();
    } catch (err) {
      setError(err.message || 'Failed to stop recording');
    }
  };

  const handleSubmit = async (transcriptToSubmit = null) => {
    if (!task) return;
    const transcriptText = transcriptToSubmit || transcript;
    if (!transcriptText.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const result = await submitMicroTask(task.id, transcriptText);
      setFeedback(result.result || result);
    } catch (err) {
      setError(err.message || 'Failed to submit. Try again.');
    } finally {
      setLoading(false);
      setTimerActive(false);
    }
  };

  return (
    <View style={styles.container}>
      <SceneBackground sceneKey="aurora" orbEmotion="calm" />
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>10s Output Task</Text>
          <Text style={styles.subtitle}>Fast speaking nudge to build fluency</Text>
        </View>
        <RukaButton title={loading ? 'Loading...' : 'New Task'} onPress={loadTask} icon={IconLightning} disabled={loading} />
      </View>

      {loading && !task && (
        <View style={styles.loadingBlock}>
          <ActivityIndicator color={colors.blueMain} />
          <Text style={styles.loadingText}>Preparing task...</Text>
        </View>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      {!loading && task && (
        <ScrollView contentContainerStyle={styles.content}>
          <RukaCard title={task.title || 'Micro Output'} subtitle={task.prompt} style={styles.card}>
            <View style={styles.timerSection}>
              <Text style={styles.timerLabel}>Time remaining:</Text>
              <Text style={[styles.timer, timerActive && styles.timerActive]}>
                {timeRemaining}s
              </Text>
            </View>

            {task.hints && task.hints.length > 0 && (
              <View style={styles.hintsSection}>
                <Text style={styles.hintsLabel}>Hints:</Text>
                {task.hints.map((hint, idx) => (
                  <Text key={idx} style={styles.hintText}>• {hint}</Text>
                ))}
              </View>
            )}

            <View style={styles.stateIndicators}>
              {isListening && (
                <View style={styles.stateBadge}>
                  <ActivityIndicator size="small" color={colors.blueMain} />
                  <Text style={styles.stateText}>Listening...</Text>
                </View>
              )}
              {isProcessing && (
                <View style={styles.stateBadge}>
                  <ActivityIndicator size="small" color={colors.blueMain} />
                  <Text style={styles.stateText}>Processing...</Text>
                </View>
              )}
              {timerActive && (
                <View style={styles.stateBadge}>
                  <View style={styles.recordingDot} />
                  <Text style={styles.stateText}>Recording...</Text>
                </View>
              )}
            </View>

            <View style={styles.micContainer}>
              <MicButton
                onPressIn={handleStartSpeaking}
                onPressOut={handleStopSpeaking}
                isRecording={isRecording}
                audioLevels={[]}
              />
              <Text style={styles.micHint}>
                {timerActive
                  ? `Speak for ${timeRemaining} more seconds...`
                  : 'Tap to start your 10-second response'}
              </Text>
            </View>

            {isRecording && (
              <View style={styles.waveformContainer}>
                <WaveformVisualizer isActive={isRecording} />
              </View>
            )}

            {transcript && (
              <View style={styles.transcriptContainer}>
                <Text style={styles.transcriptLabel}>You said:</Text>
                <Text style={styles.transcript}>{transcript}</Text>
              </View>
            )}

            {transcript && !feedback && !isProcessing && !timerActive && (
              <RukaButton
                title="Submit Response"
                onPress={() => handleSubmit()}
                icon={IconPlay}
              />
            )}
          </RukaCard>

          {feedback && (
            <RukaCard title="Quick Feedback" subtitle={feedback.feedback}>
              <View style={styles.feedbackMeta}>
                {feedback.transcript_word_count !== undefined && (
                  <Text style={styles.feedbackMetaText}>
                    Words: {feedback.transcript_word_count}
                  </Text>
                )}
                {feedback.completeness !== undefined && (
                  <Text style={styles.feedbackMetaText}>
                    Completeness: {feedback.completeness}%
                  </Text>
                )}
                {feedback.fluency !== undefined && (
                  <Text style={styles.feedbackMetaText}>
                    Fluency: {feedback.fluency}/5
                  </Text>
                )}
              </View>
              <RukaButton
                title="Next Challenge"
                onPress={() => {
                  setFeedback(null);
                  loadTask();
                }}
                icon={IconLightning}
                style={{ marginTop: spacing.m }}
              />
            </RukaCard>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.grayBg,
  },
  header: {
    padding: spacing.l,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayLine,
  },
  title: {
    ...typography.titleL,
    fontWeight: '700',
    color: colors.textMain,
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.textSoft,
    marginTop: spacing.xs,
  },
  loadingBlock: {
    padding: spacing.l,
    alignItems: 'center',
    gap: spacing.s,
  },
  loadingText: {
    ...typography.bodySm,
    color: colors.textSoft,
  },
  error: {
    ...typography.bodySm,
    color: '#EF4444',
    padding: spacing.l,
    textAlign: 'center',
  },
  content: {
    padding: spacing.l,
    gap: spacing.m,
  },
  card: {
    width: '100%',
  },
  timerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.m,
    backgroundColor: colors.grayBg,
    borderRadius: radius.m,
    marginBottom: spacing.m,
  },
  timerLabel: {
    ...typography.body,
    color: colors.textSoft,
    fontWeight: '600',
  },
  timer: {
    ...typography.titleXL,
    fontWeight: '700',
    color: colors.textMain,
  },
  timerActive: {
    color: colors.blueMain,
  },
  hintsSection: {
    gap: spacing.xs,
    marginBottom: spacing.m,
  },
  hintsLabel: {
    ...typography.bodySm,
    color: colors.textSoft,
    fontWeight: '600',
  },
  hintText: {
    ...typography.bodySm,
    color: colors.textMain,
  },
  stateIndicators: {
    flexDirection: 'row',
    gap: spacing.s,
    marginBottom: spacing.m,
    flexWrap: 'wrap',
  },
  stateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.grayBg,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: radius.m,
  },
  stateText: {
    ...typography.bodySm,
    color: colors.textMain,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.blueMain,
  },
  micContainer: {
    alignItems: 'center',
    gap: spacing.xs,
    marginVertical: spacing.m,
  },
  micHint: {
    ...typography.bodySm,
    color: colors.textSoft,
  },
  waveformContainer: {
    marginTop: spacing.sm,
    width: '100%',
  },
  transcriptContainer: {
    marginTop: spacing.m,
    backgroundColor: colors.grayBg,
    padding: spacing.m,
    borderRadius: radius.m,
  },
  transcriptLabel: {
    ...typography.bodySm,
    color: colors.textSoft,
    marginBottom: spacing.xs,
  },
  transcript: {
    ...typography.body,
    color: colors.textMain,
  },
  feedbackMeta: {
    marginTop: spacing.m,
    gap: spacing.xs,
  },
  feedbackMetaText: {
    ...typography.bodySm,
    color: colors.textMain,
  },
});
