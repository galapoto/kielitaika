import React, { useEffect } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useScaleOnPress } from '../animations/useScaleOnPress';
import { useHaptic } from '../hooks/useHaptic';

function MicButton({ onPress, onPressIn, onPressOut, disabled = false, isActive = false }) {
  const { animatedStyle, onPressIn: animIn, onPressOut: animOut } = useScaleOnPress();
  const pulse = useSharedValue(1);
  const { medium } = useHaptic();

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
          style={[styles.button, disabled && styles.disabled, isActive && styles.active]}
          onPress={(e) => {
            if (disabled) return;
            onPress?.(e);
          }}
          onPressIn={(e) => {
            if (!disabled) {
              medium();
            }
            animIn();
            onPressIn?.(e);
          }}
          onPressOut={(e) => {
            animOut();
            onPressOut?.(e);
          }}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={isActive ? "Stop recording" : "Start recording"}
          accessibilityHint={isActive ? "Press to stop recording your Finnish" : "Press to start recording your Finnish"}
          accessibilityState={{ disabled, selected: isActive }}
          testID="mic-button"
        >
          <View pointerEvents="none" style={styles.innerGlow} />
          <Ionicons
            name={isActive ? "mic" : "mic-outline"}
            size={24}
            color={isActive ? '#0b1b3a' : '#102044'}
          />
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
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 2,
    borderColor: 'rgba(99, 140, 255, 0.45)',
    shadowColor: '#4f83ff',
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(99, 140, 255, 0.35)',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#0b1b3a',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  disabled: {
    opacity: 0.5,
  },
  active: {
    backgroundColor: '#c7d6ff',
    borderColor: 'rgba(99, 140, 255, 0.8)',
  },
  innerGlow: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: 6,
    bottom: 6,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.75)',
    shadowColor: '#9bb6ff',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
});

export default React.memo(MicButton);
