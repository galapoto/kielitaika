import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { fetchRoleplay, evaluateRoleplay } from '../utils/api';
import MicButton from '../components/MicButton';
import { usePath } from '../context/PathContext';
import UpgradeNotice from '../components/UpgradeNotice';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { transcribeAudio } from '../services/sttService';
import { useSound } from '../hooks/useSound';

export default function RoleplayScreen({ route, navigation }) {
  const { field, scenarioTitle, level = 'B1' } = route?.params || {};
  const { profession: ctxProfession } = usePath();
  const activeField = field || ctxProfession;
  
  const [scenario, setScenario] = useState(null);
  const [userResponse, setUserResponse] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState(null);
  const [upgradeReason, setUpgradeReason] = useState(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  const { startRecording, stopRecording, isRecording } = useAudioRecorder();
  const { playMicOn } = useSound();

  useEffect(() => {
    if (activeField) {
      loadScenario();
    }
  }, [activeField, scenarioTitle, level]);

  const loadScenario = async () => {
    try {
      setIsLoading(true);
      const response = await fetchRoleplay(activeField, scenarioTitle, level);
      setScenario(response);
      setUpgradeReason(null);
    } catch (err) {
      console.error('Error loading roleplay:', err);
      if (err?.message?.includes('Upgrade required')) {
        setUpgradeReason(err.message);
      }
      setError(err.message || 'Failed to load roleplay scenario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicPressIn = async () => {
    try {
      playMicOn();
      await startRecording();
    } catch (err) {
      Alert.alert('Recording Error', err.message || 'Failed to start recording');
    }
  };

  const handleMicPressOut = async () => {
    try {
      const audioUri = await stopRecording();
      if (audioUri) {
        setIsTranscribing(true);
        try {
          const result = await transcribeAudio(audioUri);
          const transcript = result?.transcript || result?.text || '';
          if (transcript.trim()) {
            setUserResponse(transcript);
          } else {
            Alert.alert('No Speech Detected', 'Please try speaking again.');
          }
        } catch (err) {
          Alert.alert('Transcription Error', err.message || 'Failed to transcribe audio');
        } finally {
          setIsTranscribing(false);
        }
      }
    } catch (err) {
      Alert.alert('Recording Error', err.message || 'Failed to stop recording');
      setIsTranscribing(false);
    }
  };

  const handleEvaluate = async () => {
    if (!userResponse.trim()) {
      alert('Please provide a response first');
      return;
    }

    try {
      setIsEvaluating(true);
      const response = await evaluateRoleplay(activeField, userResponse);
      setEvaluation(response);
      setUpgradeReason(null);
    } catch (err) {
      console.error('Error evaluating roleplay:', err);
      if (err?.message?.includes('Upgrade required')) {
        setUpgradeReason(err.message);
      }
      alert(err.message || 'Failed to evaluate response');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleReset = () => {
    setUserResponse('');
    setEvaluation(null);
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0A3D62" />
        <Text style={styles.loadingText}>Loading roleplay scenario...</Text>
      </View>
    );
  }

  if (error || !scenario) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Scenario not found'}</Text>
        {upgradeReason && (
          <UpgradeNotice
            reason={upgradeReason}
            onPress={() => navigation.navigate('Subscription')}
          />
        )}
        <TouchableOpacity style={styles.retryButton} onPress={loadScenario}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Roleplay: {scenario.title}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.scenarioSection}>
          <Text style={styles.sectionTitle}>Scenario</Text>
          <View style={styles.promptContainer}>
            <Text style={styles.promptText}>{scenario.roleplay_prompt}</Text>
          </View>
        </View>

        {scenario.key_phrases && scenario.key_phrases.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Phrases to Use</Text>
            <View style={styles.phrasesContainer}>
              {scenario.key_phrases.map((phrase, idx) => (
                <View key={idx} style={styles.phraseChip}>
                  <Text style={styles.phraseText}>{phrase}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {scenario.grammar_tip && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Grammar Tip</Text>
            <View style={styles.tipContainer}>
              <Text style={styles.tipText}>{scenario.grammar_tip}</Text>
            </View>
          </View>
        )}

        <View style={styles.responseSection}>
          <Text style={styles.sectionTitle}>Your Response</Text>
          <View style={styles.audioInputContainer}>
            <MicButton 
              onPressIn={handleMicPressIn} 
              onPressOut={handleMicPressOut} 
              disabled={isEvaluating || isTranscribing}
            />
            {isTranscribing && (
              <Text style={styles.transcribingText}>Transcribing...</Text>
            )}
          </View>
          <TextInput
            style={styles.textInput}
            value={userResponse}
            onChangeText={setUserResponse}
            placeholder="Type or speak your response in Finnish..."
            multiline
            numberOfLines={4}
            editable={!isTranscribing}
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.evaluateButton, (!userResponse.trim() || isEvaluating || isTranscribing) && styles.buttonDisabled]}
            onPress={handleEvaluate}
            disabled={!userResponse.trim() || isEvaluating || isTranscribing}
          >
            {isEvaluating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.evaluateButtonText}>Evaluate Response</Text>
            )}
          </TouchableOpacity>

          {evaluation && (
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleReset}
            >
              <Text style={styles.resetButtonText}>Try Again</Text>
            </TouchableOpacity>
          )}
        </View>

        {evaluation && (
          <View style={styles.evaluationSection}>
            <Text style={styles.sectionTitle}>Evaluation Results</Text>
            
            <View style={styles.scoresContainer}>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>Coverage</Text>
                <Text style={styles.scoreValue}>{evaluation.scores?.coverage || 0}/3</Text>
              </View>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>Clarity</Text>
                <Text style={styles.scoreValue}>{evaluation.scores?.clarity || 0}/3</Text>
              </View>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>Politeness</Text>
                <Text style={styles.scoreValue}>{evaluation.scores?.politeness || 0}/1</Text>
              </View>
              <View style={[styles.scoreItem, styles.totalScore]}>
                <Text style={styles.scoreLabel}>Total</Text>
                <Text style={styles.scoreValue}>{evaluation.scores?.total || 0}/5</Text>
              </View>
            </View>

            {evaluation.feedback && evaluation.feedback.length > 0 && (
              <View style={styles.feedbackContainer}>
                <Text style={styles.feedbackTitle}>Feedback:</Text>
                {evaluation.feedback.map((item, idx) => (
                  <View key={idx} style={styles.feedbackItem}>
                    <Text style={styles.feedbackBullet}>•</Text>
                    <Text style={styles.feedbackText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}

            {evaluation.missing_phrases && evaluation.missing_phrases.length > 0 && (
              <View style={styles.missingContainer}>
                <Text style={styles.missingTitle}>Missing Key Phrases:</Text>
                <View style={styles.missingPhrases}>
                  {evaluation.missing_phrases.map((phrase, idx) => (
                    <View key={idx} style={styles.missingChip}>
                      <Text style={styles.missingText}>{phrase}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#0A3D62',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0A3D62',
  },
  content: {
    padding: 20,
  },
  scenarioSection: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  promptContainer: {
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#0A3D62',
  },
  promptText: {
    fontSize: 16,
    color: '#1e293b',
    lineHeight: 24,
  },
  phrasesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  phraseChip: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  phraseText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A3D62',
  },
  tipContainer: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F6C400',
  },
  tipText: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 20,
  },
  responseSection: {
    marginBottom: 24,
  },
  audioInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  transcribingText: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
  },
  textInput: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 24,
  },
  evaluateButton: {
    backgroundColor: '#0A3D62',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  evaluateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#64748b',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  evaluationSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  scoresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  scoreItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  totalScore: {
    backgroundColor: '#eef2ff',
    borderWidth: 2,
    borderColor: '#0A3D62',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0A3D62',
  },
  feedbackContainer: {
    marginBottom: 16,
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  feedbackItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  feedbackBullet: {
    fontSize: 16,
    color: '#0A3D62',
    marginRight: 8,
  },
  feedbackText: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 20,
  },
  missingContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  missingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 12,
  },
  missingPhrases: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  missingChip: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dc2626',
  },
  missingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#0A3D62',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
