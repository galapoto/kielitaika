// AuroraRipple - Electromagnetic ripple layer for aurora scene
import React from 'react';
import { StyleSheet, Platform, View } from 'react-native';

// Skia doesn't work on web
let Canvas, Rect, Shader, useClockValue;
if (Platform.OS !== 'web') {
  try {
    const skia = require('@shopify/react-native-skia');
    Canvas = skia.Canvas;
    Rect = skia.Rect;
    Shader = skia.Shader;
    useClockValue = skia.useClockValue;
  } catch (e) {
    // Skia not available
  }
}

/**
 * Aurora physics ripple using Skia shader
 * Creates vertical gradient bands with sine-based electromagnetic ripple
 */
export default function AuroraRipple({ intensity = 1.0, height, width }) {
  // On web, return empty view (Skia not supported)
  if (Platform.OS === 'web' || !Canvas || !Rect || !Shader || !useClockValue) {
    return <View style={[styles.canvas, { width, height }]} />;
  }

  const t = useClockValue();

  return (
    <Canvas style={[styles.canvas, { width, height }]}>
      <Rect x={0} y={0} width={width} height={height}>
        <Shader
          source={`
            uniform float2 resolution;
            uniform float u_time;
            uniform float u_intensity;

            half4 main(vec2 pos) {
              float ripple = sin(pos.y * 0.04 + u_time * 0.6) 
                           + sin(pos.y * 0.07 + u_time * 0.9) * 0.5;
              
              float shift = ripple * u_intensity * 0.15;
              
              float g = smoothstep(0.0, 1.0, pos.y / resolution.y);
              float aurora = g + shift;
              
              return half4(0.1, aurora, 0.75, 0.22);
            }
          `}
          uniforms={{
            resolution: [width || 400, height || 800],
            u_time: t.current,
            u_intensity: intensity,
          }}
        />
      </Rect>
    </Canvas>
  );
}

const styles = StyleSheet.create({
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
