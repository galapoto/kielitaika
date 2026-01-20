// ============================================================================
// FeedbackCard - Pronunciation feedback display
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GlassCard from '../../core/GlassCard';
import { colors } from '../../../design/colors';
import { typography } from '../../../design/typography';
import { spacing } from '../../../design/spacing';

/**
 * FeedbackCard
 * 
 * TODO: Codex to implement:
 * - Animated feedback appearance
 * - Color-coded feedback (red/yellow/green)
 * - Expandable details
 * - Action buttons (retry, next)
 */
export default function FeedbackCard({ 
  title,
  feedback,
  suggestions = [],
  score,
  style,
  ...props 
}) {
  return (
    <GlassCard style={[styles.container, style]} {...props}>
      {title && (
        <Text style={styles.title}>{title}</Text>
      )}
      {feedback && (
        <Text style={styles.feedback}>{feedback}</Text>
      )}
      {score !== undefined && (
        <Text style={styles.score}>Score: {score}%</Text>
      )}
      {suggestions.length > 0 && (
        <View style={styles.suggestions}>
          {suggestions.map((suggestion, index) => (
            <Text key={index} style={styles.suggestion}>
              • {suggestion}
            </Text>
          ))}
        </View>
      )}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  title: {
    ...typography.styles.h4,
    color: colors.text.primary,
  },
  feedback: {
    ...typography.styles.body,
    color: colors.text.secondary,
  },
  score: {
    ...typography.styles.h3,
    color: colors.accent.mint,
    fontWeight: '700',
  },
  suggestions: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  suggestion: {
    ...typography.styles.body,
    color: colors.text.secondary,
  },
});


