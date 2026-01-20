// ============================================================================
// Divider - Section divider component
// ============================================================================

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../design/colors';
import { spacing } from '../../design/spacing';

/**
 * Divider
 * 
 * TODO: Codex to implement:
 * - Optional animated gradient
 * - Optional text label in center
 */
export default function Divider({ 
  variant = 'solid',
  color = colors.glass.border,
  thickness = 1,
  style,
  ...props 
}) {
  return (
    <View
      style={[
        styles.divider,
        {
          backgroundColor: color,
          height: thickness,
          opacity: variant === 'solid' ? 1 : 0.3,
        },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  divider: {
    marginVertical: spacing.lg,
  },
});


