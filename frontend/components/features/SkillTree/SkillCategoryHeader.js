// ============================================================================
// SkillCategoryHeader - Category header for skill tree sections
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../../design/colors';
import { typography } from '../../../design/typography';
import { spacing } from '../../../design/spacing';

/**
 * SkillCategoryHeader
 * 
 * TODO: Codex to implement:
 * - Expand/collapse animation
 * - Progress indicator
 * - Icon animations
 */
export default function SkillCategoryHeader({ 
  title,
  description,
  progress = 0,
  icon,
  expanded = true,
  style,
  ...props 
}) {
  return (
    <View style={[styles.container, style]} {...props}>
      {icon && (
        <Text style={styles.icon}>{icon}</Text>
      )}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {description && (
          <Text style={styles.description}>{description}</Text>
        )}
      </View>
      <View style={styles.progressContainer}>
        <Text style={styles.progress}>{Math.round(progress)}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.background.surface,
    borderRadius: 16,
    marginBottom: spacing.md,
  },
  icon: {
    fontSize: 32,
  },
  textContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typography.styles.h4,
    color: colors.text.primary,
  },
  description: {
    ...typography.styles.caption,
    color: colors.text.secondary,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progress: {
    ...typography.styles.h4,
    color: colors.accent.mint,
    fontWeight: '700',
  },
});


