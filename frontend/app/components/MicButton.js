import React, { useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { useScaleOnPress } from '../animations/useScaleOnPress';

export default function MicButton({ onPressIn, onPressOut, disabled = false }) {
  const { animatedStyle, onPressIn: animIn, onPressOut: animOut } = useScaleOnPress();
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1.08, { duration: 1500 }), -1, true);
  }, [pulse]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: disabled ? 0.3 : 0.5,
  }));

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.ring, ringStyle]} />
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          style={[styles.button, disabled && styles.disabled]}
          onPressIn={(e) => {
            animIn();
            onPressIn?.(e);
          }}
          onPressOut={(e) => {
            animOut();
            onPressOut?.(e);
          }}
          disabled={disabled}
        >
          <Text style={styles.label}>🎤</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: '#1B4EDA',
  },
  button: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1B4EDA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  disabled: {
    opacity: 0.5,
  },
});
