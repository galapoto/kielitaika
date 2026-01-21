// ============================================================================
// CertificateDetailScreen - Certificate detail view
// ============================================================================

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import SceneBackground from '../components/SceneBackground';

/**
 * CertificateDetailScreen
 * 
 * TODO: Codex to implement:
 * - Load certificate data
 * - Download/share functionality
 * - Verification
 */
export default function CertificateDetailScreen({ route }) {
  const { certificateId } = route.params || {};

  // TODO: Load certificate data based on certificateId

  return (
    <View style={styles.container}>
      <SceneBackground sceneKey="lapland" orbEmotion="calm" />
      <View style={styles.content}>
        <Text style={styles.title}>Finnish A1</Text>
        <Text style={styles.level}>Beginner</Text>
        <Text style={styles.date}>Date: 2024-01-15</Text>
        <Text style={styles.code}>Verification Code: KieliTaika-2024-001</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  level: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  date: {
    fontSize: 14,
    color: '#999',
    marginBottom: 10,
  },
  code: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
});


