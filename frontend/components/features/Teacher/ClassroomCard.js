// ============================================================================
// ClassroomCard - Classroom display card
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import GlassCard from '../../core/GlassCard';
import { colors } from '../../../design/colors';
import { typography } from '../../../design/typography';
import { spacing } from '../../../design/spacing';

/**
 * ClassroomCard
 * 
 * TODO: Codex to implement:
 * - Student count animations
 * - Progress visualization
 * - Action buttons
 */
export default function ClassroomCard({ 
  name,
  studentCount = 0,
  assignmentCount = 0,
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
      <Text style={styles.name}>{name}</Text>
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{studentCount}</Text>
          <Text style={styles.statLabel}>Students</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{assignmentCount}</Text>
          <Text style={styles.statLabel}>Assignments</Text>
        </View>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  name: {
    ...typography.styles.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  stat: {
    gap: spacing.xs,
  },
  statValue: {
    ...typography.styles.h3,
    color: colors.accent.mint,
    fontWeight: '700',
  },
  statLabel: {
    ...typography.styles.caption,
    color: colors.text.secondary,
  },
});


