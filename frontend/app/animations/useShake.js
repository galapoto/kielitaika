import { useSharedValue, useAnimatedStyle, withSequence, withTiming } from 'react-native-reanimated';

export function useShake() {
  const translateX = useSharedValue(0);

  const trigger = () => {
    translateX.value = withSequence(
      withTiming(-6, { duration: 40 }),
      withTiming(6, { duration: 40 }),
      withTiming(-4, { duration: 40 }),
      withTiming(4, { duration: 40 }),
      withTiming(0, { duration: 40 }),
    );
  };

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));
  return { trigger, animatedStyle };
}


