// ============================================================================
// HeroCard - Premium hero section card (WITH ANIMATIONS)
// ============================================================================

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../design/colors';
import { typography } from '../../design/typography';
import { spacing } from '../../design/spacing';
import { shadows } from '../../design/shadows';
import { gradients } from '../../design/gradients';
import { motion } from '../../design/motion';

/**
 * HeroCard - With fade-in and wave animations
 */
export default function HeroCard({ 
  title,
  subtitle,
  children,
  style,
  ...props 
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(100, withTiming(1, {
      duration: motion.duration.slow,
      easing: Easing.out(Easing.quad),
    }));
    translateY.value = withDelay(100, withTiming(0, {
      duration: motion.duration.slow,
      easing: Easing.out(Easing.quad),
    }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle, style]} {...props}>
      <LinearGradient
        colors={gradients.accent.colors}
        start={gradients.accent.start}
        end={gradients.accent.end}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {title && (
            <Text style={styles.title}>{title}</Text>
          )}
          {subtitle && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}
          {children}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 32,
    overflow: 'hidden',
    ...shadows.deep,
  },
  gradient: {
    padding: spacing.lg,
    minHeight: 200,
  },
  content: {
    gap: spacing.md,
  },
  title: {
    ...typography.styles.h2,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.styles.bodyLarge,
    color: colors.text.secondary,
  },
});


