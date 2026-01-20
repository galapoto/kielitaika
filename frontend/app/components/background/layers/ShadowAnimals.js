import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useSharedValue, withRepeat, withTiming, useAnimatedStyle, interpolate } from 'react-native-reanimated';

/**
 * Ultra subtle shadow animal silhouettes. Currently placeholder translucent shapes.
 * Appears only when enabled (aurora/night/story). Adjust opacity for subtlety.
 */
export default function ShadowAnimals({ opacity = 0.08 }) {
  const phase = useSharedValue(0);

  React.useEffect(() => {
    phase.value = withRepeat(withTiming(1, { duration: 12000 }), -1, true);
  }, [phase]);

  const layers = useMemo(
    () => [
      { top: '10%', left: '-5%', width: '60%', height: '40%' },
      { top: '50%', right: '-10%', width: '50%', height: '35%' },
    ],
    []
  );

  const styleFor = (idx) =>
    useAnimatedStyle(() => {
      const drift = interpolate(phase.value, [0, 1], [-6, 6]);
      return {
        opacity,
        transform: [{ translateX: drift * (idx + 1) }],
      };
    });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {layers.map((layer, idx) => (
        <Animated.View
          key={idx}
          style={[
            styles.shadow,
            layer,
            styleFor(idx),
            { backgroundColor: 'rgba(0,0,0,0.3)', opacity },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    position: 'absolute',
    borderRadius: 9999,
    blurRadius: 12,
  },
});
