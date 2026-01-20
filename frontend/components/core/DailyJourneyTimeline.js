// ============================================================================
// DailyJourneyTimeline - Daily progress timeline (WITH STAGGER ANIMATIONS)
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated from 'react-native-reanimated';
import { colors } from '../../design/colors';
import { typography } from '../../design/typography';
import { spacing } from '../../design/spacing';
import GlassCard from './GlassCard';
import { useStaggerFadeIn } from '../../hooks/motion/useStaggerFadeIn';

/**
 * DailyJourneyTimeline - With stagger fade-in animations
 */
export default function DailyJourneyTimeline({ 
  tasks = [],
  title,
  showTitle = false,
  style,
  ...props 
}) {
  return (
    <View style={[styles.container, style]} {...props}>
      {showTitle && title && (
        <Text style={styles.title}>{title}</Text>
      )}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tasks.map((task, index) => (
          <TimelineItem key={task.id || index} task={task} index={index} />
        ))}
      </ScrollView>
    </View>
  );
}

function TimelineItem({ task, index }) {
  const { animatedStyle } = useStaggerFadeIn(index, 80);

  return (
    <Animated.View style={animatedStyle}>
      <GlassCard style={styles.taskCard}>
        <View style={styles.taskContent}>
          <Text style={styles.taskIcon}>{task.icon || '📚'}</Text>
          <Text style={styles.taskTitle}>{task.title}</Text>
          {task.completed && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>✓</Text>
            </View>
          )}
        </View>
      </GlassCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.lg,
  },
  title: {
    ...typography.styles.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  taskCard: {
    width: 120,
    minHeight: 140,
  },
  taskContent: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  taskIcon: {
    fontSize: 36,
  },
  taskTitle: {
    ...typography.styles.caption,
    color: colors.text.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  completedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedText: {
    color: colors.text.inverse,
    fontSize: 14,
    fontWeight: '700',
  },
});


