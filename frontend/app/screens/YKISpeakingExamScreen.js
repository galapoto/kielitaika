import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { generateYkiExam } from '../utils/api';

export default function YKISpeakingExamScreen({ route, navigation } = {}) {
  const tasksProp = route?.params?.tasks || [];
  const [tasks, setTasks] = useState(tasksProp);
  const [loading, setLoading] = useState(tasksProp.length === 0);
  const [error, setError] = useState(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [lifelines] = useState(1);

  useEffect(() => {
    if (tasksProp.length === 0) {
      (async () => {
        try {
          const exam = await generateYkiExam('speaking_only', route?.params?.level || 'intermediate');
          setTasks(exam.exam?.tasks || []);
        } catch (e) {
          setError(e?.message || 'Failed to load YKI mock tasks');
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [tasksProp, route?.params?.level]);

  useEffect(() => {
    if (isRecording && tasks[currentTaskIndex]) {
      const timeLimit = tasks[currentTaskIndex].time_limit || 90;
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev >= timeLimit) {
            setIsRecording(false);
            return timeLimit;
          }
          return prev + 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isRecording, currentTaskIndex, tasks]);

  const currentTask = tasks[currentTaskIndex];
  const progress = tasks.length > 0 ? (currentTaskIndex + 1) / tasks.length : 0;

  const handleStartRecording = () => {
    setIsRecording(true);
    setTimer(0);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
  };

  const handleNext = () => {
    if (currentTaskIndex < tasks.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
      setIsRecording(false);
      setTimer(0);
    }
  };

  const handlePrevious = () => {
    if (currentTaskIndex > 0) {
      setCurrentTaskIndex(currentTaskIndex - 1);
      setIsRecording(false);
      setTimer(0);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FFFFFF" style={styles.loader} />
      </View>
    );
  }

  if (error || tasks.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error || 'No tasks available'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4A148C', '#1A237E', '#0D47A1']} // Dark purple gradient from 4th picture
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Header Bar - From 4th picture (Quiz design) */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerIcon}>👥</Text>
          <Text style={styles.headerText}>{currentTaskIndex + 1} of {tasks.length}</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>
        <TouchableOpacity style={styles.headerRight}>
          <Text style={styles.headerIcon}>⚡</Text>
          <Text style={styles.headerText}>{lifelines} of {tasks.length}</Text>
        </TouchableOpacity>
      </View>

      {/* Timer Circle - From 4th picture */}
      <View style={styles.timerContainer}>
        <View style={styles.timerCircle}>
          <Text style={styles.timerText}>
            {currentTask ? (currentTask.time_limit - timer) : 0}
          </Text>
        </View>
      </View>

      {/* Question Card - From 4th picture */}
      {currentTask && (
        <View style={styles.questionCard}>
          <TouchableOpacity style={styles.hintButton}>
            <Text style={styles.hintIcon}>💡</Text>
            <Text style={styles.hintText}>Hint</Text>
          </TouchableOpacity>
          <Text style={styles.questionNumber}>
            Task <Text style={styles.questionNumberHighlight}>{String(currentTaskIndex + 1).padStart(2, '0')}</Text>
          </Text>
          <Text style={styles.questionCategory}>YKI Speaking Exam</Text>
          <Text style={styles.questionText}>
            "{currentTask.prompt || currentTask.description || 'Speak about the topic below.'}"
          </Text>
          {currentTask.description && (
            <Text style={styles.taskDescription}>{currentTask.description}</Text>
          )}
        </View>
      )}

      {/* Voice Input Indicator - From 5th picture (Conversation design) */}
      <View style={styles.voiceIndicatorContainer}>
        {isRecording ? (
          <View style={[styles.voiceIndicator, styles.voiceIndicatorActive]}>
            <View style={styles.voiceIndicatorInner} />
          </View>
        ) : (
          <View style={styles.voiceIndicatorIdle}>
            <View style={styles.voiceIndicatorDot} />
          </View>
        )}
      </View>

      {/* Recording Controls */}
      <View style={styles.controlsContainer}>
        {!isRecording ? (
          <TouchableOpacity style={styles.recordButton} onPress={handleStartRecording}>
            <Text style={styles.recordButtonText}>Start Recording</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.stopButton} onPress={handleStopRecording}>
            <Text style={styles.stopButtonText}>Stop Recording</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, currentTaskIndex === 0 && styles.navButtonDisabled]}
          onPress={handlePrevious}
          disabled={currentTaskIndex === 0}
        >
          <Text style={styles.navButtonText}>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonPrimary]}
          onPress={handleNext}
          disabled={currentTaskIndex >= tasks.length - 1}
        >
          <Text style={styles.navButtonText}>Next</Text>
        </TouchableOpacity>
      </View>

      {/* Task List - Flight Booking Style from 6th picture */}
      <ScrollView style={styles.tasksList} contentContainerStyle={styles.tasksListContent}>
        <Text style={styles.tasksListTitle}>All Tasks</Text>
        {tasks.map((task, index) => (
          <TouchableOpacity
            key={task.id}
            style={[
              styles.taskCard,
              index === currentTaskIndex && styles.taskCardActive
            ]}
            onPress={() => {
              setCurrentTaskIndex(index);
              setIsRecording(false);
              setTimer(0);
            }}
          >
            <View style={styles.taskCardLeft}>
              <Text style={styles.taskCardTitle}>Task {index + 1}</Text>
              <Text style={styles.taskCardDescription}>{task.description || 'Speaking Task'}</Text>
              <Text style={styles.taskCardTime}>~{task.time_limit}s</Text>
            </View>
            <View style={styles.taskCardRight}>
              {index < currentTaskIndex && <Text style={styles.taskStatusIcon}>✓</Text>}
              {index === currentTaskIndex && <Text style={styles.taskStatusIconActive}>●</Text>}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A148C', // Dark purple from 4th picture
  },
  loader: {
    marginTop: 100,
  },
  errorText: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35', // Orange
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  headerIcon: {
    fontSize: 16,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF6B35', // Orange
    borderRadius: 4,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  timerText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  questionCard: {
    backgroundColor: '#1A0B2E', // Dark indigo from 4th picture
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 24,
    position: 'relative',
  },
  hintButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF8C42', // Light orange
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  hintIcon: {
    fontSize: 16,
  },
  hintText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  questionNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 40,
    marginBottom: 8,
    textAlign: 'center',
  },
  questionNumberHighlight: {
    color: '#FF6B35',
  },
  questionCategory: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 16,
  },
  questionText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  taskDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: 8,
  },
  voiceIndicatorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  voiceIndicator: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceIndicatorActive: {
    backgroundColor: '#3B82F6', // Blue from 5th picture
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  voiceIndicatorInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  voiceIndicatorIdle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceIndicatorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  controlsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  recordButton: {
    backgroundColor: '#FF6B35', // Orange
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stopButton: {
    backgroundColor: '#EF4444', // Red
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  navigationContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  navButton: {
    flex: 1,
    backgroundColor: '#2A1B3D',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonPrimary: {
    backgroundColor: '#FF6B35',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tasksList: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  tasksListContent: {
    padding: 16,
    paddingTop: 24,
  },
  tasksListTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  taskCardActive: {
    borderWidth: 2,
    borderColor: '#1E3A8A', // Dark blue from 6th picture
  },
  taskCardLeft: {
    flex: 1,
  },
  taskCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  taskCardDescription: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
    marginBottom: 4,
  },
  taskCardTime: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  taskCardRight: {
    alignItems: 'flex-end',
  },
  taskStatusIcon: {
    fontSize: 20,
    color: '#22C55E', // Green
  },
  taskStatusIconActive: {
    fontSize: 20,
    color: '#1E3A8A', // Dark blue
  },
});
