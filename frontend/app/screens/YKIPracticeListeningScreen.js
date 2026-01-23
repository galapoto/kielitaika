/**
 * YKIPracticeListeningScreen - Short YKI listening practice exercises
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Background from '../components/ui/Background';
import PremiumEmbossedButton from '../components/PremiumEmbossedButton';
import HomeButton from '../components/HomeButton';
import YKIModeBanner from '../components/YKIModeBanner';

import { colors as palette } from '../styles/colors';
import { designTokens } from '../styles/designTokens';
import { generateYkiListeningTask } from '../utils/api';
import { playTTS } from '../services/tts';


const { typography = {}, spacing = {}, textColor = {} } = designTokens || {};

const LISTENING_BUCKETS = [
  { key: 'gist', label: 'Gist', hint: 'Understand the main idea.' },
  { key: 'detail', label: 'Details', hint: 'Capture times, places, names.' },
  { key: 'inference', label: 'Inference', hint: 'Guess implied meaning.' },
  { key: 'numbers', label: 'Numbers', hint: 'Remember figures and amounts.' },
];

export default function YKIPracticeListeningScreen({ navigation, route } = {}) {
  const { ykiMode = 'training' } = route?.params || {};
  const [loading, setLoading] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [examInfo, setExamInfo] = useState(null);
  const [fixPack, setFixPack] = useState([]);
  const [readiness, setReadiness] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [evaluation, setEvaluation] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [audioError, setAudioError] = useState('');
  const [replaysUsed, setReplaysUsed] = useState(0);
  const replayLimit = ykiMode === 'exam' ? 1 : 3; // exam mode = 1 replay, training = 3

  const handleStartPractice = async () => {
    setLoading(true);
    try {
      const res = await generateYkiListeningTask('B1');
      const task = res?.task;
      if (!task?.script_fi || !task?.questions?.length) {
        throw new Error('Listening task missing script or questions.');
      }
      setCurrentExercise({
        script: task.script_fi,
        transcript: task.transcript || task.script_fi,
        questions: task.questions || [],
        meta: task.meta || {},
      });
      setExamInfo({
        examId: `listening_practice_${Date.now()}`,
        examType: 'practice',
        level: task.level || 'B1',
        totalTasks: 1,
        totalTimeMinutes: 6,
      });
      setSelectedOptions({});
      setEvaluation(null);
      setFixPack([]);
      setReadiness(null);
      setAudioError('');
      setReplaysUsed(0);
    } catch (error) {
      console.error('Failed to load listening exercise:', error);
      Alert.alert(
        'Could not load listening task',
        error?.message || 'Please check your connection and try again.',
        [{ text: 'Retry', onPress: handleStartPractice }, { text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAudio = async () => {
    if (!currentExercise?.script) return;
    setAudioError('');
    if (replaysUsed >= replayLimit) {
      Alert.alert('Replay limit reached', `You’ve used all ${replayLimit} replays for this exercise.`);
      return;
    }
    const provider = await playTTS(currentExercise.script, 'yki', { playbackRate: 0.95 });
    if (!provider) {
      setAudioError('Audio failed. Please check your connection and tap Retry.');
      return;
    }
    setReplaysUsed((n) => n + 1);
  };

  const handleOptionSelect = (questionId, optionIdx) => {
    setSelectedOptions(prev => {
      const current = prev[questionId];
      const updated = current === optionIdx ? null : optionIdx;
      return {
        ...prev,
        [questionId]: updated,
      };
    });
  };

  const handleEvaluateListening = () => {
    if (!currentExercise) return;
    setIsEvaluating(true);
    const evaluationResult = buildListeningEvaluation(currentExercise, selectedOptions, examInfo);
    setEvaluation(evaluationResult);
    setFixPack(buildListeningFixPack(evaluationResult));
    setReadiness(buildListeningReadiness(evaluationResult));
    setIsEvaluating(false);
  };

  return (
    <Background module="yki_listen" variant="blue">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>YKI Listening Practice</Text>
          <HomeButton navigation={navigation} style={styles.homeButton} homeType="yki" />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <YKIModeBanner mode={ykiMode} style={styles.modeBanner} />
          
          {!currentExercise ? (
            <View style={styles.startContainer}>
              <Text style={styles.startTitle}>Practice YKI Listening</Text>
              <Text style={styles.startDescription}>
                Short listening comprehension exercises to prepare for the YKI exam.
              </Text>
              {loading ? (
                <ActivityIndicator size="large" color={palette.textPrimary} />
              ) : (
                <PremiumEmbossedButton
                  title="Start Practice"
                  onPress={handleStartPractice}
                  variant="primary"
                  size="large"
                  style={styles.startButton}
                />
              )}
            </View>
          ) : (
            <View style={styles.exerciseContainer}>
              {examInfo && (
                <View style={styles.examSummaryCard}>
                  <View style={styles.examSummaryRow}>
                    <View>
                      <Text style={styles.examSummaryLabel}>Mock ID</Text>
                      <Text style={styles.examSummaryValue}>{examInfo.examId}</Text>
                    </View>
                    <View>
                      <Text style={styles.examSummaryLabel}>Subtest</Text>
                      <Text style={styles.examSummaryValue}>{examInfo.examType?.replace('_', ' ')}</Text>
                    </View>
                    <View>
                      <Text style={styles.examSummaryLabel}>Level</Text>
                      <Text style={styles.examSummaryValue}>{examInfo.level}</Text>
                    </View>
                  </View>
                  <View style={styles.examSummaryRow}>
                    <View>
                      <Text style={styles.examSummaryLabel}>Time</Text>
                      <Text style={styles.examSummaryValue}>{examInfo.totalTimeMinutes} mins</Text>
                    </View>
                    <View>
                      <Text style={styles.examSummaryLabel}>Tasks</Text>
                      <Text style={styles.examSummaryValue}>{examInfo.totalTasks}</Text>
                    </View>
                  </View>
                </View>
              )}
              <Text style={styles.exerciseText}>Listen to the audio and answer the questions.</Text>
              <View style={styles.audioPlayerContainer}>
                <PremiumEmbossedButton
                  title={replaysUsed === 0 ? 'Play audio' : `Replay audio (${replaysUsed}/${replayLimit})`}
                  onPress={handlePlayAudio}
                  variant="secondary"
                  size="large"
                  style={styles.startButton}
                />
                {!!audioError && (
                  <View style={{ marginTop: 10 }}>
                    <Text style={styles.errorText}>{audioError}</Text>
                    <PremiumEmbossedButton title="Retry audio" onPress={handlePlayAudio} variant="primary" size="medium" />
                  </View>
                )}
              </View>
              {currentExercise.questions && currentExercise.questions.length > 0 && (
                <View style={styles.questionsContainer}>
                  <Text style={styles.questionsTitle}>Questions:</Text>
                  {currentExercise.questions.map((q, idx) => (
                    <View key={q.id || idx} style={styles.questionCard}>
                      <Text style={styles.questionText}>{q.question}</Text>
                      {q.options && q.options.map((opt, optIdx) => (
                        <TouchableOpacity
                          key={optIdx}
                          style={[
                            styles.optionButton,
                            selectedOptions[q.id] === optIdx && styles.optionButtonSelected,
                          ]}
                          onPress={() => handleOptionSelect(q.id || idx, optIdx)}
                        >
                          <Text
                            style={[
                              styles.optionText,
                              selectedOptions[q.id] === optIdx && styles.optionTextSelected,
                            ]}
                          >
                            {opt}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ))}
                </View>
              )}

              {/* Transcript is shown only AFTER evaluation (per guide). */}
              {evaluation && currentExercise.transcript ? (
                <View style={styles.transcriptContainer}>
                  <Text style={styles.transcriptLabel}>Transcript (after answering):</Text>
                  <Text style={styles.transcriptText}>{currentExercise.transcript}</Text>
                </View>
              ) : null}
              <View style={styles.actionButtons}>
                {isEvaluating ? (
                  <View style={styles.evaluatingContainer}>
                    <ActivityIndicator size="large" color={palette.accentPrimary} />
                    <Text style={styles.evaluatingText}>Capturing listening snapshot...</Text>
                  </View>
                ) : (
                  <PremiumEmbossedButton
                    title="Capture Results"
                    onPress={handleEvaluateListening}
                    variant="primary"
                    size="medium"
                    style={styles.actionButton}
                    disabled={isEvaluating}
                  />
                )}
              </View>
              {evaluation && (
                <View style={styles.rubricSection}>
                  <Text style={styles.rubricTitle}>Rubric Highlights</Text>
                  <View style={styles.rubricGrid}>
                    {LISTENING_BUCKETS.map(bucket => {
                      const score = evaluation?.scores?.[bucket.key];
                      return (
                        <View key={bucket.key} style={styles.rubricCard}>
                          <Text style={styles.rubricLabel}>{bucket.label}</Text>
                          <View style={styles.rubricScoreRow}>
                            <Text style={styles.rubricScore}>
                              {typeof score === 'number' ? `${score.toFixed(1)} / 4` : '–'}
                            </Text>
                            <View style={[styles.rubricDot, { backgroundColor: getBucketColor(score ?? 0) }]} />
                          </View>
                          <Text style={styles.rubricHint}>{bucket.hint}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}
              {fixPack.length > 0 && (
                <View style={styles.fixPackSection}>
                  <Text style={styles.fixPackTitle}>Fix Pack</Text>
                  {fixPack.map((item, idx) => (
                    <View key={`${item.title}-${idx}`} style={styles.fixPackCard}>
                      <Text style={styles.fixPackHeading}>{item.title}</Text>
                      <Text style={styles.fixPackDetail}>{item.detail}</Text>
                    </View>
                  ))}
                </View>
              )}
              {readiness && (
                <View style={styles.readinessSection}>
                  <Text style={styles.readinessTitle}>Readiness Snapshot</Text>
                  <View style={styles.readinessRow}>
                    <Text style={styles.readinessLabel}>Band</Text>
                    <Text style={styles.readinessValue}>{readiness.band}</Text>
                  </View>
                  <View style={styles.readinessRow}>
                    <Text style={styles.readinessLabel}>Confidence</Text>
                    <Text style={styles.readinessValue}>{readiness.confidence}</Text>
                  </View>
                  <View style={styles.readinessRow}>
                    <Text style={styles.readinessLabel}>Top blocker</Text>
                    <Text style={styles.readinessValue}>{readiness.weakest?.label}</Text>
                  </View>
                  <View style={styles.readinessPlan}>
                    {readiness.plan.map((step) => (
                      <View key={step.title} style={styles.readinessPlanItem}>
                        <Text style={styles.readinessPlanTitle}>{step.title}</Text>
                        <Text style={styles.readinessPlanDetail}>{step.detail}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </Background>
  );
}
const buildListeningEvaluation = (exercise, answers, examInfo) => {
  const totalQuestions = Math.max(exercise?.questions?.length || 0, 1);
  const answered = Object.values(answers || {}).filter(value => value != null).length;
  const completionRatio = Math.min(answered / totalQuestions, 1);
  const baseScore = Math.min(4, 2.2 + completionRatio * 1.6);
  const scores = {
    gist: Math.min(4, baseScore + 0.4),
    detail: Math.min(4, baseScore + 0.2),
    inference: Math.min(4, baseScore),
    numbers: Math.min(4, baseScore - 0.1),
  };

  const weakestEntry = Object.entries(scores).reduce(
    (lowest, [key, value]) => (value < lowest.value ? { key, value } : lowest),
    { key: 'gist', value: scores.gist }
  );

  return {
    band: examInfo?.level || '3',
    completion: completionRatio,
    confidence: completionRatio >= 0.75 ? 'High' : completionRatio >= 0.5 ? 'Medium' : 'Low',
    scores,
    weakest: {
      key: weakestEntry.key,
      label: LISTENING_BUCKETS.find(bucket => bucket.key === weakestEntry.key)?.label || 'Listening',
    },
  };
};

const buildListeningFixPack = (evaluation) => {
  const pack = [];
  if (evaluation?.scores?.gist < 3) {
    pack.push({
      title: 'Main Idea Focus',
      detail:
        'Listen again focusing on the opening sentence. Try to summarise the gist in one short line before answering.',
    });
  }
  if (evaluation?.scores?.detail < 3) {
    pack.push({
      title: 'Detail Drill',
      detail:
        'Pause after each sentence, write down one detail (time, place, person) and then answer the matching question.',
    });
  }
  if (evaluation?.scores?.inference < 3) {
    pack.push({
      title: 'Inference Probe',
      detail:
        'Highlight one implied connection in the transcript. Ask “What does X refer to?” before submitting.',
    });
  }
  if (evaluation?.scores?.numbers < 3) {
    pack.push({
      title: 'Numbers Under Pressure',
      detail:
        'Practice capturing amounts by repeating them aloud with a 4-second pause before answering.',
    });
  }
  pack.push({
    title: 'Retake Schedule',
    detail:
      'Repeat this task tomorrow and again in seven days to make the insights sticky. Mark the planned days in your calendar.',
  });
  return pack;
};

const buildListeningReadiness = (evaluation) => {
  return {
    band: evaluation?.band,
    confidence: evaluation?.confidence,
    weakest: evaluation?.weakest,
    plan: [
      {
        title: 'Today',
        detail: `Replay the same recording while journaling one key detail per sentence about ${evaluation?.weakest?.label || 'listening'}.`,
      },
      {
        title: 'In 3 days',
        detail: 'Pick a new passage and train inference + numbers back-to-back. Slower playback is OK.',
      },
      {
        title: 'In 1 week',
        detail: 'Combine this topic with a speaking check: explain the gist aloud and warn about the top blocker.',
      },
    ],
  };
};

const getBucketColor = (score) => {
  if (score >= 3.5) return palette?.accentSuccess || '#22C55E';
  if (score >= 2.5) return palette?.accentWarning || '#FBBF24';
  return palette?.accentError || '#F87171';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.backgroundPrimary,
  },
  modeBanner: {
    marginBottom: 16,
  },
  header: {
    paddingTop: spacing.xxl,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: spacing.sm,
  },
  backButtonText: {
    fontSize: typography.scale.h3.size,
    color: textColor.primary,
  },
  headerTitle: {
    fontSize: typography.scale.h2.size,
    fontFamily: typography.fontFamily,
    fontWeight: typography.scale.h2.weight,
    color: textColor.primary,
    flex: 1,
    textAlign: 'center',
  },
  homeButton: {
    position: 'absolute',
    top: spacing.xl,
    right: spacing.lg,
  },
  content: {
    padding: spacing.lg,
  },
  startContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  startTitle: {
    fontSize: typography.scale.h2.size,
    fontWeight: typography.scale.h2.weight,
    color: textColor.primary,
    marginBottom: spacing.sm,
    fontFamily: typography.fontFamily,
  },
  startDescription: {
    fontSize: typography.scale.body.size,
    color: textColor.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  startButton: {
    width: '100%',
    maxWidth: 320,
  },
  exerciseContainer: {
    marginBottom: spacing.lg,
  },
  exerciseText: {
    fontSize: typography.scale.body.size,
    color: textColor.primary,
    lineHeight: typography.scale.body.lineHeight,
    marginBottom: spacing.lg,
  },
  audioPlayerContainer: {
    backgroundColor: palette.surface,
    borderRadius: designTokens.borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: palette.divider,
  },
  audioLabel: {
    fontSize: typography.scale.small.size,
    color: textColor.secondary,
  },
  audioPlaceholder: {
    backgroundColor: palette.surface,
    borderRadius: designTokens.borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: palette.divider,
  },
  audioPlaceholderText: {
    fontSize: typography.scale.h2.size,
    color: textColor.primary,
    marginBottom: spacing.sm,
  },
  audioPlaceholderSubtext: {
    fontSize: typography.scale.small.size,
    color: textColor.secondary,
  },
  transcriptContainer: {
    backgroundColor: palette.surface,
    borderRadius: designTokens.borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: palette.divider,
  },
  transcriptLabel: {
    fontSize: typography.scale.small.size,
    fontWeight: typography.scale.small.weight,
    color: textColor.primary,
    marginBottom: spacing.xs,
    fontFamily: typography.fontFamily,
  },
  transcriptText: {
    fontSize: typography.scale.small.size,
    color: textColor.secondary,
    lineHeight: typography.scale.small.lineHeight,
  },
  questionsContainer: {
    marginTop: spacing.lg,
  },
  questionsTitle: {
    fontSize: typography.scale.cardTitle.size,
    fontWeight: typography.scale.cardTitle.weight,
    color: textColor.primary,
    marginBottom: spacing.sm,
    fontFamily: typography.fontFamily,
  },
  questionCard: {
    backgroundColor: palette.surface,
    borderRadius: designTokens.borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: palette.divider,
  },
  questionText: {
    fontSize: typography.scale.body.size,
    fontWeight: typography.scale.body.weight,
    color: textColor.primary,
    marginBottom: spacing.sm,
    fontFamily: typography.fontFamily,
  },
  optionButton: {
    backgroundColor: palette.backgroundSecondary,
    borderRadius: designTokens.borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  optionText: {
    fontSize: typography.scale.small.size,
    color: textColor.primary,
    fontFamily: typography.fontFamily,
  },
  optionButtonSelected: {
    backgroundColor: palette.accentPrimaryLight || '#E0FFE7',
  },
  optionTextSelected: {
    color: palette.accentPrimary || '#4ECDC4',
    fontWeight: typography.scale.small.weight,
  },
  examSummaryCard: {
    backgroundColor: palette.surfaceElevated,
    borderRadius: designTokens.borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: palette.divider,
  },
  examSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  examSummaryLabel: {
    fontSize: typography.scale.small.size,
    color: textColor.secondary,
    marginBottom: spacing.xs,
  },
  examSummaryValue: {
    fontSize: typography.scale.body.size,
    color: textColor.primary,
    fontWeight: typography.scale.body.weight,
  },
  actionButtons: {
    width: '100%',
    marginVertical: spacing.lg,
    alignItems: 'center',
  },
  actionButton: {
    width: '100%',
    maxWidth: 280,
  },
  evaluatingContainer: {
    alignItems: 'center',
  },
  evaluatingText: {
    marginTop: spacing.sm,
    color: textColor.secondary,
  },
  rubricSection: {
    marginTop: spacing.lg,
  },
  rubricTitle: {
    fontSize: typography.scale.h4.size,
    fontWeight: typography.scale.h4.weight,
    color: textColor.primary,
    marginBottom: spacing.md,
  },
  rubricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  rubricCard: {
    width: '48%',
    backgroundColor: palette.surface,
    borderRadius: designTokens.borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: palette.divider,
  },
  rubricLabel: {
    fontSize: typography.scale.small.size,
    color: textColor.secondary,
    marginBottom: spacing.xs,
  },
  rubricScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  rubricScore: {
    fontSize: typography.scale.body.size,
    fontWeight: typography.scale.body.weight,
    color: textColor.primary,
    marginRight: spacing.xs,
  },
  rubricDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  rubricHint: {
    fontSize: typography.scale.caption.size,
    color: textColor.secondary,
  },
  fixPackSection: {
    marginTop: spacing.lg,
  },
  fixPackTitle: {
    fontSize: typography.scale.h4.size,
    fontWeight: typography.scale.h4.weight,
    color: textColor.primary,
    marginBottom: spacing.sm,
  },
  fixPackCard: {
    backgroundColor: palette.surface,
    borderRadius: designTokens.borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: palette.divider,
  },
  fixPackHeading: {
    fontSize: typography.scale.body.size,
    fontWeight: typography.scale.body.weight,
    color: textColor.primary,
    marginBottom: spacing.xs,
  },
  fixPackDetail: {
    fontSize: typography.scale.small.size,
    color: textColor.secondary,
  },
  readinessSection: {
    marginTop: spacing.lg,
    backgroundColor: palette.surfaceElevated,
    borderRadius: designTokens.borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: palette.divider,
  },
  readinessTitle: {
    fontSize: typography.scale.h4.size,
    fontWeight: typography.scale.h4.weight,
    color: textColor.primary,
    marginBottom: spacing.md,
  },
  readinessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  readinessLabel: {
    fontSize: typography.scale.small.size,
    color: textColor.secondary,
  },
  readinessValue: {
    fontSize: typography.scale.small.size,
    color: textColor.primary,
  },
  readinessPlan: {
    marginTop: spacing.md,
  },
  readinessPlanItem: {
    marginBottom: spacing.sm,
  },
  readinessPlanTitle: {
    fontSize: typography.scale.body.size,
    fontWeight: typography.scale.body.weight,
    color: textColor.primary,
  },
  readinessPlanDetail: {
    fontSize: typography.scale.small.size,
    color: textColor.secondary,
  },
});
