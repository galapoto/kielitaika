import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import Background from '../components/ui/Background';
import PremiumEmbossedButton from '../components/PremiumEmbossedButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchRecharge, updateRechargeSection, completeRecharge, getEngagementState } from '../utils/api';
import VocabCard from '../components/VocabCard';
import GrammarBiteCard from '../components/GrammarBiteCard';
import MiniChallengeCard from '../components/MiniChallengeCard';
import HomeButton from '../components/HomeButton';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../styles/spacing';

export default function RechargeScreen({ navigation }) {
  const { colors: themeColors } = useTheme();
  const [bundle, setBundle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [vocabCompleted, setVocabCompleted] = useState(false);
  const [grammarCompleted, setGrammarCompleted] = useState(false);
  const [conversationCompleted, setConversationCompleted] = useState(false);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [updatingSection, setUpdatingSection] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [completing, setCompleting] = useState(false);
  const STORAGE_KEY = '@recharge_state';
  const totalSections = 4;
  const completedCount =
    (vocabCompleted ? 1 : 0) +
    (grammarCompleted ? 1 : 0) +
    (challengeCompleted ? 1 : 0) +
    (conversationCompleted ? 1 : 0);

  const renderSkeleton = () => (
    <Background module="home" variant="brown">
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <View style={[styles.skeletonShort, { width: 200, height: 20, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4 }]} />
              <View style={[styles.skeletonTiny, { width: 150, height: 14, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 4, marginTop: spacing.xs || 8 }]} />
            </View>
            <View style={[styles.skeletonButton, { width: 60, height: 30, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4 }]} />
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {[1, 2, 3].map((key) => (
            <View key={key} style={styles.section}>
              <View style={[styles.skeletonShort, { width: '80%', height: 20, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, marginBottom: spacing.m || 16 }]} />
              <View style={[styles.skeletonLong, { width: '100%', height: 60, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 4, marginBottom: spacing.s || 8 }]} />
              <View style={[styles.skeletonLong, { width: '100%', height: 60, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 4 }]} />
            </View>
          ))}
        </ScrollView>
      </View>
    </Background>
  );

  const hydrateFromStorage = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.date === new Date().toDateString()) {
        setVocabCompleted(!!parsed.vocab_done);
        setGrammarCompleted(!!parsed.grammar_done);
        setChallengeCompleted(!!parsed.challenge_done);
        setXp(Number(parsed.xp_today || 0));
        setStreak(Number(parsed.streak || 0));
      }
    } catch (e) {
      // ignore cache errors
    }
  };

  const persistState = async (data = {}) => {
    try {
      const payload = {
        date: new Date().toDateString(),
        vocab_done: vocabCompleted,
        grammar_done: grammarCompleted,
        challenge_done: challengeCompleted,
        xp_today: xp,
        streak,
        ...data,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      // ignore cache errors
    }
  };

  const loadBundle = async () => {
    try {
      setLoading(true);
      setError(null);
      await hydrateFromStorage();
      const [rechargeRes, engagement] = await Promise.all([
        fetchRecharge(),
        getEngagementState().catch(() => null),
      ]);
      const data = rechargeRes.recharge || rechargeRes;
      setBundle(data);
      if (engagement) {
        setXp(Number(engagement.xp_today || 0));
        setStreak(Number(engagement.streak || 0));
        setVocabCompleted(!!engagement.vocab_done);
        setGrammarCompleted(!!engagement.grammar_done);
        setChallengeCompleted(!!engagement.challenge_done);
        setConversationCompleted(!!engagement.conversation_done);
        persistState({
          vocab_done: !!engagement.vocab_done,
          grammar_done: !!engagement.grammar_done,
          challenge_done: !!engagement.challenge_done,
          conversation_done: !!engagement.conversation_done,
          xp_today: Number(engagement.xp_today || 0),
          streak: Number(engagement.streak || 0),
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to load recharge pack. Pull to retry.');
      setStatusMessage('Offline? Showing any cached progress.');
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

  // Combine all designs: Schedule (3rd), Card grid (2nd), Flight booking (6th), Quiz (4th)
  if (loading && !bundle) {
    return (
      <Background module="home" variant="brown">
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#FFFFFF" style={styles.loader} />
        </View>
      </Background>
    );
  }

  // Combine all designs: Schedule (3rd), Card grid (2nd), Flight booking (6th), Quiz (4th)
  if (loading && !bundle) {
    return (
      <Background module="home" variant="brown">
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#FFFFFF" style={styles.loader} />
        </View>
      </Background>
    );
  }

  return (
    <Background module="home" variant="brown">
      <View style={styles.container}>
      {/* Header - Dark Blue from 3rd picture */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>DAILY RECHARGE</Text>
        <View style={styles.headerRight}>
          <HomeButton navigation={navigation} style={styles.homeButtonHeader} />
          <TouchableOpacity onPress={loadBundle} style={styles.reloadButton}>
            <Text style={styles.reloadIcon}>↻</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Date Section - From 3rd picture */}
      <View style={styles.dateSection}>
        <View style={styles.dateDisplay}>
          <Text style={styles.dateNumber}>{new Date().getDate()}</Text>
          <Text style={styles.dateDay}>{['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][new Date().getDay()]}</Text>
        </View>
        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, styles.tabActive]}>
            <Text style={[styles.tabText, styles.tabTextActive]}>TODAY LIST</Text>
          </TouchableOpacity>
          <Text style={styles.taskCount}>{completedCount} of {totalSections} completed</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadBundle} />
        }
      >
        {/* Progress Summary - Flight Booking Card from 6th picture */}
        <View style={styles.progressCard}>
          <View style={styles.progressCardLeft}>
            <Text style={styles.progressCardTitle}>Progress Today</Text>
            <Text style={styles.progressCardDescription}>{xp} XP • {streak}-day streak</Text>
            <Text style={styles.progressCardStatus}>
              {completedCount}/{totalSections} sections completed
            </Text>
          </View>
          <View style={styles.progressCardRight}>
            <Text style={styles.progressCardPercentage}>
              {Math.round((completedCount / totalSections) * 100)}%
            </Text>
          </View>
        </View>

        {/* Recharge Sections - Schedule Style from 3rd picture */}
        <View style={styles.scheduleCard}>
          <View style={styles.timeAxis}>
            {['9:00', '10:00', '11:00', '12:00'].map((time) => (
              <View key={time} style={styles.timeMarker}>
                <Text style={styles.timeText}>{time}</Text>
              </View>
            ))}
          </View>

          <View style={styles.rechargeList}>
            {/* Vocab Item */}
            <View style={styles.rechargeItem}>
              <View style={styles.rechargeContent}>
                <Text style={styles.rechargeTitle}>Vocabulary</Text>
                <Text style={styles.rechargeSubtitle}>
                  {vocab.length} words to practice
                </Text>
              </View>
              <View style={styles.rechargeStatus}>
                {vocabCompleted ? (
                  <Text style={styles.statusIcon}>✓</Text>
                ) : (
                  <TouchableOpacity
                    style={styles.startButton}
                    onPress={() => navigation.navigate('Vocab')}
                  >
                    <Text style={styles.startButtonText}>Start</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Grammar Item */}
            {grammar && (
              <View style={styles.rechargeItem}>
                <View style={styles.rechargeContent}>
                  <Text style={styles.rechargeTitle}>Grammar Bite</Text>
                  <Text style={styles.rechargeSubtitle}>{grammar.title}</Text>
                </View>
                <View style={styles.rechargeStatus}>
                  {grammarCompleted ? (
                    <Text style={styles.statusIcon}>✓</Text>
                  ) : (
                    <TouchableOpacity
                      style={styles.startButton}
                      onPress={() => navigation.navigate('GrammarBite')}
                    >
                      <Text style={styles.startButtonText}>Start</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* Challenge Item */}
            {challenge && (
              <View style={styles.rechargeItem}>
                <View style={styles.rechargeContent}>
                  <Text style={styles.rechargeTitle}>Mini Challenge</Text>
                  <Text style={styles.rechargeSubtitle}>{challenge.prompt}</Text>
                </View>
                <View style={styles.rechargeStatus}>
                  {challengeCompleted ? (
                    <Text style={styles.statusIcon}>✓</Text>
                  ) : (
                    <TouchableOpacity
                      style={styles.startButton}
                      onPress={() => navigation.navigate('MiniChallenge')}
                    >
                      <Text style={styles.startButtonText}>Start</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* Conversation Item */}
            <View style={styles.rechargeItem}>
              <View style={styles.rechargeContent}>
                <Text style={styles.rechargeTitle}>Conversation</Text>
                <Text style={styles.rechargeSubtitle}>Voice practice</Text>
              </View>
              <View style={styles.rechargeStatus}>
                {conversationCompleted ? (
                  <Text style={styles.statusIcon}>✓</Text>
                ) : (
                  <TouchableOpacity
                    style={styles.startButton}
                    onPress={() => navigation.navigate('Conversation')}
                  >
                    <Text style={styles.startButtonText}>Start</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {statusMessage && (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>{statusMessage}</Text>
          </View>
        )}

        {/* Complete Button */}
        {completedCount === totalSections && (
          <TouchableOpacity
            style={[styles.completeButton, completing && styles.completeButtonDisabled]}
            onPress={async () => {
              setCompleting(true);
              try {
                await completeRecharge();
                setStatusMessage('Recharge completed!');
              } finally {
                setCompleting(false);
              }
            }}
            disabled={completing}
          >
            <Text style={styles.completeButtonText}>
              {completing ? 'Completing...' : 'Mark Day Complete'}
            </Text>
          </TouchableOpacity>
        )}
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
  loader: {
    marginTop: 100,
  },
  header: {
    backgroundColor: '#1E3A8A',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  homeButtonHeader: {
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  reloadButton: {
    padding: 8,
  },
  reloadIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  dateSection: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  dateDisplay: {
    alignItems: 'center',
  },
  dateNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dateDay: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  taskCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  progressCardLeft: {
    flex: 1,
  },
  progressCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  progressCardDescription: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
    marginBottom: 4,
  },
  progressCardStatus: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  progressCardRight: {
    alignItems: 'flex-end',
  },
  progressCardPercentage: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  scheduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    minHeight: 400,
    flexDirection: 'row',
    marginBottom: 24,
  },
  timeAxis: {
    width: 60,
    marginRight: 16,
  },
  timeMarker: {
    marginBottom: 60,
  },
  timeText: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  rechargeList: {
    flex: 1,
  },
  rechargeItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  rechargeContent: {
    flex: 1,
  },
  rechargeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  rechargeSubtitle: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
  },
  rechargeStatus: {
    alignItems: 'flex-end',
  },
  statusIcon: {
    fontSize: 24,
    color: '#22C55E',
  },
  startButton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  errorContainer: {
    backgroundColor: 'rgba(16, 22, 40, 0.78)',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  errorText: {
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
  },
  statusContainer: {
    backgroundColor: 'rgba(16, 22, 40, 0.78)',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(27,78,218,0.35)',
  },
  statusText: {
    color: 'rgba(255,255,255,0.80)',
    textAlign: 'center',
  },
  completeButton: {
    backgroundColor: 'rgba(27,78,218,0.92)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  completeButtonDisabled: {
    opacity: 0.6,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  skeletonShort: {
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
  },
  skeletonTiny: {
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 4,
  },
  skeletonButton: {
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
  },
  skeletonLong: {
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 4,
  },
  section: {
    marginBottom: 16,
  },
});
