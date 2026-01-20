// ============================================================================
// GlassCard - Premium glassmorphism card component
// ============================================================================

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { colors } from '../../design/colors';
import { spacing } from '../../design/spacing';
import { shadows } from '../../design/shadows';
import { gradients } from '../../design/gradients';
import { usePressScale } from '../../hooks/motion/usePressScale';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

/**
 * GlassCard - Premium glassmorphic card with animations
 */
export default function GlassCard({ 
  children, 
  onPress,
  style,
  variant = 'default',
  ...props 
}) {
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(0.97);

  const glassStyle = useAnimatedStyle(() => {
    return {
      ...animatedStyle.value,
    };
  });

  const CardWrapper = onPress ? AnimatedTouchable : Animated.View;

  return (
    <CardWrapper
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      activeOpacity={0.8}
      style={[styles.wrapper, style, glassStyle]}
      {...props}
    >
      <LinearGradient
        colors={gradients.card.colors}
        start={gradients.card.start}
        end={gradients.card.end}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {children}
        </View>
      </LinearGradient>
    </CardWrapper>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 24,
    overflow: 'hidden',
    ...shadows.deep,
    elevation: 8,
  },
  gradient: {
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.glass.border,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    // Enhanced backdrop blur for web
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(28px) saturate(180%)',
      WebkitBackdropFilter: 'blur(28px) saturate(180%)',
    }),
  },
  content: {
    padding: spacing.card.padding,
  },
});


