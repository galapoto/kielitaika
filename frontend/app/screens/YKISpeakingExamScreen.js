import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function YKISpeakingExamScreen({ route }) {
  const tasks = route?.params?.tasks || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>YKI Speaking Tasks</Text>
      <Text style={styles.subtitle}>
        Start the full simulation from the main YKI screen to record and submit answers.
      </Text>

      {tasks.length === 0 && (
        <View style={styles.card}>
          <Text style={styles.bodyText}>No tasks provided. Launch from the YKI screen.</Text>
        </View>
      )}

      {tasks.map((task) => (
        <View key={task.id} style={styles.card}>
          <Text style={styles.cardTitle}>{task.description || 'Speaking task'}</Text>
          <Text style={styles.meta}>Time limit ~{task.time_limit}s</Text>
          <Text style={styles.bodyText}>{task.prompt}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0A3D62',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  meta: {
    color: '#64748b',
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
  },
});
