// ============================================================================
// HomeScreen - Premium 2026 Edition Home Screen
// ============================================================================

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import SceneBackground from '../components/SceneBackground';
import VoiceOrb from '../components/VoiceOrb';
import { useRukaStore } from '../state/useRukaStore';
import BottomSheet from '../components/BottomSheet';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';

/**
 * HomeScreen - Premium redesigned home screen
 * 
 * TODO: Codex to implement:
 * - Connect to real data sources
 * - Implement navigation to screens
 * - Add animations and gestures
 * - Integrate with state management
 */
export default function HomeScreen({ navigation }) {
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const { amplitude, setAmplitude } = useRukaStore();
  
  // Simulate amplitude changes for demo
  React.useEffect(() => {
    const interval = setInterval(() => {
      setAmplitude(Math.random() * 0.5);
    }, 1000);
    return () => clearInterval(interval);
  }, [setAmplitude]);

  // Mock data - TODO: Replace with real data
  const quickActions = [
    { icon: '💬', title: 'Speak', subtitle: 'Practice conversation' },
    { icon: '🎤', title: 'Pronunciation', subtitle: 'Improve accent' },
    { icon: '📚', title: 'Vocabulary', subtitle: 'Learn new words' },
    { icon: '📖', title: 'Grammar', subtitle: 'Master rules' },
    { icon: '🎯', title: 'YKI Exam', subtitle: 'Test prep' },
  ];

  const learningPaths = [
    { id: 1, title: 'Beginner', description: 'Start your Finnish journey', progress: 65, icon: '🌱' },
    { id: 2, title: 'Intermediate', description: 'Build fluency', progress: 30, icon: '🌿' },
    { id: 3, title: 'Advanced', description: 'Master Finnish', progress: 10, icon: '🌳' },
  ];

  const dailyTasks = [
    { id: 1, title: 'Vocabulary', icon: '📚', completed: true },
    { id: 2, title: 'Grammar', icon: '📖', completed: true },
    { id: 3, title: 'Speaking', icon: '💬', completed: false },
    { id: 4, title: 'Listening', icon: '👂', completed: false },
  ];

  const handleMorePress = () => {
    setBottomSheetVisible(true);
  };

  const handleMenuAction = (action) => {
    setBottomSheetVisible(false);
    // TODO: Navigate to appropriate screen
    if (action === 'vocabulary') navigation.navigate('Vocabulary');
    else if (action === 'lessons') navigation.navigate('Lessons');
    else if (action === 'certificates') navigation.navigate('Certificates');
    else if (action === 'pronunciation') navigation.navigate('PronunciationLab');
    else if (action === 'teacher') navigation.navigate('TeacherDashboard');
    else if (action === 'settings') navigation.navigate('Settings');
  };

  return (
    <View style={styles.container}>
      <SceneBackground sceneKey="forest" orbEmotion="calm" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section with VoiceOrb */}
        <View style={styles.heroSection}>
          <View style={styles.orbContainer}>
            <VoiceOrb amplitude={amplitude} />
          </View>
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeTitle}>Welcome back!</Text>
            <Text style={styles.welcomeSubtitle}>Continue your Finnish learning journey</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, idx) => (
              <TouchableOpacity key={idx} style={styles.actionCard}>
                <Text style={styles.actionIcon}>{action.icon}</Text>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Learning Paths */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Learning Paths</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {learningPaths.map((path) => (
              <View key={path.id} style={styles.pathCard}>
                <Text style={styles.pathIcon}>{path.icon}</Text>
                <Text style={styles.pathTitle}>{path.title}</Text>
                <Text style={styles.pathDescription}>{path.description}</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${path.progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{path.progress}%</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Daily Journey */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Journey</Text>
          {dailyTasks.map((task) => (
            <View key={task.id} style={styles.taskItem}>
              <Text style={styles.taskIcon}>{task.icon}</Text>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskStatus}>{task.completed ? '✓' : '○'}</Text>
            </View>
          ))}
        </View>

        {/* Spacer for FAB */}
        <View style={styles.spacer} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleMorePress}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>➕</Text>
      </TouchableOpacity>

      {/* Bottom Sheet Menu */}
      <BottomSheet
        visible={bottomSheetVisible}
        onClose={() => setBottomSheetVisible(false)}
      >
        <View style={styles.menu}>
          <Text style={styles.menuTitle}>More Options</Text>
          <MenuItem
            icon="📚"
            title="Vocabulary"
            onPress={() => handleMenuAction('vocabulary')}
          />
          <MenuItem
            icon="📖"
            title="Lessons"
            onPress={() => handleMenuAction('lessons')}
          />
          <MenuItem
            icon="🏆"
            title="Certificates"
            onPress={() => handleMenuAction('certificates')}
          />
          <MenuItem
            icon="🎤"
            title="Pronunciation Lab"
            onPress={() => handleMenuAction('pronunciation')}
          />
          <MenuItem
            icon="👨‍🏫"
            title="Teacher Portal"
            onPress={() => handleMenuAction('teacher')}
          />
          <MenuItem
            icon="⚙️"
            title="Settings"
            onPress={() => handleMenuAction('settings')}
          />
        </View>
      </BottomSheet>
    </View>
  );
}

// Menu Item Component
function MenuItem({ icon, title, onPress }) {
  return (
    <TouchableOpacity
      style={menuItemStyles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={menuItemStyles.icon}>{icon}</Text>
      <Text style={menuItemStyles.title}>{title}</Text>
    </TouchableOpacity>
  );
}

const menuItemStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background.surface,
    borderRadius: 16,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  icon: {
    fontSize: 24,
  },
  title: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing['4xl'],
  },
  heroSection: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  orbContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  spacer: {
    height: spacing['3xl'],
  },
  menu: {
    gap: spacing.md,
  },
  menuTitle: {
    ...typography.styles.h3,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  welcomeCard: {
    backgroundColor: colors.background.surface,
    padding: spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
  },
  welcomeTitle: {
    ...typography.styles.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  welcomeSubtitle: {
    ...typography.styles.body,
    color: colors.text.secondary,
  },
  section: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  sectionTitle: {
    ...typography.styles.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background.surface,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  actionTitle: {
    ...typography.styles.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  actionSubtitle: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  pathCard: {
    width: 200,
    backgroundColor: colors.background.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginRight: spacing.md,
  },
  pathIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  pathTitle: {
    ...typography.styles.h4,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  pathDescription: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.background.secondary,
    borderRadius: 2,
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.main,
    borderRadius: 2,
  },
  progressText: {
    ...typography.styles.caption,
    color: colors.text.secondary,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  taskIcon: {
    fontSize: 24,
  },
  taskTitle: {
    ...typography.styles.body,
    color: colors.text.primary,
    flex: 1,
  },
  taskStatus: {
    fontSize: 20,
    color: colors.primary.main,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabIcon: {
    fontSize: 24,
    color: '#fff',
  },
});
