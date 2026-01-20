// ============================================================================
// CertificateBadge - Small certificate badge indicator
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../../design/colors';
import { spacing } from '../../../design/spacing';

/**
 * CertificateBadge
 * 
 * TODO: Codex to implement:
 * - Pulse animation
 * - Glow effect
 * - Tooltip on hover (web)
 */
export default function CertificateBadge({ 
  count = 0,
  style,
  ...props 
}) {
  if (count === 0) return null;

  return (
    <View style={[styles.container, style]} {...props}>
      <Text style={styles.icon}>🏆</Text>
      {count > 1 && (
        <View style={styles.countBadge}>
          <Text style={styles.count}>{count}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  icon: {
    fontSize: 24,
  },
  countBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accent.mint,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  count: {
    color: colors.text.inverse,
    fontSize: 10,
    fontWeight: '700',
  },
});


