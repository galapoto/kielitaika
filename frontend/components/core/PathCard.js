// ============================================================================
// PathCard - Individual learning path card
// ============================================================================

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import GlassCard from './GlassCard';
import { colors } from '../../design/colors';
import { typography } from '../../design/typography';
import { spacing } from '../../design/spacing';
import ProgressRing from './ProgressRing';

/**
 * PathCard
 * 
 * TODO: Codex to implement:
 * - Animated progress ring
 * - Card lift on press
 * - Gradient border on active
 * - Achievement badges
 */
export default function PathCard({ 
  title,
  description,
  progress = 0,
  icon,
  onPress,
  style,
  ...props 
}) {
  return (
    <GlassCard
      onPress={onPress}
      style={[styles.card, style]}
      {...props}
    >
      <View style={styles.content}>
        {icon && (
          <Text style={styles.icon}>{icon}</Text>
        )}
        <Text style={styles.title}>{title}</Text>
        {description && (
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        )}
        <View style={styles.progressContainer}>
          <ProgressRing
            progress={progress}
            size={60}
            strokeWidth={4}
            showLabel={false}
          />
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        </View>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200,
    minHeight: 220,
  },
  content: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  icon: {
    fontSize: 40,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.styles.h4,
    color: colors.text.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  description: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  progressContainer: {
    marginTop: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  progressText: {
    ...typography.styles.small,
    color: colors.text.tertiary,
    fontWeight: '600',
  },
});


