import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import Background from '../components/ui/Background';
import HomeButton from '../components/HomeButton';
import PremiumEmbossedButton from '../components/PremiumEmbossedButton';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';
import { radius } from '../styles/radius';
import { shadows } from '../styles/shadows';
import { getSkillDetail } from '../services/skillTreeService';
import { useSound } from '../hooks/useSound';
import { RukaButton } from '../ui';
import { IconPlay, IconLightning } from '../ui/icons/IconPack';

export default function SkillDetailScreen({ route, navigation } = {}) {
  const { skillId, skill: initialSkill } = route?.params || {};
  const [skill, setSkill] = useState(initialSkill);
  const [loading, setLoading] = useState(!initialSkill);
  const [error, setError] = useState(null);
  const { playTap } = useSound();

  useEffect(() => {
    if (!initialSkill && skillId) {
      loadSkillDetail();
    }
  }, [skillId]);

  const loadSkillDetail = async () => {
    try {
      setLoading(true);
      const data = await getSkillDetail(skillId);
      setSkill(data);
    } catch (err) {
      console.error('Failed to load skill detail:', err);
      setError(err.message || 'Failed to load skill details');
    } finally {
      setLoading(false);
    }
  };

  const handleStartPractice = () => {
    playTap();
    navigation.navigate('Conversation', {
      skillId: skill?.skill_id || skillId,
      level: skill?.level,
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.blueMain} />
          <Text style={styles.loadingText}>Loading skill details...</Text>
        </View>
      </View>
    );
  }

  if (error || !skill) {
    return (
      <Background module="home" variant="brown">
        <View style={styles.container}>
          <View style={styles.center}>
            <Text style={styles.errorText}>{error || 'Skill not found'}</Text>
            <RukaButton title="Retry" onPress={loadSkillDetail} icon={IconLightning} />
          </View>
        </View>
      </Background>
    );
  }

  const progress = skill.progress || {};
  const requirements = skill.requirements || {};

  return (
    <Background module="home" variant="brown">
      <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.icon}>{skill.icon || '📚'}</Text>
          <Text style={styles.title}>{skill.title}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{skill.level}</Text>
          </View>
        </View>

        {skill.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{skill.description}</Text>
          </View>
        )}

        {progress.progress !== undefined && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Progress</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progress.progress || 0}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round(progress.progress || 0)}% Complete
              </Text>
            </View>
            {progress.attempts > 0 && (
              <Text style={styles.attemptsText}>
                Attempts: {progress.attempts}
              </Text>
            )}
            {progress.completed && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedText}>✓ Completed</Text>
              </View>
            )}
          </View>
        )}

        {Object.keys(requirements).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Requirements to Complete</Text>
            {Object.entries(requirements).map(([key, value]) => (
              <View key={key} style={styles.requirementItem}>
                <Text style={styles.requirementLabel}>
                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                </Text>
                <Text style={styles.requirementValue}>{value}</Text>
              </View>
            ))}
          </View>
        )}

        {skill.prerequisites && skill.prerequisites.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prerequisites</Text>
            {skill.prerequisites.map((prereqId, index) => (
              <Text key={index} style={styles.prerequisiteItem}>
                • {prereqId}
              </Text>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rewards</Text>
          <View style={styles.rewardBadge}>
            <Text style={styles.rewardText}>
              +{skill.xp_reward || 50} XP
            </Text>
          </View>
        </View>

        <RukaButton
          title={progress.completed ? 'Practice Again' : 'Start Practice'}
          onPress={handleStartPractice}
          icon={IconPlay}
          style={{ marginTop: spacing.m }}
        />
      </ScrollView>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.m,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.l,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  icon: {
    fontSize: 64,
    marginBottom: spacing.m,
  },
  title: {
    ...typography.titleL,
    fontWeight: '700',
    color: colors.textMain,
    textAlign: 'center',
    marginBottom: spacing.s,
  },
  levelBadge: {
    backgroundColor: colors.blueMain,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
    borderRadius: radius.s,
    marginTop: spacing.xs,
  },
  levelText: {
    ...typography.bodySm,
    color: colors.white,
    fontWeight: '700',
  },
  section: {
    backgroundColor: colors.white,
    padding: spacing.l,
    borderRadius: radius.m,
    marginBottom: spacing.m,
    ...shadows.s,
  },
  sectionTitle: {
    ...typography.titleM,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: spacing.m,
  },
  description: {
    ...typography.body,
    color: colors.textSoft,
    lineHeight: 24,
  },
  progressContainer: {
    marginBottom: spacing.m,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.grayLine,
    borderRadius: radius.s,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.blueMain,
  },
  progressText: {
    ...typography.body,
    color: colors.blueMain,
    fontWeight: '600',
  },
  attemptsText: {
    ...typography.bodySm,
    color: colors.textSoft,
    marginTop: spacing.xs,
  },
  completedBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
    borderRadius: radius.s,
    alignSelf: 'flex-start',
    marginTop: spacing.m,
  },
  completedText: {
    ...typography.bodySm,
    color: colors.white,
    fontWeight: '700',
  },
  requirementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayLine,
  },
  requirementLabel: {
    ...typography.body,
    color: colors.textMain,
    fontWeight: '600',
  },
  requirementValue: {
    ...typography.body,
    color: colors.blueMain,
    fontWeight: '600',
  },
  prerequisiteItem: {
    ...typography.body,
    color: colors.textSoft,
    marginBottom: spacing.xs,
  },
  rewardBadge: {
    backgroundColor: colors.blueMain,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: radius.s,
    alignSelf: 'flex-start',
  },
  rewardText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '700',
  },
  practiceButton: {
    backgroundColor: colors.blueMain,
    padding: spacing.l,
    borderRadius: radius.m,
    alignItems: 'center',
    marginTop: spacing.m,
    ...shadows.m,
  },
  practiceButtonText: {
    ...typography.titleM,
    color: colors.white,
    fontWeight: '700',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSoft,
  },
  errorText: {
    ...typography.body,
    color: '#EF4444',
    marginBottom: spacing.m,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.blueMain,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.m,
    borderRadius: radius.m,
    ...shadows.s,
  },
  retryButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
});































