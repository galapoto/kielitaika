import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { getSkia } from '../../../utils/optionalSkia';

/**
 * Warm ember particles swirling around the orb when the learner speaks quickly.
 * This is a GPU-friendly effect; if Skia is unavailable the component is a no-op.
 */
export default function FireSpirits({
  amplitude = 0,
  speechSpeed = 0, // words per second or similar
  centerX = 0,
  centerY = 0,
  enabled = true,
}) {
  const skia = getSkia();
  const Canvas = skia?.Canvas;
  const Circle = skia?.Circle;
  const useFrame = skia?.useFrame;
  const particles = useMemo(() => [], []);

  useFrame?.((_canvas, _time) => {
    if (!enabled) return;
    const intensity = Math.max(0, amplitude - 0.4) + Math.max(0, speechSpeed - 2) * 0.15;
    const emitCount = intensity > 0 ? Math.min(4 + Math.floor(intensity * 14), 14) : 0;
    for (let i = 0; i < emitCount; i++) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        radius: 5 + Math.random() * 18,
        speed: 0.03 + Math.random() * 0.06,
        opacity: 0.6 + Math.random() * 0.4,
        size: 2 + Math.random() * 3,
      });
    }

    // prune if too many
    if (particles.length > 140) {
      particles.splice(0, particles.length - 140);
    }
  });

  const renderParticles = () =>
    particles.map((p, idx) => {
      p.angle += p.speed;
      p.radius += 0.05;
      p.opacity -= 0.015;
      const x = centerX + Math.cos(p.angle) * p.radius;
      const y = centerY + Math.sin(p.angle) * p.radius - p.radius * 0.15;
      if (p.opacity <= 0) {
        particles.splice(idx, 1);
        return null;
      }
      const color = `rgba(255,136,85,${p.opacity})`;
      return <Circle key={idx} cx={x} cy={y} r={p.size} color={color} />;
    });

  if (!Canvas || !Circle) return <View pointerEvents="none" style={StyleSheet.absoluteFill} />;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Canvas style={StyleSheet.absoluteFill}>{renderParticles()}</Canvas>
    </View>
  );
}
