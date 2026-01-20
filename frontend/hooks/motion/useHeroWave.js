// ============================================================================
// useHeroWave - Animated wave background for hero sections
// ============================================================================

import { useEffect } from 'react';
import { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';

/**
 * useHeroWave
 * 
 * TODO: Codex to implement:
 * - SVG wave path animation
 * - Multiple wave layers with different speeds
 * - Parallax effect based on scroll
 * - Dynamic wave amplitude based on interaction
 */
export function useHeroWave() {
  const waveOffset = useSharedValue(0);

  useEffect(() => {
    waveOffset.value = withRepeat(
      withTiming(100, { duration: 2000 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: waveOffset.value }],
    };
  });

  return { animatedStyle };
}


