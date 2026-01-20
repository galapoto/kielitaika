import { useEffect } from 'react';
import { useSharedValue, withRepeat, withTiming, useAnimatedStyle } from 'react-native-reanimated';

export function useTypingIndicatorAnimation(delay = 0) {
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 600 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return animatedStyle;
}


