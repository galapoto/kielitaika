import { useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';

export function useStaggerFadeIn(index, baseDelay = 40) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withDelay(index * baseDelay, withTiming(1, { duration: 260 })),
    transform: [
      {
        translateY: withDelay(index * baseDelay, withTiming(0, { duration: 260 })),
      },
    ],
  }));

  return animatedStyle;
}
