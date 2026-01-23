// Starfield - Parallax star layer behind aurora
import React, { useMemo } from 'react';
import { StyleSheet, Dimensions, Platform, View } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Skia doesn't work on web
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
 * Starfield with 200-300 micro-stars
 * Slow parallax drifting, occasional twinkle
 */
export default function Starfield({ starCount = 250 }) {
  // On web, return empty view (Skia not supported)
  if (Platform.OS === 'web' || !Canvas || !Circle || !useFrame) {
    return <View style={styles.canvas} />;
  }

  const stars = useMemo(() => {
    return Array.from({ length: starCount }).map((_, i) => ({
      id: i,
      x: Math.random() * SCREEN_WIDTH,
      y: Math.random() * SCREEN_HEIGHT,
      size: Math.random() * 1.2 + 0.6, // 0.6-1.8px
      brightness: Math.random() * 0.6 + 0.4, // 0.4-1.0
      parallaxDepth: Math.random() * 0.8 + 0.2, // 0.2-1.0
      twinkleRate: Math.random() * 0.02 + 0.01, // 0.01-0.03
    }));
  }, [starCount]);

  useFrame(({ time }) => {
    stars.forEach(star => {
      // Parallax drift
      star.x += 0.005 * star.parallaxDepth;
      
      // Wrap when passing edge
      if (star.x > SCREEN_WIDTH) {
        star.x = 0;
      }
      
      // Twinkle animation
      const twinkle = Math.sin(time * star.twinkleRate) * 0.12;
      star.currentBrightness = star.brightness + twinkle;
    });
  });

  return (
    <Canvas style={styles.canvas}>
      {stars.map(star => (
        <Circle
          key={star.id}
          cx={star.x}
          cy={star.y}
          r={star.size}
          color={`rgba(255, 255, 255, ${star.currentBrightness || star.brightness})`}
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
    zIndex: -2,
    pointerEvents: 'none',
  },
});
