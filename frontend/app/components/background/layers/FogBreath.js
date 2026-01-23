// FogBreath - Breathing fog layer for forest & lapland scenes
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  interpolate,
  Easing
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Breathing fog that expands and contracts like breath
 * Drifts slowly horizontally
 */
export default function FogBreath() {
  const scenePhase = useSharedValue(0);
  const fogOffsetX = useSharedValue(0);

  React.useEffect(() => {
    // Breathing cycle
    scenePhase.value = withRepeat(
      withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.cubic) }),
      -1,
      true
    );

    // Horizontal drift
    fogOffsetX.value = withRepeat(
      withTiming(1, { duration: 20000, easing: Easing.linear }),
      -1,
      false
    );
  }, [scenePhase, fogOffsetX]);

  const animatedStyle = useAnimatedStyle(() => {
    const fogScale = interpolate(
      scenePhase.value,
      [0, 0.5, 1],
      [1.0, 1.08, 1.0]
    );

    const offsetX = interpolate(
      fogOffsetX.value,
      [0, 1],
      [-12, 12]
    );

    return {
      transform: [
        { scale: fogScale },
        { translateX: offsetX },
      ],
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]} pointerEvents="none">
      <LinearGradient
        colors={[
          'rgba(255,255,255,0)',
          'rgba(255,255,255,0.12)',
          'rgba(255,255,255,0.20)',
          'rgba(255,255,255,0.12)',
          'rgba(255,255,255,0)',
        ]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={styles.gradient}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: -SCREEN_HEIGHT * 0.3,
    left: -SCREEN_WIDTH * 0.2,
    width: SCREEN_WIDTH * 1.4,
    height: SCREEN_HEIGHT * 0.6,
  },
  gradient: {
    flex: 1,
    borderRadius: SCREEN_WIDTH * 0.7,
  },
});
