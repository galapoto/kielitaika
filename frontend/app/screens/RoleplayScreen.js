import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  BackHandler,
} from 'react-native';
import MicButton from '../components/MicButton';
import Background from '../components/ui/Background';
import { useVoiceStreaming } from '../hooks/useVoiceStreaming';
import { useVoice } from '../hooks/useVoice';
import { fetchRoleplay, evaluateRoleplay } from '../utils/api';

export default function RoleplayScreen({ navigation, route } = {}) {
  const {
    field = 'sairaanhoitaja',
    scenarioTitle = null,
    level = 'B1',
  } = route?.params || {};

  const [scenario, setScenario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const sessionLockRef = useRef(false);

  const { speak } = useVoice();

  const handleSpeakPrompt = useCallback(async () => {
    const prompt = scenario?.roleplay_prompt;
    if (!prompt) return;
    try {
      await speak(prompt, 'professional');
    } catch (err) {
      setError(err?.message || 'Failed to play prompt audio.');
    }
  }, [scenario?.roleplay_prompt, speak]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      setScenario(null);
      setTranscript('');
      setEvaluation(null);
      try {
        const data = await fetchRoleplay(field, scenarioTitle, level);
        if (!mounted) return;
        setScenario(data);
        if (data?.roleplay_prompt) {
          await speak(data.roleplay_prompt, 'professional');
        }
      } catch (err) {
        if (!mounted) return;
        setError(err?.message || 'Failed to load roleplay scenario.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [field, scenarioTitle, level, speak]);

  const handleTranscriptComplete = useCallback(
    async (text) => {
      const normalized = (text || '').trim();
      if (!normalized) return;
      setTranscript(normalized);
      setIsEvaluating(true);
      setError(null);
      try {
        const result = await evaluateRoleplay(field, normalized);
        setEvaluation(result);
      } catch (err) {
        setError(err?.message || 'Failed to evaluate roleplay response.');
      } finally {
        setIsEvaluating(false);
      }
    },
    [field]
  );

  const handleVoiceState = useCallback((state) => {
    sessionLockRef.current = state.isRecording || state.isProcessing;
  }, []);

  const {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
  } = useVoiceStreaming({
    onStateChange: handleVoiceState,
    onTranscriptComplete: handleTranscriptComplete,
  });

  useEffect(() => {
    const handleBack = () => {
      if (sessionLockRef.current) {
        Alert.alert('Session in progress', 'Finish the current speaking turn before leaving.');
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBack);
    const unsubscribe = navigation?.addListener?.('beforeRemove', (e) => {
      if (!sessionLockRef.current) return;
      e.preventDefault();
      Alert.alert('Session in progress', 'Finish the current speaking turn before leaving.');
    });

    return () => {
      backHandler.remove();
      if (unsubscribe) unsubscribe();
    };
  }, [navigation]);

  const keyPhrases = useMemo(() => scenario?.key_phrases || [], [scenario?.key_phrases]);

  if (loading) {
    return (
      <Background module="workplace" variant="brown" imageVariant="workplace">
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      </Background>
    );
  }

  if (error) {
    return (
      <Background module="workplace" variant="brown" imageVariant="workplace">
        <View style={styles.container}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </Background>
    );
  }

  return (
    <Background module="workplace" variant="brown" imageVariant="workplace">
      <View style={styles.container}>
        <Text style={styles.title}>{scenario?.title || 'Roleplay'}</Text>
        <Text style={styles.subtitle}>Nursing benchmark • {level}</Text>
        <Text style={styles.prompt}>{scenario?.roleplay_prompt}</Text>

        {!!keyPhrases.length && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key phrases</Text>
            {keyPhrases.map((phrase) => (
              <Text key={phrase} style={styles.sectionItem}>• {phrase}</Text>
            ))}
          </View>
        )}

        {scenario?.grammar_tip ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Grammar focus</Text>
            <Text style={styles.sectionItem}>{scenario.grammar_tip}</Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.promptButton} onPress={handleSpeakPrompt}>
          <Text style={styles.promptButtonText}>Play Prompt</Text>
        </TouchableOpacity>

        <View style={styles.micRow}>
          <MicButton
            onPressIn={startRecording}
            onPressOut={stopRecording}
            disabled={isProcessing}
            isActive={isRecording}
          />
          <Text style={styles.micStatus}>
            {isRecording ? 'Listening…' : isProcessing ? 'Processing…' : 'Hold to respond'}
          </Text>
        </View>

        {transcript ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your response</Text>
            <Text style={styles.sectionItem}>{transcript}</Text>
          </View>
        ) : null}

        {isEvaluating ? (
          <Text style={styles.sectionItem}>Evaluating…</Text>
        ) : null}

        {evaluation ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Feedback</Text>
            {(evaluation.feedback || []).map((line) => (
              <Text key={line} style={styles.sectionItem}>• {line}</Text>
            ))}
            {evaluation.missing_phrases?.length ? (
              <Text style={styles.sectionItem}>
                Missing phrases: {evaluation.missing_phrases.join(', ')}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    color: '#f8fafc',
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    color: '#cbd5f5',
    fontSize: 14,
    marginBottom: 16,
  },
  prompt: {
    color: '#e2e8f0',
    fontSize: 16,
    marginBottom: 16,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  sectionItem: {
    color: '#cbd5f5',
    fontSize: 14,
    marginBottom: 4,
  },
  micRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  micStatus: {
    color: '#e2e8f0',
    marginLeft: 16,
    fontSize: 14,
  },
  promptButton: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  promptButtonText: {
    color: '#e2e8f0',
    fontSize: 14,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 16,
  },
});
