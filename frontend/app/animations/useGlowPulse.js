import { useEffect } from 'react';
import { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';

export function useGlowPulse() {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.2, { duration: 1200 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return animatedStyle;
}


