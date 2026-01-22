/**
 * DecorativeText - Enhanced typography with gradients, shadows, and effects
 * For creating the most beautiful UI with embellished text
 */

import React from 'react';
import { Text, StyleSheet, TextStyle, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';

interface DecorativeTextProps {
  children: React.ReactNode;
  variant?: 'gradient' | 'glow' | 'shimmer' | 'embossed' | 'neon';
  gradientColors?: string[];
  style?: TextStyle;
  size?: 'small' | 'medium' | 'large' | 'xl' | 'xxl';
  weight?: 'light' | 'regular' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right';
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function DecorativeText({
  children,
  variant = 'gradient',
  gradientColors = ['rgba(27,78,218,0.92)', 'rgba(255,255,255,0.18)', 'rgba(27,78,218,0.65)'],
  style,
  size = 'medium',
  weight = 'semibold',
  align = 'left',
}: DecorativeTextProps) {
  const shimmer = useSharedValue(0);

  React.useEffect(() => {
    if (variant === 'shimmer') {
      shimmer.value = withRepeat(
        withTiming(1, {
          duration: 2000,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    }
  }, [variant]);

  const shimmerStyle = useAnimatedStyle(() => {
    if (variant !== 'shimmer') return {};
    const translateX = interpolate(shimmer.value, [0, 1], [-100, 100]);
    return {
      transform: [{ translateX }],
    };
  });

  const getSizeStyles = () => {
    switch (size) {
      case 'small': return { fontSize: 14 };
      case 'large': return { fontSize: 24 };
      case 'xl': return { fontSize: 32 };
      case 'xxl': return { fontSize: 48 };
      default: return { fontSize: 18 };
    }
  };

  const getWeightStyles = () => {
    switch (weight) {
      case 'light': return { fontWeight: '300' };
      case 'regular': return { fontWeight: '400' };
      case 'medium': return { fontWeight: '500' };
      case 'bold': return { fontWeight: '700' };
      default: return { fontWeight: '600' };
    }
  };

  const baseStyle = [
    getSizeStyles(),
    getWeightStyles(),
    { textAlign: align },
    style,
  ];

  if (variant === 'gradient') {
    // For gradient text, we use a mask approach
    return (
      <View style={{ position: 'relative' }}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Text
          style={[
            baseStyle,
            {
              color: 'transparent',
            },
          ]}
        >
          {children}
        </Text>
        <Text
          style={[
            baseStyle,
            {
              position: 'absolute',
              color: '#FFFFFF',
            },
          ]}
        >
          {children}
        </Text>
      </View>
    );
  }

  if (variant === 'glow') {
    return (
      <Text
        style={[
          baseStyle,
          {
            color: gradientColors[0],
            textShadowColor: gradientColors[0],
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 20,
            shadowOpacity: 0.8,
          },
        ]}
      >
        {children}
      </Text>
    );
  }

  if (variant === 'neon') {
    return (
      <Text
        style={[
          baseStyle,
          {
            color: gradientColors[0],
            textShadowColor: gradientColors[0],
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 15,
            shadowOpacity: 1,
          },
        ]}
      >
        {children}
      </Text>
    );
  }

  if (variant === 'embossed') {
    return (
      <Text
        style={[
          baseStyle,
          {
            color: '#FFFFFF',
            textShadowColor: '#000000',
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 2,
          },
        ]}
      >
        {children}
      </Text>
    );
  }

  // Default shimmer
  return (
    <Animated.View style={[styles.shimmerContainer, shimmerStyle]}>
      <Text style={baseStyle}>{children}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shimmerContainer: {
    overflow: 'hidden',
  },
});







