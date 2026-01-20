// ============================================================================
// useParallaxScroll - Parallax scrolling effect
// ============================================================================

import { useSharedValue, useAnimatedStyle, useAnimatedScrollHandler } from 'react-native-reanimated';

/**
 * useParallaxScroll
 * 
 * TODO: Codex to implement:
 * - Multiple parallax layers with different speeds
 * - Smooth interpolation
 * - Direction-aware parallax
 */
export function useParallaxScroll(speed = 0.5) {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: scrollY.value * speed,
        },
      ],
    };
  });

  return {
    animatedStyle,
    scrollHandler,
    scrollY,
  };
}


