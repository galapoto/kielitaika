/**
 * IntentQuizScreen - High-value screen
 * 
 * Questions:
 * - What are you learning Finnish for?
 *   - YKI exam
 *   - Work
 *   - Daily life
 * 
 * If Work → profession choice can be deferred to next screen
 * Store results in onboarding_session (temporary state)
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Background from '../components/ui/Background';
import useOnboardingSession from '../state/useOnboardingSession';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';

export default function IntentQuizScreen({ navigation }) {
  const { setIntentType } = useOnboardingSession();

  const handleSelectIntent = (intentType) => {
    setIntentType(intentType);
    // Navigate to plan selection
    navigation?.navigate('PlanSelection');
  };

  return (
    <Background module="home" variant="blue" imageVariant="intent">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Miksi opiskelet suomea?</Text>
          <Text style={styles.subtitle}>
            Valitse tavoite, jota kohti opiskelet
          </Text>
        </View>

        <View style={styles.options}>
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => handleSelectIntent('YKI')}
            activeOpacity={0.85}
          >
            <Text style={styles.optionTitle}>YKI-kokeeseen</Text>
            <Text style={styles.optionDescription}>
              Valmistaudu suomen kielen kansalliseen kielitaitotutkintoon
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => handleSelectIntent('PROFESSIONAL')}
            activeOpacity={0.85}
          >
            <Text style={styles.optionTitle}>Työhön</Text>
            <Text style={styles.optionDescription}>
              Opettele ammattisuomea oman alasi työtilanteisiin
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => handleSelectIntent('DAILY')}
            activeOpacity={0.85}
          >
            <Text style={styles.optionTitle}>Arkeen</Text>
            <Text style={styles.optionDescription}>
              Paranna suomen kielitaitoasi päivittäiseen käyttöön
            </Text>
          </TouchableOpacity>
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
  options: {
    gap: spacing.m,
  },
  optionCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 16,
    padding: spacing.l,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.35)',
  },
  optionTitle: {
    ...typography.h3,
    color: '#e2e8f0',
    marginBottom: spacing.xs,
  },
  optionDescription: {
    ...typography.bodySm,
    color: '#94a3b8',
  },
});
