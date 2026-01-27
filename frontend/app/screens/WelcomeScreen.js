/**
 * WelcomeScreen - Soft entry point, no commitment
 * 
 * Requirements:
 * - App logo visible
 * - Short welcome message
 * - "Get started" button
 * - Optional skip
 * - No login, no analytics, no account
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Background from '../components/ui/Background';
import RukaLogo3D from '../components/RukaLogo3D';
import AnimatedCTA from '../components/AnimatedCTA';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';

export default function WelcomeScreen({ navigation }) {
  const handleGetStarted = () => {
    navigation?.navigate('IntentQuiz');
  };

  const handleSkip = () => {
    // Skip directly to IntentQuiz (still need to collect intent)
    navigation?.navigate('IntentQuiz');
  };

  return (
    <Background module="login" variant="blue" imageVariant="login">
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <RukaLogo3D width={320} height={100} />
        </View>
        
        <View style={styles.content}>
          <Text style={styles.welcomeText}>
            Tervetuloa oppimaan suomea
          </Text>
          <Text style={styles.subtitle}>
            Aloita matkasi suomen kielen oppimiseen
          </Text>
        </View>

        <View style={styles.actions}>
          <AnimatedCTA
            label="Aloita"
            onPress={handleGetStarted}
          />
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>Ohita</Text>
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
    paddingTop: spacing['4xl'],
    paddingBottom: spacing['2xl'],
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: spacing['3xl'],
  },
  content: {
    alignItems: 'center',
    marginVertical: spacing['3xl'],
  },
  welcomeText: {
    ...typography.titleXL,
    color: '#f8fafc',
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  subtitle: {
    ...typography.body,
    color: '#cbd5e1',
    textAlign: 'center',
    paddingHorizontal: spacing.l,
  },
  actions: {
    gap: spacing.m,
  },
  skipButton: {
    paddingVertical: spacing.m,
    alignItems: 'center',
  },
  skipText: {
    ...typography.body,
    color: '#94a3b8',
  },
});
