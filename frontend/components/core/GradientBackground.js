// ============================================================================
// GradientBackground - Premium gradient background component
// ============================================================================

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients } from '../../design/gradients';

/**
 * GradientBackground
 * 
 * TODO: Codex to implement:
 * - Animated gradient color transitions
 * - Parallax scrolling effects
 * - Dynamic gradient based on scroll position
 * - Optional blur overlay
 */
export default function GradientBackground({ 
  children, 
  variant = 'hero',
  style,
  ...props 
}) {
  const gradientConfig = gradients[variant] || gradients.hero;

  return (
    <LinearGradient
      colors={gradientConfig.colors}
      start={gradientConfig.start}
      end={gradientConfig.end}
      locations={gradientConfig.locations}
      style={[styles.container, style]}
      {...props}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});


