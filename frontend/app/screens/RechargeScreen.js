import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { fetchRecharge } from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import SceneBackground from '../components/SceneBackground';
import VocabCard from '../components/VocabCard';
import GrammarBiteCard from '../components/GrammarBiteCard';
import MiniChallengeCard from '../components/MiniChallengeCard';
import AnimatedCTA from '../components/AnimatedCTA';
import XPBadge from '../components/XPBadge';
import StreakFlame from '../components/StreakFlame';
import FlashcardImage from '../components/FlashcardImage';
import { colors } from '../styles/colors';
import { radius } from '../styles/radius';
import { shadows } from '../styles/shadows';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';

export default function RechargeScreen({ navigation }) {
  const { colors: themeColors } = useTheme();
  const [bundle, setBundle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [vocabCompleted, setVocabCompleted] = useState(false);
  const [grammarCompleted, setGrammarCompleted] = useState(false);

  const loadBundle = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchRecharge();
      setBundle(data.recharge || data);
    } catch (err) {
      setError(err.message || 'Failed to load recharge pack. Pull to retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBundle();
  }, []);

  const vocab = bundle?.vocab || [];
  const grammar = bundle?.grammar;
  const challenge = bundle?.mini_challenge;
  const images = bundle?.images || [];

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    header: {
      padding: spacing.l,
      backgroundColor: themeColors.surface,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
      ...shadows.s,
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      ...typography.titleXL,
      color: themeColors.primary,
      marginBottom: spacing.xs,
    },
    subtitle: {
      ...typography.bodySm,
      color: themeColors.textSecondary,
    },
    reloadButton: {
      paddingHorizontal: spacing.m,
      paddingVertical: spacing.s,
      borderRadius: radius.m,
      backgroundColor: themeColors.primary,
      ...shadows.s,
    },
    reloadText: {
      ...typography.bodySm,
      color: colors.white,
      fontWeight: '600',
    },
    content: {
      padding: spacing.m,
      gap: spacing.l,
    },
    section: {
      backgroundColor: themeColors.surface,
      borderRadius: radius.xl,
      padding: spacing.l,
      ...shadows.s,
      borderWidth: 1,
      borderColor: themeColors.border,
    },
    sectionTitle: {
      ...typography.titleL,
      color: themeColors.primary,
      marginBottom: spacing.m,
    },
    vocabGrid: {
      gap: spacing.m,
    },
    topicCard: {
      backgroundColor: colors.blueLight,
      borderRadius: radius.l,
      padding: spacing.m,
      marginTop: spacing.s,
    },
    topicText: {
      ...typography.body,
      color: themeColors.text,
      fontWeight: '600',
      marginBottom: spacing.s,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    loadingText: {
      ...typography.body,
      color: themeColors.textSecondary,
      marginTop: spacing.m,
    },
    errorText: {
      ...typography.body,
      color: '#EF4444',
      padding: spacing.m,
      textAlign: 'center',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: spacing.m,
      backgroundColor: themeColors.surface,
      borderTopWidth: 1,
      borderTopColor: themeColors.border,
    },
  });

  const handleChallengeComplete = () => {
    setChallengeCompleted(true);
    // TODO: POST to /recharge/update with challenge_done=true
  };

  const handleStartConversation = () => {
    navigation.navigate('Conversation', {
      path: 'general',
      startWithRecharge: true,
      rechargeTopic: bundle?.next_conversation_topic,
    });
  };

  if (loading) {
    return (
      <View style={dynamicStyles.container}>
        <SceneBackground sceneKey="forest" orbEmotion="calm" />
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.title}>🔋 Daily Recharge</Text>
        </View>
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={dynamicStyles.loadingText}>Fetching today's recharge…</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.title}>🔋 Daily Recharge</Text>
        </View>
        <View style={dynamicStyles.loadingContainer}>
          <Text style={dynamicStyles.errorText}>{error}</Text>
          <TouchableOpacity style={dynamicStyles.reloadButton} onPress={loadBundle}>
            <Text style={dynamicStyles.reloadText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={dynamicStyles.container}>
      <SceneBackground sceneKey="forest" orbEmotion="calm" />
      <View style={dynamicStyles.header}>
        <View style={dynamicStyles.headerContent}>
          <View>
            <Text style={dynamicStyles.title}>🔋 Daily Recharge</Text>
            <Text style={dynamicStyles.subtitle}>Valmistaudu päivän harjoitukseen</Text>
          </View>
          <TouchableOpacity style={dynamicStyles.reloadButton} onPress={loadBundle} disabled={loading}>
            <Text style={dynamicStyles.reloadText}>{loading ? '…' : '↻'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {bundle && (
        <>
          <ScrollView contentContainerStyle={dynamicStyles.content}>
            {/* Today's Focus */}
            {bundle.next_conversation_topic && (
              <View style={dynamicStyles.topicCard}>
                <Text style={dynamicStyles.sectionTitle}>Today's Focus</Text>
                <Text style={dynamicStyles.topicText}>{bundle.next_conversation_topic}</Text>
              </View>
            )}

            {/* Vocabulary Section */}
            <View style={dynamicStyles.section}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.m }}>
                <Text style={dynamicStyles.sectionTitle}>🔠 Vocabulary ({vocab.length} words)</Text>
                {vocabCompleted && <Text style={{ ...typography.micro, color: colors.mintSoft }}>✓ Done</Text>}
              </View>
              <View style={dynamicStyles.vocabGrid}>
                {vocab.slice(0, 3).map((item, idx) => {
                  const imageData = images.find(img => img.word === item.fi);
                  return (
                    <VocabCard
                      key={`${item.fi}-${idx}`}
                      word={item.fi}
                      translation={item.en}
                      example={item.example || `Example: "${item.fi}..."`}
                      imageUrl={null} // TODO: Generate image from imageData?.prompt
                      onPress={() => {
                        // Navigate to full vocab screen
                        navigation.navigate('Vocabulary', { word: item.fi });
                      }}
                    />
                  );
                })}
              </View>
              {vocab.length > 3 && (
                <TouchableOpacity
                  style={{ marginTop: spacing.s, alignItems: 'center' }}
                  onPress={() => navigation.navigate('Vocabulary')}
                >
                  <Text style={{ ...typography.bodySm, color: themeColors.primary }}>See all {vocab.length} words →</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Grammar Bite Section */}
            {grammar && (
              <View style={dynamicStyles.section}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.m }}>
                  <Text style={dynamicStyles.sectionTitle}>📘 Micro Grammar</Text>
                  {grammarCompleted && <Text style={{ ...typography.micro, color: colors.mintSoft }}>✓ Done</Text>}
                </View>
                <GrammarBiteCard
                  title={grammar.title}
                  meaning={grammar.meaning || grammar.explanation || ""}
                  examples={grammar.examples || []}
                />
              </View>
            )}

            {/* Mini Challenge Section */}
            {challenge && (
              <View style={dynamicStyles.section}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.m }}>
                  <Text style={dynamicStyles.sectionTitle}>🧩 Mini Challenge</Text>
                  {challengeCompleted && <Text style={{ ...typography.micro, color: colors.mintSoft }}>✓ Done</Text>}
                </View>
                <MiniChallengeCard
                  challengeData={challenge}
                  onComplete={handleChallengeComplete}
                />
              </View>
            )}

            {/* Start Conversation CTA */}
            <View style={dynamicStyles.section}>
              <Text style={dynamicStyles.sectionTitle}>▶ You're Ready to Speak!</Text>
              <Text style={{ ...typography.bodySm, color: themeColors.textSecondary, marginBottom: spacing.m }}>
                RUKA will help you use today's vocabulary and grammar in conversation.
              </Text>
              <AnimatedCTA
                label="Start Conversation"
                onPress={handleStartConversation}
                disabled={false}
              />
            </View>
          </ScrollView>

          {/* Footer with Streak and XP */}
          <View style={dynamicStyles.footer}>
            <StreakFlame streakCount={5} />
            <XPBadge xp={42} />
          </View>
        </>
      )}
    </View>
  );
}
