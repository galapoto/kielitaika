import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';

/**
 * Lightweight ambient cloud layer for conversation background.
 * Two layers drift slowly with slight opacity breathing.
 */
export default function AnimatedCloudLayer() {
  const phaseA = useSharedValue(0);
  const phaseB = useSharedValue(0);

  useEffect(() => {
    phaseA.value = withRepeat(withTiming(1, { duration: 16000, easing: Easing.linear }), -1, false);
    phaseB.value = withRepeat(withTiming(1, { duration: 22000, easing: Easing.linear }), -1, false);
  }, [phaseA, phaseB]);

  const layerAStyle = useAnimatedStyle(() => {
    const translateX = interpolate(phaseA.value, [0, 1], [0, 30]);
    const opacity = 0.5 + 0.1 * Math.sin(phaseA.value * Math.PI * 2);
    return { transform: [{ translateX }], opacity };
  });

  const layerBStyle = useAnimatedStyle(() => {
    const translateX = interpolate(phaseB.value, [0, 1], [0, -24]);
    const opacity = 0.35 + 0.08 * Math.sin(phaseB.value * Math.PI * 2);
    return { transform: [{ translateX }], opacity };
  });

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={[styles.layer, styles.layerA, layerAStyle]} />
      <Animated.View style={[styles.layer, styles.layerB, layerBStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  layer: {
    position: 'absolute',
    width: '160%',
    height: '160%',
    borderRadius: 9999,
  },
  layerA: {
    backgroundColor: 'rgba(101, 247, 215, 0.25)',
    top: '-30%',
    left: '-30%',
  },
  layerB: {
    backgroundColor: 'rgba(78, 197, 255, 0.2)',
    top: '-40%',
    left: '-10%',
  },
});
