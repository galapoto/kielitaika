/**
 * WavyBackground - Animated wavy motion background
 * Creates beautiful, flowing wave animations using animated gradients
 */

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

interface WavyBackgroundProps {
  colors?: string[];
  waveCount?: number;
  speed?: number;
  amplitude?: number;
  style?: any;
}

export default function WavyBackground({
  colors = ['rgba(90, 208, 255, 0.2)', 'rgba(156, 39, 176, 0.15)', 'rgba(0, 188, 212, 0.18)'],
  waveCount = 3,
  speed = 4000,
  amplitude = 60,
  style,
}: WavyBackgroundProps) {
  const wave1 = useSharedValue(0);
  const wave2 = useSharedValue(0);
  const wave3 = useSharedValue(0);

  React.useEffect(() => {
    wave1.value = withRepeat(
      withTiming(SCREEN_WIDTH * 2, {
        duration: speed,
        easing: Easing.linear,
      }),
      -1,
      false
    );
    wave2.value = withRepeat(
      withTiming(SCREEN_WIDTH * 2, {
        duration: speed * 1.3,
        easing: Easing.linear,
      }),
      -1,
      false
    );
    wave3.value = withRepeat(
      withTiming(SCREEN_WIDTH * 2, {
        duration: speed * 0.8,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const wave1Style = useAnimatedStyle(() => {
    const translateX = interpolate(
      wave1.value,
      [0, SCREEN_WIDTH * 2],
      [-SCREEN_WIDTH, SCREEN_WIDTH]
    );
    return {
      transform: [{ translateX }],
    };
  });

  const wave2Style = useAnimatedStyle(() => {
    const translateX = interpolate(
      wave2.value,
      [0, SCREEN_WIDTH * 2],
      [-SCREEN_WIDTH, SCREEN_WIDTH]
    );
    return {
      transform: [{ translateX }],
    };
  });

  const wave3Style = useAnimatedStyle(() => {
    const translateX = interpolate(
      wave3.value,
      [0, SCREEN_WIDTH * 2],
      [-SCREEN_WIDTH, SCREEN_WIDTH]
    );
    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      {/* Wave Layer 1 */}
      <AnimatedLinearGradient
        colors={[colors[0], 'transparent', colors[0], 'transparent', colors[0]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={[
          {
            position: 'absolute',
            width: SCREEN_WIDTH * 2,
            height: SCREEN_HEIGHT * 0.6,
            top: SCREEN_HEIGHT * 0.2,
            opacity: 0.4,
          },
          wave1Style,
        ]}
      />

      {/* Wave Layer 2 */}
      <AnimatedLinearGradient
        colors={[colors[1], 'transparent', colors[1], 'transparent', colors[1]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.3, 0.5, 0.7, 1]}
        style={[
          {
            position: 'absolute',
            width: SCREEN_WIDTH * 2,
            height: SCREEN_HEIGHT * 0.5,
            top: SCREEN_HEIGHT * 0.3,
            opacity: 0.3,
          },
          wave2Style,
        ]}
      />

      {/* Wave Layer 3 */}
      <AnimatedLinearGradient
        colors={[colors[2], 'transparent', colors[2], 'transparent', colors[2]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={[
          {
            position: 'absolute',
            width: SCREEN_WIDTH * 2,
            height: SCREEN_HEIGHT * 0.4,
            top: SCREEN_HEIGHT * 0.4,
            opacity: 0.35,
          },
          wave3Style,
        ]}
      />
    </View>
  );
}





























