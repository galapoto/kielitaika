// ============================================================================
// PronunciationLabScreen - Premium pronunciation lab
// ============================================================================

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import SceneBackground from '../../components/SceneBackground';
import SectionHeader from '../../components/core/SectionHeader';
import ScoreRing from '../../components/features/PronunciationLab/ScoreRing';
import PronunciationWaveform from '../../components/features/PronunciationLab/PronunciationWaveform';
import FeedbackCard from '../../components/features/PronunciationLab/FeedbackCard';
import MicButton from '../../components/features/ConversationUI/MicButton';
import { colors } from '../../design/colors';
import { spacing } from '../../design/spacing';

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
      <SectionHeader title="Pronunciation Lab" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Score Display */}
        <View style={styles.scoreSection}>
          <ScoreRing
            score={score}
            label="Overall Score"
            size={150}
          />
        </View>

        {/* Waveform Comparison */}
        <PronunciationWaveform />

        {/* Feedback */}
        {feedback && (
          <FeedbackCard
            title={feedback.title}
            feedback={feedback.text}
            suggestions={feedback.suggestions}
            score={feedback.score}
          />
        )}

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
});


