import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { radius } from '../styles/radius';

/**
 * Shimmer effect for skeleton loading
 */
function Shimmer({ style }) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, [shimmer]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(shimmer.value, [0, 0.5, 1], [0.3, 0.7, 0.3]),
    };
  });

  return (
    <Animated.View style={[styles.shimmer, style, animatedStyle]} />
  );
}

/**
 * Skeleton line component
 */
export function SkeletonLine({ width = '100%', height = 16, style }) {
  return (
    <View style={[styles.skeletonLine, { width, height }, style]}>
      <Shimmer style={StyleSheet.absoluteFill} />
    </View>
  );
}

/**
 * Skeleton circle component
 */
export function SkeletonCircle({ size = 40, style }) {
  return (
    <View style={[styles.skeletonCircle, { width: size, height: size, borderRadius: size / 2 }, style]}>
      <Shimmer style={StyleSheet.absoluteFill} />
    </View>
  );
}

/**
 * Skeleton rectangle component
 */
export function SkeletonRect({ width = '100%', height = 100, borderRadius = radius.m, style }) {
  return (
    <View style={[styles.skeletonRect, { width, height, borderRadius }, style]}>
      <Shimmer style={StyleSheet.absoluteFill} />
    </View>
  );
}

/**
 * Skeleton card component - matches common card layout
 */
export function SkeletonCard({ style }) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.cardHeader}>
        <SkeletonCircle size={40} />
        <View style={styles.cardHeaderText}>
          <SkeletonLine width="60%" height={16} />
          <SkeletonLine width="40%" height={12} style={{ marginTop: spacing.xs }} />
        </View>
      </View>
      <SkeletonRect height={120} style={{ marginTop: spacing.m }} />
      <SkeletonLine width="80%" height={14} style={{ marginTop: spacing.m }} />
      <SkeletonLine width="100%" height={14} style={{ marginTop: spacing.xs }} />
    </View>
  );
}

/**
 * Skeleton message bubble (for conversation screen)
 */
export function SkeletonBubble({ isUser = false, style }) {
  return (
    <View
      style={[
        styles.bubble,
        isUser ? styles.userBubble : styles.tutorBubble,
        style,
      ]}
    >
      <SkeletonLine width="70%" height={16} />
      <SkeletonLine width="50%" height={16} style={{ marginTop: spacing.xs }} />
    </View>
  );
}

/**
 * Skeleton list item
 */
export function SkeletonListItem({ style }) {
  return (
    <View style={[styles.listItem, style]}>
      <SkeletonCircle size={48} />
      <View style={styles.listItemContent}>
        <SkeletonLine width="70%" height={16} />
        <SkeletonLine width="50%" height={12} style={{ marginTop: spacing.xs }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shimmer: {
    backgroundColor: colors.surface,
    borderRadius: radius.s,
  },
  skeletonLine: {
    backgroundColor: colors.surface,
    borderRadius: radius.s,
    overflow: 'hidden',
  },
  skeletonCircle: {
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  skeletonRect: {
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.l,
    padding: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
  },
  cardHeaderText: {
    flex: 1,
  },
  bubble: {
    padding: spacing.m,
    borderRadius: radius.l,
    maxWidth: '85%',
    marginVertical: spacing.xs,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.surface,
  },
  tutorBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    gap: spacing.m,
    backgroundColor: colors.surface,
    borderRadius: radius.m,
    marginBottom: spacing.s,
  },
  listItemContent: {
    flex: 1,
  },
});

export default {
  SkeletonLine,
  SkeletonCircle,
  SkeletonRect,
  SkeletonCard,
  SkeletonBubble,
  SkeletonListItem,
};






























