// ============================================================================
// ProgressRing - Animated circular progress indicator (FULL SVG IMPLEMENTATION)
// ============================================================================

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';
import { colors } from '../../design/colors';
import { typography } from '../../design/typography';
import { useProgressSweep } from '../../hooks/motion/useProgressSweep';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * ProgressRing - Full SVG implementation with animated progress
 */
export default function ProgressRing({ 
  progress = 0, // 0-100
  size = 120,
  strokeWidth = 8,
  color = colors.accent.mint,
  showLabel = true,
  label,
  style,
  ...props 
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  const { animatedProgress } = useProgressSweep(progress, 900);
  const strokeDashoffset = useSharedValue(circumference);

  useEffect(() => {
    strokeDashoffset.value = withTiming(
      circumference * (1 - progress / 100),
      {
        duration: 900,
        easing: Easing.out(Easing.cubic),
      }
    );
  }, [progress]);

  const animatedCircleProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: strokeDashoffset.value,
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }, style]} {...props}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.gray[800]}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeLinecap="round"
          animatedProps={animatedCircleProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      
      {showLabel && (
        <View style={styles.labelContainer}>
          {label ? (
            <Text style={styles.label}>{label}</Text>
          ) : (
            <Text style={styles.percentage}>{Math.round(progress)}%</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
  },
  labelContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentage: {
    ...typography.styles.h4,
    color: colors.text.primary,
    fontWeight: '700',
  },
  label: {
    ...typography.styles.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});


