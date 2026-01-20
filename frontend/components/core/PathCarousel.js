// ============================================================================
// PathCarousel - Learning path carousel
// ============================================================================

import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { colors } from '../../design/colors';
import { typography } from '../../design/typography';
import { spacing } from '../../design/spacing';
import PathCard from './PathCard';

/**
 * PathCarousel
 * 
 * TODO: Codex to implement:
 * - Horizontal scroll with snap
 * - Card scale on focus
 * - Progress indicators
 * - Swipe gestures
 */
export default function PathCarousel({ 
  paths = [],
  title,
  style,
  ...props 
}) {
  return (
    <View style={[styles.container, style]} {...props}>
      {title && (
        <Text style={styles.title}>{title}</Text>
      )}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {paths.map((path, index) => (
          <PathCard
            key={path.id || index}
            {...path}
            style={index === 0 ? styles.firstItem : styles.item}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.lg,
  },
  title: {
    ...typography.styles.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  item: {
    marginRight: spacing.md,
  },
  firstItem: {
    marginLeft: 0,
    marginRight: spacing.md,
  },
});


