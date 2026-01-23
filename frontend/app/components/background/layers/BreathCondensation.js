// BreathCondensation - Winter speaking effect with breath particles
import React, { useMemo, useEffect, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

// Skia doesn't work on web
let Canvas, Circle;
if (Platform.OS !== 'web') {
  try {
    const skia = require('@shopify/react-native-skia');
    Canvas = skia.Canvas;
    Circle = skia.Circle;
  } catch (e) {
    // Skia not available
  }
}

/**
 * Breath condensation particles
 * Triggered when user speaks in winter mode
 * 20-40 particles per breath pulse
 */
export default function BreathCondensation({ 
  enabled = false, 
  amplitude = 0, 
  orbX = 0, 
  orbY = 0,
  threshold = 0.08 
}) {
  const [particles, setParticles] = useState([]);
  const lastAmplitudeRef = React.useRef(0);

  useEffect(() => {
    if (!enabled || amplitude < threshold) {
      // Clear particles when silent
      if (amplitude < 0.01) {
        setParticles([]);
      }
      lastAmplitudeRef.current = amplitude;
      return;
    }

    // Emit particles on amplitude spike
    if (amplitude > lastAmplitudeRef.current + 0.1) {
      const particleCount = Math.floor(amplitude * 30) + 20; // 20-50 particles
      const newParticles = Array.from({ length: particleCount }).map((_, i) => ({
        id: Date.now() + i,
        x: orbX + (Math.random() - 0.5) * 20,
        y: orbY + (Math.random() - 0.5) * 8,
        vx: (Math.random() - 0.5) * 0.5,
        vy: Math.random() * 0.5 + 0.2,
        opacity: 1,
        size: Math.random() * 8 + 4, // 4-12px
        lifetime: Math.random() * 300 + 600, // 600-900ms
      }));

      setParticles(prev => [...prev, ...newParticles]);
    }

    lastAmplitudeRef.current = amplitude;
  }, [enabled, amplitude, orbX, orbY, threshold]);

  // Update and remove expired particles
  useEffect(() => {
    if (particles.length === 0) return;

    const interval = setInterval(() => {
      setParticles(prev => {
        return prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y - p.vy, // Upward motion
            opacity: Math.max(0, p.opacity - 0.02),
            lifetime: p.lifetime - 16, // ~60fps
          }))
          .filter(p => p.lifetime > 0 && p.opacity > 0);
      });
    }, 16);

    return () => clearInterval(interval);
  }, [particles.length]);

  if (!enabled || particles.length === 0) return null;

  // On web, return empty view (Skia not supported)
  if (Platform.OS === 'web' || !Canvas || !Circle) {
    return <View style={StyleSheet.absoluteFill} pointerEvents="none" />;
  }

  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map(particle => (
        <Circle
          key={particle.id}
          cx={particle.x}
          cy={particle.y}
          r={particle.size}
          color={`rgba(255, 255, 255, ${particle.opacity * 0.8})`}
        />
      ))}
    </Canvas>
  );
}
