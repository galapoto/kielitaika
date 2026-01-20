import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Canvas, Path, Skia, useFrame } from '@shopify/react-native-skia';

/**
 * Draws constellation-like links between spirit orbs during mastery events.
 * Expects positions computed externally; falls back to no-op if unavailable.
 */
export default function ConstellationLinks({ nodes = [], active = false, color = 'rgba(255,255,255,0.35)' }) {
  const progress = useMemo(() => ({ value: 0 }), []);

  useFrame((_canvas, time) => {
    if (!active) return;
    progress.value = (time / 1600) % 1;
  });

  const buildPaths = () => {
    if (!nodes.length || !active) return null;
    const paths = [];
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      const b = nodes[(i + 1) % nodes.length];
      const path = Skia.Path.Make();
      path.moveTo(a.x, a.y);
      path.lineTo(b.x, b.y);
      paths.push(path);
    }
    return paths;
  };

  const paths = buildPaths();
  if (!Canvas || !paths) return <View pointerEvents="none" style={StyleSheet.absoluteFill} />;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Canvas style={StyleSheet.absoluteFill}>
        {paths.map((p, idx) => (
          <Path
            key={idx}
            path={p}
            color={color}
            style="stroke"
            strokeWidth={1.2}
            strokeCap="round"
            strokeJoin="round"
            opacity={0.5 + 0.3 * Math.sin(progress.value * Math.PI * 2)}
          />
        ))}
      </Canvas>
    </View>
  );
}
