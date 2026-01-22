import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

import Background from '../components/ui/Background';
import HomeButton from '../components/HomeButton';
import SectionHeader from '../components/core/SectionHeader';

import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';


export default function SkillTreeScreen() {
  return (
    <Background>
      <ScrollView contentContainerStyle={styles.container}>
        <HomeButton />
        <SectionHeader title="Skill Tree" />

        <View style={styles.card}>
          <Text style={styles.text}>
            Skill Tree is temporarily disabled during recovery.
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
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: 12,
  },
  text: {
    color: colors.textPrimary,
    fontSize: 16,
  },
});
