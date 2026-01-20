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

export default function AuroraVoiceReactive({ amplitude = 0 }) {
  const time = useSharedValue(0);
  const ampShared = useSharedValue(amplitude);

  useEffect(() => {
    time.value = withRepeat(withTiming(1, { duration: 9000, easing: Easing.linear }), -1, false);
  }, [time]);

  useEffect(() => {
    ampShared.value = amplitude;
  }, [amplitude, ampShared]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(time.value, [0, 0.5, 1], [-20, 24, -20]);
    const ripple = Math.sin(ampShared.value * 12);
    const opacity = 0.12 + ampShared.value * 0.12 + Math.sin(time.value * Math.PI * 2) * 0.06;
    const tint = interpolateColor(
      ampShared.value,
      [0, 1],
      ['rgba(80,220,230,0.12)', 'rgba(120,255,255,0.25)']
    );
    return {
      opacity,
      backgroundColor: tint,
      transform: [{ translateY }, { translateX: ripple * 8 }],
    };
  });

  return <Animated.View pointerEvents="none" style={[styles.overlay, animatedStyle]} />;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
