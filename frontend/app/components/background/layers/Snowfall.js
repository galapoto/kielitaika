// Snowfall particle layer (lightweight, non-Skia fallback)
import React, { useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Canvas, useFrame, Circle, useValue } from '@shopify/react-native-skia';

// NOTE: Requires @shopify/react-native-skia. If not installed, replace with a no-op View.

export default function Snowfall({ count = 120, intensity = 1 }) {
  const { width, height } = useWindowDimensions();
  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height - height,
      size: 2 + Math.random() * 4,
      speed: (0.3 + Math.random() * 0.8) * intensity,
      driftAmp: 4 + Math.random() * 8,
      brightness: 0.4 + Math.random() * 0.6,
    }));
  }, [count, width, height, intensity]);

  const t = useValue(0);

  useFrame((_canvas, elapsed) => {
    t.current = elapsed / 1000;
  });

  const renderParticles = () =>
    particles.map((p) => {
      const y = (p.y + t.current * p.speed * 60) % (height + 10);
      const x = (p.x + Math.sin(t.current * 1.2) * p.driftAmp) % width;
      const opacity = Math.min(1, Math.max(0.2, (p.size - 1.5) / 6));
      return <Circle key={p.id} cx={x} cy={y} r={p.size} color={`rgba(255,255,255,${opacity})`} />;
    });

  // Fallback if Skia isn't available
  if (!Canvas) {
    return <View pointerEvents="none" style={StyleSheet.absoluteFill} />;
  }

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Canvas style={StyleSheet.absoluteFill}>{renderParticles()}</Canvas>
    </View>
  );
}
