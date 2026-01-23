import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MiniChallengeCard from '../components/MiniChallengeCard';
import { fetchRecharge } from '../utils/api';

export default function MiniChallengeScreen({ navigation }) {
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchRecharge();
        setChallenge(data.recharge?.mini_challenge || data.mini_challenge || null);
      } catch (err) {
        setError(err.message || 'Failed to load challenge');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Combine all designs: Quiz design (4th) for challenge interface
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.hint}>Loading challenge...</Text>
      </View>
    );
  }

  if (error || !challenge) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error || 'No challenge available'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4A148C', '#1A237E', '#0D47A1']} // Dark purple gradient from 4th picture
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Header Bar - From 4th picture (Quiz design) */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()} style={styles.headerLeft}>
          <Text style={styles.headerIcon}>←</Text>
          <Text style={styles.headerText}>Challenge</Text>
        </TouchableOpacity>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: completed ? '100%' : '50%' }]} />
        </View>
        <TouchableOpacity style={styles.headerRight}>
          <Text style={styles.headerIcon}>⚡</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Challenge Card - From 4th picture (Question card style) */}
        <View style={styles.challengeCard}>
          <Text style={styles.challengeNumber}>
            Challenge <Text style={styles.challengeNumberHighlight}>01</Text>
          </Text>
          <Text style={styles.challengeCategory}>Mini Challenge</Text>
          <Text style={styles.challengeText}>
            "{challenge.prompt || 'Pick the right match'}"
          </Text>
        </View>

        {/* Mini Challenge Card Component */}
        <View style={styles.challengeContainer}>
          <MiniChallengeCard
            challengeData={{
              prompt: challenge.prompt || 'Pick the right match',
              options: challenge.word_bank || challenge.options || [],
              answer: (challenge.word_bank && challenge.word_bank[0]) || challenge.answer || '',
            }}
            onComplete={() => setCompleted(true)}
          />
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[styles.actionButton, completed && styles.actionButtonCompleted]}
          onPress={() => navigation.navigate('Conversation')}
        >
          <Text style={styles.actionButtonText}>
            {completed ? 'Conversation Ready → Start' : 'Skip to Conversation'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A148C', // Dark purple from 4th picture
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  headerIcon: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  challengeCard: {
    backgroundColor: '#1A0B2E', // Dark indigo from 4th picture
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    position: 'relative',
  },
  challengeNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  challengeNumberHighlight: {
    color: '#FF6B35',
  },
  challengeCategory: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 16,
  },
  challengeText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
  },
  challengeContainer: {
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonCompleted: {
    backgroundColor: '#22C55E',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  hint: {
    color: '#FFFFFF',
  },
  error: {
    color: '#FF6B35',
  },
});
