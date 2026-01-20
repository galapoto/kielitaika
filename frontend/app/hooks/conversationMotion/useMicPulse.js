import { useSharedValue, withRepeat, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { useEffect } from 'react';

export function useMicPulse(active = true) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (active) {
      pulse.value = withRepeat(withTiming(1.08, { duration: 1400 }), -1, true);
    } else {
      pulse.value = withTiming(1, { duration: 200 });
    }
  }, [active, pulse]);

  return useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));
}
