// VoiceOrb - Skia-based animated orb component
import React from "react";
import { Canvas, Circle, useValue, useClockValue, interpolate, useDerivedValue } from "@shopify/react-native-skia";
import { useRukaStore } from "../../state/useRukaStore";
import { StyleSheet } from "react-native";

interface VoiceOrbProps {
  amplitude?: number;
  mode?: "idle" | "listening" | "speaking";
  size?: number;
}

export default function VoiceOrb({ amplitude: propAmplitude, mode = "idle", size = 160 }: VoiceOrbProps) {
  const storeAmplitude = useRukaStore((s) => s.amplitude);
  const amplitude = propAmplitude ?? storeAmplitude;
  const t = useClockValue();
  const pulse = useValue(0);

  const animatedRadius = useDerivedValue(() => {
    const baseRadius = size / 2;
    const pulseValue = interpolate(
      Math.sin(t.current * 1.5),
      [-1, 1],
      [0.9, 1.1]
    );
    const amplitudeMultiplier = 1 + amplitude * 0.4;
    return baseRadius * amplitudeMultiplier * pulseValue;
  }, [amplitude, size]);

  const opacity = useDerivedValue(() => {
    return 0.6 + amplitude * 0.4;
  }, [amplitude]);

  return (
    <Canvas style={styles.canvas}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={animatedRadius}
        color={`rgba(120, 200, 255, ${opacity.current})`}
      />
      {/* Inner glow */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={animatedRadius.current * 0.6}
        color={`rgba(200, 230, 255, ${opacity.current * 0.5})`}
      />
    </Canvas>
  );
}

const styles = StyleSheet.create({
  canvas: {
    width: 200,
    height: 200,
  },
});
