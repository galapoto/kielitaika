// VoiceOrb - Skia-based animated orb component with fallback
import React, { useState, useEffect } from "react";
import { useRukaStore } from "../../state/useRukaStore";
import { StyleSheet, View } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, interpolate } from "react-native-reanimated";

let SkiaAvailable = false;
let Canvas: any, Circle: any, useValue: any, useClockValue: any, skiaInterpolate: any, useDerivedValue: any;

try {
  const skia = require("@shopify/react-native-skia");
  Canvas = skia.Canvas;
  Circle = skia.Circle;
  useValue = skia.useValue;
  useClockValue = skia.useClockValue;
  skiaInterpolate = skia.interpolate;
  useDerivedValue = skia.useDerivedValue;
  SkiaAvailable = true;
} catch (e) {
  SkiaAvailable = false;
}

interface VoiceOrbProps {
  amplitude?: number;
  mode?: "idle" | "listening" | "speaking";
  size?: number;
}

export default function VoiceOrb({ amplitude: propAmplitude, mode = "idle", size = 160 }: VoiceOrbProps) {
  const storeAmplitude = useRukaStore((s) => s.amplitude);
  const amplitude = propAmplitude ?? storeAmplitude;
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => prev + 0.016);
    }, 16);
    return () => clearInterval(interval);
  }, []);

  // Fallback using Reanimated if Skia not available
  if (!SkiaAvailable || !Canvas || !useValue) {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0.6);

    useEffect(() => {
      const pulseValue = 0.9 + Math.sin(time * 1.5) * 0.1;
      const amplitudeMultiplier = 1 + amplitude * 0.4;
      scale.value = withRepeat(
        withTiming(pulseValue * amplitudeMultiplier, { duration: 1000 }),
        -1,
        true
      );
      opacity.value = withTiming(0.6 + amplitude * 0.4, { duration: 200 });
    }, [amplitude, time]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }));

    return (
      <View style={[styles.fallbackContainer, { width: size, height: size }]}>
        <Animated.View
          style={[
            styles.fallbackOrb,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
            animatedStyle,
          ]}
        />
        <Animated.View
          style={[
            styles.fallbackOrbInner,
            {
              width: size * 0.6,
              height: size * 0.6,
              borderRadius: size * 0.3,
            },
            animatedStyle,
          ]}
        />
      </View>
    );
  }

  // Skia version
  const t = useClockValue();
  const pulse = useValue(0);

  const animatedRadius = useDerivedValue(() => {
    const baseRadius = size / 2;
    const pulseValue = skiaInterpolate(
      Math.sin(t.current * 1.5),
      [-1, 1],
      [0.9, 1.1]
    );
    const amplitudeMultiplier = 1 + amplitude * 0.4;
    return baseRadius * amplitudeMultiplier * pulseValue;
  }, [amplitude, size, t]);

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
  fallbackContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackOrb: {
    position: 'absolute',
    backgroundColor: 'rgba(120, 200, 255, 0.6)',
  },
  fallbackOrbInner: {
    position: 'absolute',
    backgroundColor: 'rgba(200, 230, 255, 0.3)',
  },
});
