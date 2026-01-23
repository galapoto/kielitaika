import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { typography } from '../../styles/typography';

interface DebugEntry {
  label: string;
  value: string;
  accent?: boolean;
}

interface SpeakingDebugPanelProps {
  entries: DebugEntry[];
  visible?: boolean;
}

export default function SpeakingDebugPanel({ entries, visible = true }: SpeakingDebugPanelProps) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <Text style={styles.title}>Speaking Debug</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {entries.map((entry) => (
          <View key={entry.label} style={styles.entry}>
            <Text style={[styles.label, entry.accent && styles.accent]}>{entry.label}</Text>
            <Text style={styles.value}>{entry.value}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: spacing.s12,
    left: spacing.s12,
    right: spacing.s12,
    padding: spacing.s10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    zIndex: 1100,
  },
  title: {
    color: colors.white,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    marginBottom: spacing.s6,
  },
  scroll: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entry: {
    marginRight: spacing.s12,
  },
  label: {
    color: colors.gray200,
    fontSize: typography.small.fontSize,
  },
  value: {
    color: colors.white,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  accent: {
    color: colors.rose,
  },
});
