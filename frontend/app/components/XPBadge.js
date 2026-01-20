import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { useBounce } from '../animations/useBounce';
import { colors } from '../styles/colors';
import { radius } from '../styles/radius';
import { spacing } from '../styles/spacing';

export default function XPBadge({ xp }) {
  const { trigger, animatedStyle } = useBounce();
  const AnimatedView = Animated.createAnimatedComponent(View);

  useEffect(() => {
    trigger();
  }, [xp, trigger]);

  return (
    <AnimatedView style={[styles.container, animatedStyle]}>
      <Text style={styles.label}>XP</Text>
      <Text style={styles.value}>{xp}</Text>
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.mintSoft,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: radius.m,
  },
  label: {
    fontWeight: '700',
    marginRight: spacing.xs,
    color: colors.textMain,
  },
  value: {
    fontWeight: '700',
    color: colors.textMain,
  },
});


