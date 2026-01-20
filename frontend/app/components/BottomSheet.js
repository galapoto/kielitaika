import React from 'react';
import { StyleSheet, View, TouchableWithoutFeedback } from 'react-native';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import { useBottomSheetGesture } from '../animations/useBottomSheetGesture';
import { useStaggerFadeIn } from '../animations/useStaggerFadeIn';
import { colors } from '../styles/colors';
import { radius } from '../styles/radius';
import { shadows } from '../styles/shadows';
import { spacing } from '../styles/spacing';

export default function BottomSheet({ children, onClose }) {
  const { gesture, animatedStyle, positions, snapTo, translateY } = useBottomSheetGesture({
    onSnap: (pos) => {
      if (pos === positions.closed && onClose) onClose();
    },
  });

  const dimStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translateY.value, [positions.top, positions.closed], [0.35, 0], 'clamp');
    return { opacity };
  });

  const staggerStyle = useStaggerFadeIn(0);

  return (
    <>
      <TouchableWithoutFeedback onPress={() => snapTo(positions.closed)}>
        <Animated.View pointerEvents="box-only" style={[styles.dim, dimStyle]} />
      </TouchableWithoutFeedback>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.sheet, animatedStyle]}>
          <View style={styles.handle} />
          <Animated.View style={staggerStyle}>{children}</Animated.View>
        </Animated.View>
      </GestureDetector>
    </>
  );
}

const styles = StyleSheet.create({
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
    paddingBottom: spacing.xl,
    ...shadows.m,
  },
  handle: {
    alignSelf: 'center',
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.grayLine,
    marginBottom: spacing.m,
  },
});
