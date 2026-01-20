import { useAnimatedStyle, interpolate } from 'react-native-reanimated';

// Maps amplitude (0-1) to ring thickness/opacity.
export function useVoiceReactiveRing(amplitudeShared) {
  return useAnimatedStyle(() => {
    const amp = amplitudeShared?.value ?? 0;
    const borderWidth = interpolate(amp, [0, 1], [2, 10]);
    const opacity = interpolate(amp, [0, 1], [0.35, 0.8]);
    return {
      borderWidth,
      opacity,
    };
  });
}
