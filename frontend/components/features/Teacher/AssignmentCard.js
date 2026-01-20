// ============================================================================
// AssignmentCard - Assignment display card
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import GlassCard from '../../core/GlassCard';
import { colors } from '../../../design/colors';
import { typography } from '../../../design/typography';
import { spacing } from '../../../design/spacing';

/**
 * AssignmentCard
 * 
 * TODO: Codex to implement:
 * - Status indicators
 * - Due date countdown
 * - Submission count
 * - Action buttons
 */
export default function AssignmentCard({ 
  title,
  description,
  dueDate,
  submissionsCount = 0,
  totalStudents = 0,
  status = 'active',
  onPress,
  style,
  ...props 
}) {
  return (
    <GlassCard
      onPress={onPress}
      style={[styles.container, style]}
      {...props}
    >
      <Text style={styles.title}>{title}</Text>
      {description && (
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
      )}
      <View style={styles.footer}>
        <Text style={styles.dueDate}>Due: {dueDate}</Text>
        <Text style={styles.submissions}>
          {submissionsCount}/{totalStudents} submissions
        </Text>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.styles.h4,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.styles.body,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dueDate: {
    ...typography.styles.caption,
    color: colors.text.tertiary,
  },
  submissions: {
    ...typography.styles.caption,
    color: colors.accent.mint,
    fontWeight: '600',
  },
});


