import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';

export default function FogBreath({ intensity = 1, amplitude = 0 }) {
  const phase = useSharedValue(0);
  const amp = useSharedValue(amplitude);

  useEffect(() => {
    phase.value = withRepeat(withTiming(1, { duration: 12000, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [phase]);

  useEffect(() => {
    amp.value = amplitude;
  }, [amplitude, amp]);

  const fogStyle = useAnimatedStyle(() => {
    const scale = interpolate(phase.value, [0, 0.5, 1], [1, 1.08, 1]) * intensity;
    const baseDrift = interpolate(phase.value, [0, 1], [-12, 12]);
    const push = amp.value * 40;
    const translateX = baseDrift + push;
    return {
      transform: [{ scale }, { translateX }],
      opacity: 0.18 * intensity,
      filter: `blur(${2 + amp.value * 4}px)`,
    };
  });

  return <Animated.View pointerEvents="none" style={[styles.fog, fogStyle]} />;
}

const styles = StyleSheet.create({
  fog: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
});
