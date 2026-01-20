import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { Canvas, Circle, useValue, useFrame } from '@shopify/react-native-skia';
import Animated, { withTiming } from 'react-native-reanimated';

/**
 * Particle burst on orb evolution.
 * Props:
 *  - trigger (number) changes to start burst
 *  - color (string)
 */
export default function OrbEvolutionBurst({ trigger, color = '#65F7D7' }) {
  const { width, height } = useWindowDimensions();
  const centerX = width / 2;
  const centerY = height / 2;
  const count = 150;

  const particles = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      angle: Math.random() * Math.PI * 2,
      speed: 14 + Math.random() * 14,
      size: 3 + Math.random() * 5,
    }));
  }, [count]);

  const dist = useValue(0);
  const opacity = useValue(0);

  useEffect(() => {
    dist.current = 0;
    opacity.current = 1;
    dist.current = withTiming(42, { duration: 1000 });
    opacity.current = withTiming(0, { duration: 900 });
  }, [trigger, dist, opacity]);

  useFrame(() => {});

  if (!Canvas) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Canvas style={StyleSheet.absoluteFill}>
        {particles.map((p, idx) => {
          const x = centerX + Math.cos(p.angle) * dist.current * p.speed * 0.02;
          const y = centerY + Math.sin(p.angle) * dist.current * p.speed * 0.02;
          return <Circle key={idx} cx={x} cy={y} r={p.size} color={`${color}${Math.round(opacity.current * 255).toString(16)}`} />;
        })}
      </Canvas>
    </View>
  );
}
