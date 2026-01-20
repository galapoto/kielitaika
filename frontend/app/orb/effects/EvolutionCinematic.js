import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useSharedValue, withSequence, withTiming, useAnimatedStyle } from 'react-native-reanimated';

/**
 * Lightweight cinematic overlay when the orb evolves.
 * Trigger prop should change (e.g., timestamp or counter) to replay animation.
 */
export default function EvolutionCinematic({ trigger }) {
  const vignette = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!trigger) return;
    vignette.value = 0;
    scale.value = 1;
    vignette.value = withSequence(
      withTiming(0.3, { duration: 450, easing: Easing.out(Easing.cubic) }),
      withTiming(0, { duration: 650, easing: Easing.out(Easing.cubic) })
    );
    scale.value = withSequence(
      withTiming(1.08, { duration: 450, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 650, easing: Easing.out(Easing.quad) })
    );
  }, [trigger, scale, vignette]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const overlay = useAnimatedStyle(() => ({
    opacity: vignette.value,
    backgroundColor: 'rgba(0,0,0,0.35)',
  }));

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, overlay]} />
    </Animated.View>
  );
}
