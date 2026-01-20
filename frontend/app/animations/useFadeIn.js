import { useEffect } from 'react';
import { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

export function useFadeIn(duration = 300) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration });
  }, [duration, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return style;
}


