import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AnimatedCTA from '../components/AnimatedCTA';

export default function PersonalizedPlanScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Plan</Text>
      <View style={styles.block}>
        <Text style={styles.item}>• Vocabulary: 5 words</Text>
        <Text style={styles.item}>• Grammar: 1 micro-bite</Text>
        <Text style={styles.item}>• Conversation Topic: Morning routine</Text>
        <Text style={styles.item}>• YKI / Workplace: optional tasks</Text>
      </View>
      <AnimatedCTA label="Start Recharge" onPress={() => navigation.navigate('Recharge')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F8FAFC', gap: 12 },
  title: { fontSize: 22, fontWeight: '700', color: '#0A3D62' },
  block: { backgroundColor: '#fff', borderRadius: 12, padding: 16, gap: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  item: { color: '#1e293b' },
});
