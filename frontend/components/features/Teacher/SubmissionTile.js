// ============================================================================
// SubmissionTile - Student submission display tile
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import GlassCard from '../../core/GlassCard';
import { colors } from '../../../design/colors';
import { typography } from '../../../design/typography';
import { spacing } from '../../../design/spacing';

/**
 * SubmissionTile
 * 
 * TODO: Codex to implement:
 * - Status badges
 * - Score display
 * - Timestamp
 * - Action buttons (grade, comment)
 */
export default function SubmissionTile({ 
  studentName,
  submittedAt,
  score,
  status = 'submitted', // submitted, graded, late
  onPress,
  style,
  ...props 
}) {
  const getStatusColor = () => {
    switch (status) {
      case 'graded': return colors.success;
      case 'late': return colors.error;
      default: return colors.info;
    }
  };

  return (
    <GlassCard
      onPress={onPress}
      style={[styles.container, style]}
      {...props}
    >
      <View style={styles.content}>
        <View style={styles.info}>
          <Text style={styles.name}>{studentName}</Text>
          <Text style={styles.date}>Submitted: {submittedAt}</Text>
        </View>
        {score !== undefined && (
          <View style={styles.scoreContainer}>
            <Text style={styles.score}>{score}%</Text>
          </View>
        )}
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{status.toUpperCase()}</Text>
        </View>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
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
  date: {
    ...typography.styles.caption,
    color: colors.text.secondary,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  score: {
    ...typography.styles.h4,
    color: colors.accent.mint,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    ...typography.styles.small,
    color: colors.text.primary,
    fontWeight: '700',
  },
});


