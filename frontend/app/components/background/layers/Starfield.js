// Starfield layer (Skia-based). If Skia not present, falls back to empty view.
import React, { useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Canvas, Circle, useFrame, useValue } from '@shopify/react-native-skia';

export default function Starfield({ count = 220 }) {
  const { width, height } = useWindowDimensions();
  const stars = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      size: 0.6 + Math.random() * 1.2,
      brightness: 0.4 + Math.random() * 0.6,
      parallaxDepth: 0.2 + Math.random() * 0.8,
      twinkleRate: 0.5 + Math.random() * 1.2,
    }));
  }, [count, width, height]);

  const t = useValue(0);
  useFrame((_c, elapsed) => {
    t.current = elapsed / 1000;
  });

  if (!Canvas) {
    return <View pointerEvents="none" style={StyleSheet.absoluteFill} />;
  }

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Canvas style={StyleSheet.absoluteFill}>
        {stars.map((s) => {
          const x = (s.x + t.current * 0.005 * s.parallaxDepth * width) % width;
          const opacity = s.brightness + Math.sin(t.current * s.twinkleRate) * 0.12;
          return <Circle key={s.id} cx={x} cy={s.y} r={s.size} color={`rgba(255,255,255,${opacity})`} />;
        })}
      </Canvas>
    </View>
  );
}
