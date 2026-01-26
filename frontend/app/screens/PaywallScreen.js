import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Linking,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { createCheckoutSession, getSubscriptionStatus } from '../services/paymentService';
import { useSound } from '../hooks/useSound';
import useOnboardingStore from '../state/useOnboardingStore';
import Background from '../components/ui/Background';

export default function PaywallScreen({ navigation, route } = {}) {
  const { redirectFrom } = route?.params || {};
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { goal } = useOnboardingStore();
  const { playTap } = useSound();

  const tiers = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      period: 'month',
      features: [
        'Limited conversations (5/day)',
        'Basic grammar correction',
        'Limited vocabulary',
        'No workplace content',
        'No YKI practice',
      ],
    },
    {
      id: 'general_premium',
      name: 'General Premium',
      price: 12.99,
      period: 'month',
      trialDays: 3, // 3-day trial
      features: [
        'Unlimited conversations',
        'Full grammar correction',
        'Unlimited vocabulary',
        'Personalization',
        'Analytics',
        'Limited workplace content',
        'Limited YKI practice',
      ],
      isRecommended: goal === 'general',
    },
    {
      id: 'professional_premium',
      name: 'Professional Premium',
      price: 29.99,
      period: 'month',
      trialDays: 3, // 3-day trial
      features: [
        'Everything in General Premium',
        'Full Workplace Finnish (all professions)',
        'Full YKI exam practice',
        'Professional reports',
        'Certificates',
        'B2B features',
      ],
      isRecommended: goal === 'workplace' || goal === 'yki',
    },
  ];

  const comparisonFeatures = [
    { id: 'conversations', name: 'Unlimited Conversations' },
    { id: 'grammar', name: 'Full Grammar Correction' },
    { id: 'vocabulary', name: 'Unlimited Vocabulary' },
    { id: 'workplace', name: 'Workplace Finnish' },
    { id: 'yki', name: 'YKI Exam Practice' },
    { id: 'certificates', name: 'Certificates' },
    { id: 'reports', name: 'Professional Reports' },
  ];

  const [currentTier, setCurrentTier] = useState(null);

  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  const loadSubscriptionStatus = async () => {
    try {
      const status = await getSubscriptionStatus();
      if (status) {
        setCurrentTier(status.tier);
      }
    } catch (error) {
      console.error('Failed to load subscription status:', error);
    }
  };

  const handleSelectTier = async (tierId) => {
    if (tierId === 'free') {
      if (navigation && navigation.goBack) navigation.goBack();
      return;
    }

    if (currentTier === tierId) {
      Alert.alert('Current Plan', 'You are already subscribed to this tier.');
      return;
    }

    try {
      playTap();
      setLoading(true);
      setError(null);
      const checkout = await createCheckoutSession(tierId, 0);

      if (checkout.checkout_url || checkout.url) {
        const url = checkout.checkout_url || checkout.url;
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Cannot open payment page');
        }
      } else {
        Alert.alert('Error', 'Failed to create checkout session');
      }
    } catch (err) {
      setError(err.message || 'Failed to start purchase');
      Alert.alert('Error', err.message || 'Failed to start purchase');
    } finally {
      setLoading(false);
    }
  };

  // Combine 19-20 pictures with 3-day trial - Paywall design
  return (
    <Background module="home" variant="brown">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Unlock Your Finnish Potential</Text>
          <Text style={styles.headerSubtitle}>
            Choose the plan that fits your learning goals
          </Text>
          {redirectFrom && (
            <View style={styles.upgradePrompt}>
              <Text style={styles.upgradeText}>
                ⚠️ This feature requires {redirectFrom} subscription
              </Text>
            </View>
          )}
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Tier Cards - From 19-20 pictures */}
          <View style={styles.tiersContainer}>
            {tiers.map((tier) => (
              <TouchableOpacity
                key={tier.id}
                style={[
                  styles.tierCard,
                  tier.isRecommended && styles.tierCardRecommended,
                  currentTier === tier.id && styles.tierCardCurrent,
                ]}
                onPress={() => handleSelectTier(tier.id)}
              >
                {tier.isRecommended && (
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedText}>RECOMMENDED</Text>
                  </View>
                )}
                <Text style={styles.tierName}>{tier.name}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceAmount}>${tier.price}</Text>
                  <Text style={styles.pricePeriod}>/{tier.period}</Text>
                </View>
                {tier.trialDays && (
                  <View style={styles.trialBadge}>
                    <Text style={styles.trialText}>{tier.trialDays}-Day Free Trial</Text>
                  </View>
                )}
                <View style={styles.featuresList}>
                  {tier.features.map((feature, idx) => (
                    <View key={idx} style={styles.featureItem}>
                      <Text style={styles.featureIcon}>✓</Text>
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity
                  style={[
                    styles.selectButton,
                    currentTier === tier.id && styles.selectButtonCurrent,
                  ]}
                  onPress={() => handleSelectTier(tier.id)}
                  disabled={loading || currentTier === tier.id}
                >
                  <Text style={[
                    styles.selectButtonText,
                    currentTier === tier.id && styles.selectButtonTextCurrent,
                  ]}>
                    {currentTier === tier.id ? 'Current Plan' : tier.trialDays ? `Start ${tier.trialDays}-Day Trial` : 'Select Plan'}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>

          {/* Feature Comparison - From 19-20 pictures */}
          <View style={styles.comparisonSection}>
            <Text style={styles.comparisonTitle}>Feature Comparison</Text>
            {comparisonFeatures.map((feature) => (
              <View key={feature.id} style={styles.comparisonRow}>
                <Text style={styles.comparisonFeature}>{feature.name}</Text>
                <View style={styles.comparisonCheckmarks}>
                  <Text style={styles.comparisonCheck}>✓</Text>
                  <Text style={styles.comparisonCheck}>✓</Text>
                  <Text style={styles.comparisonCheck}>✓</Text>
                </View>
              </View>
            ))}
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {loading && (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color="#1E3A8A" />
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
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    padding: 8,
  },
  closeIcon: {
    fontSize: 24,
    color: '#000000',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
    textAlign: 'center',
  },
  upgradePrompt: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
  },
  upgradeText: {
    fontSize: 14,
    color: '#92400E',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  tiersContainer: {
    gap: 16,
    marginBottom: 24,
  },
  tierCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    position: 'relative',
  },
  tierCardRecommended: {
    borderColor: '#1E3A8A',
    borderWidth: 3,
  },
  tierCardCurrent: {
    borderColor: '#22C55E',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -12,
    left: '50%',
    transform: [{ translateX: -60 }],
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  recommendedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tierName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 12,
  },
  priceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  pricePeriod: {
    fontSize: 18,
    color: 'rgba(0, 0, 0, 0.6)',
  },
  trialBadge: {
    backgroundColor: '#22C55E',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'center',
    marginBottom: 16,
  },
  trialText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  featuresList: {
    marginBottom: 24,
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureIcon: {
    fontSize: 18,
    color: '#22C55E',
  },
  featureText: {
    fontSize: 14,
    color: '#000000',
    flex: 1,
  },
  selectButton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectButtonCurrent: {
    backgroundColor: '#22C55E',
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  selectButtonTextCurrent: {
    color: '#FFFFFF',
  },
  comparisonSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
  },
  comparisonTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  comparisonFeature: {
    fontSize: 14,
    color: '#000000',
    flex: 1,
  },
  comparisonCheckmarks: {
    flexDirection: 'row',
    gap: 16,
  },
  comparisonCheck: {
    fontSize: 18,
    color: '#22C55E',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  errorText: {
    color: '#DC2626',
    textAlign: 'center',
  },
  loader: {
    alignItems: 'center',
    marginTop: 24,
  },
});
