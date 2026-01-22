// ============================================================================
// WaveformVisualizer - Audio waveform visualization
// ============================================================================

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  withSpring,
  interpolate
} from 'react-native-reanimated';
import { colors } from '../../../styles/colors';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * WaveformVisualizer - Animated audio waveform with smooth transitions
 */
export default function WaveformVisualizer({ 
  data = [],
  height = 60,
  barCount = 20,
  style,
  ...props 
}) {
  // Generate bars from data or use default
  const bars = React.useMemo(() => {
    if (data.length > 0) {
      // Use actual audio data
      const step = Math.max(1, Math.floor(data.length / barCount));
      return Array.from({ length: barCount }, (_, i) => {
        const index = Math.min(i * step, data.length - 1);
        return {
          id: i,
          value: data[index] || 0,
        };
      });
    }
    // Default bars with random values
    return Array.from({ length: barCount }, (_, i) => ({
      id: i,
      value: Math.random() * 0.5 + 0.2,
    }));
  }, [data, barCount]);

  return (
    <View style={[styles.container, { height }, style]} {...props}>
      {bars.map((bar) => (
        <AnimatedBar 
          key={bar.id} 
          value={bar.value} 
          maxHeight={height}
          index={bar.id}
        />
      ))}
    </View>
  );
}

// Individual animated bar component
function AnimatedBar({ value, maxHeight, index }) {
  const height = useSharedValue(value * maxHeight);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    const targetHeight = Math.max(4, value * maxHeight);
    const delay = index * 20; // Stagger animation
    
    setTimeout(() => {
      height.value = withSpring(targetHeight, {
        damping: 15,
        stiffness: 100,
      });
      opacity.value = withTiming(0.8 + value * 0.2, { duration: 200 });
    }, delay);
  }, [value, maxHeight, index, height, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: opacity.value,
  }));

  return (
    <View style={styles.barContainer}>
      <Animated.View style={[styles.barWrapper, animatedStyle]}>
        <LinearGradient
          colors={[colors.primary?.main || '#1B4EDA', colors.blueMain || '#1B4EDA']}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
          style={styles.bar}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 8,
  },
  barContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    minHeight: 4,
  },
  barWrapper: {
    width: '100%',
    minHeight: 4,
  },
  bar: {
    width: '100%',
    height: '100%',
    borderRadius: 2,
  },
});




