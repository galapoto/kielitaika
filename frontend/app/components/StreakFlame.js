import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { useGlowPulse } from '../animations/useGlowPulse';
import { colors } from '../styles/colors';
import { radius } from '../styles/radius';
import { spacing } from '../styles/spacing';

export default function StreakFlame({ streakCount }) {
  const glowStyle = useGlowPulse();
  const AnimatedView = Animated.createAnimatedComponent(View);
  return (
    <View style={styles.container}>
      <AnimatedView style={[styles.glow, glowStyle]} />
      <View style={styles.content}>
        <Text style={styles.icon}>🔥</Text>
        <Text style={styles.text}>{streakCount} days</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: spacing.s,
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.yellowWarm,
    opacity: 0.15,
    borderRadius: radius.l,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  icon: {
    fontSize: 20,
  },
  text: {
    fontWeight: '700',
    color: colors.textMain,
  },
});


