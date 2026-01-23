/**
 * EnhancedCard - Premium card with decorative elements
 * Features gradients, borders, shadows, and animated effects
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import ShimmerEffect from './ShimmerEffect';
import GlossySurface from './GlossySurface';

interface EnhancedCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'gradient' | 'glass' | 'neon' | 'premium';
  style?: ViewStyle;
  gradientColors?: string[];
  glowColor?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function EnhancedCard({
  children,
  onPress,
  variant = 'default',
  style,
  gradientColors = ['#0A0E27', 'rgba(16, 22, 40, 0.9)'],
  glowColor = 'rgba(27,78,218,0.92)',
}: EnhancedCardProps) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
      glow.value = withSpring(1, { damping: 12, stiffness: 250 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    glow.value = withSpring(0, { damping: 12, stiffness: 250 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => {
    const opacity = interpolate(glow.value, [0, 1], [0, 0.6]);
    return {
      shadowColor: glowColor,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: opacity,
      shadowRadius: 20,
      elevation: glow.value > 0 ? 15 : 5,
    };
  });

  const cardContent = (
    <GlossySurface
      variant={variant === 'premium' ? 'premium' : variant === 'glass' ? 'glass' : 'default'}
      borderRadius={16}
      style={[styles.card, style]}
    >
      {variant === 'gradient' && (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
        />
      )}

      {variant === 'neon' && (
        <>
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                borderWidth: 1,
                borderColor: glowColor,
                borderRadius: 16,
              },
            ]}
          />
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                borderWidth: 1,
                borderColor: glowColor + '40',
                borderRadius: 16,
                margin: 2,
              },
            ]}
          />
          {/* Neon glow effect */}
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                borderRadius: 16,
                shadowColor: glowColor,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 20,
                elevation: 10,
              },
            ]}
          />
        </>
      )}

      {variant === 'premium' && (
        <>
          <LinearGradient
            colors={['rgba(27,78,218,0.16)', 'transparent', 'rgba(255,255,255,0.10)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
          />
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                borderWidth: 1.5,
                borderColor: 'rgba(255,255,255,0.12)',
                borderRadius: 16,
              },
            ]}
          />
          {/* Subtle shimmer */}
          <ShimmerEffect
            width="100%"
            height="100%"
            borderRadius={16}
            colors={['transparent', 'rgba(255, 255, 255, 0.08)', 'transparent']}
            speed={5000}
          />
        </>
      )}

      <View style={styles.content}>{children}</View>
    </GlossySurface>
  );

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[animatedStyle, glowStyle]}
      >
        {cardContent}
      </AnimatedPressable>
    );
  }

  return <Animated.View style={[animatedStyle, glowStyle]}>{cardContent}</Animated.View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#2A2A3A',
    position: 'relative',
  },
  content: {
    padding: 16,
    position: 'relative',
    zIndex: 1,
  },
});







