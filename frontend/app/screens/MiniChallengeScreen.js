import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import MiniChallengeCard from '../components/MiniChallengeCard';
import AnimatedCTA from '../components/AnimatedCTA';
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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#1B4EDA" />
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
      <Text style={styles.title}>Mini Challenge</Text>
      <MiniChallengeCard challengeData={{
        prompt: challenge.prompt || 'Pick the right match',
        options: challenge.word_bank || challenge.options || [],
        answer: (challenge.word_bank && challenge.word_bank[0]) || challenge.answer || '',
      }} onComplete={() => setCompleted(true)} />
      <AnimatedCTA
        label={completed ? 'Conversation Ready → Start' : 'Skip to Conversation'}
        onPress={() => navigation.navigate('Conversation')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F8FAFC', gap: 12 },
  title: { fontSize: 20, fontWeight: '700', color: '#0A3D62' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  hint: { color: '#64748b' },
  error: { color: '#dc2626' },
});
