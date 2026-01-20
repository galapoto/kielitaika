import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import SceneBackground from '../components/SceneBackground';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';
import { colors } from '../styles/colors';

// Placeholder skill tree screen
export default function SkillTreeScreen() {
  return (
    <View style={styles.container}>
      <SceneBackground sceneKey="lapland" orbEmotion="calm" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Skill Tree</Text>
      <Text style={styles.subtitle}>Future home of interactive nodes and infusion effects.</Text>
      <View style={styles.box}>
        <Text style={styles.boxText}>Skill nodes and orb infusion animations will live here.</Text>
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.l,
    gap: spacing.m,
  },
  title: {
    ...typography.titleL,
    fontWeight: '700',
    color: colors.textMain,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSoft,
  },
  box: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.l,
    borderWidth: 1,
    borderColor: colors.grayLine,
  },
  boxText: {
    ...typography.bodySm,
    color: colors.textSoft,
  },
});

