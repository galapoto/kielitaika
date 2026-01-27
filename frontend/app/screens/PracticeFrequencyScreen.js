/**
 * PracticeFrequencyScreen
 * 
 * Ask:
 * - 1× / week
 * - 3× / week
 * - 5× / week
 * - Daily
 * 
 * Explain briefly why.
 * Persist to user_profile.
 * Then navigate to HomeScreen (personalized).
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Background from '../components/ui/Background';
import AnimatedCTA from '../components/AnimatedCTA';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';
import { useAuth } from '../context/AuthContext';

const FREQUENCY_OPTIONS = [
  {
    id: '1',
    label: '1 kerta viikossa',
    description: 'Hiljainen tahti',
  },
  {
    id: '3',
    label: '3 kertaa viikossa',
    description: 'Tasainen harjoittelu',
  },
  {
    id: '5',
    label: '5 kertaa viikossa',
    description: 'Aktiivinen oppiminen',
  },
  {
    id: 'daily',
    label: 'Päivittäin',
    description: 'Nopea edistyminen',
  },
];

export default function PracticeFrequencyScreen({ navigation }) {
  const { token } = useAuth();
  const [selectedFrequency, setSelectedFrequency] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSelectFrequency = (frequencyId) => {
    setSelectedFrequency(frequencyId);
  };

  const handleContinue = async () => {
    if (!selectedFrequency) return;

    setSaving(true);
    try {
      // TODO: Persist practice_frequency to user_profile via API
      // For now, we'll just navigate - API call will be added when endpoint is available
      // await updateUserProfile({ practice_frequency: selectedFrequency });
      
      // Navigate to personalized HomeScreen
      navigation?.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      console.error('Failed to save practice frequency:', error);
      // Still navigate even if save fails
      navigation?.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Background module="home" variant="blue" imageVariant="PracticeFrequency">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Kuinka usein haluat harjoitella?</Text>
          <Text style={styles.subtitle}>
            Säännöllinen harjoittelu auttaa sinua oppimaan nopeammin
          </Text>
        </View>

        <View style={styles.options}>
          {FREQUENCY_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                selectedFrequency === option.id && styles.optionCardSelected,
              ]}
              onPress={() => handleSelectFrequency(option.id)}
              activeOpacity={0.85}
            >
              <Text style={styles.optionLabel}>{option.label}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <AnimatedCTA
            label="Jatka"
            onPress={handleContinue}
            disabled={!selectedFrequency || saving}
          />
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
    flex: 1,
  },
  optionCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 16,
    padding: spacing.l,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.35)',
  },
  optionCardSelected: {
    borderColor: '#7dd3fc',
    borderWidth: 2,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
  },
  optionLabel: {
    ...typography.h3,
    color: '#e2e8f0',
    marginBottom: spacing.xs,
  },
  optionDescription: {
    ...typography.bodySm,
    color: '#94a3b8',
  },
  footer: {
    marginTop: spacing.l,
  },
});
