import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

/**
 * Simple lens effect placeholder; distorts scale subtly based on strength.
 */
export default function OrbGravityField({ strength = 0.05, speaking = false }) {
  const s = useSharedValue(strength);

  React.useEffect(() => {
    s.value = withTiming(speaking ? strength * 1.2 : strength, { duration: 300 });
  }, [speaking, strength, s]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + s.value }],
    opacity: 0.2,
  }));

  return <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, style, styles.overlay]} />;
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 9999,
  },
});
