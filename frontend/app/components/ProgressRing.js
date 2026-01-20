import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useAnimatedProps, interpolate, Extrapolate } from 'react-native-reanimated';
import { useProgressSweep } from '../animations/useProgressSweep';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function ProgressRing({
  size = 120,
  strokeWidth = 10,
  progress = 0,
  trackColor = '#E3E3E3',
  indicatorColor = '#1B4EDA',
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const { progress: sharedProgress, animateTo } = useProgressSweep(progress);

  useEffect(() => {
    animateTo(progress);
  }, [progress]);

  const animatedProps = useAnimatedProps(() => {
    const clamped = interpolate(sharedProgress.value, [0, 1], [0, 1], Extrapolate.CLAMP);
    const strokeDashoffset = circumference * (1 - clamped);
    return { strokeDashoffset };
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          stroke={trackColor}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
        />
        <AnimatedCircle
          stroke={indicatorColor}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
    </View>
  );
}
