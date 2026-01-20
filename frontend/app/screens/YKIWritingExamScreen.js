import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import SceneBackground from '../components/SceneBackground';
import { submitYkiExam } from '../utils/api';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';
import { radius } from '../styles/radius';
import { shadows } from '../styles/shadows';

export default function YKIWritingExamScreen({ route, navigation }) {
  const tasks = route?.params?.tasks || [];
  const examId = route?.params?.examId;
  const [responses, setResponses] = useState({});
  const [timeRemaining, setTimeRemaining] = useState({});
  const [activeTaskIndex, setActiveTaskIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timersRef = useRef({});

  // Initialize timers for each task
  useEffect(() => {
    tasks.forEach((task) => {
      if (task.time_limit && !timeRemaining[task.id]) {
        setTimeRemaining((prev) => ({
          ...prev,
          [task.id]: task.time_limit * 60, // Convert minutes to seconds
        }));
      }
    });

    // Start timers
    tasks.forEach((task) => {
      if (task.time_limit && timersRef.current[task.id] === undefined) {
        timersRef.current[task.id] = setInterval(() => {
          setTimeRemaining((prev) => {
            const current = prev[task.id];
            if (current === undefined || current <= 0) {
              clearInterval(timersRef.current[task.id]);
              return prev;
            }
            return { ...prev, [task.id]: current - 1 };
          });
        }, 1000);
      }
    });

    return () => {
      // Cleanup timers
      Object.values(timersRef.current).forEach((timer) => {
        if (timer) clearInterval(timer);
      });
    };
  }, [tasks]);

  // Check for time expiration
  useEffect(() => {
    Object.entries(timeRemaining).forEach(([taskId, seconds]) => {
      if (seconds === 0) {
        Alert.alert('Time Up', `Time has run out for task ${taskId}. Please move to the next task.`);
      }
    });
  }, [timeRemaining]);

  const wordCount = (text) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const updateResponse = (taskId, text) => {
    setResponses((prev) => ({ ...prev, [taskId]: text }));
  };

  const formatTime = (seconds) => {
    if (seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (!examId) {
      Alert.alert('Error', 'No exam ID provided. Please start from the main YKI screen.');
      return;
    }

    const writingPayload = tasks
      .map((task) => ({
        task_id: task.id,
        text: (responses[task.id] || '').trim(),
      }))
      .filter((item) => item.text.length > 0);

    if (writingPayload.length === 0) {
      Alert.alert('No Responses', 'Please complete at least one writing task before submitting.');
      return;
    }

    // Warn if word counts are too low
    const warnings = [];
    tasks.forEach((task) => {
      const words = wordCount(responses[task.id] || '');
      if (words > 0 && words < task.word_limit * 0.5) {
        warnings.push(`${task.id}: Only ${words} words (target: ${task.word_limit})`);
      }
    });

    if (warnings.length > 0) {
      Alert.alert(
        'Low Word Count',
        `Some tasks have very few words:\n${warnings.join('\n')}\n\nSubmit anyway?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Submit', onPress: () => doSubmit(writingPayload) },
        ]
      );
    } else {
      doSubmit(writingPayload);
    }
  };

  const doSubmit = async (writingPayload) => {
    setIsSubmitting(true);
    try {
      const { evaluation } = await submitYkiExam(examId, [], writingPayload);
      navigation.navigate('YKI', {
        screen: 'YKIResults',
        params: { evaluation },
      });
    } catch (err) {
      Alert.alert('Submission Error', err.message || 'Failed to submit writing exam');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (tasks.length === 0) {
    return (
      <View style={styles.container}>
        <SceneBackground sceneKey="lapland" orbEmotion="calm" />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Writing Tasks</Text>
          <Text style={styles.emptyText}>
            No writing tasks provided. Please generate an exam from the main YKI screen.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const currentTask = tasks[activeTaskIndex];
  const currentResponse = responses[currentTask.id] || '';
  const currentWordCount = wordCount(currentResponse);
  const currentTime = timeRemaining[currentTask.id] || 0;

  return (
    <View style={styles.container}>
      <SceneBackground sceneKey="lapland" orbEmotion="calm" />
      
      {/* Header with task navigation */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setActiveTaskIndex(Math.max(0, activeTaskIndex - 1))}
          disabled={activeTaskIndex === 0}
        >
          <Text style={[styles.navButtonText, activeTaskIndex === 0 && styles.navButtonDisabled]}>
            ← Prev
          </Text>
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            Task {activeTaskIndex + 1} of {tasks.length}
          </Text>
          <Text style={styles.headerSubtitle}>{currentTask.description || 'Writing Task'}</Text>
        </View>
        
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setActiveTaskIndex(Math.min(tasks.length - 1, activeTaskIndex + 1))}
          disabled={activeTaskIndex === tasks.length - 1}
        >
          <Text
            style={[
              styles.navButtonText,
              activeTaskIndex === tasks.length - 1 && styles.navButtonDisabled,
            ]}
          >
            Next →
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Task Info Card */}
        <View style={styles.taskInfoCard}>
          <View style={styles.taskInfoRow}>
            <View style={styles.infoBadge}>
              <Text style={styles.infoBadgeLabel}>Time</Text>
              <Text style={styles.infoBadgeValue}>
                {currentTime > 0 ? formatTime(currentTime) : '00:00'}
              </Text>
            </View>
            <View style={styles.infoBadge}>
              <Text style={styles.infoBadgeLabel}>Words</Text>
              <Text
                style={[
                  styles.infoBadgeValue,
                  currentWordCount >= currentTask.word_limit * 0.8 &&
                    styles.infoBadgeValueGood,
                  currentWordCount >= currentTask.word_limit && styles.infoBadgeValueExcellent,
                ]}
              >
                {currentWordCount} / {currentTask.word_limit}
              </Text>
            </View>
            <View style={styles.infoBadge}>
              <Text style={styles.infoBadgeLabel}>Type</Text>
              <Text style={styles.infoBadgeValue}>{currentTask.type || 'writing'}</Text>
            </View>
          </View>
        </View>

        {/* Prompt Card */}
        <View style={styles.promptCard}>
          <Text style={styles.promptLabel}>Task Prompt</Text>
          <Text style={styles.promptText}>{currentTask.prompt}</Text>
          <View style={styles.promptMeta}>
            <Text style={styles.promptMetaText}>
              Target: {currentTask.word_limit} words • Time: {currentTask.time_limit} minutes
            </Text>
          </View>
        </View>

        {/* Writing Input */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Your Answer</Text>
          <TextInput
            style={styles.textInput}
            multiline
            placeholder="Write your answer here in Finnish..."
            placeholderTextColor={colors.textSoft}
            value={currentResponse}
            onChangeText={(text) => updateResponse(currentTask.id, text)}
            textAlignVertical="top"
            editable={currentTime > 0}
          />
          <View style={styles.inputFooter}>
            <Text
              style={[
                styles.wordCountText,
                currentWordCount >= currentTask.word_limit * 0.8 && styles.wordCountGood,
                currentWordCount >= currentTask.word_limit && styles.wordCountExcellent,
              ]}
            >
              {currentWordCount} / {currentTask.word_limit} words
            </Text>
            {currentTime === 0 && (
              <Text style={styles.timeUpText}>⏱ Time's up!</Text>
            )}
          </View>
        </View>

        {/* Task Progress Indicator */}
        <View style={styles.progressSection}>
          <Text style={styles.progressLabel}>Task Progress</Text>
          <View style={styles.progressDots}>
            {tasks.map((task, idx) => {
              const hasResponse = responses[task.id] && wordCount(responses[task.id]) > 0;
              return (
                <View
                  key={task.id}
                  style={[
                    styles.progressDot,
                    idx === activeTaskIndex && styles.progressDotActive,
                    hasResponse && styles.progressDotCompleted,
                  ]}
                />
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Footer with Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit All Tasks</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    ...typography.titleL,
    color: colors.textMain,
    marginBottom: spacing.m,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSoft,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  backButton: {
    backgroundColor: colors.blueMain,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.m,
    borderRadius: radius.l,
    ...shadows.s,
  },
  backButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayLine,
    ...shadows.s,
  },
  navButton: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
  },
  navButtonText: {
    ...typography.bodySm,
    color: colors.blueMain,
    fontWeight: '600',
  },
  navButtonDisabled: {
    color: colors.grayLine,
    opacity: 0.5,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.titleM,
    color: colors.textMain,
    fontWeight: '700',
  },
  headerSubtitle: {
    ...typography.bodySm,
    color: colors.textSoft,
    marginTop: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.l,
    gap: spacing.m,
    paddingBottom: spacing['3xl'],
  },
  taskInfoCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.m,
    ...shadows.s,
  },
  taskInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: spacing.s,
  },
  infoBadge: {
    alignItems: 'center',
    flex: 1,
  },
  infoBadgeLabel: {
    ...typography.micro,
    color: colors.textSoft,
    marginBottom: spacing.xs,
  },
  infoBadgeValue: {
    ...typography.body,
    color: colors.textMain,
    fontWeight: '700',
  },
  infoBadgeValueGood: {
    color: colors.mintSoft,
  },
  infoBadgeValueExcellent: {
    color: '#10b981',
  },
  promptCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.l,
    borderLeftWidth: 4,
    borderLeftColor: colors.blueMain,
    ...shadows.s,
  },
  promptLabel: {
    ...typography.bodySm,
    color: colors.textSoft,
    marginBottom: spacing.s,
    fontWeight: '600',
  },
  promptText: {
    ...typography.body,
    color: colors.textMain,
    lineHeight: 24,
    marginBottom: spacing.m,
  },
  promptMeta: {
    paddingTop: spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.grayLine,
  },
  promptMetaText: {
    ...typography.bodySm,
    color: colors.textSoft,
  },
  inputCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.l,
    ...shadows.s,
  },
  inputLabel: {
    ...typography.bodySm,
    color: colors.textMain,
    fontWeight: '600',
    marginBottom: spacing.m,
  },
  textInput: {
    ...typography.body,
    color: colors.textMain,
    borderWidth: 1,
    borderColor: colors.grayLine,
    borderRadius: radius.m,
    padding: spacing.m,
    minHeight: 200,
    backgroundColor: colors.grayBg,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.m,
    paddingTop: spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.grayLine,
  },
  wordCountText: {
    ...typography.bodySm,
    color: colors.textSoft,
  },
  wordCountGood: {
    color: colors.mintSoft,
    fontWeight: '600',
  },
  wordCountExcellent: {
    color: '#10b981',
    fontWeight: '700',
  },
  timeUpText: {
    ...typography.bodySm,
    color: '#dc2626',
    fontWeight: '600',
  },
  progressSection: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.l,
    ...shadows.s,
  },
  progressLabel: {
    ...typography.bodySm,
    color: colors.textSoft,
    marginBottom: spacing.m,
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.s,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.grayLine,
  },
  progressDotActive: {
    backgroundColor: colors.blueMain,
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  progressDotCompleted: {
    backgroundColor: '#10b981',
  },
  footer: {
    padding: spacing.l,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.grayLine,
    ...shadows.l,
  },
  submitButton: {
    backgroundColor: colors.blueMain,
    paddingVertical: spacing.m,
    borderRadius: radius.l,
    alignItems: 'center',
    ...shadows.s,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '700',
  },
});
