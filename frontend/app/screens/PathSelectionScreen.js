// ============================================================================
// PathSelectionScreen - Learning path selection
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import SceneBackground from '../components/SceneBackground';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';

/**
 * PathSelectionScreen
 * 
 * TODO: Codex to implement:
 * - Load paths from API
 * - Navigation to path details
 * - Progress tracking
 */
export default function PathSelectionScreen({ navigation }) {
  const paths = [
    { id: 1, title: 'Beginner', description: 'Start your journey', progress: 0, icon: '🌱' },
    { id: 2, title: 'Intermediate', description: 'Build fluency', progress: 0, icon: '🌿' },
    { id: 3, title: 'Advanced', description: 'Master Finnish', progress: 0, icon: '🌳' },
  ];

  return (
    <View style={styles.container}>
      <SceneBackground sceneKey="forest" orbEmotion="calm" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Choose Your Path</Text>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {paths.map((path) => (
          <TouchableOpacity
            key={path.id}
            style={styles.pathCard}
            onPress={() => navigation.navigate('PathDetails', { pathId: path.id })}
          >
            <Text style={styles.pathIcon}>{path.icon}</Text>
            <Text style={styles.pathTitle}>{path.title}</Text>
            <Text style={styles.pathDescription}>{path.description}</Text>
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
  pathCard: {
    backgroundColor: '#fff',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  pathIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  pathTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: spacing.xs,
  },
  pathDescription: {
    fontSize: 14,
    color: '#666',
  },
});

