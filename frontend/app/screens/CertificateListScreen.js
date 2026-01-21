// ============================================================================
// CertificateListScreen - Certificate list view
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import SceneBackground from '../components/SceneBackground';
import { spacing } from '../styles/spacing';

/**
 * CertificateListScreen
 * 
 * TODO: Codex to implement:
 * - Load certificates from API
 * - Certificate details navigation
 * - Share functionality
 */
export default function CertificateListScreen({ navigation }) {
  const certificates = [
    {
      id: 1,
      title: 'Finnish A1',
      level: 'Beginner',
      date: '2024-01-15',
      verified: true,
    },
    {
      id: 2,
      title: 'Finnish A2',
      level: 'Elementary',
      date: '2024-03-20',
      verified: true,
    },
  ];

  return (
    <View style={styles.container}>
      <SceneBackground sceneKey="lapland" orbEmotion="calm" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Certificates</Text>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {certificates.map((cert) => (
          <TouchableOpacity
            key={cert.id}
            style={styles.certCard}
            onPress={() => navigation.navigate('CertificateDetail', { certificateId: cert.id })}
          >
            <Text style={styles.certTitle}>{cert.title}</Text>
            <Text style={styles.certLevel}>{cert.level}</Text>
            <Text style={styles.certDate}>{cert.date}</Text>
            {cert.verified && <Text style={styles.verified}>✓ Verified</Text>}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  certCard: {
    backgroundColor: '#fff',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  certTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: spacing.xs,
  },
  certLevel: {
    fontSize: 14,
    color: '#666',
    marginBottom: spacing.xs,
  },
  certDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: spacing.xs,
  },
  verified: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
});


