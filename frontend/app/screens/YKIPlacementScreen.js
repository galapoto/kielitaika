/**
 * YKIPlacementScreen - 10-15 minute placement diagnostic covering all 4 skills
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import Background from '../components/ui/Background';
import PremiumEmbossedButton from '../components/PremiumEmbossedButton';
import HomeButton from '../components/HomeButton';
import MicRecorder from '../components/MicRecorder';
import { colors as palette } from '../styles/colors';
import { designTokens } from '../styles/designTokens';
import { startYkiPlacement, submitYkiPlacement } from '../utils/api';
import { playTTS } from '../services/tts';

const { typography = {}, spacing = {}, textColor = {} } = designTokens || {};

export default function YKIPlacementScreen({ navigation, route } = {}) {
  const [loading, setLoading] = useState(false);
  const [placement, setPlacement] = useState(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [responses, setResponses] = useState({
    speaking: null,
    listening: null,
    reading: null,
    writing: null,
  });
  const [results, setResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const currentTask = placement?.tasks?.[currentTaskIndex] || null;
  const isComplete = results !== null;

  useEffect(() => {
    startPlacement();
  }, []);

  const startPlacement = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await startYkiPlacement();
      setPlacement(res.placement);
      setCurrentTaskIndex(0);
      setResponses({ speaking: null, listening: null, reading: null, writing: null });
      setResults(null);
    } catch (e) {
      setError(e?.message || 'Failed to start placement. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSpeakingTranscript = (transcript) => {
    if (transcript && transcript.trim()) {
      setResponses(prev => ({ ...prev, speaking: { transcript } }));
    }
  };

  const handleListeningAnswers = (answers) => {
    setResponses(prev => ({ ...prev, listening: { answers } }));
  };

  const handleReadingAnswers = (answers) => {
    setResponses(prev => ({ ...prev, reading: { answers } }));
  };

  const handleWritingText = (text) => {
    setResponses(prev => ({ ...prev, writing: { text } }));
  };

  const handleNextTask = () => {
    if (currentTaskIndex < (placement?.tasks?.length || 0) - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
    }
  };

  const handleSubmitPlacement = async () => {
    if (!placement) return;
    
    // Check all responses are complete
    const allComplete = 
      (currentTask?.task_type === 'speaking' ? responses.speaking : true) &&
      (currentTask?.task_type === 'listening' ? responses.listening : true) &&
      (currentTask?.task_type === 'reading' ? responses.reading : true) &&
      (currentTask?.task_type === 'writing' ? responses.writing : true);
    
    if (!allComplete) {
      Alert.alert('Complete all tasks', 'Please complete all placement tasks before submitting.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await submitYkiPlacement(
        placement.placement_id,
        responses.speaking,
        responses.listening,
        responses.reading,
        responses.writing
      );
      setResults(res.results);
    } catch (e) {
      setError(e?.message || 'Failed to submit placement. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const playPrompt = async () => {
    if (!currentTask?.prompt_fi) return;
    try {
      await playTTS(currentTask.prompt_fi, 'yki');
    } catch (e) {
      Alert.alert('Ääni ei toiminut', 'Äänen toisto epäonnistui. Jatka tekstin avulla.', [{ text: 'OK' }]);
    }
  };

  if (loading) {
    return (
      <Background module="yki_read" variant="blue" solidContentZone>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>YKI: tasotesti</Text>
            <HomeButton navigation={navigation} style={styles.homeButton} homeType="yki" />
          </View>
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#EAF5FF" />
            <Text style={styles.centerText}>Aloitetaan tasotesti…</Text>
          </View>
        </View>
      </Background>
    );
  }

  if (isComplete && results) {
    return (
      <Background module="yki_read" variant="blue" solidContentZone>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Tasotestin tulos</Text>
            <HomeButton navigation={navigation} style={styles.homeButton} homeType="yki" />
          </View>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.resultsCard}>
              <Text style={styles.resultsTitle}>Arvioitu tasosi</Text>
              <Text style={styles.resultsBand}>{results.estimated_band || 'B1'}</Text>
              <Text style={styles.resultsSubtitle}>
                Perustuu suoriutumiseesi kaikissa neljässä osa-alueessa
              </Text>
            </View>

            <View style={styles.skillsCard}>
              <Text style={styles.skillsTitle}>Arvio osa-alueittain</Text>
              {Object.entries(results.per_skill || {}).map(([skill, data]) => (
                <View key={skill} style={styles.skillRow}>
                  <View style={styles.skillInfo}>
                    <Text style={styles.skillName}>{skill.charAt(0).toUpperCase() + skill.slice(1)}</Text>
                    <Text style={styles.skillBand}>Taso: {data.band || '—'}</Text>
                  </View>
                  <View style={styles.distanceInfo}>
                    <Text style={styles.distanceLabel}>Etäisyys YKI-tasoon 3</Text>
                    <Text style={styles.distanceValue}>
                      {data.distance_to_yki3 !== undefined ? `${data.distance_to_yki3.toFixed(1)}` : '—'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.recommendationsCard}>
              <Text style={styles.recommendationsTitle}>Suositukset</Text>
              {results.recommendations?.map((rec, idx) => (
                <Text key={idx} style={styles.recommendationItem}>• {rec}</Text>
              ))}
            </View>

            <PremiumEmbossedButton
              title="Jatka YKI-harjoitteluun"
              onPress={() => {
                navigation.navigate('YKI');
              }}
              variant="primary"
              size="large"
              style={styles.continueButton}
            />
          </ScrollView>
        </View>
      </Background>
    );
  }

  if (!placement) {
    return (
      <Background module="yki_read" variant="blue" solidContentZone>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>YKI: tasotesti</Text>
            <HomeButton navigation={navigation} style={styles.homeButton} homeType="yki" />
          </View>
          <View style={styles.center}>
            {error ? (
              <>
                <Text style={styles.errorText}>{error}</Text>
                <PremiumEmbossedButton title="Yritä uudelleen" onPress={startPlacement} variant="primary" size="large" />
              </>
            ) : (
              <Text style={styles.centerText}>Ladataan tasotestiä…</Text>
            )}
          </View>
        </View>
      </Background>
    );
  }

  return (
    <Background module="yki_read" variant="blue" solidContentZone>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>YKI: tasotesti</Text>
          <HomeButton navigation={navigation} style={styles.homeButton} homeType="yki" />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Tasotesti</Text>
            <Text style={styles.infoText}>
              Tämä tasotesti kestää noin {placement.estimated_minutes || 12} minuuttia ja kattaa kaikki neljä osa-aluetta.
              Sen avulla määritämme nykyisen tasosi ja luomme henkilökohtaisen harjoitussuunnitelman.
            </Text>
            <Text style={styles.progressText}>
              Tehtävä {currentTaskIndex + 1} / {placement.tasks?.length || 0}
            </Text>
          </View>

          {currentTask && (
            <View style={styles.taskCard}>
              <View style={styles.taskHeader}>
                <Text style={styles.taskTitle}>
                  {currentTask.task_type === 'speaking' ? 'Speaking' :
                   currentTask.task_type === 'listening' ? 'Listening' :
                   currentTask.task_type === 'reading' ? 'Reading' :
                   'Writing'}
                </Text>
                <Text style={styles.taskMeta}>Level {currentTask.level}</Text>
              </View>

              {currentTask.task_type === 'speaking' && (
                <View style={styles.taskContent}>
                  <Text style={styles.prompt}>{currentTask.prompt_fi}</Text>
                  <PremiumEmbossedButton
                    title="Play prompt audio"
                    onPress={playPrompt}
                    variant="secondary"
                    size="medium"
                    style={styles.audioButton}
                  />
                  <Text style={styles.recordingLabel}>Record your response:</Text>
                  <MicRecorder onTranscript={handleSpeakingTranscript} />
                  {responses.speaking?.transcript && (
                    <View style={styles.responseBox}>
                      <Text style={styles.responseLabel}>Your response:</Text>
                      <Text style={styles.responseText}>{responses.speaking.transcript}</Text>
                    </View>
                  )}
                </View>
              )}

              {currentTask.task_type === 'listening' && (
                <View style={styles.taskContent}>
                  <Text style={styles.prompt}>Listen to the audio and answer the questions.</Text>
                  <PremiumEmbossedButton
                    title="Play audio"
                    onPress={async () => {
                      if (currentTask.script_fi) {
                        try {
                          await playTTS(currentTask.script_fi, 'yki');
                        } catch (e) {
                          Alert.alert('Audio failed', 'Could not play audio.', [{ text: 'OK' }]);
                        }
                      }
                    }}
                    variant="secondary"
                    size="medium"
                    style={styles.audioButton}
                  />
                  {currentTask.questions?.map((q, idx) => (
                    <View key={idx} style={styles.questionCard}>
                      <Text style={styles.questionText}>{q.question}</Text>
                      {q.options?.map((opt, optIdx) => (
                        <TouchableOpacity
                          key={optIdx}
                          style={[
                            styles.optionButton,
                            responses.listening?.answers?.[q.id] === optIdx && styles.optionButtonSelected,
                          ]}
                          onPress={() => {
                            const answers = responses.listening?.answers || {};
                            handleListeningAnswers({ ...answers, [q.id]: optIdx });
                          }}
                        >
                          <Text style={styles.optionText}>{opt}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ))}
                </View>
              )}

              {currentTask.task_type === 'reading' && (
                <View style={styles.taskContent}>
                  <Text style={styles.readingText}>{currentTask.text_fi}</Text>
                  {currentTask.questions?.map((q, idx) => (
                    <View key={idx} style={styles.questionCard}>
                      <Text style={styles.questionText}>{q.question}</Text>
                      {q.options?.map((opt, optIdx) => (
                        <TouchableOpacity
                          key={optIdx}
                          style={[
                            styles.optionButton,
                            responses.reading?.answers?.[q.id] === optIdx && styles.optionButtonSelected,
                          ]}
                          onPress={() => {
                            const answers = responses.reading?.answers || {};
                            handleReadingAnswers({ ...answers, [q.id]: optIdx });
                          }}
                        >
                          <Text style={styles.optionText}>{opt}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ))}
                </View>
              )}

              {currentTask.task_type === 'writing' && (
                <View style={styles.taskContent}>
                  <Text style={styles.prompt}>{currentTask.prompt_fi}</Text>
                  <Text style={styles.constraints}>
                    {currentTask.constraints?.min_words || 50}-{currentTask.constraints?.max_words || 80} sanaa
                  </Text>
                  <TextInput
                    value={responses.writing?.text || ''}
                    onChangeText={(text) => handleWritingText(text)}
                    placeholder="Kirjoita vastauksesi suomeksi…"
                    placeholderTextColor="rgba(255,255,255,0.45)"
                    multiline
                    style={styles.textInput}
                  />
                  <Text style={styles.wordCount}>
                    {responses.writing?.text?.trim().split(/\s+/).filter(Boolean).length || 0} sanaa
                  </Text>
                </View>
              )}

              <View style={styles.taskActions}>
                {currentTaskIndex < (placement.tasks?.length || 0) - 1 ? (
                  <PremiumEmbossedButton
                    title="Seuraava tehtävä"
                    onPress={handleNextTask}
                    variant="primary"
                    size="large"
                    style={styles.actionButton}
                  />
                ) : (
                  <PremiumEmbossedButton
                    title={submitting ? 'Lähetetään…' : 'Lähetä tasotesti'}
                    onPress={handleSubmitPlacement}
                    disabled={submitting}
                    variant="primary"
                    size="large"
                    style={styles.actionButton}
                  />
                )}
              </View>
            </View>
          )}

          {error && <Text style={styles.errorText}>{error}</Text>}
        </ScrollView>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(10, 14, 39, 0.78)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.10)',
  },
  backButton: { padding: 8 },
  backButtonText: { color: 'rgba(255,255,255,0.92)', fontSize: 20 },
  headerTitle: { color: 'rgba(255,255,255,0.95)', fontSize: 16, fontWeight: '800', flex: 1, textAlign: 'center' },
  homeButton: { marginLeft: 8 },
  content: { padding: 16, paddingBottom: 32 },
  center: { padding: 22, alignItems: 'center', gap: 12 },
  centerText: { color: 'rgba(255,255,255,0.78)' },
  errorText: { color: '#fecaca', textAlign: 'center' },
  infoCard: {
    backgroundColor: 'rgba(16, 22, 40, 0.78)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  infoTitle: { color: 'rgba(255,255,255,0.95)', fontSize: 18, fontWeight: '800', marginBottom: 8 },
  infoText: { color: 'rgba(255,255,255,0.75)', lineHeight: 20, marginBottom: 8 },
  progressText: { color: 'rgba(255,255,255,0.65)', fontSize: 14, fontWeight: '600' },
  taskCard: {
    backgroundColor: 'rgba(16, 22, 40, 0.78)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  taskHeader: { marginBottom: 12 },
  taskTitle: { color: 'rgba(255,255,255,0.95)', fontSize: 18, fontWeight: '800' },
  taskMeta: { color: 'rgba(255,255,255,0.65)', marginTop: 4, fontSize: 12 },
  taskContent: { marginTop: 12 },
  prompt: { color: 'rgba(255,255,255,0.88)', lineHeight: 20, marginBottom: 12 },
  readingText: { color: 'rgba(255,255,255,0.88)', lineHeight: 22, marginBottom: 16 },
  audioButton: { marginBottom: 12, alignSelf: 'flex-start' },
  recordingLabel: { color: 'rgba(255,255,255,0.92)', fontWeight: '700', marginBottom: 8, marginTop: 8 },
  responseBox: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginTop: 12,
  },
  responseLabel: { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginBottom: 6 },
  responseText: { color: 'rgba(255,255,255,0.92)', lineHeight: 20 },
  questionCard: { marginTop: 16, marginBottom: 8 },
  questionText: { color: 'rgba(255,255,255,0.92)', fontSize: 16, fontWeight: '600', marginBottom: 12 },
  optionButton: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  optionButtonSelected: {
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    borderColor: '#4ECDC4',
  },
  optionText: { color: 'rgba(255,255,255,0.92)' },
  constraints: { color: 'rgba(255,255,255,0.65)', fontSize: 14, marginBottom: 8 },
  textInput: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    padding: 12,
    color: 'rgba(255,255,255,0.92)',
    minHeight: 120,
    textAlignVertical: 'top',
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: 8,
  },
  wordCount: { color: 'rgba(255,255,255,0.55)', fontSize: 12, textAlign: 'right' },
  taskActions: { marginTop: 20 },
  actionButton: { width: '100%' },
  resultsCard: {
    backgroundColor: 'rgba(16, 22, 40, 0.95)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
  },
  resultsTitle: { color: 'rgba(255,255,255,0.75)', fontSize: 14, marginBottom: 8 },
  resultsBand: { color: '#4ECDC4', fontSize: 36, fontWeight: '800', marginBottom: 8 },
  resultsSubtitle: { color: 'rgba(255,255,255,0.65)', fontSize: 14, textAlign: 'center' },
  skillsCard: {
    backgroundColor: 'rgba(16, 22, 40, 0.78)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  skillsTitle: { color: 'rgba(255,255,255,0.95)', fontSize: 18, fontWeight: '800', marginBottom: 16 },
  skillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  skillInfo: { flex: 1 },
  skillName: { color: 'rgba(255,255,255,0.95)', fontSize: 16, fontWeight: '700' },
  skillBand: { color: 'rgba(255,255,255,0.65)', fontSize: 14, marginTop: 4 },
  distanceInfo: { alignItems: 'flex-end' },
  distanceLabel: { color: 'rgba(255,255,255,0.65)', fontSize: 12 },
  distanceValue: { color: '#4ECDC4', fontSize: 18, fontWeight: '700', marginTop: 4 },
  recommendationsCard: {
    backgroundColor: 'rgba(16, 22, 40, 0.78)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  recommendationsTitle: { color: 'rgba(255,255,255,0.95)', fontSize: 18, fontWeight: '800', marginBottom: 12 },
  recommendationItem: { color: 'rgba(255,255,255,0.85)', lineHeight: 22, marginBottom: 8 },
  continueButton: { width: '100%' },
});
