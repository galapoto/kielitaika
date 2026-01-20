// ============================================================================
// CertificatePreview - Full certificate preview modal
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../../../design/colors';
import { typography } from '../../../design/typography';
import { spacing } from '../../../design/spacing';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients } from '../../../design/gradients';

/**
 * CertificatePreview
 * 
 * TODO: Codex to implement:
 * - Certificate design layout
 * - Download/Share functionality
 * - Verification code display
 * - Print functionality
 */
export default function CertificatePreview({ 
  title,
  level,
  date,
  verificationCode,
  style,
  ...props 
}) {
  return (
    <ScrollView style={[styles.container, style]} {...props}>
      <LinearGradient
        colors={gradients.hero.colors}
        start={gradients.hero.start}
        end={gradients.hero.end}
        style={styles.certificate}
      >
        <Text style={styles.certificateTitle}>Certificate of Achievement</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.level}>Level: {level}</Text>
        <Text style={styles.date}>Issued: {date}</Text>
        {verificationCode && (
          <Text style={styles.code}>Verification: {verificationCode}</Text>
        )}
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  certificate: {
    padding: spacing['2xl'],
    minHeight: 600,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  certificateTitle: {
    ...typography.styles.h2,
    color: colors.text.primary,
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.styles.h1,
    color: colors.accent.mint,
    textAlign: 'center',
  },
  level: {
    ...typography.styles.h3,
    color: colors.text.secondary,
  },
  date: {
    ...typography.styles.bodyLarge,
    color: colors.text.tertiary,
  },
  code: {
    ...typography.styles.caption,
    color: colors.text.tertiary,
    marginTop: spacing.xl,
    fontFamily: typography.fontFamily.mono,
  },
});


