import { useAnimatedStyle, interpolate, Extrapolate } from 'react-native-reanimated';

// Parallax card effect based on scrollX shared value and card index.
export function useParallaxScroll(scrollX, index, cardWidth, spacing = 16) {
  return useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * (cardWidth + spacing),
      index * (cardWidth + spacing),
      (index + 1) * (cardWidth + spacing),
    ];
    const translateY = interpolate(scrollX.value, inputRange, [12, 0, 12], Extrapolate.CLAMP);
    const scale = interpolate(scrollX.value, inputRange, [0.94, 1, 0.94], Extrapolate.CLAMP);
    return {
      transform: [{ translateY }, { scale }],
    };
  });
}
