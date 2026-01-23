// Snowfall - Particle system for forest & lapland scenes
import React, { useMemo } from 'react';
import { StyleSheet, Dimensions, Platform, View } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Skia doesn't work on web, so we'll use a fallback
let Canvas, Circle, useFrame;
if (Platform.OS !== 'web') {
  try {
    const skia = require('@shopify/react-native-skia');
    Canvas = skia.Canvas;
    Circle = skia.Circle;
    useFrame = skia.useFrame;
  } catch (e) {
    // Skia not available
  }
}

/**
 * Snowfall particle system
 * 80-140 snowflakes with varying size, opacity, drift speed
 */
export default function Snowfall({ particleCount = 100, speedMultiplier = 1.0 }) {
  // On web, return empty view (Skia not supported)
  if (Platform.OS === 'web' || !Canvas || !Circle || !useFrame) {
    return <View style={styles.canvas} />;
  }

  const particles = useMemo(() => {
    return Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      x: Math.random() * SCREEN_WIDTH,
      y: Math.random() * -SCREEN_HEIGHT, // Start above screen
      size: Math.random() * 4 + 2, // 2-6px
      speed: (Math.random() * 0.8 + 0.3) * speedMultiplier, // 0.3-1.1
      driftAmp: Math.random() * 8 + 4, // 4-12px horizontal drift
      opacity: Math.random() * 0.5 + 0.3, // 0.3-0.8
    }));
  }, [particleCount, speedMultiplier]);

  useFrame(({ time }) => {
    particles.forEach(particle => {
      // Vertical fall
      particle.y += particle.speed;
      
      // Horizontal drift (sine wave)
      particle.x += Math.sin(time * 1.2 + particle.id) * particle.driftAmp * 0.01;
      
      // Reset when below screen
      if (particle.y > SCREEN_HEIGHT) {
        particle.y = -10;
        particle.x = Math.random() * SCREEN_WIDTH;
      }
      
      // Wrap horizontally
      if (particle.x < 0) particle.x = SCREEN_WIDTH;
      if (particle.x > SCREEN_WIDTH) particle.x = 0;
    });
  });

  return (
    <Canvas style={styles.canvas}>
      {particles.map(particle => (
        <Circle
          key={particle.id}
          cx={particle.x}
          cy={particle.y}
          r={particle.size}
          color={`rgba(255, 255, 255, ${particle.opacity})`}
        />
      ))}
    </Canvas>
  );
}

const styles = StyleSheet.create({
  canvas: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    pointerEvents: 'none',
  },
});
