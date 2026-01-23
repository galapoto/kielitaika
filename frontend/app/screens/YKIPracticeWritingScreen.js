/**
 * YKIPracticeWritingScreen - Short YKI writing practice exercises
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import Background from '../components/ui/Background';
import PremiumEmbossedButton from '../components/PremiumEmbossedButton';
import HomeButton from '../components/HomeButton';
import YKIModeBanner from '../components/YKIModeBanner';

import { colors as palette } from '../styles/colors';
import { generateYkiPractice, evaluateYkiWriting } from '../utils/api';

export default function YKIPracticeWritingScreen({ navigation, route } = {}) {
  const { ykiMode = 'training' } = route?.params || {};
  const [loading, setLoading] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [writingText, setWritingText] = useState('');
  const [examInfo, setExamInfo] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [fixPack, setFixPack] = useState([]);
  const [readiness, setReadiness] = useState(null);
  const [originalText, setOriginalText] = useState('');  // Store original for rewrite comparison
  const [rewriteRequired, setRewriteRequired] = useState(false);
  const [rewriteText, setRewriteText] = useState('');

  const handleStartPractice = async () => {
    setLoading(true);
    try {
      const exam = await generateYkiPractice('writing', 'intermediate');
      const writingTasks = exam?.exam?.tasks?.filter(t => t.type === 'writing') || [];
      
      if (writingTasks.length > 0) {
        const task = writingTasks[0];
        setCurrentExercise({
          prompt: task.prompt || task.text || 'Kirjoita lyhyt teksti.',
          wordLimit: task.word_limit || 50,
          timeLimit: task.time_limit || 10,
        });
        setExamInfo({
          examId: exam?.exam?.exam_id,
          examType: exam?.exam?.exam_type,
          level: exam?.exam?.level,
          totalTasks: exam?.exam?.tasks?.length || writingTasks.length,
          totalTimeMinutes: exam?.exam?.total_time_minutes || 0,
        });
      } else {
        const fallback = {
          prompt: 'Kirjoita lyhyt teksti itsestäsi. (Write a short text about yourself.)',
          wordLimit: 50,
          timeLimit: 10,
        };
        setCurrentExercise(fallback);
        setExamInfo({
          examId: 'fallback_yki',
          examType: 'writing_practice',
          level: 'intermediate',
          totalTasks: 1,
          totalTimeMinutes: Math.ceil(fallback.timeLimit),
        });
      }
      setEvaluation(null);
      setFixPack([]);
      setReadiness(null);
    } catch (error) {
      console.error('Failed to load writing exercise:', error);
      const fallback = {
        prompt: 'Kirjoita lyhyt teksti itsestäsi.',
        wordLimit: 50,
        timeLimit: 10,
      };
      setCurrentExercise(fallback);
      setExamInfo({
        examId: 'fallback_yki',
        examType: 'writing_practice',
        level: 'intermediate',
        totalTasks: 1,
        totalTimeMinutes: Math.ceil(fallback.timeLimit),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!writingText.trim()) {
      Alert.alert('Empty Response', 'Please write something before submitting.');
      return;
    }
    
    setIsEvaluating(true);
    try {
      const result = await evaluateYkiWriting(writingText);
      setEvaluation(result);
      setFixPack(buildWritingFixPack(result));
      setReadiness(buildWritingReadiness(result));
      
      // In training mode, require rewrite if score is below threshold
      if (ykiMode === 'training') {
        const scores = result?.scores || {};
        const scoreValues = Object.values(scores).filter(v => typeof v === 'number');
        const avgScore = scoreValues.length ? scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length : 0;
        if (avgScore < 3.0) {
          setOriginalText(writingText);
          setRewriteRequired(true);
          setRewriteText('');  // Clear rewrite text
          Alert.alert('Rewrite Required', 'Your score was below the threshold. Please rewrite your text with improvements.', [{ text: 'OK' }]);
          return;
        }
      }
      
      Alert.alert('Submitted', 'Your writing has been submitted for evaluation.', [
        {
          text: 'OK',
          onPress: () => {
            setWritingText('');
          },
        },
      ]);
    } catch (error) {
      console.error('Failed to submit:', error);
      Alert.alert('Error', 'Failed to submit your writing. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleRewrite = async () => {
    if (!rewriteText.trim()) {
      Alert.alert('Empty rewrite', 'Please write your improved version before submitting.');
      return;
    }
    setIsEvaluating(true);
    try {
      const result = await evaluateYkiWriting(rewriteText);
      const originalScores = evaluation?.scores || {};
      const rewriteScores = result?.scores || {};
      const originalScoreValues = Object.values(originalScores).filter(v => typeof v === 'number');
      const rewriteScoreValues = Object.values(rewriteScores).filter(v => typeof v === 'number');
      const originalAvg = originalScoreValues.length ? originalScoreValues.reduce((a, b) => a + b, 0) / originalScoreValues.length : 0;
      const rewriteAvg = rewriteScoreValues.length ? rewriteScoreValues.reduce((a, b) => a + b, 0) / rewriteScoreValues.length : 0;
      
      setEvaluation(result);
      setFixPack(buildWritingFixPack(result));
      setReadiness(buildWritingReadiness(result));
      setRewriteRequired(false);
      
      if (rewriteAvg > originalAvg) {
        Alert.alert('Great improvement!', `Your rewrite improved from ${originalAvg.toFixed(1)} to ${rewriteAvg.toFixed(1)}. Keep practicing!`, [{ text: 'OK' }]);
      } else {
        Alert.alert('Keep working', 'Your rewrite maintained similar quality. Review the feedback and try again.', [{ text: 'OK' }]);
      }
    } catch (error) {
      console.error('Failed to evaluate rewrite:', error);
      Alert.alert('Error', 'Failed to evaluate your rewrite. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const wordCount = writingText.trim().split(/\s+/).filter(word => word.length > 0).length;

  const WRITING_BUCKETS = [
    { key: 'task_fulfilment', label: 'Task Fulfilment', hint: 'All requirements met completely.' },
    { key: 'coherence', label: 'Coherence', hint: 'Clear structure, connectors, flow.' },
    { key: 'vocabulary_range', label: 'Vocabulary Range', hint: 'Variety and breadth of words used.' },
    { key: 'vocabulary_precision', label: 'Vocabulary Precision', hint: 'Accuracy and appropriateness of word choice.' },
    { key: 'register', label: 'Register', hint: 'Appropriate formal/informal style.' },
    { key: 'grammar', label: 'Grammar', hint: 'Accurate verb forms, cases, and structures.' },
  ];

  const buildWritingFixPack = (evaluation) => {
    if (!evaluation?.scores) return [];
    const pack = [];
    const scores = evaluation.scores;

    if (scores.coherence != null && scores.coherence < 3) {
      pack.push({
        title: 'Structure Drill',
        detail: 'Group your ideas into two short paragraphs. Introduce the topic, add detail, and finish with a conclusion sentence.',
      });
    }
    if (scores.grammar != null && scores.grammar < 3) {
      pack.push({
        title: 'Grammar Focus',
        detail: 'Find three complex sentences with conjugation or case errors and rewrite them using correct forms.',
      });
    }
    if (scores.task_fulfilment != null && scores.task_fulfilment < 3) {
      pack.push({
        title: 'Requirement Check',
        detail: 'List the required bullet points and confirm each one appears in your text out loud before rewriting.',
      });
    }
    if (scores.vocabulary_range != null && scores.vocabulary_range < 3) {
      pack.push({
        title: 'Vocabulary Range Expansion',
        detail: 'Replace two repeated words with more varied synonyms. Expand your word choices.',
      });
    }
    if (scores.vocabulary_precision != null && scores.vocabulary_precision < 3) {
      pack.push({
        title: 'Vocabulary Precision',
        detail: 'Review word choices for accuracy. Check if words match the intended meaning and context.',
      });
    }
    if (scores.register != null && scores.register < 3) {
      pack.push({
        title: 'Register Control',
        detail: 'Check if your text uses consistent formal or informal style. Match the register to the task requirements.',
      });
    }

    if (evaluation?.suggestions?.length) {
      pack.push({
        title: 'Suggestion Drill',
        detail: `Apply this suggestion: ${evaluation.suggestions[0]}.`,
      });
    }

    if (currentExercise?.prompt) {
      pack.push({
        title: 'Shadowing Clip',
        detail: `Read the prompt aloud twice with steady pacing, then rewrite one sentence from memory.`,
      });
    }

    return pack;
  };

  const buildWritingReadiness = (evaluation) => {
    if (!evaluation?.scores) return null;
    const scoreValues = Object.values(evaluation.scores);
    const avg = scoreValues.length ? scoreValues.reduce((sum, value) => sum + value, 0) / scoreValues.length : 0;

    const weakest = getWeakestBucket(evaluation.scores, WRITING_BUCKETS);

    return {
      band: evaluation?.band || 'A2.1',
      confidence: avg >= 3.2 ? 'High' : avg >= 2.6 ? 'Medium' : 'Low',
      weakest,
      plan: [
        { title: 'Today', detail: `Rewrite one paragraph with ${weakest?.label || 'clarity'} in mind.` },
        { title: 'In 3 days', detail: 'Mix the same prompt with another topic to strengthen cohesion and task completion.' },
        { title: 'In 1 week', detail: 'Complete a new writing task and compare its band to this one.' },
      ],
    };
  };

  const getWeakestBucket = (scores = {}, buckets = WRITING_BUCKETS) => {
    if (!buckets.length) return { label: 'Confidence' };
    const entries = buckets.map(bucket => ({
      key: bucket.key,
      label: bucket.label,
      score: scores[bucket.key] ?? 4,
    }));
    return entries.reduce((min, current) => (current.score < min.score ? current : min), entries[0]);
  };

  const getBucketColor = (score) => {
    if (score >= 3.5) return palette?.accentSuccess || '#22C55E';
    if (score >= 2.5) return palette?.accentWarning || '#FBBF24';
    return palette?.accentError || '#F87171';
  };

  return (
    <Background module="yki_write" variant="blue">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>YKI Writing Practice</Text>
          <HomeButton navigation={navigation} style={styles.homeButton} homeType="yki" />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <YKIModeBanner mode={ykiMode} style={styles.modeBanner} />
          
          {!currentExercise ? (
            <View style={styles.startContainer}>
              <Text style={styles.startTitle}>Practice YKI Writing</Text>
              <Text style={styles.startDescription}>
                Short writing exercises to prepare for the YKI exam.
              </Text>
              {loading ? (
                <ActivityIndicator size="large" color={palette?.textPrimary || '#F8F9FA'} />
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
                      <Text style={styles.examSummaryLabel}>Length</Text>
                      <Text style={styles.examSummaryValue}>{examInfo.totalTimeMinutes} mins</Text>
                    </View>
                  </View>
                  <View style={styles.examSummaryRow}>
                    <Text style={styles.examSummaryLabel}>Target Level</Text>
                    <Text style={styles.examSummaryValue}>{examInfo.level}</Text>
                  </View>
                </View>
              )}
              <Text style={styles.exercisePrompt}>{currentExercise.prompt}</Text>
              <Text style={styles.exerciseInfo}>
                Word limit: {currentExercise.wordLimit} words • Time: {currentExercise.timeLimit} min
              </Text>
              <TextInput
                style={styles.textInput}
                multiline
                placeholder="Write your text here..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={writingText}
                onChangeText={setWritingText}
                autoCorrect={ykiMode !== 'exam'}  // Disable autocorrect in exam mode
                autoCapitalize="none"
                spellCheck={ykiMode !== 'exam'}  // Disable spellcheck in exam mode
                textContentType="none"
                editable={!evaluation || ykiMode === 'training'}  // Allow editing in training mode after evaluation
                keyboardType="default"
              />
              <Text style={styles.wordCount}>
                Words: {wordCount} / {currentExercise.wordLimit}
              </Text>
              <PremiumEmbossedButton
                title="Submit"
                onPress={handleSubmit}
                variant="primary"
                size="medium"
                style={styles.submitButton}
              />
              {evaluation?.scores && (
                <View style={styles.evaluationSection}>
                  <Text style={styles.rubricTitle}>Evaluation</Text>
                  <View style={styles.rubricGrid}>
                    {WRITING_BUCKETS.map(bucket => {
                      const score = evaluation.scores?.[bucket.key];
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

              {/* Rewrite Loop - Training Mode Only */}
              {rewriteRequired && ykiMode === 'training' && (
                <View style={styles.rewriteSection}>
                  <Text style={styles.rewriteTitle}>📝 Rewrite Required</Text>
                  <Text style={styles.rewriteDescription}>
                    Your score was below the threshold. Review the feedback above and rewrite your text with improvements.
                  </Text>
                  
                  {originalText && (
                    <View style={styles.originalTextCard}>
                      <Text style={styles.originalTextLabel}>Original:</Text>
                      <Text style={styles.originalText}>{originalText}</Text>
                    </View>
                  )}
                  
                  <Text style={styles.rewriteLabel}>Your improved version:</Text>
                  <TextInput
                    style={styles.textInput}
                    multiline
                    placeholder="Rewrite your text with improvements..."
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={rewriteText}
                    onChangeText={setRewriteText}
                    autoCorrect={true}
                    spellCheck={true}
                  />
                  <Text style={styles.wordCount}>
                    Words: {rewriteText.trim().split(/\s+/).filter(word => word.length > 0).length} / {currentExercise.wordLimit}
                  </Text>
                  
                  <PremiumEmbossedButton
                    title="Submit Rewrite"
                    onPress={handleRewrite}
                    variant="primary"
                    size="medium"
                    style={styles.submitButton}
                    disabled={!rewriteText.trim() || isEvaluating}
                  />
                  
                  <TouchableOpacity
                    onPress={() => {
                      setRewriteRequired(false);
                      setRewriteText('');
                    }}
                    style={styles.skipRewriteButton}
                  >
                    <Text style={styles.skipRewriteText}>Skip rewrite (not recommended)</Text>
                  </TouchableOpacity>
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
                  <Text style={styles.readinessTitle}>Readiness</Text>
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
                    {readiness.plan.map(step => (
                      <View key={step.title} style={styles.readinessPlanItem}>
                        <Text style={styles.readinessPlanTitle}>{step.title}</Text>
                        <Text style={styles.readinessPlanDetail}>{step.detail}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Rewrite Loop - Training Mode Only */}
              {rewriteRequired && ykiMode === 'training' && (
                <View style={styles.rewriteSection}>
                  <Text style={styles.rewriteTitle}>📝 Rewrite Required</Text>
                  <Text style={styles.rewriteDescription}>
                    Your score was below the threshold. Review the feedback above and rewrite your text with improvements.
                  </Text>
                  
                  {originalText && (
                    <View style={styles.originalTextCard}>
                      <Text style={styles.originalTextLabel}>Original:</Text>
                      <Text style={styles.originalText}>{originalText}</Text>
                    </View>
                  )}
                  
                  <Text style={styles.rewriteLabel}>Your improved version:</Text>
                  <TextInput
                    style={styles.textInput}
                    multiline
                    placeholder="Rewrite your text with improvements..."
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={rewriteText}
                    onChangeText={setRewriteText}
                    autoCorrect={true}
                    spellCheck={true}
                  />
                  <Text style={styles.wordCount}>
                    Words: {rewriteText.trim().split(/\s+/).filter(word => word.length > 0).length} / {currentExercise.wordLimit}
                  </Text>
                  
                  <PremiumEmbossedButton
                    title="Submit Rewrite"
                    onPress={handleRewrite}
                    variant="primary"
                    size="medium"
                    style={styles.submitButton}
                    disabled={!rewriteText.trim() || isEvaluating}
                  />
                  
                  <TouchableOpacity
                    onPress={() => {
                      setRewriteRequired(false);
                      setRewriteText('');
                    }}
                    style={styles.skipRewriteButton}
                  >
                    <Text style={styles.skipRewriteText}>Skip rewrite (not recommended)</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modeBanner: {
    marginBottom: 16,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: palette.textPrimary,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  homeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
  },
  content: {
    padding: 20,
  },
  startContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  startTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.textPrimary,
    marginBottom: 12,
  },
  startDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 32,
  },
  startButton: {
    width: '100%',
    maxWidth: 300,
  },
  exerciseContainer: {
    gap: 16,
  },
  exercisePrompt: {
    fontSize: 18,
    color: palette.textPrimary,
    marginBottom: 8,
  },
  exerciseInfo: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: palette.textPrimary,
    minHeight: 200,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  wordCount: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  submitButton: {
    width: '100%',
    marginTop: 8,
  },
  examSummaryCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  examSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  examSummaryLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  examSummaryValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  evaluationSection: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  rubricTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  rubricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rubricCard: {
    width: '48%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },
  rubricLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
  },
  rubricScoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rubricScore: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rubricDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  rubricHint: {
    marginTop: 4,
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  fixPackSection: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  fixPackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  fixPackCard: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  fixPackHeading: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  fixPackDetail: {
    marginTop: 4,
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  readinessSection: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  readinessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  readinessLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  readinessValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  readinessPlan: {
    marginTop: 12,
  },
  readinessPlanItem: {
    marginBottom: 6,
  },
  readinessPlanTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  readinessPlanDetail: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  rewriteSection: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.30)',
  },
  rewriteTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.95)',
    marginBottom: 8,
  },
  rewriteDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
    marginBottom: 16,
  },
  originalTextCard: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  originalTextLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 6,
    fontWeight: '600',
  },
  originalText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
  },
  rewriteLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.95)',
    marginBottom: 8,
  },
  skipRewriteButton: {
    marginTop: 12,
    padding: 8,
    alignItems: 'center',
  },
  skipRewriteText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    textDecorationLine: 'underline',
  },
});
