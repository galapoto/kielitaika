// ============================================================================
// useProgressSweep - Animated progress sweep animation (FULL IMPLEMENTATION)
// ============================================================================

import { useEffect } from 'react';
import { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';

/**
 * useProgressSweep - Provides smooth progress animation
 * 
 * @param {number} progress - Target progress value (0-100)
 * @param {number} duration - Animation duration in ms (default: 900)
 * @returns {Object} - { animatedStyle, animatedProgress }
 */
export function useProgressSweep(progress = 0, duration = 900) {
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${animatedProgress.value}%`,
    };
  });

  return {
    animatedStyle,
    animatedProgress,
  };
}


