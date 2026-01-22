// ReferralRewardCard - Displays a referral reward with redeem button
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, withDelay, withSequence } from 'react-native-reanimated';
import { useBounce } from '../../animations/useBounce';
import { useFadeIn } from '../../animations/useFadeIn';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';
import { radius } from '../../styles/radius';
import { shadows } from '../../styles/shadows';

const REWARD_ICONS = {
  premium_days: '⭐',
  xp: '✨',
  trophy: '🏆',
};

export default function ReferralRewardCard({ reward, onRedeem, index = 0 }) {
  const fadeInStyle = useFadeIn(index * 100);
  const bounceStyle = useBounce();

  const handleRedeem = () => {
    if (onRedeem && !reward.redeemed) {
      onRedeem(reward.id);
    }
  };

  const icon = REWARD_ICONS[reward.type] || '🎁';

  return (
    <Animated.View style={[styles.container, fadeInStyle, bounceStyle]}>
      <View style={styles.content}>
        <Text style={styles.icon}>{icon}</Text>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{reward.description}</Text>
          <Text style={styles.value}>
            {reward.type === 'premium_days' && `${reward.value} days`}
            {reward.type === 'xp' && `+${reward.value} XP`}
            {reward.type === 'trophy' && 'Trophy Unlocked'}
          </Text>
        </View>
      </View>
      
      {!reward.redeemed && (
        <TouchableOpacity
          style={styles.redeemButton}
          onPress={handleRedeem}
          activeOpacity={0.7}
        >
          <Text style={styles.redeemText}>Redeem</Text>
        </TouchableOpacity>
      )}
      
      {reward.redeemed && (
        <View style={styles.redeemedBadge}>
          <Text style={styles.redeemedText}>✓ Redeemed</Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.l,
    marginVertical: spacing.s,
    ...shadows.m,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 32,
    marginRight: spacing.m,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: spacing.xs,
  },
  value: {
    ...typography.bodySm,
    color: colors.accent.mint,
    fontWeight: '600',
  },
  redeemButton: {
    backgroundColor: colors.accent.mint,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    borderRadius: radius.md,
    marginLeft: spacing.m,
  },
  redeemText: {
    ...typography.bodySm,
    fontWeight: '600',
    color: colors.white,
  },
  redeemedBadge: {
    backgroundColor: colors.grayLight,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    borderRadius: radius.md,
    marginLeft: spacing.m,
  },
  redeemedText: {
    ...typography.bodySm,
    fontWeight: '600',
    color: colors.textSoft,
  },
});

