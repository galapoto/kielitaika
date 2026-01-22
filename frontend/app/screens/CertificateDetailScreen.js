import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

import Background from '../components/ui/Background';
import HomeButton from '../components/HomeButton';
import SectionHeader from '../components/core/SectionHeader';

import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';


const defaultCertificateBackground = require('../../assets/backgrounds/revontuli.png');
const onDark = '#E6F2FF';
const onDarkMuted = '#BFD7E8';

/**
 * CertificateDetailScreen - Certificate detail with preview, share, download
 *
 * Features:
 * - Load certificate data
 * - Preview certificate
 * - Download PDF (web)
 * - Share certificate
 * - Show verification code
 * - Verify certificate
 */
export default function CertificateDetailScreen() {
  return (
    <Background>
      <ScrollView contentContainerStyle={styles.container}>
        <HomeButton />
        <SectionHeader title="Certificate Details" />

        <View style={styles.card}>
          <Text style={styles.text}>
            Certificate details are temporarily unavailable during recovery.
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
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: 12,
  },
  text: {
    color: colors.textPrimary,
    fontSize: 16,
  },
});
