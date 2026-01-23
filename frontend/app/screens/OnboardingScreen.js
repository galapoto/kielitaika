/**
 * OnboardingScreen - New Duolingo-style onboarding flow
 * 
 * Flow:
 * 1. Welcome/Splash
 * 2. Practice Selection (What Part of Finnish?)
 * 3. Commitment (How often per week?)
 * 4. Trial/Subscription Choice
 * 5. Payment Collection
 * 6. Navigate to selected section
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import Background from '../components/ui/Background';
import useOnboardingStore from '../state/useOnboardingStore';
import PremiumEmbossedButton from '../components/PremiumEmbossedButton';
import RukaLogo3D from '../components/RukaLogo3D';
import { createCheckoutSession } from '../services/paymentService';
import { colors as palette } from '../styles/colors';

const { width } = Dimensions.get('window');

const PRACTICE_OPTIONS = [
  {
    id: 'general',
    title: 'General Finnish',
    description: 'A1 to B1 level Finnish for everyday life',
    icon: '🌱',
    color: '#3A2A1E',
  },
  {
    id: 'workplace',
    title: 'Workplace Finnish',
    description: 'Professional Finnish for 11+ professions',
    icon: '💼',
    color: '#3A2A1E',
  },
  {
    id: 'yki',
    title: 'YKI Exam Prep',
    description: 'Complete exam simulation and practice',
    icon: '🎓',
    color: '#3A2A1E',
  },
];

const COMMITMENT_OPTIONS = [
  { id: '2', label: '2 times', description: 'per week' },
  { id: '3', label: '3 times', description: 'per week' },
  { id: '4', label: '4 times', description: 'per week' },
  { id: '5', label: '5 times', description: 'per week' },
];

export default function OnboardingScreen({ navigation }) {
  const {
    currentStep,
    goal,
    commitment,
    subscriptionChoice,
    setCurrentStep,
    setGoal,
    setCommitment,
    setSubscriptionChoice,
    setPaymentMethod,
    markCompleted,
    loadFromStorage,
  } = useOnboardingStore();

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
  });
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePracticeSelect = (practiceId) => {
    setGoal(practiceId);
    handleNext();
  };

  const handleCommitmentSelect = (commitmentId) => {
    setCommitment(commitmentId);
    handleNext();
  };

  const handleTrialChoice = async (choice) => {
    setSubscriptionChoice(choice);
    if (choice === 'subscription') {
      // Go directly to payment
      handleNext();
    } else {
      // Start trial, then collect payment for post-trial
      handleNext();
    }
  };

  const handlePaymentSubmit = async () => {
    if (!paymentInfo.cardNumber || !paymentInfo.expiryDate || !paymentInfo.cvv || !paymentInfo.name) {
      Alert.alert('Error', 'Please fill in all payment fields');
      return;
    }

    setProcessingPayment(true);
    try {
      // Store payment method (in real app, this would be tokenized via Stripe)
      setPaymentMethod({
        last4: paymentInfo.cardNumber.slice(-4),
        expiry: paymentInfo.expiryDate,
        name: paymentInfo.name,
      });

      // Create checkout session if subscription
      if (subscriptionChoice === 'subscription') {
        const tier = goal === 'yki' || goal === 'workplace' ? 'professional_premium' : 'general_premium';
        await createCheckoutSession(tier, subscriptionChoice === 'trial' ? 3 : 0);
      }

      // Complete onboarding and navigate
      await markCompleted();
      navigateToSelectedSection();
    } catch (error) {
      Alert.alert('Payment Error', error.message || 'Failed to process payment. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const navigateToSelectedSection = () => {
    if (navigation?.reset) {
      if (goal === 'general') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      } else if (goal === 'workplace') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Workplace' }],
        });
      } else if (goal === 'yki') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'YKI' }],
        });
      }
    } else if (navigation?.navigate) {
      if (goal === 'general') {
        navigation.navigate('Home');
      } else if (goal === 'workplace') {
        navigation.navigate('Workplace');
      } else if (goal === 'yki') {
        navigation.navigate('YKI');
      }
    }
  };

  const handleSkip = () => {
    if (navigation?.replace) {
      navigation.replace('Home');
    } else {
      navigation?.navigate('Home');
    }
  };

  // Step 0: Welcome/Splash
  if (currentStep === 0) {
    return (
      <Background module="home" variant="brown">
        <View style={styles.container}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.welcomeContainer}>
              <View style={styles.logoContainer}>
                <RukaLogo3D width={280} height={93} />
              </View>
              <Text style={styles.welcomeTitle}>Welcome to RUKA</Text>
              <Text style={styles.welcomeSubtitle}>
                Your AI-powered Finnish learning companion
              </Text>
              <Text style={styles.welcomeDescription}>
                Master Finnish with personalized lessons, workplace training, and YKI exam preparation.
              </Text>
            </View>
          </ScrollView>
          <View style={styles.footer}>
            <PremiumEmbossedButton
              title="Skip"
              onPress={handleSkip}
              variant="secondary"
              size="medium"
              style={styles.footerButton}
            />
            <PremiumEmbossedButton
              title="Get Started"
              onPress={handleNext}
              variant="primary"
              size="medium"
              style={styles.footerButton}
            />
          </View>
        </View>
      </Background>
    );
  }

  // Step 1: Practice Selection
  if (currentStep === 1) {
    return (
      <Background module="home" variant="brown">
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>What Part of Finnish would you like to practice?</Text>
          </View>
          <ScrollView 
            contentContainerStyle={styles.practiceScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {PRACTICE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.practiceCard,
                  goal === option.id && styles.practiceCardSelected,
                ]}
                onPress={() => handlePracticeSelect(option.id)}
              >
                <Text style={styles.practiceIcon}>{option.icon}</Text>
                <Text style={styles.practiceTitle}>{option.title}</Text>
                <Text style={styles.practiceDescription}>{option.description}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Background>
    );
  }

  // Step 2: Commitment Selection
  if (currentStep === 2) {
    return (
      <Background module="home" variant="brown">
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>How often will you practice?</Text>
          </View>
          <ScrollView 
            contentContainerStyle={styles.commitmentScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {COMMITMENT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.commitmentCard,
                  commitment === option.id && styles.commitmentCardSelected,
                ]}
                onPress={() => handleCommitmentSelect(option.id)}
              >
                <Text style={styles.commitmentLabel}>{option.label}</Text>
                <Text style={styles.commitmentDescription}>{option.description}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Background>
    );
  }

  // Step 3: Trial/Subscription Choice
  if (currentStep === 3) {
    return (
      <Background module="home" variant="brown">
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Choose Your Plan</Text>
          </View>
          <ScrollView 
            contentContainerStyle={styles.choiceScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.pricingInfo}>
              <Text style={styles.pricingTitle}>
                {goal === 'yki' || goal === 'workplace' 
                  ? 'Professional Premium' 
                  : 'General Premium'}
              </Text>
              <Text style={styles.pricingAmount}>
                ${goal === 'yki' || goal === 'workplace' ? '29.99' : '12.99'}
                <Text style={styles.pricingPeriod}>/month</Text>
              </Text>
            </View>
            <PremiumEmbossedButton
              title="Start 3-day free trial"
              onPress={() => handleTrialChoice('trial')}
              variant="primary"
              size="large"
              style={styles.choiceButton}
            />
            <PremiumEmbossedButton
              title="Start subscription immediately"
              onPress={() => handleTrialChoice('subscription')}
              variant="secondary"
              size="large"
              style={styles.choiceButton}
            />
            <Text style={styles.trialNote}>
              * Trial includes full access. Payment method required for post-trial billing.
            </Text>
          </ScrollView>
        </View>
      </Background>
    );
  }

  // Step 4: Payment Collection
  if (currentStep === 4) {
    return (
      <Background module="home" variant="brown">
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Payment Information</Text>
          </View>
          <ScrollView 
            contentContainerStyle={styles.paymentScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.paymentNote}>
              {subscriptionChoice === 'trial' 
                ? 'We\'ll charge you after your 3-day trial ends.'
                : 'Your subscription starts immediately.'}
            </Text>
            <View style={styles.paymentForm}>
              <Text style={styles.inputLabel}>Cardholder Name</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={paymentInfo.name}
                onChangeText={(text) => setPaymentInfo({ ...paymentInfo, name: text })}
              />
              <Text style={styles.inputLabel}>Card Number</Text>
              <TextInput
                style={styles.input}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={paymentInfo.cardNumber}
                onChangeText={(text) => setPaymentInfo({ ...paymentInfo, cardNumber: text })}
                keyboardType="numeric"
              />
              <View style={styles.paymentRow}>
                <View style={styles.paymentRowItem}>
                  <Text style={styles.inputLabel}>Expiry Date</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="MM/YY"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={paymentInfo.expiryDate}
                    onChangeText={(text) => setPaymentInfo({ ...paymentInfo, expiryDate: text })}
                  />
                </View>
                <View style={styles.paymentRowItem}>
                  <Text style={styles.inputLabel}>CVV</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="123"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={paymentInfo.cvv}
                    onChangeText={(text) => setPaymentInfo({ ...paymentInfo, cvv: text })}
                    keyboardType="numeric"
                    secureTextEntry
                  />
                </View>
              </View>
            </View>
            <PremiumEmbossedButton
              title={processingPayment ? "Processing..." : "Complete Setup"}
              onPress={handlePaymentSubmit}
              variant="primary"
              size="large"
              disabled={processingPayment}
              style={styles.submitButton}
            />
          </ScrollView>
        </View>
      </Background>
    );
  }

  // Should not reach here, but fallback
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  welcomeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: palette.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 16,
  },
  welcomeDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 24,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 24,
    color: palette.textPrimary,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.textPrimary,
    textAlign: 'center',
  },
  practiceScrollContent: {
    padding: 24,
    gap: 16,
  },
  practiceCard: {
    backgroundColor: palette.backgroundSecondary,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    // Embossed effect
    shadowColor: '#000000',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  practiceCardSelected: {
    borderColor: '#1B4EDA',
    backgroundColor: palette.backgroundTertiary,
  },
  practiceIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  practiceTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: palette.textPrimary,
    marginBottom: 8,
  },
  practiceDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  commitmentScrollContent: {
    padding: 24,
    gap: 16,
  },
  commitmentCard: {
    backgroundColor: palette.backgroundSecondary,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000000',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  commitmentCardSelected: {
    borderColor: '#1B4EDA',
    backgroundColor: palette.backgroundTertiary,
  },
  commitmentLabel: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.textPrimary,
    marginBottom: 4,
  },
  commitmentDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  choiceScrollContent: {
    padding: 24,
    gap: 24,
  },
  pricingInfo: {
    alignItems: 'center',
    marginBottom: 8,
  },
  pricingTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: 8,
  },
  pricingAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  pricingPeriod: {
    fontSize: 18,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.7)',
  },
  choiceButton: {
    width: '100%',
  },
  trialNote: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 8,
  },
  paymentScrollContent: {
    padding: 24,
    gap: 20,
  },
  paymentNote: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 8,
  },
  paymentForm: {
    gap: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: palette.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: palette.textPrimary,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  paymentRow: {
    flexDirection: 'row',
    gap: 12,
  },
  paymentRowItem: {
    flex: 1,
  },
  submitButton: {
    width: '100%',
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 24,
  },
  footerButton: {
    flex: 1,
  },
});
