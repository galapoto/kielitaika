// ============================================================================
// CertificateCard - Certificate display card
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import GlassCard from '../../core/GlassCard';
import { colors } from '../../../design/colors';
import { typography } from '../../../design/typography';
import { spacing } from '../../../design/spacing';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients } from '../../../design/gradients';

/**
 * CertificateCard
 * 
 * TODO: Codex to implement:
 * - Certificate preview image
 * - Share button animation
 * - Verification badge
 * - Achievement date
 */
export default function CertificateCard({ 
  title,
  level,
  date,
  verified = false,
  onPress,
  style,
  ...props 
}) {
  return (
    <GlassCard
      onPress={onPress}
      style={[styles.container, style]}
      {...props}
    >
      <LinearGradient
        colors={gradients.royal.colors}
        start={gradients.royal.start}
        end={gradients.royal.end}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.icon}>🏆</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.level}>{level}</Text>
          {date && (
            <Text style={styles.date}>{date}</Text>
          )}
          {verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Verified</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 200,
  },
  gradient: {
    padding: spacing.lg,
    borderRadius: 24,
    minHeight: 200,
  },
  content: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  icon: {
    fontSize: 48,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.styles.h3,
    color: colors.text.primary,
    textAlign: 'center',
  },
  level: {
    ...typography.styles.body,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  date: {
    ...typography.styles.caption,
    color: colors.text.tertiary,
  },
  verifiedBadge: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.success,
    borderRadius: 12,
  },
  verifiedText: {
    ...typography.styles.caption,
    color: colors.text.inverse,
    fontWeight: '600',
  },
});


