// ============================================================================
// BottomSheet - Premium modal bottom sheet with gesture physics (FULL IMPLEMENTATION)
// ============================================================================

import React, { useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Text, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { colors } from '../../design/colors';
import { spacing } from '../../design/spacing';
import { shadows } from '../../design/shadows';
import { motion } from '../../design/motion';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * BottomSheet - With gesture handling and snap points
 */
export default function BottomSheet({ 
  visible,
  onClose,
  children,
  snapPoints = ['50%'],
  style,
  ...props 
}) {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const opacity = useSharedValue(0);

  // Convert snap points to numbers
  const snapValues = snapPoints.map(point => {
    if (typeof point === 'string') {
      const percentage = parseFloat(point);
      return SCREEN_HEIGHT * (1 - percentage / 100);
    }
    return SCREEN_HEIGHT - point;
  });

  const targetY = snapValues[0] || SCREEN_HEIGHT * 0.5;

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSpring(targetY, motion.spring.gentle);
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
    }
  }, [visible]);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      const newY = event.translationY;
      if (newY > 0) {
        translateY.value = targetY + newY;
      }
    })
    .onEnd((event) => {
      const threshold = SCREEN_HEIGHT * 0.3;
      const velocity = event.velocityY;
      
      if (event.translationY > threshold || velocity > 1000) {
        // Dismiss
        translateY.value = withSpring(SCREEN_HEIGHT, motion.spring.snappy, () => {
          runOnJS(onClose)();
        });
      } else {
        // Snap back
        translateY.value = withSpring(targetY, motion.spring.gentle);
      }
    });

  const sheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const backdropStyle = useAnimatedStyle(() => {
    const backdropOpacity = interpolate(
      translateY.value,
      [SCREEN_HEIGHT, targetY],
      [0, 0.5],
      Extrapolate.CLAMP
    );
    
    return {
      opacity: backdropOpacity * opacity.value,
    };
  });

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      {...props}
    >
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.container, { maxHeight: SCREEN_HEIGHT - targetY }, sheetStyle, style]}>
            {/* Handle bar */}
            <View style={styles.handle} />
            
            {/* Content */}
            <View style={styles.content}>
              {children}
            </View>
          </Animated.View>
        </GestureDetector>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.background.elevated,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    ...shadows.deep,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.gray[600],
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
});


