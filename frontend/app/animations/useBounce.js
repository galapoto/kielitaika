import { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

export function useBounce() {
  const scale = useSharedValue(1);

  const trigger = () => {
    scale.value = 1;
    scale.value = withSpring(1.1, { stiffness: 200, damping: 10 }, () => {
      scale.value = withSpring(1, { stiffness: 150, damping: 10 });
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return { trigger, animatedStyle };
}


