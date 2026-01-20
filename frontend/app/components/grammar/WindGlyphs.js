import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Canvas, Path, Skia, useFrame } from '@shopify/react-native-skia';

/**
 * Airy rune-like glyphs that animate when grammar practice is active.
 */
export default function WindGlyphs({ mood = 'calm', active = false }) {
  const glyphs = useMemo(() => [], []);

  useEffect(() => {
    if (!active) glyphs.length = 0;
  }, [active, glyphs]);

  const palette = {
    calm: 'rgba(101,247,215,0.12)',
    confident: 'rgba(78,197,255,0.14)',
    unsure: 'rgba(63,160,255,0.1)',
  }[mood] || 'rgba(101,247,215,0.12)';

  useFrame((_canvas, time) => {
    if (!active) return;
    if (glyphs.length < 6 && Math.random() > 0.9) {
      const p = Skia.Path.Make();
      const startX = Math.random() * 320;
      const startY = Math.random() * 280;
      p.moveTo(startX, startY);
      p.cubicTo(startX + 20, startY - 30, startX + 50, startY + 10, startX + 80, startY - 20);
      glyphs.push({ path: p, born: time, life: 0 });
    }
    glyphs.forEach((g) => {
      g.life = (time - g.born) / 3000;
    });
    for (let i = glyphs.length - 1; i >= 0; i--) {
      if (glyphs[i].life > 1.2) glyphs.splice(i, 1);
    }
  });

  if (!Canvas) return <View pointerEvents="none" style={StyleSheet.absoluteFill} />;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Canvas style={StyleSheet.absoluteFill}>
        {glyphs.map((g, idx) => (
          <Path
            key={idx}
            path={g.path}
            color={palette}
            style="stroke"
            strokeWidth={1.4}
            strokeCap="round"
            strokeJoin="round"
            opacity={Math.max(0, 1 - g.life)}
          />
        ))}
      </Canvas>
    </View>
  );
}
