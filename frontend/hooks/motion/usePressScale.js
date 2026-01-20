// ============================================================================
// usePressScale - Scale animation on press (FULL IMPLEMENTATION)
// ============================================================================

import { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { motion } from '../../design/motion';

/**
 * usePressScale - Provides press scale animation
 * 
 * @param {number} scale - Target scale value on press (default: 0.95)
 * @returns {Object} - { animatedStyle, onPressIn, onPressOut }
 */
export function usePressScale(scale = 0.95) {
  const scaleValue = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleValue.value }],
    };
  });

  const handlePressIn = () => {
    scaleValue.value = withSpring(scale, motion.spring.snappy);
  };

  const handlePressOut = () => {
    scaleValue.value = withSpring(1, motion.spring.snappy);
  };

  return {
    animatedStyle,
    onPressIn: handlePressIn,
    onPressOut: handlePressOut,
  };
}


