import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import VocabCard from '../components/VocabCard';
import AnimatedCTA from '../components/AnimatedCTA';
import { fetchRecharge } from '../utils/api';

export default function VocabScreen({ navigation }) {
  const [vocab, setVocab] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchRecharge();
        setVocab(data.recharge?.vocab || data.vocab || []);
      } catch (err) {
        setError(err.message || 'Failed to load vocabulary');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}> 
        <ActivityIndicator color="#1B4EDA" />
        <Text style={styles.hint}>Loading vocab...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}> 
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vocabulary Boost</Text>
      <FlatList
        data={vocab}
        keyExtractor={(item, idx) => `${item.fi || item.word || idx}`}
        renderItem={({ item }) => (
          <VocabCard word={item.fi || item.word} example={item.example} imageUrl={item.image} />
        )}
        contentContainerStyle={styles.list}
      />
      <AnimatedCTA label="Next → Grammar Bite" onPress={() => navigation.navigate('GrammarBite')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F8FAFC', gap: 12 },
  title: { fontSize: 20, fontWeight: '700', color: '#0A3D62' },
  list: { paddingBottom: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  hint: { color: '#64748b' },
  error: { color: '#dc2626' },
});
