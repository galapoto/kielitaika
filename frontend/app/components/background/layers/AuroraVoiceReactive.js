// AuroraVoiceReactive - Aurora that reacts to voice waveform
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
 * Aurora that reacts to microphone amplitude
 * Ripples more when user speaks loudly
 */
export default function AuroraVoiceReactive({ amplitude = 0, width = SCREEN_WIDTH, height = SCREEN_HEIGHT }) {
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
            uniform float u_wave;  // microphone amplitude envelope

            half4 main(vec2 pos) {
              float band = sin(pos.y * 0.04 + u_time * 0.3);
              float voiceRipple = sin(pos.y * 0.12 + u_wave * 12.0);

              float combined = band + voiceRipple * 0.6;

              float g = smoothstep(0.0, 1.0, pos.y / resolution.y);
              float aurora = g + combined * 0.15;

              return half4(0.1, aurora, 0.75, 0.25);
            }
          `}
          uniforms={{
            resolution: [width, height],
            u_time: t.current,
            u_wave: amplitude,
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
    pointerEvents: 'none',
  },
});
