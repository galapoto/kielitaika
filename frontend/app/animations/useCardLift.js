import { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

export function useCardLift() {
  const elevation = useSharedValue(2);
  const translateY = useSharedValue(0);

  const onPressIn = () => {
    elevation.value = withTiming(6, { duration: 80 });
    translateY.value = withTiming(-2, { duration: 80 });
  };

  const onPressOut = () => {
    elevation.value = withTiming(2, { duration: 80 });
    translateY.value = withTiming(0, { duration: 80 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    elevation: elevation.value,
    transform: [{ translateY: translateY.value }],
  }));

  return { animatedStyle, onPressIn, onPressOut };
}


