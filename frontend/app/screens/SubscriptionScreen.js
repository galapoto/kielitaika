import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView, Linking } from 'react-native';
import { fetchSubscriptionStatus, upgradeSubscription, createCheckoutSession, createPortalSession } from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import AnimatedCTA from '../components/AnimatedCTA';
import { colors } from '../styles/colors';
import { radius } from '../styles/radius';
import { shadows } from '../styles/shadows';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';

export default function SubscriptionScreen({ navigation }) {
  const { colors: themeColors } = useTheme();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchSubscriptionStatus();
      setStatus(res);
    } catch (err) {
      setError(err.message || 'Failed to load subscription status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleUpgrade = async (tier) => {
    try {
      setLoading(true);
      
      // Create Stripe checkout session
      const checkout = await createCheckoutSession(tier, 0);
      
      if (checkout.checkout_url || checkout.url) {
        // Open Stripe checkout in browser/webview
        const url = checkout.checkout_url || checkout.url;
        const canOpen = await Linking.canOpenURL(url);
        
        if (canOpen) {
          await Linking.openURL(url);
          Alert.alert(
            'Redirecting to Payment',
            'You will be redirected to complete your payment. Return to the app after payment.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert('Error', 'Cannot open payment page. Please try again.');
        }
      } else {
        // Fallback to direct upgrade (for testing without Stripe)
        const res = await upgradeSubscription(tier);
        setStatus(res);
        Alert.alert('Success', `Upgraded to ${tier}`);
      }
    } catch (err) {
      Alert.alert('Upgrade failed', err.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setLoading(true);
      const portal = await createPortalSession();
      
      if (portal.url) {
        const canOpen = await Linking.canOpenURL(portal.url);
        if (canOpen) {
          await Linking.openURL(portal.url);
        } else {
          Alert.alert('Error', 'Cannot open subscription management page.');
        }
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to open subscription management');
    } finally {
      setLoading(false);
    }
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    header: {
      padding: spacing.l,
      backgroundColor: themeColors.surface,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
    },
    title: {
      ...typography.titleXL,
      color: themeColors.primary,
      marginBottom: spacing.xs,
    },
    subtitle: {
      ...typography.bodySm,
      color: themeColors.textSecondary,
    },
    content: {
      padding: spacing.l,
      gap: spacing.l,
    },
    statusCard: {
      backgroundColor: themeColors.surface,
      padding: spacing.l,
      borderRadius: radius.l,
      borderWidth: 1,
      borderColor: themeColors.border,
      ...shadows.s,
    },
    statusLabel: {
      ...typography.bodySm,
      color: themeColors.textSecondary,
      marginBottom: spacing.xs,
    },
    statusValue: {
      ...typography.body,
      fontWeight: '600',
      color: themeColors.primary,
      marginBottom: spacing.m,
    },
    tierCard: {
      backgroundColor: themeColors.surface,
      padding: spacing.l,
      borderRadius: radius.l,
      borderWidth: 2,
      borderColor: themeColors.border,
      ...shadows.m,
    },
    tierCardPremium: {
      backgroundColor: themeColors.primary,
      borderColor: themeColors.primary,
    },
    tierTitle: {
      ...typography.titleL,
      color: themeColors.text,
      marginBottom: spacing.s,
    },
    tierTitlePremium: {
      color: colors.white,
    },
    tierDescription: {
      ...typography.body,
      color: themeColors.textSecondary,
      marginBottom: spacing.m,
      lineHeight: 22,
    },
    tierDescriptionPremium: {
      color: colors.white + 'DD',
    },
    featuresList: {
      marginBottom: spacing.l,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.s,
    },
    featureIcon: {
      marginRight: spacing.s,
      fontSize: 16,
    },
    featureText: {
      ...typography.bodySm,
      color: themeColors.text,
    },
    featureTextPremium: {
      color: colors.white,
    },
    error: {
      ...typography.body,
      color: '#EF4444',
      padding: spacing.m,
      textAlign: 'center',
    },
    primaryButton: {
      backgroundColor: themeColors.primary,
      paddingVertical: spacing.m,
      paddingHorizontal: spacing.l,
      borderRadius: radius.l,
      alignItems: 'center',
      ...shadows.s,
    },
    primaryButtonText: {
      ...typography.body,
      color: colors.white,
      fontWeight: '700',
    },
  });

  const tiers = [
    {
      id: 'general_premium',
      title: 'General Premium',
      description: 'Unlimited General Finnish',
      features: [
        '✓ Unlimited conversations',
        '✓ Full grammar correction',
        '✓ Personalization',
        '✓ Analytics',
        '✓ Vocabulary unlimited',
      ],
      isPremium: false,
    },
    {
      id: 'professional_premium',
      title: 'Professional Premium',
      description: 'Unlock Töihin + YKI + Reports',
      features: [
        '✓ Everything in General Premium',
        '✓ Unlimited Workplace Finnish',
        '✓ Unlimited YKI practice',
        '✓ Professional reports',
        '✓ Certificates',
      ],
      isPremium: true,
    },
  ];

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.title}>💎 Subscription</Text>
        <Text style={dynamicStyles.subtitle}>Manage access to General, Töihin, and YKI</Text>
      </View>

      <ScrollView contentContainerStyle={dynamicStyles.content}>
        {loading && !status && (
          <View style={[dynamicStyles.statusCard, { alignItems: 'center', padding: spacing.xl }]}>
            <ActivityIndicator color={themeColors.primary} size="large" />
            <Text style={[dynamicStyles.statusLabel, { marginTop: spacing.m }]}>Loading...</Text>
          </View>
        )}

        {error && <Text style={dynamicStyles.error}>{error}</Text>}

        {status && (
          <View style={dynamicStyles.statusCard}>
            <Text style={dynamicStyles.statusLabel}>Current Tier:</Text>
            <Text style={dynamicStyles.statusValue}>
              {status.tier === 'free' ? 'Free' : status.tier === 'general_premium' ? 'General Premium' : 'Professional Premium'}
            </Text>
            {status.is_trial && (
              <>
                <Text style={dynamicStyles.statusLabel}>Trial Period:</Text>
                <Text style={dynamicStyles.statusValue}>Active</Text>
              </>
            )}
            {status.tier !== 'free' && (
              <TouchableOpacity
                style={[dynamicStyles.primaryButton, { marginTop: spacing.m }]}
                onPress={handleManageSubscription}
                disabled={loading}
              >
                <Text style={dynamicStyles.primaryButtonText}>Manage Subscription</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {tiers.map((tier) => {
          const isCurrentTier = status?.tier === tier.id;
          const isUpgradeable = !isCurrentTier && status?.tier !== 'professional_premium';

          return (
            <View
              key={tier.id}
              style={[
                dynamicStyles.tierCard,
                tier.isPremium && dynamicStyles.tierCardPremium,
                isCurrentTier && { borderColor: colors.mintSoft, borderWidth: 3 },
              ]}
            >
              {tier.isPremium && (
                <View style={{ position: 'absolute', top: spacing.m, right: spacing.m }}>
                  <Text style={{ color: colors.yellowWarm, fontWeight: '700', fontSize: 12 }}>⭐ RECOMMENDED</Text>
                </View>
              )}

              <Text
                style={[
                  dynamicStyles.tierTitle,
                  tier.isPremium && dynamicStyles.tierTitlePremium,
                ]}
              >
                {tier.title}
              </Text>
              <Text
                style={[
                  dynamicStyles.tierDescription,
                  tier.isPremium && dynamicStyles.tierDescriptionPremium,
                ]}
              >
                {tier.description}
              </Text>

              <View style={dynamicStyles.featuresList}>
                {tier.features.map((feature, idx) => (
                  <View key={idx} style={dynamicStyles.featureItem}>
                    <Text
                      style={[
                        dynamicStyles.featureText,
                        tier.isPremium && dynamicStyles.featureTextPremium,
                      ]}
                    >
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>

              <AnimatedCTA
                label={isCurrentTier ? 'Current Plan' : 'Upgrade'}
                onPress={() => {
                  if (isUpgradeable) {
                    handleUpgrade(tier.id);
                  }
                }}
                variant={tier.isPremium ? 'primary' : 'secondary'}
                disabled={isCurrentTier || !isUpgradeable}
              />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

// Styles are now in dynamicStyles within the component

