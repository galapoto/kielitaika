import { useEffect } from 'react';
import { useSharedValue, useAnimatedStyle, withRepeat, withTiming, interpolate } from 'react-native-reanimated';

// Slowly drifts a gradient/wave background.
export function useHeroWave(duration = 12000) {
  const phase = useSharedValue(0);

  useEffect(() => {
    phase.value = withRepeat(withTiming(1, { duration }), -1, false);
  }, [duration, phase]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(phase.value, [0, 1], [0, 24]);
    const translateY = interpolate(phase.value, [0, 1], [0, -12]);
    return {
      transform: [{ translateX }, { translateY }],
      opacity: 0.9,
    };
  });

  return { animatedStyle };
}
