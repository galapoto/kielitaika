// ============================================================================
// useStaggerFadeIn - Staggered fade-in animation for list items (FULL IMPLEMENTATION)
// ============================================================================

import { useEffect } from 'react';
import { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from 'react-native-reanimated';
import { motion } from '../../design/motion';

/**
 * useStaggerFadeIn - Provides staggered fade-in animation
 * 
 * @param {number} index - Item index for stagger calculation
 * @param {number} delay - Delay multiplier (default: motion.stagger.normal)
 * @returns {Object} - { animatedStyle, startAnimation }
 */
export function useStaggerFadeIn(index = 0, delay = motion.stagger.normal) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  const startAnimation = () => {
    const totalDelay = index * delay;
    opacity.value = withDelay(
      totalDelay,
      withTiming(1, {
        duration: motion.duration.normal,
        easing: Easing.out(Easing.quad),
      })
    );
    translateY.value = withDelay(
      totalDelay,
      withTiming(0, {
        duration: motion.duration.normal,
        easing: Easing.out(Easing.quad),
      })
    );
  };

  useEffect(() => {
    startAnimation();
  }, []);

  return {
    animatedStyle,
    startAnimation,
  };
}


