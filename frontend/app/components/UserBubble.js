import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { radius } from '../styles/radius';
import { shadows } from '../styles/shadows';
import { useBubbleAppear } from '../hooks/conversationMotion/useBubbleAppear';

export default function UserBubble({ text }) {
  const animatedStyle = useBubbleAppear({ type: 'user' });

  const AnimatedView = Animated.createAnimatedComponent(View);
  return (
    <AnimatedView style={[styles.container, animatedStyle]}>
      <Text style={styles.text}>{text}</Text>
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-end',
    backgroundColor: colors.white,
    borderRadius: radius.l,
    padding: spacing.m,
    maxWidth: '85%',
    borderWidth: 1,
    borderColor: colors.grayLine,
    ...shadows.s,
    marginVertical: spacing.xs,
  },
  text: {
    fontSize: 16,
    color: colors.textMain,
  },
});

