import { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

export function useScaleOnPress() {
  const scale = useSharedValue(1);

  const onPressIn = () => {
    scale.value = withTiming(0.96, { duration: 80 });
  };

  const onPressOut = () => {
    scale.value = withTiming(1, { duration: 80 });
  };

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return { animatedStyle, onPressIn, onPressOut };
}


