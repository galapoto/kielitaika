// ReferralScreen - Main referral screen with code, stats, and rewards
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import Background from '../components/ui/Background';
import HomeButton from '../components/HomeButton';
import PremiumEmbossedButton from '../components/PremiumEmbossedButton';
import ReferralCodeBox from '../components/referral/ReferralCodeBox';
import useReferralStore from '../state/useReferralStore';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';
import { designTokens } from '../styles/designTokens';

// Safe fallbacks for spacing in case of circular dependency issues
const safeSpacing = spacing || designTokens?.spacing || {
  xs: 8, sm: 12, m: 16, md: 16, l: 24, xl: 32, xxl: 40
};
const safeTypography = typography || designTokens?.typography || {};
const safeColors = colors || designTokens?.palette || {};
import { useBounce } from '../animations/useBounce';
import Animated from 'react-native-reanimated';
import { RukaButton, RukaCard } from '../ui';
import { IconLightning, IconShare } from '../ui/icons/IconPack';

export default function ReferralScreen({ navigation }) {
  const {
    referralCode,
    invitesSent,
    invitesAccepted,
    rewards,
    loading,
    error,
    fetchReferralData,
    recordInvite,
    redeemReward,
  } = useReferralStore();

  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const handleShare = async () => {
    if (!referralCode) {
      Alert.alert('Error', 'Referral code not available');
      return;
    }

    setSharing(true);

    try {
      // Create share message
      const shareMessage = `Join me on RUKA - Learn Finnish with AI! Use my referral code: ${referralCode}\n\nDownload the app and start your Finnish journey today! 🇫🇮`;

      const result = await Share.share({
        message: shareMessage,
        title: 'Join RUKA',
      });

      if (result.action === Share.sharedAction) {
        // Record invite if email/contact was shared
        try {
          await recordInvite(referralCode);
        } catch (error) {
          console.error('Error recording invite:', error);
        }
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share referral code');
    } finally {
      setSharing(false);
    }
  };

  const handleRedeem = async (rewardId) => {
    try {
      await redeemReward(rewardId);
      Alert.alert('Success!', 'Reward redeemed successfully');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to redeem reward');
    }
  };

  const bounceStyle = useBounce();

  if (loading && !referralCode) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading referral info...</Text>
        </View>
      </View>
    );
  }

  return (
    <Background module="home" variant="brown">
      <View style={styles.container}>
        <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Invite Friends</Text>
        <Text style={styles.subtitle}>
          Share RUKA with friends and earn rewards!
        </Text>

        {/* Referral Code Box */}
        <ReferralCodeBox code={referralCode} />

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Animated.View style={[styles.statBox, bounceStyle]}>
            <Text style={styles.statValue}>{invitesSent || 0}</Text>
            <Text style={styles.statLabel}>Invites Sent</Text>
          </Animated.View>
          <Animated.View style={[styles.statBox, bounceStyle]}>
            <Text style={styles.statValue}>{invitesAccepted || 0}</Text>
            <Text style={styles.statLabel}>Friends Joined</Text>
          </Animated.View>
        </View>

        {/* Share Button */}
        <RukaButton
          title={sharing ? 'Sharing...' : 'Share with Friends'}
          onPress={handleShare}
          icon={IconShare}
          disabled={sharing || !referralCode}
          style={{ marginTop: safeSpacing?.md || safeSpacing?.m || 16 }}
        />

        {/* Rewards Section */}
        {rewards && rewards.length > 0 && (
          <View style={styles.rewardsSection}>
            <Text style={styles.sectionTitle}>Your Rewards</Text>
            {rewards.map((reward, index) => (
              <RukaCard
                key={reward.id}
                title={reward.title || 'Reward'}
                subtitle={reward.description}
                icon={IconLightning}
                onPress={() => handleRedeem(reward.id)}
                style={{ width: '100%' }}
              />
            ))}
          </View>
        )}

        {/* How It Works */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          {[
            'Share your referral code with friends',
            'They sign up using your code',
            'You both get Premium days! 🎉',
          ].map((text, idx) => (
            <RukaCard
              key={idx}
              title={`Step ${idx + 1}`}
              subtitle={text}
              icon={IconLightning}
              style={{ width: '100%' }}
            />
          ))}
        </View>

        {/* Rewards Info */}
        <View style={styles.rewardsInfo}>
          <Text style={styles.rewardsInfoTitle}>Rewards</Text>
          <Text style={styles.rewardsInfoText}>
            • You get: 3 days Premium per friend
          </Text>
          <Text style={styles.rewardsInfoText}>
            • Your friend gets: 2 days Premium
          </Text>
          <Text style={styles.rewardsInfoText}>
            • Max 3 rewarded invites per month
          </Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        </ScrollView>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: safeSpacing?.l || 24,
    paddingBottom: safeSpacing?.xl || 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...(safeTypography?.body || {}),
    color: safeColors?.textSoft || safeColors?.textMuted || '#CBD5F5',
  },
  title: {
    ...(safeTypography?.titleXL || {}),
    fontWeight: '700',
    color: safeColors?.textPrimary || '#F8F9FA',
    marginBottom: safeSpacing?.xs || 8,
  },
  subtitle: {
    ...(safeTypography?.body || {}),
    color: safeColors?.textMuted || 'rgba(248,249,250,0.6)',
    marginBottom: safeSpacing?.l || 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: safeSpacing?.l || 24,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: safeColors?.backgroundTertiary || '#F8F9FA',
    borderRadius: 16,
    padding: safeSpacing?.l || 24,
    minWidth: 120,
    ...shadows.m,
  },
  statValue: {
    ...(safeTypography?.titleL || {}),
    fontWeight: '700',
    color: safeColors?.accentPrimary || '#4ECDC4',
    marginBottom: safeSpacing?.xs || 8,
  },
  statLabel: {
    ...(safeTypography?.bodySm || {}),
    color: safeColors?.textMuted || 'rgba(248,249,250,0.6)',
  },
  shareButton: {
    backgroundColor: safeColors?.accentPrimary || '#4ECDC4',
    borderRadius: 16,
    padding: safeSpacing?.l || 24,
    alignItems: 'center',
    marginVertical: safeSpacing?.l || 24,
    ...shadows.l,
  },
  shareButtonDisabled: {
    opacity: 0.6,
  },
  shareButtonText: {
    ...(safeTypography?.body || {}),
    fontWeight: '600',
    color: safeColors?.textPrimary || '#F8F9FA',
    fontSize: 18,
  },
  rewardsSection: {
    marginTop: safeSpacing?.xl || 32,
  },
  sectionTitle: {
    ...(safeTypography?.titleL || {}),
    fontWeight: '600',
    color: safeColors?.textPrimary || '#F8F9FA',
    marginBottom: safeSpacing?.m || safeSpacing?.md || 16,
  },
  infoSection: {
    marginTop: safeSpacing?.xl || 32,
    backgroundColor: safeColors?.backgroundTertiary || '#F8F9FA',
    borderRadius: 16,
    padding: safeSpacing?.l || 24,
    ...shadows.m,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: safeSpacing?.s || safeSpacing?.sm || 12,
  },
  infoNumber: {
    ...(safeTypography?.titleL || {}),
    fontWeight: '700',
    color: safeColors?.accentPrimary || '#4ECDC4',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: (safeColors?.accentPrimary || '#4ECDC4') + '20',
    textAlign: 'center',
    lineHeight: 32,
    marginRight: safeSpacing?.m || safeSpacing?.md || 16,
  },
  infoText: {
    ...(safeTypography?.body || {}),
    color: safeColors?.textPrimary || '#F8F9FA',
    flex: 1,
  },
  rewardsInfo: {
    marginTop: safeSpacing?.l || 24,
    backgroundColor: (safeColors?.accentPrimary || '#4ECDC4') + '15',
    borderRadius: 16,
    padding: safeSpacing?.l || 24,
  },
  rewardsInfoTitle: {
    ...(safeTypography?.body || {}),
    fontWeight: '600',
    color: safeColors?.textPrimary || '#F8F9FA',
    marginBottom: safeSpacing?.s || safeSpacing?.sm || 12,
  },
  rewardsInfoText: {
    ...(safeTypography?.bodySm || {}),
    color: safeColors?.textMuted || 'rgba(248,249,250,0.6)',
    marginVertical: safeSpacing?.xs || 8,
  },
  errorContainer: {
    backgroundColor: (safeColors?.error || '#EF4444') + '20',
    borderRadius: 12,
    padding: safeSpacing?.m || safeSpacing?.md || 16,
    marginTop: safeSpacing?.l || 24,
  },
  errorText: {
    ...(safeTypography?.bodySm || {}),
    color: safeColors?.error || '#EF4444',
  },
});
