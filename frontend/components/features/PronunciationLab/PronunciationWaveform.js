// ============================================================================
// PronunciationWaveform - Pronunciation comparison waveform
// ============================================================================

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { colors } from '../../../design/colors';
import { typography } from '../../../design/typography';
import { spacing } from '../../../design/spacing';

/**
 * PronunciationWaveform
 * 
 * TODO: Codex to implement:
 * - Side-by-side waveform comparison
 * - Overlay comparison mode
 * - Highlight differences
 * - Audio playback controls
 */
export default function PronunciationWaveform({ 
  expected = [],
  actual = [],
  style,
  ...props 
}) {
  return (
    <View style={[styles.container, style]} {...props}>
      <View style={styles.waveformContainer}>
        <Text style={styles.label}>Expected</Text>
        {/* TODO: Codex - Implement expected waveform */}
        <View style={styles.placeholder} />
      </View>
      <View style={styles.waveformContainer}>
        <Text style={styles.label}>Your Pronunciation</Text>
        {/* TODO: Codex - Implement actual waveform */}
        <View style={styles.placeholder} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  waveformContainer: {
    gap: spacing.sm,
  },
  label: {
    ...typography.styles.body,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  placeholder: {
    height: 80,
    backgroundColor: colors.gray[800],
    borderRadius: 8,
  },
});


