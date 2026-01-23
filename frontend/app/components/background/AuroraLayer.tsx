// AuroraLayer - Skia animated gradient for aurora effect
import React from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { getSkia } from "../../utils/optionalSkia";

export default function AuroraLayer() {
  const skia = getSkia();
  const { Canvas, Rect, Shader, useClockValue, useDerivedValue } = skia || {};

  const t = useClockValue ? useClockValue() : { current: 0 };
  const { width, height } = useWindowDimensions();

  const time = useDerivedValue ? useDerivedValue(() => t.current, [t]) : t;

  if (!Canvas || !Rect || !Shader) {
    return <View style={[styles.canvas, styles.fallback]} />;
  }

  return (
    <Canvas style={styles.canvas}>
      <Rect x={0} y={0} width={width} height={height}>
        <Shader
          source={`
          uniform float2 resolution;
          uniform float time;
          half4 main(vec2 fragCoord) {
            float y = fragCoord.y / resolution.y;
            float x = fragCoord.x / resolution.x;
            float glow = sin(time * 0.2 + y * 5.0 + x * 2.0) * 0.3 + 0.5;
            float aurora = sin(time * 0.1 + y * 3.0) * 0.2 + 0.3;
            return half4(0.1 + aurora, glow * 0.8, 0.7 + aurora, 0.25);
          }
        `}
          uniforms={{
            resolution: [width, height],
            time: time,
          }}
        />
      </Rect>
    </Canvas>
  );
}

const styles = StyleSheet.create({
  canvas: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  fallback: {
    backgroundColor: "rgba(10, 44, 82, 0.35)",
  },
});


