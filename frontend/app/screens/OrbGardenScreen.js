import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';
import { colors } from '../styles/colors';
import SkillOrb from '../components/SkillOrb';
import RukaCard from '../ui/components/Card';
import RukaButton from '../ui/components/Button';
import { IconPlay, IconHome } from '../ui/icons/IconPack';

const sampleSkills = [
  { key: 'vocab', label: 'Vocabulary', progress: 0.62, color: '#4EC5FF' },
  { key: 'grammar', label: 'Grammar', progress: 0.48, color: '#1B4EDA' },
  { key: 'pronunciation', label: 'Pronunciation', progress: 0.71, color: '#65F7D7' },
  { key: 'listening', label: 'Listening', progress: 0.55, color: '#4EC5FF' },
  { key: 'confidence', label: 'Confidence', progress: 0.58, color: '#FCE97C' },
];

export default function OrbGardenScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Orb Garden</Text>
      <Text style={styles.subtitle}>Each skill has its own orb with a breathing animation.</Text>
      <View style={styles.grid}>
        {sampleSkills.map((s) => (
          <SkillOrb key={s.key} label={s.label} progress={s.progress} color={s.color} />
        ))}
      </View>
      <RukaCard
        title="Skill Tree & Infusions"
        subtitle="Complete nodes to infuse your primary orb with more glow and motion."
        icon={IconHome}
        style={styles.card}
      >
        <RukaButton
          title="Go to Skill Tree"
          icon={IconPlay}
          onPress={() => navigation.navigate('SkillTree')}
          style={styles.button}
        />
      </RukaCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.grayBg,
  },
  content: {
    padding: spacing.l,
    gap: spacing.m,
  },
  title: {
    ...typography.titleL,
    color: colors.textMain,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSoft,
  },
  button: {
    marginTop: spacing.s,
  },
});
