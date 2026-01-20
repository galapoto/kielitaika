// AuroraRipple: simplified ripple overlay; replace with Skia shader when available.
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';

/**
 * Props:
 *  - intensity: 0-1
 *  - emotion: 'calm' | 'confident' | 'unsure' | 'overloaded'
 */
export default function AuroraRipple({ intensity = 0.3, emotion = 'calm', wave = 0 }) {
  const time = useSharedValue(0);
  const waveShared = useSharedValue(wave);

  useEffect(() => {
    time.value = withRepeat(withTiming(1, { duration: 8000, easing: Easing.linear }), -1, false);
  }, [time]);

  useEffect(() => {
    waveShared.value = wave;
  }, [wave, waveShared]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(time.value, [0, 0.5, 1], [-30, 20, -30]);
    const translateX = interpolate(time.value, [0, 1], [-40, 40]);
    const baseOpacity =
      interpolate(time.value, [0, 0.5, 1], [0.05, 0.22, 0.05]) * intensity +
      waveShared.value * 0.1;
    const emoValue =
      emotion === 'confident' ? 1 : emotion === 'unsure' ? 0.4 : emotion === 'overloaded' ? 0.2 : 0;
    const tint = interpolateColor(
      emoValue,
      [0, 1],
      ['rgba(100,255,230,0.1)', 'rgba(120,255,255,0.25)']
    );
    return {
      opacity: baseOpacity,
      backgroundColor: tint,
      transform: [{ translateY }, { translateX }, { translateY: waveShared.value * 8 }],
    };
  });

  return <Animated.View pointerEvents="none" style={[styles.overlay, animatedStyle]} />;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
