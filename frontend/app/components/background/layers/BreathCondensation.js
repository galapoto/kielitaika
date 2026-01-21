import React, { useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

let SkiaAvailable = false;
let Canvas, useValue, useFrame, Circle;

try {
  const skia = require('@shopify/react-native-skia');
  Canvas = skia.Canvas;
  useValue = skia.useValue;
  useFrame = skia.useFrame;
  Circle = skia.Circle;
  SkiaAvailable = true;
} catch (e) {
  SkiaAvailable = false;
}

/**
 * Breath condensation particles. Emits when amplitude > threshold (winter).
 */
export default function BreathCondensation({ amplitude = 0, orbX = 0, orbY = 0 }) {
  const threshold = 0.08;
  const { width, height } = useWindowDimensions();
  const particles = useMemo(() => [], []);

  if (!SkiaAvailable || !Canvas || !useValue) {
    return <View pointerEvents="none" style={StyleSheet.absoluteFill} />;
  }

  const t = useValue(0);

  useFrame((_, elapsed) => {
    t.current = elapsed / 1000;
    // emit
    if (amplitude > threshold && particles.length < 80) {
      const count = 20 + Math.floor(Math.random() * 10);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: orbX + (Math.random() * 20 - 10),
          y: orbY + (Math.random() * 8 - 4),
          vx: Math.random() * 1 - 0.5,
          vy: Math.random() * 0.8 + 0.2,
          life: 0,
          size: 4 + Math.random() * 8,
        });
      }
    } else if (amplitude <= threshold) {
      particles.length = 0;
    }
  });

  // update particles
  const renderParticles = () => {
    return particles.map((p, idx) => {
      p.y -= p.vy;
      p.x += p.vx;
      p.life += 0.016;
      const alpha = Math.max(0, 1 - p.life / 0.8);
      if (p.life > 0.9 || p.y < -10 || p.x < -20 || p.x > width + 20) {
        particles.splice(idx, 1);
        return null;
      }
      return <Circle key={idx} cx={p.x} cy={p.y} r={p.size} color={`rgba(255,255,255,${alpha * 0.35})`} />;
    });
  };

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Canvas style={StyleSheet.absoluteFill}>{renderParticles()}</Canvas>
    </View>
  );
}
