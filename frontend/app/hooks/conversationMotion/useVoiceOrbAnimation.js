import { useSharedValue, withRepeat, withTiming, Easing, useAnimatedStyle, interpolateColor } from 'react-native-reanimated';
import { useEffect } from 'react';

export function useVoiceOrbAnimation({ amplitude = 0, mode = 'idle' }) {
  const breath = useSharedValue(1);
  const hue = useSharedValue(0);

  useEffect(() => {
    breath.value = withRepeat(
      withTiming(1.04, { duration: 2400, easing: Easing.inOut(Easing.cubic) }),
      -1,
      true
    );
    hue.value = withRepeat(withTiming(1, { duration: 6000, easing: Easing.linear }), -1, false);
  }, [breath, hue]);

  const coreStyle = useAnimatedStyle(() => {
    const extra = Math.min(0.08, amplitude * 0.08);
    const scale = breath.value + extra + (mode === 'speaking' ? 0.04 : 0);
    const glow = Math.min(0.75, 0.3 + amplitude * 0.6);
    const color = interpolateColor(hue.value, [0, 1], ['#4EC5FF', '#65F7D7']);
    return {
      transform: [{ scale }],
      backgroundColor: color,
      shadowOpacity: glow,
    };
  });

  return { coreStyle };
}
