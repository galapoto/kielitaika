// ============================================================================
// IconButton - Icon-only button component
// ============================================================================

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { colors } from '../../design/colors';
import { spacing } from '../../design/spacing';
import { shadows } from '../../design/shadows';

/**
 * IconButton
 * 
 * TODO: Codex to implement:
 * - Press scale animation
 * - Ripple effect
 * - Haptic feedback
 * - Loading state
 * - Badge indicator
 */
export default function IconButton({ 
  icon,
  onPress,
  size = 48,
  variant = 'glass',
  disabled = false,
  style,
  ...props 
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        styles.button,
        { width: size, height: size, borderRadius: size / 2 },
        variant === 'glass' && styles.glass,
        disabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      <Text style={[styles.icon, { fontSize: size * 0.5 }]}>{icon}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.soft,
  },
  glass: {
    backgroundColor: colors.glass.light,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    // Icon styling
  },
});


