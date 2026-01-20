import { useSharedValue, withTiming, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useEffect } from 'react';

// Fade + slight rise for tutor bubble; slight bounce for user bubble.
export function useBubbleAppear({ type = 'tutor' } = {}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(type === 'tutor' ? 6 : 0);
  const scale = useSharedValue(type === 'user' ? 0.96 : 1);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 260 });
    if (type === 'tutor') {
      translateY.value = withTiming(0, { duration: 260 });
    } else {
      scale.value = withSpring(1, { damping: 16, stiffness: 200 });
    }
  }, [opacity, translateY, scale, type]);

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));
}
