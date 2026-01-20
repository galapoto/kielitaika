// ============================================================================
// CertificateListScreen - Certificate list view
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import SceneBackground from '../../components/SceneBackground';
import SectionHeader from '../../components/core/SectionHeader';
import CertificateCard from '../../components/features/Certificates/CertificateCard';
import { spacing } from '../../design/spacing';

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
      <SectionHeader title="My Certificates" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {certificates.map((cert) => (
          <CertificateCard
            key={cert.id}
            {...cert}
            onPress={() => navigation.navigate('CertificateDetail', { certificateId: cert.id })}
          />
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
});


