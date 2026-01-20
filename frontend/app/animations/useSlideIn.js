import { useEffect } from 'react';
import { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

export function useSlideIn(distance = 20, duration = 250) {
  const translateY = useSharedValue(distance);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withTiming(0, { duration });
    opacity.value = withTiming(1, { duration });
  }, [distance, duration, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return animatedStyle;
}


