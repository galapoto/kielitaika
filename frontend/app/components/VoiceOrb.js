import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import Animated, { 
  useSharedValue, 
  withRepeat, 
  withTiming, 
  withSequence,
  Easing, 
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

/**
 * Premium VoiceOrb - Combining the best of all designs
 * Features from the orb image:
 * - Perfectly spherical, translucent/frosted glass appearance (glassmorphism)
 * - Internal wave-like fluid elements with gradient (soft purple/lavender to vibrant electric blue)
 * - Glassmorphic effect with subtle highlights
 * - Soft glow/luminescence
 * - Dynamic, flowing motion
 * - Clean, modern aesthetic
 * 
 * Props:
 * - amplitude (0-1) to modulate scale/glow/wave motion
 * - mode: 'idle' | 'listening' | 'speaking'
 * - size: base size of the orb (default 160)
 */
export default function VoiceOrb({
  amplitude = 0,
  mode = 'idle',
  size = 160,
}) {
  // Animation values
  const waveRotation = useSharedValue(0);
  const waveAmplitude = useSharedValue(0);
  const glowIntensity = useSharedValue(0.3);
  const scaleValue = useSharedValue(1);
  const breathingValue = useSharedValue(0);

  // Wave animation - continuous rotation
  useEffect(() => {
    waveRotation.value = withRepeat(
      withTiming(360, {
        duration: 8000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  // Breathing animation - subtle pulsing
  useEffect(() => {
    breathingValue.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  // Amplitude-reactive animations
  useEffect(() => {
    waveAmplitude.value = withTiming(amplitude, {
      duration: 100,
      easing: Easing.out(Easing.ease),
    });
    glowIntensity.value = withTiming(0.3 + amplitude * 0.7, {
      duration: 100,
      easing: Easing.out(Easing.ease),
    });
    scaleValue.value = withTiming(1 + amplitude * 0.15, {
      duration: 100,
      easing: Easing.out(Easing.ease),
    });
  }, [amplitude]);

  // Mode-based color adjustments
  const getModeColors = () => {
    switch (mode) {
      case 'speaking':
        return {
          outer: ['rgba(255, 255, 255, 0.25)', 'rgba(200, 200, 255, 0.3)'],
          wave: ['rgba(150, 100, 200, 0.6)', '#3B82F6'], // Purple to electric blue
          glow: '#3B82F6',
        };
      case 'listening':
        return {
          outer: ['rgba(255, 255, 255, 0.2)', 'rgba(180, 220, 255, 0.25)'],
          wave: ['rgba(120, 150, 220, 0.5)', '#60A5FA'], // Softer purple to blue
          glow: '#60A5FA',
        };
      default: // idle
        return {
          outer: ['rgba(255, 255, 255, 0.15)', 'rgba(200, 200, 220, 0.2)'],
          wave: ['rgba(180, 160, 200, 0.4)', '#93C5FD'], // Muted purple to light blue
          glow: '#93C5FD',
        };
    }
  };

  const colors = getModeColors();

  // Animated styles
  const waveStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${waveRotation.value}deg` },
        { scale: 1 + waveAmplitude.value * 0.3 },
      ],
    };
  });

  const orbContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleValue.value }],
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    return {
      shadowOpacity: glowIntensity.value,
      shadowRadius: 20 + amplitude * 30,
    };
  });

  const breathingStyle = useAnimatedStyle(() => {
    const breath = interpolate(
      breathingValue.value,
      [0, 1],
      [1, 1.02],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ scale: breath }],
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outer Glow - Soft radial glow */}
      <Animated.View
        style={[
          styles.outerGlow,
          {
            width: size * 1.4,
            height: size * 1.4,
            borderRadius: (size * 1.4) / 2,
          },
          glowStyle,
        ]}
      >
        <LinearGradient
          colors={[colors.glow, 'transparent']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Main Orb Container */}
      <Animated.View
        style={[
          styles.orbContainer,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          orbContainerStyle,
          breathingStyle,
        ]}
      >
        {/* Glassmorphic Outer Shell - Frosted glass effect */}
        {Platform.OS !== 'web' ? (
          <BlurView
            intensity={20}
            tint="light"
            style={[
              styles.glassShell,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
              },
            ]}
          >
            <LinearGradient
              colors={colors.outer}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </BlurView>
        ) : (
          <View
            style={[
              styles.glassShell,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(20px)',
              },
            ]}
          >
            <LinearGradient
              colors={colors.outer}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </View>
        )}

        {/* Internal Wave - Fluid, flowing element */}
        <Animated.View
          style={[
            styles.waveContainer,
            {
              width: size * 0.9,
              height: size * 0.9,
              borderRadius: (size * 0.9) / 2,
            },
            waveStyle,
          ]}
        >
          <Animated.View
            style={[
              {
                width: size * 0.7,
                height: size * 0.5,
                borderRadius: size * 0.35,
                transform: [{ rotate: '-45deg' }, { translateY: size * 0.1 }],
              },
            ]}
          >
            <LinearGradient
              colors={colors.wave}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </Animated.View>

        {/* Highlight - Subtle top-left highlight for 3D effect */}
        <View
          style={[
            styles.highlight,
            {
              width: size * 0.4,
              height: size * 0.4,
              borderRadius: (size * 0.4) / 2,
              top: size * 0.15,
              left: size * 0.15,
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.4)', 'transparent']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </View>

        {/* Inner Core Glow - Luminous center */}
        <Animated.View
          style={[
            styles.innerCore,
            {
              width: size * 0.3,
              height: size * 0.3,
              borderRadius: (size * 0.3) / 2,
            },
            glowStyle,
          ]}
        >
          <LinearGradient
            colors={[colors.glow, 'transparent']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0.5, y: 0.5 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>
      </Animated.View>

      {/* Soft Shadow - Ground shadow for depth */}
      <View
        style={[
          styles.shadow,
          {
            width: size * 0.8,
            height: size * 0.3,
            borderRadius: (size * 0.3) / 2,
            bottom: -size * 0.1,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  outerGlow: {
    position: 'absolute',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  orbContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  glassShell: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
  },
  waveContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  highlight: {
    position: 'absolute',
    overflow: 'hidden',
  },
  innerCore: {
    position: 'absolute',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  shadow: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    opacity: 0.3,
    transform: [{ scaleY: 0.5 }],
  },
});
