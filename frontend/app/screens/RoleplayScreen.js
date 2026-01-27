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
import {
  completeSpeakingSession,
  setSpeakingTurnAiTranscript,
  setSpeakingTurnUserTranscript,
} from '../utils/speakingAttempts';
import { useSpeakingSessionContext } from '../context/SpeakingSessionContext';

export default function RoleplayScreen({ navigation, route } = {}) {
  const {
    field = 'sairaanhoitaja',
    scenarioTitle = null,
    level = 'B1',
  } = route?.params || {};

  // Get session from context (provided by SpeakingScreenWrapper)
  const { sessionId, session, status: sessionStatus, currentTurn: turn0 } = useSpeakingSessionContext();
  const transcript = turn0?.userSpeech?.transcript || '';

  const [scenario, setScenario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const sessionLockRef = useRef(false);

  const { speak } = useVoice();

  const handleSpeakPrompt = useCallback(async () => {
    if (sessionStatus === 'completed') return;
    const prompt = scenario?.roleplay_prompt;
    if (!prompt) return;
    try {
      await speak(prompt, 'professional');
    } catch (err) {
      setError(err?.message || 'Ohjeen äänen toisto epäonnistui.');
    }
  }, [scenario?.roleplay_prompt, speak, sessionStatus]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      setScenario(null);
      setEvaluation(null);
      try {
        const data = await fetchRoleplay(field, scenarioTitle, level);
        if (!mounted) return;
        setScenario(data);
        if (data?.roleplay_prompt) {
          setSpeakingTurnAiTranscript(sessionId, 0, data.roleplay_prompt);
        }
        if (data?.roleplay_prompt) {
          await speak(data.roleplay_prompt, 'professional');
        }
      } catch (err) {
        if (!mounted) return;
        setError(err?.message || 'Roolipelin lataus epäonnistui.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [field, scenarioTitle, level, speak, sessionId]);

  const handleTranscriptComplete = useCallback(
    async (text) => {
      if (sessionStatus === 'completed') return;
      const normalized = (text || '').trim();
      if (!normalized) return;
      setSpeakingTurnUserTranscript(sessionId, 0, normalized);
      setIsEvaluating(true);
      setError(null);
      try {
        const result = await evaluateRoleplay(field, normalized);
        setEvaluation(result);
        // Roleplay is a finite single-turn interaction; enter review mode after evaluation.
        completeSpeakingSession(sessionId);
      } catch (err) {
        setError(err?.message || 'Vastauksen arviointi epäonnistui.');
      } finally {
        setIsEvaluating(false);
      }
    },
    [field, sessionId, sessionStatus]
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
        Alert.alert('Harjoitus kesken', 'Viimeistele käynnissä oleva puhevuoro ennen poistumista.');
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBack);
    const unsubscribe = navigation?.addListener?.('beforeRemove', (e) => {
      if (!sessionLockRef.current) return;
      e.preventDefault();
      Alert.alert('Harjoitus kesken', 'Viimeistele käynnissä oleva puhevuoro ennen poistumista.');
    });

    return () => {
      backHandler.remove();
      if (unsubscribe) unsubscribe();
    };
  }, [navigation]);

  const keyPhrases = useMemo(() => scenario?.key_phrases || [], [scenario?.key_phrases]);

  if (sessionStatus === 'completed') {
    const aiText = turn0?.aiSpeech?.transcript || scenario?.roleplay_prompt || '';
    const userText = turn0?.userSpeech?.transcript || '';
    return (
      <Background module="workplace" variant="brown" imageVariant="workplace">
        <View style={styles.container}>
          <View style={styles.reviewCard}>
            <Text style={styles.reviewCardLabel}>Tekoäly</Text>
            <Text style={styles.reviewCardText}>{aiText}</Text>
          </View>
          <View style={styles.reviewCard}>
            <Text style={styles.reviewCardLabel}>Sinä</Text>
            <Text style={styles.reviewCardText}>{userText}</Text>
          </View>
        </View>
      </Background>
    );
  }

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
        <Text style={styles.title}>{scenario?.title || 'Roolipeli'}</Text>
        <Text style={styles.subtitle}>Ammattiharjoitus • {level}</Text>
        <Text style={styles.prompt}>{scenario?.roleplay_prompt}</Text>

        {!!keyPhrases.length && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Avainfraasit</Text>
            {keyPhrases.map((phrase) => (
              <Text key={phrase} style={styles.sectionItem}>• {phrase}</Text>
            ))}
          </View>
        )}

        {scenario?.grammar_tip ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kielioppiteema</Text>
            <Text style={styles.sectionItem}>{scenario.grammar_tip}</Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.promptButton} onPress={handleSpeakPrompt}>
          <Text style={styles.promptButtonText}>Toista ohje</Text>
        </TouchableOpacity>

        <View style={styles.micRow}>
          <MicButton
            onPressIn={() => {
              if (sessionStatus === 'completed') return;
              startRecording({ userInitiated: true, userGesture: true });
            }}
            onPressOut={() => {
              if (sessionStatus === 'completed') return;
              stopRecording();
            }}
            disabled={isProcessing || sessionStatus === 'completed'}
            isActive={isRecording}
          />
          <Text style={styles.micStatus}>
            {isRecording ? 'Kuunnellaan…' : isProcessing ? 'Käsitellään…' : 'Pidä pohjassa vastataksesi'}
          </Text>
        </View>

        {transcript ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vastauksesi</Text>
            <Text style={styles.sectionItem}>{transcript}</Text>
          </View>
        ) : null}

        {isEvaluating ? (
          <Text style={styles.sectionItem}>Arvioidaan…</Text>
        ) : null}

        {evaluation ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Palaute</Text>
            {(evaluation.feedback || []).map((line) => (
              <Text key={line} style={styles.sectionItem}>• {line}</Text>
            ))}
            {evaluation.missing_phrases?.length ? (
              <Text style={styles.sectionItem}>
                Puuttuvat fraasit: {evaluation.missing_phrases.join(', ')}
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
  reviewCard: {
    backgroundColor: '#0f1117',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  reviewCardLabel: {
    color: '#7dd3fc',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  reviewCardText: {
    color: '#e2e8f0',
    fontSize: 16,
    lineHeight: 22,
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
