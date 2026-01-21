// ============================================================================
// SkillNode - Individual skill node in skill tree
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../../app/styles/colors';
import { typography } from '../../../app/styles/typography';
import { spacing } from '../../../app/styles/spacing';
import { radius } from '../../../app/styles/radius';
import { shadows } from '../../../app/styles/shadows';
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
    backgroundColor: colors.white,
    borderWidth: 3,
    borderColor: colors.blueMain,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.m,
  },
  locked: {
    backgroundColor: colors.grayLine,
    borderColor: colors.grayLine,
    opacity: 0.5,
  },
  completed: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  progressOverlay: {
    position: 'absolute',
  },
  icon: {
    fontSize: 32,
  },
  title: {
    ...typography.bodySm,
    color: colors.textMain,
    textAlign: 'center',
    maxWidth: 100,
    fontWeight: '600',
  },
  lockedTitle: {
    color: colors.textSoft,
  },
});





