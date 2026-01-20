// Snow crystals overlay on orb surface (Skia if available, fallback to translucent view)
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';

/**
 * Props:
 *  - amplitude (0-1) from mic envelope (low amplitude -> more crystals)
 */
export default function OrbOverlaySnow({ amplitude = 0 }) {
  const time = useSharedValue(0);

  useEffect(() => {
    time.value = withRepeat(withTiming(1, { duration: 6000, easing: Easing.linear }), -1, false);
  }, [time]);

  const animatedStyle = useAnimatedStyle(() => {
    // Higher intensity when amplitude is low
    const intensity = 1 - Math.min(1, amplitude);
    const opacity = interpolate(time.value, [0, 0.5, 1], [0.08, 0.18, 0.08]) * intensity;
    return {
      opacity,
      transform: [
        { scale: 1 + intensity * 0.02 },
        { rotate: `${time.value * 6}deg` },
      ],
    };
  });

  return <Animated.View pointerEvents="none" style={[styles.overlay, animatedStyle]} />;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(200,230,255,0.25)',
    backgroundColor: 'rgba(180,210,255,0.08)',
  },
});
