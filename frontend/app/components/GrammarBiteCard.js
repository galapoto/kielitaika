import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSlideIn } from '../animations/useSlideIn';
import { useFadeIn } from '../animations/useFadeIn';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { radius } from '../styles/radius';
import { shadows } from '../styles/shadows';

export default function GrammarBiteCard({ title, meaning, examples = [] }) {
  const slideStyle = useSlideIn();
  const fadeStyle = useFadeIn();
  const AnimatedView = Animated.createAnimatedComponent(View);

  return (
    <AnimatedView style={[styles.card, slideStyle, fadeStyle]}>
      <Text style={styles.title}>{title}</Text>
      {meaning ? <Text style={styles.meaning}>{meaning}</Text> : null}
      {examples && examples.length > 0 && (
        <View style={styles.examples}>
          {examples.map((ex, idx) => (
            <Text key={idx} style={styles.example}>• {ex}</Text>
          ))}
        </View>
      )}
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.blueLight,
    borderRadius: radius.l,
    padding: spacing.m,
    ...shadows.s,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: spacing.xs,
  },
  meaning: {
    fontSize: 14,
    color: colors.textSoft,
    marginBottom: spacing.s,
  },
  examples: {
    gap: spacing.xs,
  },
  example: {
    fontSize: 14,
    color: colors.textMain,
  },
});





