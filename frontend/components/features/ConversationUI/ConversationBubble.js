// ============================================================================
// ConversationBubble - Base conversation bubble component
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GlassCard from '../../core/GlassCard';
import { colors } from '../../../design/colors';
import { typography } from '../../../design/typography';
import { spacing } from '../../../design/spacing';

/**
 * ConversationBubble
 * 
 * TODO: Codex to implement:
 * - Slide-in animation
 * - Typing indicator animation
 * - Bubble tail/triangle
 * - Read receipts
 */
export default function ConversationBubble({ 
  message,
  isUser = false,
  timestamp,
  style,
  ...props 
}) {
  return (
    <View
      style={[
        styles.container,
        isUser && styles.userContainer,
        style,
      ]}
      {...props}
    >
      <GlassCard style={styles.bubble}>
        <Text style={styles.text}>{message}</Text>
        {timestamp && (
          <Text style={styles.timestamp}>{timestamp}</Text>
        )}
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    maxWidth: '80%',
    marginBottom: spacing.md,
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  bubble: {
    padding: spacing.md,
  },
  text: {
    ...typography.styles.body,
    color: colors.text.primary,
  },
  timestamp: {
    ...typography.styles.small,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
});


