/**
 * ProfessionSelectionScreen (Conditional)
 * 
 * Only shown if Professional plan chosen.
 * 
 * Professions:
 * - Nurse (sairaanhoitaja)
 * - IT (it)
 * - Construction (rakennus)
 * - (others if already existing)
 * 
 * Store profession locally (in onboarding session).
 * Then navigate to Auth.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Background from '../components/ui/Background';
import useOnboardingSession from '../state/useOnboardingSession';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';

const PROFESSIONS = [
  {
    id: 'sairaanhoitaja',
    label: 'Sairaanhoitaja',
    icon: '🏥',
  },
  {
    id: 'it',
    label: 'IT',
    icon: '💻',
  },
  {
    id: 'rakennus',
    label: 'Rakennus',
    icon: '🏗️',
  },
  {
    id: 'opettaja',
    label: 'Opettaja',
    icon: '📚',
  },
  {
    id: 'myynti',
    label: 'Myynti',
    icon: '💼',
  },
  {
    id: 'ravintola',
    label: 'Ravintola',
    icon: '🍽️',
  },
];

export default function ProfessionSelectionScreen({ navigation }) {
  const { setProfession } = useOnboardingSession();

  const handleSelectProfession = (professionId) => {
    setProfession(professionId);
    // Navigate to auth (account creation)
    navigation?.navigate('Auth');
  };

  return (
    <Background module="workplace" variant="blue" imageVariant="workplace">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Valitse ammattisi</Text>
          <Text style={styles.subtitle}>
            Valitse ala, jota varten opiskelet suomea
          </Text>
        </View>

        <View style={styles.professions}>
          {PROFESSIONS.map((profession) => (
            <TouchableOpacity
              key={profession.id}
              style={styles.professionCard}
              onPress={() => handleSelectProfession(profession.id)}
              activeOpacity={0.85}
            >
              <Text style={styles.professionIcon}>{profession.icon}</Text>
              <Text style={styles.professionLabel}>{profession.label}</Text>
            </TouchableOpacity>
          ))}
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
  professions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.m,
  },
  professionCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 16,
    padding: spacing.l,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.35)',
    width: '47%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  professionIcon: {
    fontSize: 40,
    marginBottom: spacing.xs,
  },
  professionLabel: {
    ...typography.h4,
    color: '#e2e8f0',
    textAlign: 'center',
  },
});
