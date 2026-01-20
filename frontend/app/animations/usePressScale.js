import { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

export function usePressScale() {
  const scale = useSharedValue(1);

  const onPressIn = () => {
    scale.value = withSpring(0.97, { damping: 14, stiffness: 220 });
  };

  const onPressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { animatedStyle, onPressIn, onPressOut };
}
