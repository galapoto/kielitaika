/**
 * IconBase - Reusable icon system using Skia for rendering
 * 
 * Provides consistent icon rendering with customizable size, stroke, and color
 */

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { getSkia } from '../../utils/optionalSkia';

interface IconBaseProps {
  size?: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  children: (props: {
    size: number;
    stroke: string;
    strokeWidth: number;
    fill?: string;
  }) => React.ReactNode;
}

export default function IconBase({
  size = 32,
  stroke = "#FFF",
  strokeWidth = 2,
  fill,
  children,
}: IconBaseProps) {
  const skia = getSkia();

  // Fallback on web or when Skia is unavailable
  if (Platform.OS === 'web' || !skia?.Canvas) {
    return (
      <View
        style={[
          styles.container,
          {
            width: size,
            height: size,
            borderWidth: strokeWidth,
            borderColor: stroke,
            borderRadius: size / 5,
          },
        ]}
      />
    );
  }

  const Canvas = skia.Canvas;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Canvas style={StyleSheet.absoluteFill}>
        {children({ size, stroke, strokeWidth, fill })}
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
