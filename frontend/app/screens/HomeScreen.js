// ============================================================================
// HomeScreen - Premium 2026 Edition Home Screen
// ============================================================================

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import SceneBackground from '../../components/SceneBackground';
import VoiceOrb from '../../components/orb/VoiceOrb';
import { useRukaStore } from '../../state/useRukaStore';
import HeroCard from '../../components/core/HeroCard';
import QuickActionsCarousel from '../../components/core/QuickActionsCarousel';
import PathCarousel from '../../components/core/PathCarousel';
import DailyJourneyTimeline from '../../components/core/DailyJourneyTimeline';
import FloatingActionButton from '../../components/core/FloatingActionButton';
import BottomSheet from '../../components/core/BottomSheet';
import SectionHeader from '../../components/core/SectionHeader';
import { colors } from '../../design/colors';
import { typography } from '../../design/typography';
import { spacing } from '../../design/spacing';

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
            <VoiceOrb />
          </View>
          <HeroCard
            title="Welcome back!"
            subtitle="Continue your Finnish learning journey"
          />
        </View>

        {/* Quick Actions */}
        <SectionHeader title="Quick Actions" />
        <QuickActionsCarousel actions={quickActions} />

        {/* Learning Paths */}
        <SectionHeader title="Your Learning Paths" />
        <PathCarousel paths={learningPaths} />

        {/* Daily Journey */}
        <SectionHeader title="Today's Journey" />
        <DailyJourneyTimeline tasks={dailyTasks} showTitle={false} />

        {/* Spacer for FAB */}
        <View style={styles.spacer} />
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingActionButton
        icon="➕"
        label="More"
        onPress={handleMorePress}
      />

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
});
