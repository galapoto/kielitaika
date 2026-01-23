import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView, Linking, TouchableOpacity } from 'react-native';
import { fetchSubscriptionStatus, upgradeSubscription, createCheckoutSession, createPortalSession } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Background from '../components/ui/Background';
import HomeButton from '../components/HomeButton';
import ProfileImage from '../components/ProfileImage';
import PremiumEmbossedButton from '../components/PremiumEmbossedButton';

export default function SubscriptionScreen({ navigation }) {
  const { user } = useAuth();
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

      const checkout = await createCheckoutSession(tier, 0);

      if (checkout.checkout_url || checkout.url) {
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

  // Combine app design + 21st picture - Subscription management screen
  return (
    <Background module="home" variant="brown">
      <View style={styles.container}>
      {/* Header - Dark Blue from 6th picture */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => {
              if (navigation?.canGoBack?.() && navigation.canGoBack()) navigation.goBack();
              else navigation?.navigate?.('Home');
            }}
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Subscription</Text>
        </View>
        <View style={styles.headerRight}>
          <HomeButton navigation={navigation} style={styles.homeButtonHeader} />
          <ProfileImage size={32} />
          <Text style={styles.headerEmail}>{user?.email || 'user@example.com'}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Current Subscription Card - Flight Booking Style from 6th picture */}
        {status && (
          <View style={styles.currentCard}>
            <View style={styles.currentCardLeft}>
              <Text style={styles.currentCardTitle}>Current Plan</Text>
              <Text style={styles.currentCardDescription}>
                {status.tier === 'free' ? 'Free' : status.tier === 'general_premium' ? 'General Premium' : 'Professional Premium'}
              </Text>
              {status.is_trial && (
                <Text style={styles.trialBadgeText}>Trial Period: Active</Text>
              )}
            </View>
            {status.tier !== 'free' && (
              <TouchableOpacity
                style={styles.manageButton}
                onPress={handleManageSubscription}
                disabled={loading}
              >
                <Text style={styles.manageButtonText}>Manage</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Subscription Tiers - From 21st picture + app design */}
        <View style={styles.tiersSection}>
          <Text style={styles.sectionTitle}>Available Plans</Text>
          
          {tiers.map((tier) => {
            const isCurrentTier = status?.tier === tier.id;
            const isUpgradeable = !isCurrentTier && status?.tier !== 'professional_premium';

            return (
              <View
                key={tier.id}
                style={[
                  styles.tierCard,
                  tier.isPremium && styles.tierCardPremium,
                  isCurrentTier && styles.tierCardCurrent,
                ]}
              >
                <View style={styles.tierCardHeader}>
                  <Text style={[
                    styles.tierCardTitle,
                    tier.isPremium && styles.tierCardTitlePremium,
                  ]}>
                    {tier.title}
                  </Text>
                  {tier.isPremium && (
                    <View style={styles.premiumBadge}>
                      <Text style={styles.premiumBadgeText}>PREMIUM</Text>
                    </View>
                  )}
                </View>
                
                <Text style={[
                  styles.tierCardDescription,
                  tier.isPremium && styles.tierCardDescriptionPremium,
                ]}>
                  {tier.description}
                </Text>

                <View style={styles.priceRow}>
                  <Text style={styles.priceAmount}>${tier.price}</Text>
                  <Text style={styles.pricePeriod}>/{tier.period}</Text>
                  {tier.trialDays && (
                    <View style={styles.trialBadge}>
                      <Text style={styles.trialText}>{tier.trialDays} days free</Text>
                    </View>
                  )}
                </View>

                <View style={styles.featuresList}>
                  {tier.features.map((feature, idx) => (
                    <View key={idx} style={styles.featureRow}>
                      <Text style={styles.featureCheck}>✓</Text>
                      <Text style={[
                        styles.featureText,
                        tier.isPremium && styles.featureTextPremium,
                      ]}>
                        {feature}
                      </Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={[
                    styles.subscribeButton,
                    isCurrentTier && styles.subscribeButtonCurrent,
                    !isUpgradeable && styles.subscribeButtonDisabled,
                  ]}
                  onPress={() => {
                    if (isUpgradeable) {
                      handleUpgrade(tier.id);
                    }
                  }}
                  disabled={isCurrentTier || !isUpgradeable || loading}
                >
                  <Text style={[
                    styles.subscribeButtonText,
                    isCurrentTier && styles.subscribeButtonTextCurrent,
                  ]}>
                    {isCurrentTier ? 'Current Plan' : tier.trialDays ? `Start ${tier.trialDays}-Day Trial` : 'Subscribe'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {loading && !status && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#1E3A8A" />
            <Text style={styles.loadingText}>Loading subscription status...</Text>
          </View>
        )}

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
    backgroundColor: 'transparent',
  },
  header: {
    backgroundColor: 'rgba(10, 14, 39, 0.78)',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.10)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.92)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.95)',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  homeButtonHeader: {
    marginLeft: 8,
  },
  profileImageSmall: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  profileImageSmallText: {
    fontSize: 16,
  },
  headerEmail: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  currentCard: {
    backgroundColor: 'rgba(16, 22, 40, 0.78)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  currentCardLeft: {
    flex: 1,
  },
  currentCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.92)',
    marginBottom: 4,
  },
  currentCardDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.72)',
    marginBottom: 8,
  },
  trialBadgeText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.80)',
    fontWeight: '600',
  },
  manageButton: {
    backgroundColor: 'rgba(27, 78, 218, 0.92)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  manageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tiersSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.92)',
    marginBottom: 16,
  },
  tierCard: {
    backgroundColor: 'rgba(16, 22, 40, 0.78)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  tierCardPremium: {
    borderColor: 'rgba(27, 78, 218, 0.85)',
    borderWidth: 3,
  },
  tierCardCurrent: {
    borderColor: 'rgba(27, 78, 218, 0.85)',
  },
  tierCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tierCardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.92)',
  },
  tierCardTitlePremium: {
    color: 'rgba(255,255,255,0.95)',
  },
  premiumBadge: {
    backgroundColor: 'rgba(27, 78, 218, 0.92)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tierCardDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.72)',
    marginBottom: 16,
  },
  tierCardDescriptionPremium: {
    color: 'rgba(255,255,255,0.72)',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
    gap: 8,
  },
  priceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.95)',
  },
  pricePeriod: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.65)',
  },
  trialBadge: {
    backgroundColor: 'rgba(27, 78, 218, 0.92)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  trialText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  featuresList: {
    marginBottom: 20,
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureCheck: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.85)',
  },
  featureText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.80)',
    flex: 1,
  },
  featureTextPremium: {
    color: 'rgba(255,255,255,0.86)',
    fontWeight: '600',
  },
  subscribeButton: {
    backgroundColor: 'rgba(27, 78, 218, 0.92)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscribeButtonCurrent: {
    backgroundColor: 'rgba(27, 78, 218, 0.92)',
  },
  subscribeButtonDisabled: {
    opacity: 0.5,
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subscribeButtonTextCurrent: {
    color: '#FFFFFF',
  },
  loader: {
    alignItems: 'center',
    marginTop: 40,
  },
  loadingText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.72)',
    marginTop: 12,
  },
  errorContainer: {
    backgroundColor: 'rgba(220, 38, 38, 0.18)',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.25)',
  },
  errorText: {
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
  },
});
