import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { getSkia } from '../../../utils/optionalSkia';

/**
 * Voice-reactive trail emitting from orb center.
 * Props:
 *  - amplitude (0-1)
 *  - pitchDelta (number)
 *  - maxParticles (default 80)
 */
export default function VoiceTrail({ amplitude = 0, pitchDelta = 0, maxParticles = 80, centerX = 0, centerY = 0 }) {
  const skia = getSkia();
  const Canvas = skia?.Canvas;
  const Circle = skia?.Circle;
  const useFrame = skia?.useFrame;
  const particles = useMemo(() => [], []);

  useFrame?.(() => {
    // emit when amplitude > 0.05
    if (amplitude > 0.05 && particles.length < maxParticles) {
      const p = {
        x: centerX,
        y: centerY,
        vx: (Math.random() * 2 - 1) + pitchDelta * 0.02,
        vy: Math.random() * 2 - 1,
        size: 2 + Math.random() * 3,
        life: 0,
      };
      particles.push(p);
    }
  });

  const renderParticles = () =>
    particles.map((p, idx) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life += 0.016;
      const alpha = Math.max(0, 1 - p.life / 0.5);
      if (p.life > 0.5) {
        particles.splice(idx, 1);
        return null;
      }
      return <Circle key={idx} cx={p.x} cy={p.y} r={p.size} color={`rgba(120,255,255,${alpha})`} />;
    });

  if (!Canvas || !Circle) return <View pointerEvents="none" style={StyleSheet.absoluteFill} />;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Canvas style={StyleSheet.absoluteFill}>{renderParticles()}</Canvas>
    </View>
  );
}
