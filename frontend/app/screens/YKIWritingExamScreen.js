import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { submitYkiExam } from '../utils/api';
import Background from '../components/ui/Background';
import HomeButton from '../components/HomeButton';
import { YKIExamModeController } from '../utils/constants';

export default function YKIWritingExamScreen({ route, navigation } = {}) {
  const tasks = route?.params?.tasks || [];
  const examId = route?.params?.examId;
  const [responses, setResponses] = useState({});
  const [activeTaskIndex, setActiveTaskIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examSnapshot, setExamSnapshot] = useState(null);
  const alertedRef = useRef({});

  useEffect(() => {
    let unsubscribe = null;
    let mounted = true;
    YKIExamModeController.hydrate().then(() => {
      if (!mounted) return;
      unsubscribe = YKIExamModeController.subscribe(setExamSnapshot);
    });
    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (tasks.length > 0) {
      YKIExamModeController.startExam({
        examId: examId || 'yki_writing_exam',
        tasks,
        timeUnit: 'minutes',
      });
    }
  }, [tasks, examId]);

  useEffect(() => {
    const current = tasks[activeTaskIndex];
    if (current?.id) {
      YKIExamModeController.setActiveTask(current.id);
    }
  }, [activeTaskIndex, tasks]);

  useEffect(() => {
    const current = tasks[activeTaskIndex];
    if (!current?.id || !examSnapshot) return;
    const remaining = YKIExamModeController.getRemainingFor(current.id);
    if (remaining === 0 && !alertedRef.current[current.id]) {
      alertedRef.current[current.id] = true;
      Alert.alert('Time Up', `Time has run out for task ${current.id}. Please move to the next task.`);
    }
  }, [examSnapshot, activeTaskIndex, tasks]);

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
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Writing Tasks</Text>
          <Text style={styles.emptyText}>
            No writing tasks provided. Please generate an exam from the main YKI screen.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (navigation?.canGoBack?.() && navigation.canGoBack()) navigation.goBack();
              else navigation?.navigate?.('Home');
            }}
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
  const currentTime = examSnapshot ? YKIExamModeController.getRemainingFor(currentTask.id) : (currentTask.time_limit || 0) * 60;
  const totalTasks = tasks.length;
  const currentStep = activeTaskIndex;
  const totalSteps = totalTasks;

  return (
    <Background module="yki_write" variant="blue">
      <View style={styles.container}>
      {/* Purple Header - From 7th picture */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (navigation?.canGoBack?.() && navigation.canGoBack()) navigation.goBack();
            else navigation?.navigate?.('Home');
          }}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>YKI Writing Exam</Text>
        <HomeButton navigation={navigation} style={styles.homeButtonHeader} />
      </View>

      {/* Progress Indicator - From 7th picture */}
      <View style={styles.progressIndicator}>
        {Array.from({ length: totalSteps }).map((_, step) => (
          <View
            key={step}
            style={[
              styles.progressDash,
              step === currentStep && styles.progressDashActive,
              step < currentStep && styles.progressDashCompleted,
            ]}
          />
        ))}
      </View>

      {/* Main Content Card - From 7th picture */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.mainCard}>
          {/* Task Prompt Card - Instead of image card from 7th picture */}
          <View style={styles.promptCard}>
            <Text style={styles.promptTitle}>{currentTask.description || 'Writing Task'}</Text>
            <Text style={styles.promptText}>{currentTask.prompt}</Text>
            <View style={styles.promptMeta}>
              <Text style={styles.promptMetaText}>
                Target: {currentTask.word_limit} words • Time: {formatTime(currentTime)}
              </Text>
            </View>
          </View>

          {/* Instruction Text - From 7th picture */}
          <Text style={styles.instructionText}>Write your response in Finnish</Text>

          {/* Text Input Area - Instead of answer grid from 7th picture */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              multiline
              placeholder="Type your answer here..."
              placeholderTextColor="rgba(255,255,255,0.55)"
              value={currentResponse}
              onChangeText={(text) => updateResponse(currentTask.id, text)}
              textAlignVertical="top"
              editable={currentTime > 0}
            />
            <View style={styles.wordCountContainer}>
              <Text style={[
                styles.wordCountText,
                currentWordCount >= currentTask.word_limit * 0.8 && styles.wordCountGood,
                currentWordCount >= currentTask.word_limit && styles.wordCountExcellent,
              ]}>
                {currentWordCount} / {currentTask.word_limit} words
              </Text>
            </View>
          </View>

          {/* Task Navigation */}
          <View style={styles.taskNavigation}>
            <TouchableOpacity
              style={[styles.navButton, activeTaskIndex === 0 && styles.navButtonDisabled]}
              onPress={() => setActiveTaskIndex(Math.max(0, activeTaskIndex - 1))}
              disabled={activeTaskIndex === 0}
            >
              <Text style={styles.navButtonText}>Previous</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navButton, styles.navButtonPrimary]}
              onPress={() => setActiveTaskIndex(Math.min(tasks.length - 1, activeTaskIndex + 1))}
              disabled={activeTaskIndex >= tasks.length - 1}
            >
              <Text style={styles.navButtonText}>Next</Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button - Instead of Check button from 7th picture */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Submitting...' : 'Submit All Tasks'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Removed placeholder bottom navigation */}
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
    marginBottom: 24,
  },
  header: {
    backgroundColor: 'rgba(10, 14, 39, 0.78)',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.10)',
  },
  backButton: {
    marginRight: 16,
  },
  backIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.95)',
    flex: 1,
  },
  homeButtonHeader: {
    marginLeft: 'auto',
  },
  progressIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  progressDash: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  progressDashActive: {
    backgroundColor: 'rgba(27,78,218,0.92)',
  },
  progressDashCompleted: {
    backgroundColor: 'rgba(27,78,218,0.92)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  mainCard: {
    backgroundColor: 'rgba(16, 22, 40, 0.78)',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  promptCard: {
    backgroundColor: 'rgba(16, 22, 40, 0.78)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  promptTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.92)',
    marginBottom: 12,
  },
  promptText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.80)',
    lineHeight: 24,
    marginBottom: 12,
  },
  promptMeta: {
    marginTop: 8,
  },
  promptMetaText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.92)',
    marginBottom: 24,
    textAlign: 'left',
  },
  inputContainer: {
    marginBottom: 24,
  },
  textInput: {
    backgroundColor: 'rgba(16, 22, 40, 0.78)',
    borderRadius: 12,
    padding: 16,
    minHeight: 200,
    fontSize: 16,
    color: 'rgba(255,255,255,0.92)',
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  wordCountContainer: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  wordCountText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
  },
  wordCountGood: {
    color: 'rgba(255,255,255,0.92)',
    fontWeight: '600',
  },
  wordCountExcellent: {
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '700',
  },
  taskNavigation: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  navButton: {
    flex: 1,
    backgroundColor: 'rgba(16, 22, 40, 0.78)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonPrimary: {
    backgroundColor: 'rgba(27,78,218,0.92)',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.92)',
  },
  submitButton: {
    backgroundColor: 'rgba(27,78,218,0.92)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // bottom navigation removed (placeholder)
});
