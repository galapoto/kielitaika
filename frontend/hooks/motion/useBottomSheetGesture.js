// ============================================================================
// useBottomSheetGesture - Gesture handling for bottom sheet
// ============================================================================

import { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';
import { motion } from '../../design/motion';

/**
 * useBottomSheetGesture
 * 
 * TODO: Codex to implement:
 * - Pan gesture handler
 * - Snap points logic
 * - Dismiss threshold
 * - Spring physics
 * - Backdrop interaction
 */
export function useBottomSheetGesture({
  onDismiss,
  snapPoints = [0.5, 0.75, 1],
  initialSnapIndex = 0,
}) {
  const translateY = useSharedValue(0);
  const isActive = useSharedValue(false);

  const gesture = Gesture.Pan()
    .onStart(() => {
      isActive.value = true;
    })
    .onUpdate((event) => {
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      // TODO: Codex - Implement snap point logic
      // - Determine closest snap point
      // - Animate to snap point
      // - Dismiss if below threshold
      
      translateY.value = withSpring(0, motion.spring.gentle);
      isActive.value = false;
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  return {
    gesture,
    animatedStyle,
    translateY,
  };
}


