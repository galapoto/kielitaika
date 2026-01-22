import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';
import { radius } from '../styles/radius';

const AnimatedView = Animated.createAnimatedComponent(View);

/**
 * Minimal progress meter for session turns/targets.
 * Optimized with memoization and smooth animations.
 */
function GoalMeter({ progress = 0, label = 'Goal' }) {
  const pct = useMemo(() => Math.min(1, Math.max(0, progress)), [progress]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    width: `${pct * 100}%`,
  }), [pct]);

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        <AnimatedView style={[styles.fill, animatedStyle]} />
      </View>
      <Text style={styles.label}>{label} {Math.round(pct * 100)}%</Text>
    </View>
  );
}

export default React.memo(GoalMeter);

const styles = StyleSheet.create({
  container: {
    width: 120,
    gap: spacing.xs,
  },
  bar: {
    height: 8,
    borderRadius: radius.l,
    backgroundColor: colors.grayLine,
    overflow: 'hidden',
  },
  fill: {
    flex: 1,
    backgroundColor: colors.blueMain,
  },
  label: {
    ...typography.bodySm,
    color: colors.textSoft,
    textAlign: 'right',
  },
});
