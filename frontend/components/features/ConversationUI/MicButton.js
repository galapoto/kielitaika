// ============================================================================
// MicButton - Premium microphone button for voice input
// ============================================================================

import React from 'react';
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../../design/colors';
import { spacing } from '../../../design/spacing';
import { shadows } from '../../../design/shadows';
import { gradients } from '../../../design/gradients';

/**
 * MicButton
 * 
 * TODO: Codex to implement:
 * - Pulse animation when recording
 * - Waveform visualization
 * - Press and hold gesture
 * - Recording indicator
 * - Haptic feedback
 */
export default function MicButton({ 
  onPressIn,
  onPressOut,
  isRecording = false,
  disabled = false,
  style,
  ...props 
}) {
  return (
    <TouchableOpacity
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      activeOpacity={0.8}
      style={[styles.container, style]}
      {...props}
    >
      <LinearGradient
        colors={isRecording ? gradients.accent.colors : gradients.royal.colors}
        start={gradients.royal.start}
        end={gradients.royal.end}
        style={styles.gradient}
      >
        <Text style={styles.icon}>🎤</Text>
      </LinearGradient>
      {isRecording && (
        <View style={styles.recordingIndicator}>
          <Text style={styles.recordingText}>Recording...</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 64,
    height: 64,
    borderRadius: 32,
    ...shadows.deep,
  },
  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 28,
  },
  recordingIndicator: {
    position: 'absolute',
    bottom: -32,
    alignSelf: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.error,
    borderRadius: 12,
  },
  recordingText: {
    color: colors.text.primary,
    fontSize: 10,
    fontWeight: '600',
  },
});


