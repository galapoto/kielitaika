import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

import Background from '../components/ui/Background';
import HomeButton from '../components/HomeButton';
import SectionHeader from '../components/core/SectionHeader';

import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';


export default function CertificateListScreen() {
  return (
    <Background module="home" variant="brown">
      <ScrollView contentContainerStyle={styles.container}>
        <HomeButton />
        <SectionHeader title="Certificates" />

        <View style={styles.card}>
          <Text style={styles.text}>
            Certificates are temporarily unavailable during recovery.
          </Text>
        </View>
      </ScrollView>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  card: {
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginTop: spacing.lg,
  },
  text: {
    color: colors.textPrimary,
    fontSize: 16,
  },
});
