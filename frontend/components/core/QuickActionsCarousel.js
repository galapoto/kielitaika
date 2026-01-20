// ============================================================================
// QuickActionsCarousel - Horizontal scrolling action cards (WITH PARALLAX)
// ============================================================================

import React, { useRef } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import Animated, { useSharedValue, useAnimatedScrollHandler, useAnimatedStyle, interpolate } from 'react-native-reanimated';
import { spacing } from '../../design/spacing';
import QuickActionCard from './QuickActionCard';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

/**
 * QuickActionsCarousel - With parallax and snap scrolling
 */
export default function QuickActionsCarousel({ 
  actions = [],
  style,
  ...props 
}) {
  const scrollX = useSharedValue(0);
  const CARD_WIDTH = 140 + spacing.md; // card width + gap

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const renderItem = ({ item, index }) => {
    const inputRange = [
      (index - 1) * CARD_WIDTH,
      index * CARD_WIDTH,
      (index + 1) * CARD_WIDTH,
    ];

    const animatedStyle = useAnimatedStyle(() => {
      const scale = interpolate(
        scrollX.value,
        inputRange,
        [0.9, 1.05, 0.9],
        'clamp'
      );
      
      const opacity = interpolate(
        scrollX.value,
        inputRange,
        [0.6, 1, 0.6],
        'clamp'
      );

      return {
        transform: [{ scale }],
        opacity,
      };
    });

    return (
      <Animated.View style={[styles.cardWrapper, animatedStyle]}>
        <QuickActionCard
          {...item}
          style={index === 0 ? styles.firstItem : styles.item}
        />
      </Animated.View>
    );
  };

  return (
    <AnimatedFlatList
      data={actions}
      renderItem={renderItem}
      keyExtractor={(_, index) => `action-${index}`}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, style]}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      snapToInterval={CARD_WIDTH}
      decelerationRate="fast"
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  cardWrapper: {
    marginRight: spacing.md,
  },
  item: {
    marginRight: spacing.md,
  },
  firstItem: {
    marginLeft: 0,
    marginRight: spacing.md,
  },
});


