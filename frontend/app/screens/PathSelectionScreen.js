// ============================================================================
// PathSelectionScreen - Learning path selection
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Background from '../components/ui/Background';
import SectionHeader from '../components/core/SectionHeader';
import PathCard from '../../components/core/PathCard';
import { spacing } from '../../design/spacing';
import HomeButton from '../components/HomeButton';

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
    <Background module="home" variant="brown">
      <View style={styles.container}>
        <View style={styles.header}>
          <SectionHeader title="Choose Your Path" />
          <HomeButton navigation={navigation} style={styles.homeButtonHeader} />
        </View>
        
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
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  homeButtonHeader: {
    marginLeft: 'auto',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
});

