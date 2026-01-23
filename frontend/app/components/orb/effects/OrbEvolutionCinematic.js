import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../../styles/colors';
import { useSound } from '../../../hooks/useSound';

/**
 * OrbEvolutionCinematic - Cinematic animation for orb evolution events
 * 
 * Features:
 * - Burst animation on evolution
 * - Particle effects
 * - Glow pulses
 * - Sound effects
 */
export default function OrbEvolutionCinematic({
  visible = false,
  evolutionLevel = 1,
  onComplete,
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(0);
  const { playSound } = useSound();

  useEffect(() => {
    if (visible) {
      // Play evolution sound
      playSound('achievement');

      // Burst animation
      scale.value = withSequence(
        withTiming(1.5, { duration: 300, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 500, easing: Easing.inOut(Easing.quad) })
      );

      opacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 800 }, () => {
          if (onComplete) onComplete();
        })
      );

      rotation.value = withRepeat(
        withTiming(360, { duration: 2000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      scale.value = 1;
      opacity.value = 0;
      rotation.value = 0;
    }
  }, [visible, evolutionLevel]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={[styles.burst, animatedStyle]}>
        <LinearGradient
          colors={['rgba(246, 196, 0, 0.8)', 'rgba(10, 61, 98, 0.6)', 'transparent']}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
      </Animated.View>

      {/* Particle rings */}
      {[1, 2, 3].map((ring) => (
        <Animated.View
          key={ring}
          style={[
            styles.particleRing,
            {
              width: 200 + ring * 50,
              height: 200 + ring * 50,
              opacity: opacity.value * (1 - ring * 0.2),
            },
          ]}
        />
      ))}

      {/* Evolution level text */}
      <Animated.View style={[styles.textContainer, { opacity: opacity.value }]}>
        <Text style={styles.evolutionText}>Level {evolutionLevel}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  burst: {
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  gradient: {
    flex: 1,
    borderRadius: 150,
  },
  particleRing: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: 'rgba(246, 196, 0, 0.4)',
  },
  textContainer: {
    position: 'absolute',
    marginTop: 200,
  },
  evolutionText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});
