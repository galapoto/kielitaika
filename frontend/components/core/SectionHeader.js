// ============================================================================
// SectionHeader - Section title component
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../design/colors';
import { typography } from '../../design/typography';
import { spacing } from '../../design/spacing';

/**
 * SectionHeader
 * 
 * TODO: Codex to implement:
 * - Optional animated underline
 * - Optional badge count
 * - Action button animations
 */
export default function SectionHeader({ 
  title,
  subtitle,
  action,
  actionLabel,
  onActionPress,
  style,
  ...props 
}) {
  return (
    <View style={[styles.container, style]} {...props}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && (
          <Text style={styles.subtitle}>{subtitle}</Text>
        )}
      </View>
      {action && (
        <TouchableOpacity onPress={onActionPress} style={styles.action}>
          <Text style={styles.actionLabel}>{actionLabel || 'See All'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...typography.styles.h3,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  action: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  actionLabel: {
    ...typography.styles.button,
    color: colors.accent.mint,
  },
});


