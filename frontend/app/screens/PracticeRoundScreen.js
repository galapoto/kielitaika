/**
 * Practice Round Screen - Integrated skill rounds
 * 
 * Vocab → Listening → Roleplay → Writing
 * 10-12 minute integrated practice session
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Background, { LockedFeature } from '../components/ui/Background';
import { generatePracticeRoundV2 } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import HomeButton from '../components/HomeButton';
import { getProfessionLabel, calculatePracticeProgress } from '../utils/workplaceHelpers';
import { colors as palette } from '../styles/colors';

export default function PracticeRoundScreen({ route, navigation } = {}) {
  const { user } = useAuth();
  const profession = route?.params?.profession || route?.params?.field || 'nurse';
  const professionLabel = getProfessionLabel(profession);
  const level = route?.params?.level || 'B1';

  if (!user) {
    return (
      <View style={styles.authGuard}>
        <Text style={styles.authGuardText}>Kirjaudu sisään jatkaaksesi.</Text>
      </View>
    );
  }
  
  const [round, setRound] = useState(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    loadPracticeRound();
  }, [profession, level]);

  const loadPracticeRound = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const roundData = await generatePracticeRoundV2(profession, level, 12);
      setRound(roundData);
      setStartTime(Date.now());
    } catch (err) {
      console.error('Error loading practice round:', err);
      setError(err.message || 'Failed to load practice round');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskComplete = (taskIndex) => {
    const newCompleted = [...completedTasks, taskIndex];
    setCompletedTasks(newCompleted);
    
    // Auto-advance to next task
    if (taskIndex < (round?.tasks?.length || 0) - 1) {
      setTimeout(() => {
        setCurrentTaskIndex(taskIndex + 1);
      }, 500);
    } else {
      // All tasks complete
      handleRoundComplete();
    }
  };

  const handleRoundComplete = () => {
    const duration = Math.round((Date.now() - startTime) / 1000 / 60);
    Alert.alert(
      'Round Complete!',
      `You completed all ${round.tasks.length} tasks in ${duration} minutes.`,
      [
        {
          text: 'View Dashboard',
          onPress: () => navigation.navigate('CompetenceDashboard', { profession }),
        },
        {
          text: 'Practice More',
          onPress: () => loadPracticeRound(),
        },
        { text: 'Done', style: 'cancel' },
      ]
    );
  };

  const getTaskTypeLabel = (type) => {
    const labels = {
      vocabulary: 'Vocabulary',
      listening: 'Listening',
      roleplay: 'Roleplay',
      writing: 'Writing',
    };
    return labels[type] || type;
  };

  const renderTaskCard = (task, index) => {
    const isCompleted = completedTasks.includes(index);
    const isCurrent = currentTaskIndex === index;
    
    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.taskCard,
          isCurrent && styles.taskCardCurrent,
          isCompleted && styles.taskCardCompleted,
        ]}
        onPress={() => setCurrentTaskIndex(index)}
        disabled={!isCurrent && !isCompleted}
      >
        <View style={styles.taskHeader}>
          <Text style={styles.taskNumber}>{index + 1}</Text>
          <Text style={styles.taskType}>{getTaskTypeLabel(task.type)}</Text>
          {isCompleted && <Text style={styles.checkmark}>✓</Text>}
        </View>
        {task.time_limit_seconds && (
          <Text style={styles.taskTime}>
            {Math.round(task.time_limit_seconds / 60)} min
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderCurrentTask = () => {
    if (!round || !round.tasks || round.tasks.length === 0) {
      return (
        <LockedFeature
          title="Harjoituskierros ei ole käytettävissä"
          message="Tehtäviä ei löytynyt. Tarkista yhteys ja yritä uudelleen."
        />
      );
    }
    
    const currentTask = round.tasks[currentTaskIndex];
    if (!currentTask) {
      return (
        <LockedFeature
          title="Tehtävä ei ole käytettävissä"
          message="Valittua tehtävää ei löytynyt. Valitse toinen tehtävä."
        />
      );
    }

    return (
      <View style={styles.currentTaskContainer}>
        <Text style={styles.currentTaskTitle}>
          Task {currentTaskIndex + 1}: {getTaskTypeLabel(currentTask.type)}
        </Text>
        
        {currentTask.type === 'vocabulary' && (
          <View style={styles.taskContent}>
            <Text style={styles.taskInstruction}>
              {currentTask.task?.instruction || 'Practice vocabulary'}
            </Text>
            <TouchableOpacity
              style={styles.startTaskButton}
              onPress={() => {
                navigation.navigate('Vocabulary', {
                  path: 'workplace',
                  field: profession,
                  vocabulary: currentTask.task?.vocabulary,
                });
                handleTaskComplete(currentTaskIndex);
              }}
            >
              <Text style={styles.startTaskButtonText}>Start Vocabulary</Text>
            </TouchableOpacity>
          </View>
        )}

        {currentTask.type === 'listening' && (
          <View style={styles.taskContent}>
            <Text style={styles.taskInstruction}>
              {currentTask.task?.audio?.script || 'Listen to instructions'}
            </Text>
            <TouchableOpacity
              style={styles.startTaskButton}
              onPress={() => {
                navigation.navigate('LessonDetail', {
                  type: 'listening',
                  path: 'workplace',
                  field: profession,
                  task: currentTask.task,
                });
                handleTaskComplete(currentTaskIndex);
              }}
            >
              <Text style={styles.startTaskButtonText}>Start Listening</Text>
            </TouchableOpacity>
          </View>
        )}

        {currentTask.type === 'roleplay' && (
          <View style={styles.taskContent}>
            <Text style={styles.taskInstruction}>
              {currentTask.task?.prompt || 'Practice roleplay'}
            </Text>
            <TouchableOpacity
              style={styles.startTaskButton}
              onPress={() => {
                navigation.navigate('Roleplay', {
                  field: profession,
                  task: currentTask.task,
                });
                handleTaskComplete(currentTaskIndex);
              }}
            >
              <Text style={styles.startTaskButtonText}>Start Roleplay</Text>
            </TouchableOpacity>
          </View>
        )}

        {currentTask.type === 'writing' && (
          <View style={styles.taskContent}>
            <Text style={styles.taskInstruction}>
              {currentTask.task?.prompt || 'Write a message'}
            </Text>
            <TouchableOpacity
              style={styles.startTaskButton}
              onPress={() => {
                navigation.navigate('Notes', {
                  path: 'workplace',
                  field: profession,
                  task: currentTask.task,
                });
                handleTaskComplete(currentTaskIndex);
              }}
            >
              <Text style={styles.startTaskButtonText}>Start Writing</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <Background module="workplace" variant="blue" solidContentZone>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Practice Round</Text>
            <HomeButton navigation={navigation} />
          </View>
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={palette.accentPrimary} />
            <Text style={styles.loadingText}>Loading practice round...</Text>
          </View>
        </View>
      </Background>
    );
  }

  if (error) {
    return (
      <Background module="workplace" variant="blue" solidContentZone>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Practice Round</Text>
            <HomeButton navigation={navigation} />
          </View>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadPracticeRound}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Background>
    );
  }

  const progress = calculatePracticeProgress(round?.tasks || [], completedTasks);

  return (
    <Background module="workplace" variant="blue" solidContentZone>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{professionLabel} Practice</Text>
          <HomeButton navigation={navigation} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Progress Bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {completedTasks.length} / {round?.tasks?.length || 0} tasks completed
            </Text>
          </View>

          {/* Task List */}
          <View style={styles.tasksSection}>
            <Text style={styles.sectionTitle}>Practice Tasks</Text>
            {round?.tasks?.map((task, index) => renderTaskCard(task, index))}
          </View>

          {/* Current Task */}
          {renderCurrentTask()}

          {/* Round Info */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Practice Round Info</Text>
            <Text style={styles.infoText}>
              Duration: {round?.duration_minutes || 12} minutes
            </Text>
            <Text style={styles.infoText}>
              Level: {round?.level || level}
            </Text>
            {round?.speed_pressure && (
              <Text style={styles.infoText}>
                Speed pressure: {round.speed_pressure ? 'Enabled' : 'Disabled'}
              </Text>
            )}
          </View>
        </ScrollView>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  authGuard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 24,
  },
  authGuardText: {
    color: '#e2e8f0',
    fontSize: 16,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: palette.backgroundPrimary,
  },
  backIcon: {
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: palette.textSecondary,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: palette.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: palette.accentPrimary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  progressSection: {
    marginBottom: 24,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: palette.surface,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: palette.accentPrimary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: palette.textSecondary,
    textAlign: 'center',
  },
  tasksSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.textPrimary,
    marginBottom: 16,
  },
  taskCard: {
    backgroundColor: palette.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: palette.divider,
  },
  taskCardCurrent: {
    borderColor: palette.accentPrimary,
    backgroundColor: '#F0F4FF',
  },
  taskCardCompleted: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8F4',
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.accentPrimary,
    marginRight: 12,
    width: 30,
  },
  taskType: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textPrimary,
    flex: 1,
  },
  checkmark: {
    fontSize: 20,
    color: '#4CAF50',
  },
  taskTime: {
    fontSize: 14,
    color: palette.textSecondary,
  },
  currentTaskContainer: {
    backgroundColor: palette.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: palette.accentPrimary,
  },
  currentTaskTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.textPrimary,
    marginBottom: 16,
  },
  taskContent: {
    marginTop: 8,
  },
  taskInstruction: {
    fontSize: 16,
    color: palette.textPrimary,
    marginBottom: 16,
    lineHeight: 24,
  },
  startTaskButton: {
    backgroundColor: palette.accentPrimary,
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  startTaskButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: palette.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.divider,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.textPrimary,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: palette.textSecondary,
    marginBottom: 8,
  },
});










