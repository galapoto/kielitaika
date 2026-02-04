// ============================================================================
// PronunciationLabScreen - Premium pronunciation lab
// ============================================================================
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

import Background from '../components/ui/Background';
import HomeButton from '../components/HomeButton';
import SectionHeader from '../components/core/SectionHeader';

import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';


/**
 * PronunciationLabScreen
 * 
 * TODO: Codex to implement:
 * - Real pronunciation analysis
 * - Audio recording and playback
 * - Waveform visualization
 * - Detailed feedback
 */
export default function PronunciationLabScreen() {
  return (
    <Background module="practice" variant="brown" solidContentZone>
      <ScrollView contentContainerStyle={styles.container}>
        <HomeButton />
        <SectionHeader title="Pronunciation Lab" />

        <View style={styles.card}>
          <Text style={styles.text}>
            Pronunciation Lab is temporarily disabled during recovery.
          </Text>
        </View>
      </ScrollView>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  card: {
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginTop: spacing.lg,
  },
  text: {
    color: colors.textPrimary,
    fontSize: 16,
  },
});
