// ============================================================================
// PronunciationLabScreen - Premium pronunciation lab
// ============================================================================

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import SceneBackground from '../components/SceneBackground';
import MicButton from '../components/MicButton';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';

/**
 * PronunciationLabScreen
 * 
 * TODO: Codex to implement:
 * - Real pronunciation analysis
 * - Audio recording and playback
 * - Waveform visualization
 * - Detailed feedback
 */
export default function PronunciationLabScreen({ navigation }) {
  const [score, setScore] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleRecord = () => {
    // TODO: Codex - Implement recording and analysis
    setIsRecording(!isRecording);
  };

  return (
    <View style={styles.container}>
      <SceneBackground sceneKey="lapland" orbEmotion="calm" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pronunciation Lab</Text>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Score Display */}
        <View style={styles.scoreSection}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreText}>{score}%</Text>
            <Text style={styles.scoreLabel}>Overall Score</Text>
          </View>
        </View>

        {/* Recording Button */}
        <View style={styles.recordSection}>
          <MicButton
            onPressIn={() => setIsRecording(true)}
            onPressOut={() => setIsRecording(false)}
            isRecording={isRecording}
          />
          <Text style={styles.recordHint}>
            Hold to record your pronunciation
          </Text>
        </View>

        {/* Feedback */}
        {feedback && (
          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackTitle}>{feedback.title}</Text>
            <Text style={styles.feedbackText}>{feedback.text}</Text>
          </View>
        )}
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
    gap: spacing.xl,
  },
  scoreSection: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  recordSection: {
    alignItems: 'center',
    gap: spacing.md,
    marginVertical: spacing.xl,
  },
  recordHint: {
    color: colors.text.secondary,
    fontSize: 14,
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
  scoreCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#4CAF50',
  },
  scoreText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  feedbackCard: {
    backgroundColor: '#fff',
    padding: spacing.md,
    borderRadius: 12,
    marginTop: spacing.md,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: spacing.sm,
  },
  feedbackText: {
    fontSize: 14,
    color: '#666',
  },
});


