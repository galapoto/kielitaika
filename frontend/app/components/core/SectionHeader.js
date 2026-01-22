// ============================================================================
// SectionHeader - Section title component
// ============================================================================

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { designTokens } from '../../app/styles/designTokens';

/**
 * SectionHeader - Enhanced with animated underline, badge, and action animations
 */

const AnimatedView = Animated.createAnimatedComponent(View);

export default function SectionHeader({ 
  title,
  subtitle,
  action,
  actionLabel,
  onActionPress,
  badge,
  showUnderline = false,
  style,
  ...props 
}) {
  const underlineWidth = useSharedValue(0);

  useEffect(() => {
    if (showUnderline) {
      underlineWidth.value = withTiming(100, { duration: 500 });
    }
  }, [showUnderline]);

  const underlineStyle = useAnimatedStyle(() => ({
    width: `${underlineWidth.value}%`,
  }));

  return (
    <View style={[styles.container, style]} {...props}>
      <View style={styles.textContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{title}</Text>
          {badge !== undefined && badge !== null && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>
        {subtitle && (
          <Text style={styles.subtitle}>{subtitle}</Text>
        )}
        {showUnderline && (
          <AnimatedView style={[styles.underline, underlineStyle]} />
        )}
      </View>
      {action && (
        <TouchableOpacity 
          onPress={onActionPress} 
          style={styles.action}
          activeOpacity={0.7}
        >
          <Text style={styles.actionLabel}>{actionLabel || 'See All'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg || 20,
    marginBottom: spacing.md || 16,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm || 8,
  },
  title: {
    fontFamily: designTokens.fontFamily,
    fontSize: designTokens.fontSize.medium,
    fontWeight: designTokens.fontWeight.bold,
    color: designTokens.textColor.primary,
  },
  badge: {
    backgroundColor: designTokens.textColor.accent,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: designTokens.fontSize.small,
    fontWeight: designTokens.fontWeight.bold,
    fontFamily: designTokens.fontFamily,
  },
  subtitle: {
    fontFamily: designTokens.fontFamily,
    fontSize: designTokens.fontSize.small,
    color: designTokens.textColor.secondary,
    marginTop: spacing.xs || 8,
    lineHeight: designTokens.lineHeight * designTokens.fontSize.small,
  },
  underline: {
    height: 2,
    backgroundColor: designTokens.textColor.accent,
    marginTop: spacing.xs || 8,
    borderRadius: 1,
  },
  action: {
    paddingVertical: spacing.xs || 8,
    paddingHorizontal: spacing.md || 16,
  },
  actionLabel: {
    fontFamily: designTokens.fontFamily,
    fontSize: designTokens.fontSize.small,
    fontWeight: designTokens.fontWeight.bold,
    color: designTokens.textColor.accent,
  },
});




