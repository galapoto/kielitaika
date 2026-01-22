/**
 * ShimmerEffect - Creates a polished, shiny shimmer animation
 * For that premium, glossy look
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';

interface ShimmerEffectProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: any;
  colors?: string[];
  speed?: number;
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function ShimmerEffect({
  width = '100%',
  height = '100%',
  borderRadius = 0,
  style,
  colors = ['transparent', 'rgba(255, 255, 255, 0.3)', 'transparent'],
  speed = 2000,
}: ShimmerEffectProps) {
  const shimmer = useSharedValue(0);

  React.useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, {
        duration: speed,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(shimmer.value, [0, 1], [-200, 200]);
    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          overflow: 'hidden',
          position: 'absolute',
        },
        style,
      ]}
      pointerEvents="none"
    >
      <AnimatedLinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          {
            width: '200%',
            height: '100%',
            position: 'absolute',
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}





























