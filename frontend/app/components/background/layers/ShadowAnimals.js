// ShadowAnimals - Sámi mythology shadow silhouettes
import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Shadow animals - extremely subtle Sámi mythology silhouettes
 * Only appear during aurora scenes, story mode, or night
 */
export default function ShadowAnimals({ enabled = false, scenePhase = 0 }) {
  const shadows = useMemo(() => {
    if (!enabled) return [];
    
    // 2-4 shadow silhouettes
    const count = Math.floor(Math.random() * 3) + 2;
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      type: ['reindeer', 'forest', 'bird', 'spirit'][i % 4],
      x: Math.random() * SCREEN_WIDTH,
      y: Math.random() * SCREEN_HEIGHT,
      opacity: Math.random() * 0.06 + 0.06, // 0.06-0.12
      driftSpeed: Math.random() * 0.5 + 0.2, // 0.2-0.7
      fadeCycle: Math.random() * 12000 + 8000, // 8-20s
    }));
  }, [enabled]);

  if (!enabled || shadows.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {shadows.map(shadow => (
        <AnimatedShadow key={shadow.id} shadow={shadow} scenePhase={scenePhase} />
      ))}
    </View>
  );
}

function AnimatedShadow({ shadow, scenePhase }) {
  const driftX = useSharedValue(0);
  const opacity = useSharedValue(shadow.opacity);

  React.useEffect(() => {
    // Horizontal drift
    driftX.value = withRepeat(
      withTiming(1, {
        duration: 10000 / shadow.driftSpeed,
        easing: Easing.linear,
      }),
      -1,
      true // Reverse
    );

    // Fade in/out cycle
    opacity.value = withRepeat(
      withTiming(shadow.opacity * 0.5, {
        duration: shadow.fadeCycle,
        easing: Easing.inOut(Easing.cubic),
      }),
      -1,
      true
    );
  }, [driftX, opacity, shadow]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      driftX.value,
      [0, 1],
      [-4, 4]
    );

    return {
      transform: [{ translateX }],
      opacity: opacity.value,
    };
  });

  // Simple placeholder for shadow shape
  return (
    <Animated.View
      style={[
        styles.shadow,
        {
          left: shadow.x,
          top: shadow.y,
          width: 60,
          height: 40,
        },
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    zIndex: -3,
  },
  shadow: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
  },
});
