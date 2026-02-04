import React, { useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
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
          {/* Emboss highlight */}
          <View pointerEvents="none" style={styles.embossHighlight} />
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
    width: 76, // Increased to match larger button
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: 'rgba(27, 78, 218, 0.50)', // Blue accent
  },
  button: {
    width: 56, // Increased for better touch target (minimum 44pt)
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3A2A1E', // Brown matching theme
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(27, 78, 218, 0.30)', // Blue edge accent
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.90, // Even more obvious shadow
    shadowRadius: 24, // Larger shadow radius
    shadowOffset: { width: 0, height: 18 }, // Deeper shadow
    elevation: 16, // Higher elevation
  },
  label: {
    fontSize: 24,
    color: 'rgba(255,255,255,0.95)',
  },
  disabled: {
    opacity: 0.5,
  },
  active: {
    borderColor: 'rgba(27, 78, 218, 0.70)', // Blue accent when active
    backgroundColor: '#1B4EDA', // Blue when active
  },
  embossHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.20)', // Much stronger highlight
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
});

export default React.memo(MicButton);
