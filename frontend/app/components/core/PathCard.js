// ============================================================================
// PathCard - Individual learning path card
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GlassCard from './GlassCard';
import { colors } from '../../design/colors';
import { typography } from '../../design/typography';
import { spacing } from '../../design/spacing';
import ProgressRing from './ProgressRing';

/**
 * PathCard - Enhanced with animations, card lift, gradient border, and badges
 */
import { useState } from 'react';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const AnimatedView = Animated.createAnimatedComponent(View);

export default function PathCard({ 
  title,
  description,
  progress = 0,
  icon,
  iconComponent: IconComponent,
  onPress,
  active = false,
  badges = [],
  style,
  ...props 
}) {
  const scale = useSharedValue(1);
  const [pressed, setPressed] = useState(false);

  const handlePressIn = () => {
    setPressed(true);
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    setPressed(false);
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedView style={[animatedStyle]}>
      <GlassCard
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.card, 
          active && styles.cardActive,
          pressed && styles.cardPressed,
          style,
        ]}
        {...props}
      >
        {active && (
          <LinearGradient
            colors={['#3B82F6', '#1E40AF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBorder}
          />
        )}
        <View style={styles.content}>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          {!icon && IconComponent && <IconComponent size={32} stroke={colors.accent?.mint || '#AEE2FF'} />}
          <Text style={styles.title}>{title}</Text>
          {description && (
            <Text style={styles.description} numberOfLines={2}>
              {description}
            </Text>
          )}
          {badges.length > 0 && (
            <View style={styles.badgesContainer}>
              {badges.map((badge, index) => (
                <View key={index} style={styles.badge}>
                  <Text style={styles.badgeText}>{badge}</Text>
                </View>
              ))}
            </View>
          )}
          <View style={styles.progressContainer}>
            <ProgressRing
              progress={progress}
              size={60}
              strokeWidth={4}
              showLabel={false}
            />
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          </View>
        </View>
      </GlassCard>
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200,
    minHeight: 220,
    overflow: 'hidden',
  },
  cardActive: {
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  cardPressed: {
    opacity: 0.9,
  },
  gradientBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  content: {
    alignItems: 'center',
    gap: spacing.sm || 8,
    padding: spacing.md || 16,
  },
  icon: {
    fontSize: 40,
    marginBottom: spacing.xs || 8,
  },
  title: {
    ...(typography?.styles?.h4 || { fontSize: 16, fontWeight: '600' }),
    color: colors.text?.primary || '#000000',
    textAlign: 'center',
  },
  description: {
    ...(typography?.styles?.caption || { fontSize: 12 }),
    color: colors.text?.secondary || '#6B7280',
    textAlign: 'center',
    marginBottom: spacing.xs || 8,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs || 8,
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  progressContainer: {
    marginTop: spacing.md || 16,
    alignItems: 'center',
    gap: spacing.xs || 8,
  },
  progressText: {
    ...(typography?.styles?.small || { fontSize: 12 }),
    color: colors.text?.tertiary || '#9CA3AF',
    fontWeight: '600',
  },
});




