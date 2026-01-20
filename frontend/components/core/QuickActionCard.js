// ============================================================================
// QuickActionCard - Individual quick action card (WITH ANIMATIONS)
// ============================================================================

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import GlassCard from './GlassCard';
import { colors } from '../../design/colors';
import { typography } from '../../design/typography';
import { spacing } from '../../design/spacing';
import { usePressScale } from '../../hooks/motion/usePressScale';

/**
 * QuickActionCard - With press scale animation
 */
export default function QuickActionCard({ 
  icon,
  title,
  subtitle,
  onPress,
  style,
  ...props 
}) {
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(0.96);

  return (
    <Animated.View style={[animatedStyle, style]}>
      <GlassCard
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={styles.card}
        {...props}
      >
        <View style={styles.content}>
          {icon && (
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{icon}</Text>
            </View>
          )}
          <Text style={styles.title}>{title}</Text>
          {subtitle && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}
        </View>
      </GlassCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 140,
    minHeight: 120,
  },
  content: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconContainer: {
    marginBottom: spacing.xs,
  },
  icon: {
    fontSize: 32,
  },
  title: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});


