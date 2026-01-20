// ============================================================================
// FloatingActionButton - FAB component
// ============================================================================

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../design/colors';
import { typography } from '../../design/typography';
import { spacing } from '../../design/spacing';
import { shadows } from '../../design/shadows';
import { gradients } from '../../design/gradients';

/**
 * FloatingActionButton
 * 
 * TODO: Codex to implement:
 * - Floating animation
 * - Expand/collapse animation
 * - Shadow glow on hover
 * - Ripple effect
 * - Badge notification
 */
export default function FloatingActionButton({ 
  icon,
  label,
  onPress,
  position = { bottom: 32, right: 24 },
  style,
  ...props 
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.container, position, style]}
      {...props}
    >
      <LinearGradient
        colors={gradients.accent.colors}
        start={gradients.accent.start}
        end={gradients.accent.end}
        style={styles.gradient}
      >
        {icon && (
          <Text style={styles.icon}>{icon}</Text>
        )}
        {label && (
          <Text style={styles.label}>{label}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    borderRadius: 28,
    ...shadows.deep,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 28,
    gap: spacing.sm,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    ...typography.styles.button,
    color: colors.text.inverse,
  },
});


