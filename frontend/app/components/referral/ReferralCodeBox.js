// ReferralCodeBox - Displays referral code with copy functionality
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
// Clipboard import with fallback
let Clipboard;
try {
  Clipboard = require('expo-clipboard');
} catch (e) {
  // Fallback for web/development
  Clipboard = {
    setStringAsync: async (text) => {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
    },
  };
}
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming } from 'react-native-reanimated';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';
import { radius } from '../../styles/radius';
import { shadows } from '../../styles/shadows';
import { useGlowPulse } from '../../animations/useGlowPulse';

export default function ReferralCodeBox({ code }) {
  const [copied, setCopied] = useState(false);
  const scale = useSharedValue(1);
  const glowStyle = useGlowPulse();

  const handleCopy = async () => {
    if (!code) return;

    try {
      await Clipboard.setStringAsync(code);
      setCopied(true);
      
      // Animate scale
      scale.value = withSequence(
        withTiming(1.05, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
      
      Alert.alert('Copied!', 'Referral code copied to clipboard');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      Alert.alert('Error', 'Failed to copy code');
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!code) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading referral code...</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, glowStyle, animatedStyle]}>
      <TouchableOpacity
        style={styles.touchable}
        onPress={handleCopy}
        activeOpacity={0.8}
      >
        <View style={styles.codeContainer}>
          <Text style={styles.label}>Your Referral Code</Text>
          <Text style={styles.code}>{code}</Text>
          <Text style={styles.hint}>
            {copied ? '✓ Copied!' : 'Tap to copy'}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.accent.mint,
    borderRadius: radius.xl,
    padding: spacing.l,
    ...shadows.deep,
    marginVertical: spacing.m,
  },
  touchable: {
    width: '100%',
  },
  codeContainer: {
    alignItems: 'center',
  },
  label: {
    ...typography.bodySm,
    color: colors.textSoft,
    marginBottom: spacing.xs,
  },
  code: {
    ...typography.titleL,
    fontWeight: '700',
    color: colors.textMain,
    letterSpacing: 2,
    marginVertical: spacing.s,
  },
  hint: {
    ...typography.bodySm,
    color: colors.textSoft,
    marginTop: spacing.xs,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSoft,
    textAlign: 'center',
  },
});

