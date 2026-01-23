/**
 * TTS Provider Indicator
 * Shows which TTS provider is being used (ElevenLabs or Azure)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { radius } from '../styles/radius';

export type TTSProvider = 'elevenlabs' | 'azure' | null;

interface TTSProviderIndicatorProps {
  provider: TTSProvider;
  mode?: 'conversation' | 'system' | 'yki' | 'toihin' | 'vocab' | 'grammar';
  compact?: boolean;
}

export default function TTSProviderIndicator({ 
  provider, 
  mode = 'system',
  compact = false 
}: TTSProviderIndicatorProps) {
  // Determine provider from mode if provider not explicitly set
  const actualProvider: TTSProvider = provider || (
    mode === 'conversation' || mode === 'yki' || mode === 'toihin' 
      ? 'elevenlabs' 
      : 'azure'
  );

  if (!actualProvider) {
    return null;
  }

  const isElevenLabs = actualProvider === 'elevenlabs';

  return (
    <View style={[styles.container, compact && styles.compact]}>
      <View style={[styles.dot, isElevenLabs ? styles.dotEleven : styles.dotAzure]} />
      <Text style={styles.text}>
        {isElevenLabs ? 'High Quality Voice (EL)' : 'System Voice (Azure)'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: radius.s,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  compact: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  dotEleven: {
    backgroundColor: '#61dafb', // Cyan for ElevenLabs
  },
  dotAzure: {
    backgroundColor: '#b5d0ff', // Light blue for Azure
  },
  text: {
    ...typography.bodyXs,
    color: colors.textSoft,
    fontSize: 11,
  },
});
