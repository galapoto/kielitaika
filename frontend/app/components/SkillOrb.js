import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';
import ProgressRing from './ProgressRing';

/**
 * SkillOrb: small animated orb for a skill (vocab, grammar, etc).
 * Props:
 *  - label: string
 *  - progress: number (0-1)
 *  - color: string
 */
export default function SkillOrb({ label, progress = 0, color = colors.blueMain }) {
  const breath = useSharedValue(1);

  useEffect(() => {
    breath.value = withRepeat(
      withTiming(1.05, { duration: 2400, easing: Easing.inOut(Easing.cubic) }),
      -1,
      true
    );
  }, [breath]);

  const breathStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breath.value }],
    shadowOpacity: 0.2 + progress * 0.4,
  }));

  return (
    <Animated.View style={[styles.container, breathStyle]}>
      <ProgressRing size={68} strokeWidth={6} progress={progress} trackColor={`${color}33`} indicatorColor={color} />
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.percent}>{Math.round(progress * 100)}%</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.s,
    borderRadius: 14,
    backgroundColor: colors.white,
    shadowColor: colors.textMain,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  labelContainer: {
    alignItems: 'center',
    gap: 2,
  },
  label: {
    ...typography.bodySm,
    fontWeight: '700',
    color: colors.textMain,
  },
  percent: {
    ...typography.micro,
    color: colors.textSoft,
  },
});
