// Frost edge animation placeholder (non-Skia shader fallback).
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';

/**
 * Props:
 *  - growth: 0-1
 */
export default function FrostEdges({ growth = 0 }) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(withSequence(withTiming(1, { duration: 1200 }), withTiming(0, { duration: 1200 })), -1);
  }, [shimmer]);

  const frostStyle = useAnimatedStyle(() => ({
    opacity: growth * 0.35 + shimmer.value * 0.05,
    backgroundColor: 'rgba(200,230,255,0.2)',
  }));

  return <Animated.View pointerEvents="none" style={[styles.overlay, frostStyle]} />;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 8,
    borderColor: 'rgba(210,230,255,0.3)',
  },
});
