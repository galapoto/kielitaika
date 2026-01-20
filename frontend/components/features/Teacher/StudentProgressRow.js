// ============================================================================
// StudentProgressRow - Student progress display row
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../../design/colors';
import { typography } from '../../../design/typography';
import { spacing } from '../../../design/spacing';
import ProgressRing from '../../core/ProgressRing';

/**
 * StudentProgressRow
 * 
 * TODO: Codex to implement:
 * - Progress bar animations
 * - Status indicators
 * - Expandable details
 * - Action buttons
 */
export default function StudentProgressRow({ 
  name,
  email,
  progress = 0,
  assignmentsCompleted = 0,
  assignmentsTotal = 0,
  onPress,
  style,
  ...props 
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, style]}
      {...props}
    >
      <View style={styles.content}>
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          {email && (
            <Text style={styles.email}>{email}</Text>
          )}
          <Text style={styles.assignments}>
            {assignmentsCompleted}/{assignmentsTotal} assignments
          </Text>
        </View>
        <ProgressRing
          progress={progress}
          size={60}
          strokeWidth={4}
          showLabel={false}
        />
        <Text style={styles.progressText}>{Math.round(progress)}%</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    backgroundColor: colors.background.surface,
    borderRadius: 16,
    marginBottom: spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  email: {
    ...typography.styles.caption,
    color: colors.text.secondary,
  },
  assignments: {
    ...typography.styles.small,
    color: colors.text.tertiary,
  },
  progressText: {
    ...typography.styles.body,
    color: colors.accent.mint,
    fontWeight: '700',
  },
});


