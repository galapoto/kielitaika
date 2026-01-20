import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import SceneBackground from '../components/SceneBackground';
import GrammarBiteCard from '../components/GrammarBiteCard';
import AnimatedCTA from '../components/AnimatedCTA';
import { fetchRecharge } from '../utils/api';

export default function GrammarBiteScreen({ navigation }) {
  const [grammar, setGrammar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchRecharge();
        setGrammar(data.recharge?.grammar || data.grammar || null);
      } catch (err) {
        setError(err.message || 'Failed to load grammar bite');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <SceneBackground sceneKey="lapland" orbEmotion="calm" />
        <View style={styles.center}> 
          <ActivityIndicator color="#1B4EDA" />
          <Text style={styles.hint}>Loading grammar...</Text>
        </View>
      </View>
    );
  }

  if (error || !grammar) {
    return (
      <View style={styles.container}>
        <SceneBackground sceneKey="lapland" orbEmotion="calm" />
        <View style={styles.center}> 
          <Text style={styles.error}>{error || 'No grammar bite'}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SceneBackground sceneKey="lapland" orbEmotion="calm" />
      <Text style={styles.title}>Grammar Bite</Text>
      <GrammarBiteCard title={grammar.title} meaning={grammar.explanation || grammar.meaning} examples={grammar.examples || []} />
      <AnimatedCTA label="Next → Mini Challenge" onPress={() => navigation.navigate('MiniChallenge')} />
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
