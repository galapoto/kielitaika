import React, { useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, { withSpring, useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { theme } from '../themes/theme';

type ToggleProps = {
  value: boolean;
  onChange: (value: boolean) => void;
};

export default function Toggle({ value, onChange }: ToggleProps) {
  const x = useSharedValue(value ? 20 : 0);

  useEffect(() => {
    x.value = withSpring(value ? 20 : 0, { damping: 14, stiffness: 240 });
  }, [value, x]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  return (
    <Pressable
      onPress={() => {
        x.value = withSpring(value ? 0 : 20, { damping: 14, stiffness: 240 });
        onChange(!value);
      }}
      style={{
        width: 50,
        height: 28,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        padding: 4,
      }}
    >
      <Animated.View
        style={[
          {
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: theme.dark.accent,
          },
          style,
        ]}
      />
    </Pressable>
  );
}
