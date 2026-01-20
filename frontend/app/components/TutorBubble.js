import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, withRepeat, interpolateColor } from 'react-native-reanimated';
import { useEffect } from 'react';
import { useTypingIndicatorAnimation } from '../animations/useTypingIndicatorAnimation';
import { useTheme } from '../context/ThemeContext';
import { colors } from '../styles/colors';
import { radius } from '../styles/radius';
import { shadows } from '../styles/shadows';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';
import { useBubbleAppear } from '../hooks/conversationMotion/useBubbleAppear';

export default function TutorBubble({
  message,
  maskedMessage,
  supportLevel,
  grammar,
  showMasked = true,
  isTyping = false,
}) {
  const { colors: themeColors } = useTheme();
  const slideInStyle = useBubbleAppear({ type: 'tutor' });
  const typingStyle = useTypingIndicatorAnimation();
  const leftGlow = useAnimatedStyle(() => {
    const animatedColor = interpolateColor(
      Math.random(), // subtle random hue per render
      [0, 1],
      [colors.mintSoft, colors.blueMain]
    );
    return {
      backgroundColor: animatedColor,
    };
  });
  const [showFull, setShowFull] = useState(false);
  const displayText = showMasked && maskedMessage && supportLevel > 0 ? maskedMessage : message;
  const hasMasking = showMasked && maskedMessage && maskedMessage !== message;

  const supportLevelLabels = {
    0: 'Full Support',
    1: 'Hide Endings',
    2: 'Hide Verbs',
    3: 'Memory Mode',
  };

  const AnimatedView = Animated.createAnimatedComponent(View);
  const AnimatedDot = Animated.createAnimatedComponent(View);

  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: colors.blueMain,
      padding: spacing.m,
      borderRadius: radius.l,
      marginVertical: spacing.s,
      alignSelf: 'flex-start',
      maxWidth: '85%',
      ...shadows.s,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.s,
    },
    name: {
      ...typography.bodySm,
      fontWeight: '600',
      color: colors.white,
    },
    leftAccent: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 4,
      borderRadius: 4,
      opacity: 0.8,
    },
    supportBadge: {
      backgroundColor: colors.mintSoft,
      paddingHorizontal: spacing.s,
      paddingVertical: spacing.xs,
      borderRadius: radius.s,
    },
    supportText: {
      ...typography.micro,
      fontWeight: '600',
      color: themeColors.primary,
    },
    messageContainer: {
      marginBottom: spacing.s,
    },
    messageText: {
      ...typography.body,
      color: colors.white,
      lineHeight: 22,
    },
    typingContainer: {
      flexDirection: 'row',
      gap: spacing.xs,
      paddingVertical: spacing.xs,
    },
    typingDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.white,
    },
    toggleButton: {
      marginTop: spacing.s,
      paddingVertical: spacing.xs,
    },
    toggleText: {
      ...typography.micro,
      color: colors.white + 'DD',
      textDecorationLine: 'underline',
    },
    fullTextContainer: {
      marginTop: spacing.s,
      padding: spacing.s,
      backgroundColor: colors.white + '20',
      borderRadius: radius.s,
      borderLeftWidth: 3,
      borderLeftColor: colors.mintSoft,
    },
    fullTextLabel: {
      ...typography.micro,
      fontWeight: '600',
      color: colors.white + 'DD',
      marginBottom: spacing.xs,
    },
    fullText: {
      ...typography.bodySm,
      color: colors.white,
    },
    grammarContainer: {
      marginTop: spacing.m,
      paddingTop: spacing.m,
      borderTopWidth: 1,
      borderTopColor: colors.white + '30',
    },
    grammarTitle: {
      ...typography.micro,
      fontWeight: '600',
      color: colors.white,
      marginBottom: spacing.s,
    },
    grammarItem: {
      marginBottom: spacing.s,
    },
    grammarError: {
      ...typography.bodySm,
      fontWeight: '600',
      color: colors.white,
      marginBottom: spacing.xs,
    },
    grammarReason: {
      ...typography.micro,
      color: colors.white + 'CC',
      fontStyle: 'italic',
    },
  });

  return (
    <AnimatedView style={[dynamicStyles.container, slideInStyle]}>
      <Animated.View style={[dynamicStyles.leftAccent, leftGlow]} />
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.name}>SuomiTutor</Text>
        {supportLevel !== undefined && supportLevel > 0 && (
          <View style={dynamicStyles.supportBadge}>
            <Text style={dynamicStyles.supportText}>
              Level {supportLevel}: {supportLevelLabels[supportLevel]}
            </Text>
          </View>
        )}
      </View>

      <View style={dynamicStyles.messageContainer}>
        {isTyping ? (
          <View style={dynamicStyles.typingContainer}>
            <AnimatedDot style={[dynamicStyles.typingDot, typingStyle]} />
            <AnimatedDot style={[dynamicStyles.typingDot, typingStyle]} />
            <AnimatedDot style={[dynamicStyles.typingDot, typingStyle]} />
          </View>
        ) : (
          <>
            <Text style={dynamicStyles.messageText}>{displayText}</Text>
            {hasMasking && (
              <TouchableOpacity
                style={dynamicStyles.toggleButton}
                onPress={() => setShowFull(!showFull)}
              >
                <Text style={dynamicStyles.toggleText}>
                  {showFull ? 'Show masked' : 'Show full text'}
                </Text>
              </TouchableOpacity>
            )}
            {showFull && hasMasking && (
              <View style={dynamicStyles.fullTextContainer}>
                <Text style={dynamicStyles.fullTextLabel}>Full text:</Text>
                <Text style={dynamicStyles.fullText}>{message}</Text>
              </View>
            )}
          </>
        )}
      </View>

      {grammar && grammar.mistakes && grammar.mistakes.length > 0 && !isTyping && (
        <View style={dynamicStyles.grammarContainer}>
          <Text style={dynamicStyles.grammarTitle}>Grammar Notes:</Text>
          {grammar.suggestions?.slice(0, 3).map((suggestion, idx) => (
            <View key={idx} style={dynamicStyles.grammarItem}>
              <Text style={dynamicStyles.grammarError}>
                {suggestion.error} → {suggestion.correction}
              </Text>
              <Text style={dynamicStyles.grammarReason}>{suggestion.reason}</Text>
            </View>
          ))}
        </View>
      )}
    </AnimatedView>
  );
}
