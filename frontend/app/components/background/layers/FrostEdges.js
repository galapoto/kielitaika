// FrostEdges - Mystical frost growth on screen edges during story unlocks
import React from 'react';
import { StyleSheet, Dimensions, Platform, View } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
 * Frost edge animation using fractal noise shader
 * Grows on screen edges during story mode unlocks
 */
export default function FrostEdges({ growth = 0, enabled = false }) {
  if (!enabled || growth <= 0) return null;

  // On web, return empty view (Skia not supported)
  if (Platform.OS === 'web' || !Canvas || !Rect || !Shader || !useClockValue) {
    return <View style={styles.canvas} />;
  }

  const t = useClockValue();

  return (
    <Canvas style={styles.canvas}>
      <Rect x={0} y={0} width={SCREEN_WIDTH} height={SCREEN_HEIGHT}>
        <Shader
          source={`
            uniform float2 resolution;
            uniform float u_time;
            uniform float u_growth;

            // Simple noise function
            float noise(vec2 p) {
              return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
            }

            // Fractal Brownian Motion
            float fbm(vec2 pos) {
              float value = 0.0;
              float amplitude = 0.5;
              for(int i = 0; i < 4; i++) {
                value += amplitude * noise(pos);
                pos *= 2.0;
                amplitude *= 0.5;
              }
              return value;
            }

            half4 main(vec2 pos) {
              float edge = min(
                min(pos.x, resolution.x - pos.x),
                min(pos.y, resolution.y - pos.y)
              );
              
              float noise = fbm(pos * 0.02 + u_time * 0.1);
              float frost = smoothstep(50.0, 0.0, edge - noise * 20.0);
              frost *= u_growth;
              
              return half4(0.8, 0.9, 1.0, frost * 0.35);
            }
          `}
          uniforms={{
            resolution: [SCREEN_WIDTH, SCREEN_HEIGHT],
            u_time: t.current,
            u_growth: growth,
          }}
        />
      </Rect>
    </Canvas>
  );
}

const styles = StyleSheet.create({
  canvas: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    pointerEvents: 'none',
    zIndex: 10,
  },
});
