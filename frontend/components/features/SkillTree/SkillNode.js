// ============================================================================
// SkillNode - Individual skill node in skill tree
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../../design/colors';
import { typography } from '../../../design/typography';
import { spacing } from '../../../design/spacing';
import ProgressRing from '../../core/ProgressRing';

/**
 * SkillNode
 * 
 * TODO: Codex to implement:
 * - Node state animations (locked/unlocked/completed)
 * - Progress animations
 * - Glow effect when active
 * - Connection line animations
 */
export default function SkillNode({ 
  title,
  icon,
  progress = 0,
  locked = false,
  completed = false,
  onPress,
  style,
  ...props 
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={locked}
      style={[styles.container, style]}
      {...props}
    >
      <View style={[
        styles.node,
        locked && styles.locked,
        completed && styles.completed,
      ]}>
        {icon && (
          <Text style={styles.icon}>{icon}</Text>
        )}
        {!locked && (
          <View style={styles.progressOverlay}>
            <ProgressRing
              progress={progress}
              size={60}
              strokeWidth={4}
              showLabel={false}
            />
          </View>
        )}
      </View>
      {title && (
        <Text style={[styles.title, locked && styles.lockedTitle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  node: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background.surface,
    borderWidth: 3,
    borderColor: colors.accent.mint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locked: {
    backgroundColor: colors.gray[800],
    borderColor: colors.gray[600],
    opacity: 0.5,
  },
  completed: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  progressOverlay: {
    position: 'absolute',
  },
  icon: {
    fontSize: 32,
  },
  title: {
    ...typography.styles.caption,
    color: colors.text.primary,
    textAlign: 'center',
    maxWidth: 100,
  },
  lockedTitle: {
    color: colors.text.tertiary,
  },
});


