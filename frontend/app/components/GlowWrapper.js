import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useColorScheme } from 'react-native';

/**
 * GlowWrapper - Subtle animated glow effect wrapper
 * Lightweight component for adding subtle colored light around elements
 */
export default function GlowWrapper({ 
  children, 
  color, 
  intensity = 0.3,
  radius = 12,
  animated = false,
  style,
}) {
  const colorScheme = useColorScheme() || 'dark';
  const pulse = useSharedValue(0);

  React.useEffect(() => {
    if (animated) {
      pulse.value = withRepeat(
        withTiming(1, { duration: 2000 }),
        -1,
        true
      );
    }
  }, [animated, pulse]);

  const glowColor = color || (colorScheme === 'dark' 
    ? 'rgba(174, 226, 255, ' 
    : 'rgba(59, 130, 246, ');

  const animatedStyle = useAnimatedStyle(() => {
    if (!animated) {
      return {
        shadowColor: glowColor + intensity + ')',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: radius,
        elevation: 4,
      };
    }

    const pulseIntensity = interpolate(pulse.value, [0, 1], [intensity * 0.7, intensity]);
    const pulseRadius = interpolate(pulse.value, [0, 1], [radius * 0.9, radius * 1.1]);

    return {
      shadowColor: glowColor + pulseIntensity + ')',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: pulseRadius,
      elevation: 4,
    };
  });

  return (
    <Animated.View style={[styles.wrapper, animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    // No background, just glow effect
  },
});






























