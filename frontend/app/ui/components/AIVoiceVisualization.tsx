/**
 * AIVoiceVisualization - Rotating cloud of shades visualization
 * 
 * Based on image 2 design:
 * - Large abstract sphere-like object
 * - Vibrant, shifting gradients in shades of blue and purple
 * - Glowing and luminous quality
 * - Rotating cloud of shades when talking
 * - Abstract and fluid internal coloration
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

interface AIVoiceVisualizationProps {
  isSpeaking?: boolean;
  amplitude?: number; // 0-1, voice amplitude
  size?: number;
  style?: ViewStyle;
}

const AnimatedSvg = Animated.createAnimatedComponent(Svg);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function AIVoiceVisualization({
  isSpeaking = false,
  amplitude = 0,
  size = 200,
  style,
}: AIVoiceVisualizationProps) {
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(0);
  const cloudRotation = useSharedValue(0);

  useEffect(() => {
    // Continuous rotation
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 20000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    // Pulsing effect
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Cloud rotation when speaking
    if (isSpeaking) {
      cloudRotation.value = withRepeat(
        withTiming(360, {
          duration: 3000,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    } else {
      cloudRotation.value = withTiming(0, { duration: 500 });
    }
  }, [isSpeaking]);

  const containerAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(pulse.value, [0, 1], [1, 1.05]);
    const opacity = interpolate(pulse.value, [0, 1], [0.9, 1]);
    return {
      transform: [{ scale }, { rotate: `${rotation.value}deg` }],
      opacity,
    };
  });

  const cloudAnimatedStyle = useAnimatedStyle(() => {
    const scale = 1 + amplitude * 0.2;
    return {
      transform: [{ rotate: `${cloudRotation.value}deg` }, { scale }],
    };
  });

  // Create multiple cloud particles
  const cloudParticles = Array.from({ length: 12 }).map((_, i) => {
    const angle = (i * 360) / 12;
    const radius = size * 0.35;
    const x = Math.cos((angle * Math.PI) / 180) * radius;
    const y = Math.sin((angle * Math.PI) / 180) * radius;
    const particleSize = 20 + Math.random() * 30;

    return {
      id: i,
      x: size / 2 + x,
      y: size / 2 + y,
      size: particleSize,
      // Restricted palette (blue/white only)
      color: i % 3 === 0 ? 'rgba(27,78,218,0.92)' : i % 3 === 1 ? 'rgba(255,255,255,0.18)' : 'rgba(27,78,218,0.55)',
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Animated.View style={[styles.sphereContainer, containerAnimatedStyle]}>
        {/* Base gradient sphere */}
        <LinearGradient
          colors={['#050813', '#0A0E27', '#0F2147', '#050813']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.sphere, { width: size, height: size, borderRadius: size / 2 }]}
        />

        {/* Rotating cloud of shades when speaking */}
        {isSpeaking && (
          <Animated.View style={[styles.cloudContainer, cloudAnimatedStyle]}>
            <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
              <Defs>
                {cloudParticles.map((particle) => (
                  <RadialGradient key={particle.id} id={`gradient-${particle.id}`}>
                    <Stop offset="0%" stopColor={particle.color} stopOpacity="0.8" />
                    <Stop offset="50%" stopColor={particle.color} stopOpacity="0.4" />
                    <Stop offset="100%" stopColor={particle.color} stopOpacity="0" />
                  </RadialGradient>
                ))}
              </Defs>
              {cloudParticles.map((particle) => (
                <AnimatedCircle
                  key={particle.id}
                  cx={particle.x}
                  cy={particle.y}
                  r={particle.size}
                  fill={`url(#gradient-${particle.id})`}
                />
              ))}
            </Svg>
          </Animated.View>
        )}

        {/* Inner glow */}
        <View
          style={[
            styles.innerGlow,
            {
              width: size * 0.6,
              height: size * 0.6,
              borderRadius: (size * 0.6) / 2,
            },
          ]}
        />

        {/* Outer glow ring */}
        <Animated.View
          style={[
            styles.outerGlow,
            {
              width: size * 1.2,
              height: size * 1.2,
              borderRadius: (size * 1.2) / 2,
            },
            cloudAnimatedStyle,
          ]}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sphereContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sphere: {
    position: 'absolute',
  },
  cloudContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  innerGlow: {
    position: 'absolute',
    backgroundColor: 'rgba(27,78,218,0.18)',
    shadowColor: 'rgba(27,78,218,0.92)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  outerGlow: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: 'rgba(27,78,218,0.92)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 15,
  },
});







