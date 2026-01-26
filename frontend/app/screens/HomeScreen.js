/**
 * HomeScreen - Outcome selection only
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Background from '../components/ui/Background';

export default function HomeScreen({ navigation }) {
  return (
    <Background module="home" variant="brown" imageVariant="home">
      <View style={styles.container}>
        <Text style={styles.title}>Valitse suunnitelma</Text>
        <Text style={styles.subtitle}>Valitse tavoite, jota kohti opiskelet.</Text>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation?.navigate('YKIPlan')}
          activeOpacity={0.85}
        >
          <Text style={styles.cardTitle}>YKI‑suunnitelma</Text>
          <Text style={styles.cardBody}>Kokeeseen keskittyvä harjoittelutila.</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation?.navigate('WorkPlan')}
          activeOpacity={0.85}
        >
          <Text style={styles.cardTitle}>Työvalmius‑suunnitelma</Text>
          <Text style={styles.cardBody}>Ammattisuomea omalle alallesi.</Text>
        </TouchableOpacity>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#cbd5f5',
    marginBottom: 24,
  },
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.35)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 6,
  },
  cardBody: {
    fontSize: 14,
    color: '#94a3b8',
  },
});
