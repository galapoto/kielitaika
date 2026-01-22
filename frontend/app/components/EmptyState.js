import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';
import { radius } from '../styles/radius';
import RukaButton from '../ui/components/Button';

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedText = Animated.createAnimatedComponent(Text);

/**
 * EmptyState - Beautiful empty state component with illustrations and CTAs
 */
export default function EmptyState({
  emoji = '📭',
  title,
  message,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  illustration,
  style,
}) {
  return (
    <AnimatedView 
      style={[styles.container, style]}
      entering={FadeInDown.duration(600)}
    >
      {illustration ? (
        <AnimatedView entering={FadeInUp.duration(800).delay(100)}>
          {illustration}
        </AnimatedView>
      ) : (
        <AnimatedText 
          style={styles.emoji}
          entering={FadeInUp.duration(800).delay(100)}
        >
          {emoji}
        </AnimatedText>
      )}
      
      <AnimatedText 
        style={styles.title}
        entering={FadeInDown.duration(600).delay(200)}
      >
        {title}
      </AnimatedText>
      
      {message && (
        <AnimatedText 
          style={styles.message}
          entering={FadeInDown.duration(600).delay(300)}
        >
          {message}
        </AnimatedText>
      )}
      
      {(actionLabel || secondaryActionLabel) && (
        <AnimatedView 
          style={styles.actions}
          entering={FadeInUp.duration(600).delay(400)}
        >
          {actionLabel && onAction && (
            <RukaButton
              title={actionLabel}
              onPress={onAction}
              accessibilityLabel={actionLabel}
              style={styles.actionButton}
            />
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <RukaButton
              title={secondaryActionLabel}
              onPress={onSecondaryAction}
              variant="secondary"
              accessibilityLabel={secondaryActionLabel}
              style={styles.actionButton}
            />
          )}
        </AnimatedView>
      )}
    </AnimatedView>
  );
}

/**
 * Pre-configured empty states for common scenarios
 */

export function EmptyConversation({ onStartConversation }) {
  return (
    <EmptyState
      emoji="💬"
      title="Start Your First Conversation"
      message="Practice your Finnish with our AI tutor. Just hold the mic and start speaking!"
      actionLabel="Start Conversation"
      onAction={onStartConversation}
    />
  );
}

export function EmptyVocabulary({ onBrowseVocabulary }) {
  return (
    <EmptyState
      emoji="📚"
      title="No Vocabulary Yet"
      message="Start learning Finnish words and phrases. Build your vocabulary step by step."
      actionLabel="Browse Vocabulary"
      onAction={onBrowseVocabulary}
    />
  );
}

export function EmptyProgress({ onStartLearning }) {
  return (
    <EmptyState
      emoji="📊"
      title="Track Your Progress"
      message="Complete lessons and exercises to see your learning journey here."
      actionLabel="Start Learning"
      onAction={onStartLearning}
    />
  );
}

export function EmptySearch({ searchQuery }) {
  return (
    <EmptyState
      emoji="🔍"
      title="No Results Found"
      message={`We couldn't find anything matching "${searchQuery}". Try different keywords.`}
    />
  );
}

export function EmptyNotifications() {
  return (
    <EmptyState
      emoji="🔔"
      title="No Notifications"
      message="You're all caught up! We'll notify you about important updates and reminders."
    />
  );
}

export function EmptyError({ onRetry, errorMessage }) {
  return (
    <EmptyState
      emoji="⚠️"
      title="Something Went Wrong"
      message={errorMessage || "We couldn't load this content. Please check your connection and try again."}
      actionLabel="Try Again"
      onAction={onRetry}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    minHeight: 300,
  },
  emoji: {
    fontSize: 80,
    marginBottom: spacing.l,
  },
  title: {
    ...typography.titleXL,
    color: colors.textMain,
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
    maxWidth: 400,
  },
  actions: {
    width: '100%',
    maxWidth: 300,
    gap: spacing.m,
  },
  actionButton: {
    width: '100%',
  },
});






























