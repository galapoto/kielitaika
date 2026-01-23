/**
 * Particle Effect for Interactive Elements
 * Creates dynamic particle effects when users interact with buttons/icons
 */
import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';

let LottieView: any = null;
if (Platform.OS !== 'web') {
  try {
    LottieView = require('lottie-react-native').default;
  } catch (e) {
    // Lottie not available
  }
}

interface ParticleEffectProps {
  trigger?: boolean;
  source?: any;
  opacity?: number;
  onComplete?: () => void;
}

export default function ParticleEffect({ 
  trigger = false, 
  source,
  opacity = 0.8,
  onComplete 
}: ParticleEffectProps) {
  // Disable Lottie particles on native to avoid crash; keep layout clean
  if (Platform.OS !== 'web') {
    return null;
  }

  const animatedOpacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    if (trigger) {
      animatedOpacity.value = withTiming(1, { duration: 200 });
      scale.value = withTiming(1, { duration: 200 });
      
      // Auto-hide after animation
      setTimeout(() => {
        animatedOpacity.value = withTiming(0, { duration: 300 });
        if (onComplete) onComplete();
      }, 1000);
    }
  }, [trigger]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: animatedOpacity.value * opacity,
    transform: [{ scale: scale.value }],
  }));

  // Fallback for web or if Lottie is not available
  if (Platform.OS === 'web' || !source || !LottieView) {
    return null;
  }

  try {
    return (
      <Animated.View style={[styles.container, animatedStyle]} pointerEvents="none">
        <LottieView
          source={source || require('../../assets/animations/login/login_particles.json')}
          autoPlay={trigger}
          loop={false}
          style={styles.animation}
        />
      </Animated.View>
    );
  } catch (error) {
    console.warn('Lottie particle animation not available:', error);
    return null;
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: 200,
    height: 200,
  },
});
