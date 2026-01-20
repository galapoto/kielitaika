import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { colors } from '../../../styles/colors';

/**
 * Floating spirits orbiting the orb.
 * Props:
 *  - skills: array of { key, energy (0-1), color }
 *  - radius: base radius to orbit
 */
export default function SpiritLights({ skills = [], radius = 120 }) {
  const angles = useMemo(() => skills.map((_, i) => useSharedValue((i / Math.max(1, skills.length)) * Math.PI * 2)), [skills]);

  angles.forEach((a) => {
    React.useEffect(() => {
      a.value = withRepeat(withTiming(a.value + Math.PI * 2, { duration: 14000 }), -1);
    }, [a]);
  });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {skills.map((s, idx) => {
        const angle = angles[idx];
        const orbitStyle = useAnimatedStyle(() => {
          const x = Math.cos(angle.value) * radius;
          const y = Math.sin(angle.value) * radius * 0.8;
          return {
            transform: [{ translateX: x }, { translateY: y }],
            opacity: 0.3 + (s.energy ?? 0.5) * 0.6,
          };
        });
        return <Animated.View key={s.key} style={[styles.light, orbitStyle, { backgroundColor: s.color || colors.mintSoft }]} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  light: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    shadowColor: colors.mintSoft,
    shadowOpacity: 0.6,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
});
