import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useVoiceStreaming } from '../hooks/useVoiceStreaming';
import MicButton from './MicButton';
import AudioPlayer from './AudioPlayer';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';
import { radius } from '../styles/radius';
import { shadows } from '../styles/shadows';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:8000';

/**
 * Pronunciation Nudge Component
 * 
 * Mini vowel/consonant drills with minimal pair lists and quick feedback.
 * Can be used inline in conversation or as a standalone drill.
 */
export default function PronunciationNudge({ 
  expectedText, 
  transcript, 
  onComplete,
  autoStart = false,
  minimalPairs = null 
}) {
  const [nudge, setNudge] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPairIndex, setCurrentPairIndex] = useState(0);

  // Voice streaming for practice
  const {
    isRecording,
    isProcessing,
    transcript: practiceTranscript,
    startRecording,
    stopRecording,
    speakText,
  } = useVoiceStreaming({
    onTranscriptComplete: async (finalTranscript) => {
      // Auto-check pronunciation when done
      if (nudge && finalTranscript.trim()) {
        await checkPronunciation(finalTranscript);
      }
    },
    vadSilenceThreshold: 2000,
  });

  // Default minimal pairs for Finnish
  const defaultMinimalPairs = minimalPairs || [
    { word1: 'tuli', word2: 'tuuli', meaning1: 'fire', meaning2: 'wind', type: 'vowel_length' },
    { word1: 'kana', word2: 'kanna', meaning1: 'chicken', meaning2: 'carry', type: 'consonant' },
    { word1: 'muta', word2: 'mutta', meaning1: 'mud', meaning2: 'but', type: 'consonant' },
    { word1: 'taka', word2: 'takka', meaning1: 'back', meaning2: 'fireplace', type: 'consonant' },
    { word1: 'kuka', word2: 'kukka', meaning1: 'who', meaning2: 'flower', type: 'consonant' },
  ];

  // Fetch nudge from backend
  useEffect(() => {
    if (expectedText && transcript) {
      fetchNudge();
    }
  }, [expectedText, transcript]);

  const fetchNudge = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(`${API_BASE}/voice/pronunciation/nudge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expected_text: expectedText,
          transcript: transcript,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch nudge');
      }

      const data = await res.json();
      setNudge(data.nudge);
    } catch (err) {
      setError(err.message || 'Failed to load pronunciation nudge');
    } finally {
      setLoading(false);
    }
  };

  const checkPronunciation = async (practiceText) => {
    // Simple client-side check (can be enhanced with backend)
    const practiceLower = practiceText.toLowerCase().trim();
    const expectedLower = (nudge?.expected || expectedText || '').toLowerCase().trim();
    
    // Calculate similarity
    const similarity = calculateSimilarity(practiceLower, expectedLower);
    
    if (similarity > 0.8) {
      // Good match - move to next pair or complete
      if (currentPairIndex < defaultMinimalPairs.length - 1) {
        setCurrentPairIndex(currentPairIndex + 1);
      } else if (onComplete) {
        onComplete({ success: true, similarity });
      }
    }
  };

  const calculateSimilarity = (str1, str2) => {
    // Simple word-based similarity
    const words1 = str1.split(/\s+/);
    const words2 = str2.split(/\s+/);
    const matches = words1.filter(w => words2.includes(w)).length;
    return matches / Math.max(words1.length, words2.length);
  };

  const handlePracticeWord = async (word) => {
    // Play the word via TTS
    speakText(word);
    
    // Start recording for user to repeat
    setTimeout(async () => {
      await startRecording();
    }, 1000);
  };

  const currentPair = defaultMinimalPairs[currentPairIndex];

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading pronunciation tips...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {nudge && !loading && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Focus area */}
          <View style={styles.focusCard}>
            <Text style={styles.focusLabel}>Focus Area</Text>
            <Text style={styles.focusText}>
              {nudge.focus === 'vowel_length' && 'Vowel Length (Pituus)'}
              {nudge.focus === 'consonant_doubling' && 'Consonant Doubling (Kaksoiskonsonantit)'}
              {nudge.focus === 'rhythm' && 'Rhythm (Rytmi)'}
              {!['vowel_length', 'consonant_doubling', 'rhythm'].includes(nudge.focus) && 'General Pronunciation'}
            </Text>
          </View>

          {/* Nudges */}
          {nudge.nudges && nudge.nudges.length > 0 && (
            <View style={styles.nudgesSection}>
              <Text style={styles.sectionTitle}>Tips</Text>
              {nudge.nudges.map((n, idx) => (
                <View key={idx} style={styles.nudgeCard}>
                  <Text style={styles.nudgeMessage}>{n.message}</Text>
                  {n.example && (
                    <Text style={styles.nudgeExample}>Example: {n.example}</Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Minimal pairs practice */}
          <View style={styles.pairsSection}>
            <Text style={styles.sectionTitle}>Practice Minimal Pairs</Text>
            <Text style={styles.sectionSubtitle}>
              Listen and repeat to practice the difference
            </Text>

            {currentPair && (
              <View style={styles.pairCard}>
                <View style={styles.pairRow}>
                  <View style={styles.wordCard}>
                    <Text style={styles.wordLabel}>Word 1</Text>
                    <Text style={styles.word}>{currentPair.word1}</Text>
                    <Text style={styles.meaning}>{currentPair.meaning1}</Text>
                    <TouchableOpacity
                      style={styles.playButton}
                      onPress={() => handlePracticeWord(currentPair.word1)}
                    >
                      <Text style={styles.playButtonText}>▶ Play & Practice</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.vs}>vs</Text>

                  <View style={styles.wordCard}>
                    <Text style={styles.wordLabel}>Word 2</Text>
                    <Text style={styles.word}>{currentPair.word2}</Text>
                    <Text style={styles.meaning}>{currentPair.meaning2}</Text>
                    <TouchableOpacity
                      style={styles.playButton}
                      onPress={() => handlePracticeWord(currentPair.word2)}
                    >
                      <Text style={styles.playButtonText}>▶ Play & Practice</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Practice area */}
                {isRecording && (
                  <View style={styles.practiceArea}>
                    <Text style={styles.practiceHint}>
                      Repeat the word you just heard...
                    </Text>
                    <MicButton
                      onPressIn={() => {}}
                      onPressOut={stopRecording}
                      isActive={isRecording}
                    />
                  </View>
                )}

                {practiceTranscript && (
                  <View style={styles.transcriptArea}>
                    <Text style={styles.transcriptLabel}>You said:</Text>
                    <Text style={styles.transcript}>{practiceTranscript}</Text>
                  </View>
                )}

                {/* Progress */}
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${((currentPairIndex + 1) / defaultMinimalPairs.length) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {currentPairIndex + 1} of {defaultMinimalPairs.length}
                </Text>
              </View>
            )}

            {/* Navigation */}
            <View style={styles.navigation}>
              <TouchableOpacity
                style={[styles.navButton, currentPairIndex === 0 && styles.navButtonDisabled]}
                onPress={() => setCurrentPairIndex(Math.max(0, currentPairIndex - 1))}
                disabled={currentPairIndex === 0}
              >
                <Text style={styles.navButtonText}>← Previous</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.navButton,
                  currentPairIndex >= defaultMinimalPairs.length - 1 && styles.navButtonDisabled,
                ]}
                onPress={() =>
                  setCurrentPairIndex(
                    Math.min(defaultMinimalPairs.length - 1, currentPairIndex + 1)
                  )
                }
                disabled={currentPairIndex >= defaultMinimalPairs.length - 1}
              >
                <Text style={styles.navButtonText}>Next →</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Completion */}
          {currentPairIndex >= defaultMinimalPairs.length - 1 && practiceTranscript && (
            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => onComplete && onComplete({ success: true })}
            >
              <Text style={styles.completeButtonText}>Complete Practice</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    padding: spacing.l,
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSoft,
  },
  errorContainer: {
    padding: spacing.l,
    backgroundColor: '#fee2e2',
    borderRadius: radius.m,
    margin: spacing.m,
  },
  errorText: {
    ...typography.bodySm,
    color: '#b91c1c',
  },
  content: {
    flex: 1,
    padding: spacing.l,
  },
  focusCard: {
    backgroundColor: colors.blueMain,
    padding: spacing.l,
    borderRadius: radius.l,
    marginBottom: spacing.m,
    ...shadows.s,
  },
  focusLabel: {
    ...typography.bodySm,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  focusText: {
    ...typography.titleM,
    color: colors.white,
    fontWeight: '700',
  },
  nudgesSection: {
    marginBottom: spacing.l,
  },
  sectionTitle: {
    ...typography.titleM,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: spacing.s,
  },
  sectionSubtitle: {
    ...typography.bodySm,
    color: colors.textSoft,
    marginBottom: spacing.m,
  },
  nudgeCard: {
    backgroundColor: colors.grayBg,
    padding: spacing.m,
    borderRadius: radius.m,
    marginBottom: spacing.s,
  },
  nudgeMessage: {
    ...typography.body,
    color: colors.textMain,
    marginBottom: spacing.xs,
  },
  nudgeExample: {
    ...typography.bodySm,
    color: colors.textSoft,
    fontStyle: 'italic',
  },
  pairsSection: {
    marginBottom: spacing.l,
  },
  pairCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.grayLine,
    borderRadius: radius.l,
    padding: spacing.l,
    ...shadows.s,
  },
  pairRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
  },
  wordCard: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  wordLabel: {
    ...typography.bodySm,
    color: colors.textSoft,
    fontWeight: '600',
  },
  word: {
    ...typography.titleL,
    fontWeight: '700',
    color: colors.textMain,
  },
  meaning: {
    ...typography.bodySm,
    color: colors.textSoft,
    fontStyle: 'italic',
  },
  playButton: {
    backgroundColor: colors.blueMain,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderRadius: radius.m,
    marginTop: spacing.xs,
  },
  playButtonText: {
    ...typography.bodySm,
    color: colors.white,
    fontWeight: '600',
  },
  vs: {
    ...typography.titleM,
    fontWeight: '700',
    color: colors.textSoft,
  },
  practiceArea: {
    marginTop: spacing.m,
    alignItems: 'center',
    gap: spacing.s,
    padding: spacing.m,
    backgroundColor: colors.grayBg,
    borderRadius: radius.m,
  },
  practiceHint: {
    ...typography.bodySm,
    color: colors.textSoft,
  },
  transcriptArea: {
    marginTop: spacing.m,
    padding: spacing.m,
    backgroundColor: colors.grayBg,
    borderRadius: radius.m,
  },
  transcriptLabel: {
    ...typography.bodySm,
    color: colors.textSoft,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  transcript: {
    ...typography.body,
    color: colors.textMain,
    fontWeight: '500',
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.grayLine,
    borderRadius: 2,
    marginTop: spacing.m,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.blueMain,
  },
  progressText: {
    ...typography.bodySm,
    color: colors.textSoft,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.m,
    gap: spacing.m,
  },
  navButton: {
    flex: 1,
    backgroundColor: colors.blueMain,
    paddingVertical: spacing.m,
    borderRadius: radius.m,
    alignItems: 'center',
  },
  navButtonDisabled: {
    backgroundColor: colors.grayLine,
  },
  navButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#10b981',
    paddingVertical: spacing.m,
    borderRadius: radius.m,
    alignItems: 'center',
    marginTop: spacing.m,
  },
  completeButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '700',
  },
});
