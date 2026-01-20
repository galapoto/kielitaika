// ============================================================================
// PathSelectionScreen - Learning path selection
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import SceneBackground from '../../components/SceneBackground';
import SectionHeader from '../../components/core/SectionHeader';
import PathCard from '../../components/core/PathCard';
import { colors } from '../../design/colors';
import { spacing } from '../../design/spacing';

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
      <SectionHeader title="Choose Your Path" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {paths.map((path) => (
          <PathCard
            key={path.id}
            {...path}
            onPress={() => navigation.navigate('PathDetails', { pathId: path.id })}
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

