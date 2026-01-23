import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useScaleOnPress } from '../animations/useScaleOnPress';
import { useGlowPulse } from '../animations/useGlowPulse';
import { colors } from '../styles/colors';
import { radius } from '../styles/radius';
import { spacing } from '../styles/spacing';

export default function AnimatedCTA({ label, onPress, disabled = false }) {
  const { animatedStyle, onPressIn, onPressOut } = useScaleOnPress();
  const glowStyle = useGlowPulse();
  const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
  const AnimatedView = Animated.createAnimatedComponent(View);

  return (
    <AnimatedTouchable
      style={[styles.button, animatedStyle, disabled && styles.disabled]}
      activeOpacity={0.9}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={onPress}
      disabled={disabled}
    >
      <AnimatedView style={[styles.glow, glowStyle]} />
      <Text style={styles.label}>{label}</Text>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.blueMain,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  label: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 18,
  },
  glow: {
    position: 'absolute',
    top: -10,
    bottom: -10,
    left: -10,
    right: -10,
    backgroundColor: colors.white,
    opacity: 0,
  },
  disabled: {
    opacity: 0.6,
  },
});





