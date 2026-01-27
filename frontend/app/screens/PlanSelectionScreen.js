/**
 * PlanSelectionScreen
 * 
 * Show plans based on intent:
 * - 3-day free trial
 * - YKI Preparation – €29.99
 * - Professional Finnish – €19.99 / profession
 * 
 * Rules:
 * - No account yet
 * - If Professional → route to ProfessionSelectionScreen
 * - CTA: "Continue → Create account to activate"
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Background from '../components/ui/Background';
import useOnboardingSession from '../state/useOnboardingSession';
import AnimatedCTA from '../components/AnimatedCTA';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';

export default function PlanSelectionScreen({ navigation }) {
  const { intent_type, setSelectedPlan } = useOnboardingSession();

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    
    if (plan === 'professional') {
      // Route to profession selection
      navigation?.navigate('ProfessionSelection');
    } else {
      // Go directly to auth (account creation)
      navigation?.navigate('Auth');
    }
  };

  const plans = [
    {
      id: 'trial',
      title: '3 päivän ilmainen kokeilu',
      price: 'Ilmainen',
      description: 'Kokeile kaikkia ominaisuuksia 3 päivää ilmaiseksi',
      plan: 'trial',
    },
  ];

  // Add YKI plan if intent is YKI
  if (intent_type === 'YKI') {
    plans.push({
      id: 'yki',
      title: 'YKI-valmistautuminen',
      price: '€29.99',
      description: 'Kattava valmennus YKI-kokeeseen',
      plan: 'yki',
    });
  }

  // Add Professional plan if intent is PROFESSIONAL
  if (intent_type === 'PROFESSIONAL') {
    plans.push({
      id: 'professional',
      title: 'Ammattisuomi',
      price: '€19.99 / ala',
      description: 'Ammattisuomea oman alasi työtilanteisiin',
      plan: 'professional',
    });
  }

  // Add Daily plan option if intent is DAILY
  if (intent_type === 'DAILY') {
    plans.push({
      id: 'daily',
      title: 'Päivittäinen harjoittelu',
      price: '€14.99',
      description: 'Paranna suomen kielitaitoasi arkeen',
      plan: 'trial', // Use trial for daily users
    });
  }

  return (
    <Background module="home" variant="blue" imageVariant="PlanSelection">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Valitse suunnitelma</Text>
          <Text style={styles.subtitle}>
            Aloita matkasi suomen kielen oppimiseen
          </Text>
        </View>

        <View style={styles.plans}>
          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={styles.planCard}
              onPress={() => handleSelectPlan(plan.plan)}
              activeOpacity={0.85}
            >
              <View style={styles.planHeader}>
                <Text style={styles.planTitle}>{plan.title}</Text>
                <Text style={styles.planPrice}>{plan.price}</Text>
              </View>
              <Text style={styles.planDescription}>{plan.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Jatka → Luo tili aktivoidaksesi
          </Text>
        </View>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.l,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing['2xl'],
  },
  header: {
    marginBottom: spacing['3xl'],
  },
  title: {
    ...typography.titleXL,
    color: '#f8fafc',
    marginBottom: spacing.m,
  },
  subtitle: {
    ...typography.body,
    color: '#cbd5e1',
  },
  plans: {
    gap: spacing.m,
    flex: 1,
  },
  planCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 16,
    padding: spacing.l,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.35)',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  planTitle: {
    ...typography.h3,
    color: '#e2e8f0',
    flex: 1,
  },
  planPrice: {
    ...typography.h4,
    color: '#7dd3fc',
  },
  planDescription: {
    ...typography.bodySm,
    color: '#94a3b8',
  },
  footer: {
    marginTop: spacing.l,
    alignItems: 'center',
  },
  footerText: {
    ...typography.bodySm,
    color: '#94a3b8',
  },
});
