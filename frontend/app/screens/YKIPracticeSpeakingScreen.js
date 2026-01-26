/**
 * YKIPracticeSpeakingScreen - Short YKI speaking practice exercises
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Background from '../components/ui/Background';
import PremiumEmbossedButton from '../components/PremiumEmbossedButton';
import HomeButton from '../components/HomeButton';
import MicRecorder from '../components/MicRecorder';
import YKIModeBanner from '../components/YKIModeBanner';
import { colors as palette } from '../styles/colors';
import { designTokens } from '../styles/designTokens';
import { analyzePronunciation, generateYkiPractice, evaluateYkiSpeaking, startYkiSpeakingDialogue, respondYkiSpeakingDialogue, getYkiSpeakingModes } from '../utils/api';
import { playTTS } from '../services/tts';
import { YKIError, YKIErrorType, handleEmptyRecording } from '../services/ykiErrorService';

const { typography = {}, spacing = {}, textColor = {} } = designTokens || {};

export default function YKIPracticeSpeakingScreen({ navigation, route } = {}) {
  const { level = 'intermediate', mode: routeMode = 'single', ykiMode = 'training' } = route?.params || {};
  const [practiceMode, setPracticeMode] = useState(routeMode); // 'single' or 'dialogue'
  const [dialogueMode, setDialogueMode] = useState('S1'); // S1, S2, S3, S4
  const [availableModes, setAvailableModes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [speakingTasks, setSpeakingTasks] = useState([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [examInfo, setExamInfo] = useState(null);
  const [fixPack, setFixPack] = useState([]);
  const [readiness, setReadiness] = useState(null);
  
  // Turn-by-turn dialogue state
  const [dialogueSession, setDialogueSession] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [waitingForUser, setWaitingForUser] = useState(false);
  const [ttsError, setTtsError] = useState(null); // TTS error state
  const [pendingTtsText, setPendingTtsText] = useState(null); // Text that failed to play, for retry

  const handleStartPractice = async () => {
    setLoading(true);
    setTranscript('');
    setEvaluation(null);
    try {
      const exam = await generateYkiPractice('speaking', level);
      const availableTasks = exam?.exam?.tasks?.filter(t => t.type === 'speaking') || [];

      if (availableTasks.length > 0) {
        setSpeakingTasks(availableTasks);
        setCurrentTaskIndex(0);
        setCurrentExercise({
          id: availableTasks[0].id,
          prompt: availableTasks[0].prompt || availableTasks[0].text || 'Kerro minulle päivästäsi.',
          timeLimit: availableTasks[0].time_limit || 60,
          description: availableTasks[0].description,
        });
        setExamInfo({
          examId: exam?.exam?.exam_id,
          examType: exam?.exam?.exam_type,
          level: exam?.exam?.level,
          totalTasks: exam?.exam?.tasks?.length || availableTasks.length,
          totalTimeMinutes: exam?.exam?.total_time_minutes || 0,
        });
      } else {
        // Fallback
        const fallbackTask = {
          id: 'fallback_1',
          prompt: 'Kerro minulle päivästäsi. Mitä teit tänään?',
          timeLimit: 60,
          description: 'Puhu vapaasti päivästäsi noin 60 sekuntia.',
        };
        setSpeakingTasks([fallbackTask]);
        setCurrentTaskIndex(0);
        setCurrentExercise(fallbackTask);
        setExamInfo({
          examId: 'fallback_yki',
          examType: 'practice',
          level,
          totalTasks: 1,
          totalTimeMinutes: Math.ceil(fallbackTask.timeLimit / 60),
        });
      }
    } catch (error) {
      console.error('Failed to load speaking exercise:', error);
      const fallbackTask = {
        id: 'fallback_1',
        prompt: 'Kerro minulle päivästäsi. Mitä teit tänään?',
        timeLimit: 60,
        description: 'Puhu vapaasti päivästäsi noin 60 sekuntia.',
      };
      setSpeakingTasks([fallbackTask]);
      setCurrentTaskIndex(0);
      setCurrentExercise(fallbackTask);
    } finally {
      setLoading(false);
    }
  };

  const [sttError, setSttError] = useState(null); // STT error state

  const handleTranscript = async (transcriptText) => {
    // Clear previous STT error
    setSttError(null);
    
    if (!transcriptText || !transcriptText.trim()) {
      // Empty transcript - show error
      setSttError(handleEmptyRecording());
      return;
    }
    
    setTranscript(transcriptText);
    setIsEvaluating(true);
    
    try {
      const voiceResult = await analyzePronunciation(
        currentExercise?.prompt || '',
        transcriptText
      );
      const ykiResult = await evaluateYkiSpeaking(transcriptText);

      const combinedEvaluation = {
        score: voiceResult?.score ?? ykiResult?.scores?.fluency ?? null,
        feedback: voiceResult?.feedback || 'Your response has been recorded. Keep practicing!',
        issues: voiceResult?.issues || [],
        suggestions: voiceResult?.suggestions || [],
        scores: ykiResult?.scores || {},
        band: ykiResult?.band || 'A2.1',
      };

      setEvaluation(combinedEvaluation);
      setFixPack(buildFixPack(combinedEvaluation, currentExercise?.prompt));
      setReadiness(buildReadiness(combinedEvaluation));
    } catch (error) {
      console.error('[YKI Speaking] Evaluation error:', error);
      setEvaluation({
        score: null,
        feedback: 'Your response has been recorded. Keep practicing!',
        issues: [],
        suggestions: [],
        scores: {},
        band: 'A2.1',
      });
      setFixPack([]);
      setReadiness(null);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextTask = () => {
    if (currentTaskIndex >= speakingTasks.length - 1) {
      Alert.alert(
        'Great job!',
        'You have completed all available speaking tasks. Tap "Start Practice" again for a new set.',
        [
          {
            text: 'OK',
            onPress: () => {
              setCurrentExercise(null);
              setSpeakingTasks([]);
              setCurrentTaskIndex(0);
              setTranscript('');
              setEvaluation(null);
            },
          },
        ]
      );
      return;
    }
    
    const nextIndex = currentTaskIndex + 1;
    const nextTask = speakingTasks[nextIndex];
    setCurrentTaskIndex(nextIndex);
    setCurrentExercise({
      id: nextTask.id,
      prompt: nextTask.prompt || nextTask.text || 'Continue speaking...',
      timeLimit: nextTask.time_limit || 60,
      description: nextTask.description,
    });
    setTranscript('');
    setEvaluation(null);
  };

  const handleRetry = () => {
    setTranscript('');
    setEvaluation(null);
  };

  // Handle TTS retry - preserves conversation state
  const handleTTSRetry = async () => {
    if (!pendingTtsText) return;
    
    setTtsError(null);
    setIsPlayingTTS(true);
    try {
      await playTTS(pendingTtsText, 'yki');
      setPendingTtsText(null); // Clear pending text on success
    } catch (error) {
      console.error('TTS retry failed:', error);
      if (error instanceof YKIError) {
        setTtsError(error);
        // Keep pendingTtsText for another retry attempt
      } else {
        setTtsError(new YKIError(
          YKIErrorType.TTS_FAILURE,
          error?.message || 'TTS error occurred',
          'Failed to play audio. Please try again.',
          { originalError: error }
        ));
      }
    } finally {
      setIsPlayingTTS(false);
    }
  };

  // Load available speaking modes
  useEffect(() => {
    const loadModes = async () => {
      try {
        const res = await getYkiSpeakingModes();
        setAvailableModes(res?.modes || {});
      } catch (e) {
        console.error('Failed to load speaking modes:', e);
      }
    };
    loadModes();
  }, []);

  // Turn-by-turn dialogue handlers
  const handleStartDialogue = async () => {
    setLoading(true);
    try {
      const levelMap = { 'beginner': 'A1', 'intermediate': 'B1', 'advanced': 'C1' };
      const cefrLevel = levelMap[level] || 'B1';
      const res = await startYkiSpeakingDialogue(dialogueMode, cefrLevel);
      setDialogueSession(res);
      setAiPrompt(res.initial_prompt || '');
      setConversationHistory([]);
      setCurrentTurn(1);
      setWaitingForUser(true);
      
      // Play initial prompt via TTS
      if (res.initial_prompt) {
        setIsPlayingTTS(true);
        setTtsError(null);
        try {
          await playTTS(res.initial_prompt, 'yki');
        } catch (error) {
          console.error('TTS failed:', error);
          // Handle YKIError from TTS service
          if (error instanceof YKIError) {
            setTtsError(error);
            setPendingTtsText(res.initial_prompt); // Store for retry
            // State is preserved automatically - conversation session and history remain intact
          } else {
            // Fallback for non-YKIError exceptions
            setTtsError(new YKIError(
              YKIErrorType.TTS_FAILURE,
              error?.message || 'TTS error occurred',
              'Failed to play audio. Please try again.',
              { originalError: error }
            ));
            setPendingTtsText(res.initial_prompt);
          }
        } finally {
          setIsPlayingTTS(false);
        }
      }
    } catch (e) {
      Alert.alert('Failed to start dialogue', e?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDialogueTranscript = async (transcriptText) => {
    if (!dialogueSession) return;
    
    // Clear previous STT error
    setSttError(null);
    
    // Check for empty transcript
    if (!transcriptText || !transcriptText.trim()) {
      setSttError(handleEmptyRecording());
      return;
    }
    
    setTranscript(transcriptText);
    setIsEvaluating(true);
    setWaitingForUser(false);
    
    try {
      const levelMap = { 'beginner': 'A1', 'intermediate': 'B1', 'advanced': 'C1' };
      const cefrLevel = levelMap[level] || 'B1';
      
      // Add user turn to history
      const newHistory = [
        ...conversationHistory,
        { role: 'user', text: transcriptText },
      ];
      setConversationHistory(newHistory);
      
      // Get AI response
      const response = await respondYkiSpeakingDialogue(
        dialogueMode,
        cefrLevel,
        transcriptText,
        currentTurn,
        newHistory
      );
      
      // Update evaluation
      setEvaluation({
        kind: 'dialogue',
        scores: response.evaluation?.scores || {},
        band: response.evaluation?.band || 'A2.1',
        hint: response.hint,
      });
      
      // Add AI response to history
      const updatedHistory = [
        ...newHistory,
        { role: 'assistant', text: response.reply },
      ];
      setConversationHistory(updatedHistory);
      setAiPrompt(response.reply);
      
      // Play AI response via TTS
      if (response.reply) {
        setIsPlayingTTS(true);
        setTtsError(null);
        try {
          await playTTS(response.reply, 'yki');
        } catch (error) {
          console.error('TTS failed:', error);
          // Handle YKIError from TTS service
          if (error instanceof YKIError) {
            setTtsError(error);
            setPendingTtsText(response.reply); // Store for retry
            // State is preserved: conversation history, turn number, and all other state remain intact
          } else {
            // Fallback for non-YKIError exceptions
            setTtsError(new YKIError(
              YKIErrorType.TTS_FAILURE,
              error?.message || 'TTS error occurred',
              'Failed to play audio. Please try again.',
              { originalError: error }
            ));
            setPendingTtsText(response.reply);
          }
        } finally {
          setIsPlayingTTS(false);
        }
      }
      
      // Check if session should continue or end
      if (response.next_action === 'evaluate' || response.next_action === 'complete') {
        // Session complete - show final evaluation
        setWaitingForUser(false);
      } else {
        // Continue to next turn
        setCurrentTurn(currentTurn + 1);
        setWaitingForUser(true);
        setTranscript('');
      }
    } catch (e) {
      Alert.alert('Failed to get response', e?.message || 'Please try again.');
      setWaitingForUser(true);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <Background module="yki_speak" variant="blue">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>YKI Speaking Practice</Text>
          <HomeButton navigation={navigation} style={styles.homeButton} homeType="yki" />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <YKIModeBanner mode={ykiMode} style={styles.modeBanner} />
          
          {practiceMode === 'dialogue' && !dialogueSession ? (
            <View style={styles.startContainer}>
              <Text style={styles.startTitle}>Turn-by-Turn Speaking Practice</Text>
              <Text style={styles.startDescription}>
                Practice speaking in a natural dialogue with AI. Choose a mode:
              </Text>
              {availableModes && (
                <View style={styles.modeSelector}>
                  {Object.entries(availableModes).map(([key, modeInfo]) => (
                    <TouchableOpacity
                      key={key}
                      style={[styles.modeCard, dialogueMode === key && styles.modeCardSelected]}
                      onPress={() => setDialogueMode(key)}
                    >
                      <Text style={styles.modeTitle}>{modeInfo.name}</Text>
                      <Text style={styles.modeDescription}>{modeInfo.description}</Text>
                      <Text style={styles.modeMeta}>{modeInfo.max_turns} turns • {modeInfo.style}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <View style={styles.modeToggle}>
                <TouchableOpacity
                  style={[styles.modeToggleButton, practiceMode === 'single' && styles.modeToggleButtonActive]}
                  onPress={() => setPracticeMode('single')}
                >
                  <Text style={styles.modeToggleText}>Single Practice</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modeToggleButton, practiceMode === 'dialogue' && styles.modeToggleButtonActive]}
                  onPress={() => setPracticeMode('dialogue')}
                >
                  <Text style={styles.modeToggleText}>Turn-by-Turn</Text>
                </TouchableOpacity>
              </View>
              {loading ? (
                <ActivityIndicator size="large" color={palette.textPrimary} />
              ) : (
                <PremiumEmbossedButton
                  title="Start Dialogue"
                  onPress={handleStartDialogue}
                  variant="primary"
                  size="large"
                  style={styles.startButton}
                />
              )}
            </View>
          ) : practiceMode === 'dialogue' && dialogueSession ? (
            <View style={styles.dialogueContainer}>
              <View style={styles.dialogueHeader}>
                <Text style={styles.dialogueTitle}>{dialogueSession.mode_info?.name || 'Dialogue'}</Text>
                <Text style={styles.dialogueSubtitle}>Turn {currentTurn} / {dialogueSession.mode_info?.max_turns || 6}</Text>
              </View>
              
              {aiPrompt && (
                <View style={styles.aiBubble}>
                  <Text style={styles.aiBubbleText}>{aiPrompt}</Text>
                  {isPlayingTTS && <ActivityIndicator size="small" color={palette.textPrimary} style={styles.ttsIndicator} />}
                </View>
              )}
              
              {/* TTS Error Display - Non-blocking, user can continue conversation */}
              {ttsError && (
                <View style={styles.errorCard}>
                  <Text style={styles.errorTitle}>⚠️ Audio Playback Error</Text>
                  <Text style={styles.errorMessage}>{ttsError.userMessage}</Text>
                  {ttsError.fixSteps && ttsError.fixSteps.length > 0 && (
                    <View style={styles.fixStepsContainer}>
                      {ttsError.fixSteps.map((step, index) => (
                        <Text key={index} style={styles.fixStepText}>{index + 1}. {step}</Text>
                      ))}
                    </View>
                  )}
                  {ttsError.canRetry && pendingTtsText && (
                    <TouchableOpacity 
                      onPress={handleTTSRetry}
                      style={styles.retryButton}
                    >
                      <Text style={styles.retryButtonText}>🔊 Retry Audio</Text>
                    </TouchableOpacity>
                  )}
                  <Text style={styles.errorNote}>You can continue the conversation below.</Text>
                </View>
              )}
              
              {conversationHistory.length > 0 && (
                <View style={styles.historyContainer}>
                  {conversationHistory.map((msg, idx) => (
                    <View key={idx} style={msg.role === 'user' ? styles.userBubble : styles.aiBubble}>
                      <Text style={msg.role === 'user' ? styles.userBubbleText : styles.aiBubbleText}>
                        {msg.text}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
              
              {waitingForUser && (
                <View style={styles.recordingSection}>
                  <Text style={styles.recordingLabel}>Your turn - Record your response:</Text>
                  
                  {/* STT Error Display */}
                  {sttError && (
                    <View style={styles.errorCard}>
                      <Text style={styles.errorTitle}>⚠️ {sttError.userMessage}</Text>
                      {sttError.fixSteps && sttError.fixSteps.length > 0 && (
                        <View style={styles.fixStepsContainer}>
                          {sttError.fixSteps.map((step, index) => (
                            <Text key={index} style={styles.fixStepText}>{index + 1}. {step}</Text>
                          ))}
                        </View>
                      )}
                      <Text style={styles.errorNote}>Please record again below.</Text>
                    </View>
                  )}
                  
                  <MicRecorder onTranscript={handleDialogueTranscript} />
                </View>
              )}
              
              {transcript && !waitingForUser && (
                <View style={styles.userBubble}>
                  <Text style={styles.userBubbleText}>{transcript}</Text>
                </View>
              )}
              
              {isEvaluating && (
                <View style={styles.evaluatingContainer}>
                  <ActivityIndicator size="large" color={palette?.accentPrimary || '#4ECDC4'} />
                  <Text style={styles.evaluatingText}>Getting AI response...</Text>
                </View>
              )}
              
              {evaluation && evaluation.hint && (
                <View style={styles.hintCard}>
                  <Text style={styles.hintTitle}>💡 Hint</Text>
                  <Text style={styles.hintText}>{evaluation.hint}</Text>
                </View>
              )}
              
              {evaluation && (
                <View style={styles.evaluationSection}>
                  <Text style={styles.sectionTitle}>Evaluation:</Text>
                  {evaluation.scores && (
                    <View style={styles.scoreContainer}>
                      {Object.entries(evaluation.scores).map(([key, value]) => (
                        <View key={key} style={styles.scoreItem}>
                          <Text style={styles.scoreLabel}>{key}:</Text>
                          <Text style={styles.scoreValue}>{value?.toFixed(1) || '—'}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  <Text style={styles.bandText}>Band: {evaluation.band || '—'}</Text>
                </View>
              )}
              
              <View style={styles.dialogueActions}>
                <PremiumEmbossedButton
                  title="End Dialogue"
                  onPress={() => {
                    setDialogueSession(null);
                    setConversationHistory([]);
                    setCurrentTurn(0);
                    setAiPrompt('');
                    setTranscript('');
                    setEvaluation(null);
                  }}
                  variant="secondary"
                  size="medium"
                />
              </View>
            </View>
          ) : !currentExercise ? (
            <View style={styles.startContainer}>
              <Text style={styles.startTitle}>Practice YKI Speaking</Text>
              <Text style={styles.startDescription}>
                Short speaking exercises to prepare for the YKI exam.
              </Text>
              <View style={styles.modeToggle}>
                <TouchableOpacity
                  style={[styles.modeToggleButton, practiceMode === 'single' && styles.modeToggleButtonActive]}
                  onPress={() => setPracticeMode('single')}
                >
                  <Text style={styles.modeToggleText}>Single Practice</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modeToggleButton, practiceMode === 'dialogue' && styles.modeToggleButtonActive]}
                  onPress={() => setPracticeMode('dialogue')}
                >
                  <Text style={styles.modeToggleText}>Turn-by-Turn</Text>
                </TouchableOpacity>
              </View>
              {loading ? (
                <ActivityIndicator size="large" color={palette.textPrimary} />
              ) : (
                <PremiumEmbossedButton
                  title="Start Practice"
                  onPress={handleStartPractice}
                  variant="primary"
                  size="large"
                  style={styles.startButton}
                />
              )}
            </View>
          ) : (
            <View style={styles.exerciseContainer}>
              {examInfo && (
                <View style={styles.examSummaryCard}>
                  <View style={styles.examSummaryRow}>
                    <View>
                      <Text style={styles.examSummaryLabel}>Mock ID</Text>
                      <Text style={styles.examSummaryValue}>{examInfo.examId}</Text>
                    </View>
                    <View>
                      <Text style={styles.examSummaryLabel}>Subtest</Text>
                      <Text style={styles.examSummaryValue}>{examInfo.examType?.replace('_', ' ')}</Text>
                    </View>
                    <View>
                      <Text style={styles.examSummaryLabel}>Time</Text>
                      <Text style={styles.examSummaryValue}>{examInfo.totalTimeMinutes} mins</Text>
                    </View>
                  </View>
                  <View style={styles.examSummaryRow}>
                    <Text style={styles.examSummaryLabel}>Level</Text>
                    <Text style={styles.examSummaryValue}>{examInfo.level}</Text>
                  </View>
                </View>
              )}
              <Text style={styles.exercisePrompt}>{currentExercise.prompt}</Text>
              {currentExercise.description && (
                <Text style={styles.exerciseDescription}>{currentExercise.description}</Text>
              )}
              <Text style={styles.timeLimit}>Time limit: {currentExercise.timeLimit}s</Text>
              
              {/* STT Error Display for single practice mode */}
              {sttError && !transcript && (
                <View style={styles.errorCard}>
                  <Text style={styles.errorTitle}>⚠️ {sttError.userMessage}</Text>
                  {sttError.fixSteps && sttError.fixSteps.length > 0 && (
                    <View style={styles.fixStepsContainer}>
                      {sttError.fixSteps.map((step, index) => (
                        <Text key={index} style={styles.fixStepText}>{index + 1}. {step}</Text>
                      ))}
                    </View>
                  )}
                  <Text style={styles.errorNote}>Please record again below.</Text>
                </View>
              )}
              
              {!transcript ? (
                <MicRecorder onTranscript={handleTranscript} />
              ) : (
                <View style={styles.resultContainer}>
                  <View style={styles.transcriptSection}>
                    <Text style={styles.sectionTitle}>You said:</Text>
                    <Text style={styles.transcriptText}>{transcript}</Text>
                  </View>
                  
                  {isEvaluating ? (
                    <View style={styles.evaluatingContainer}>
                      <ActivityIndicator size="large" color={palette?.accentPrimary || '#4ECDC4'} />
                      <Text style={styles.evaluatingText}>Evaluating your response...</Text>
                    </View>
                  ) : evaluation ? (
                    <View style={styles.evaluationSection}>
                      <Text style={styles.sectionTitle}>Evaluation:</Text>
                      {evaluation.score !== null && (
                        <View style={styles.scoreContainer}>
                          <Text style={styles.scoreLabel}>Score:</Text>
                          <Text style={styles.scoreValue}>
                            {evaluation.score.toFixed(1)} / 4.0
                          </Text>
                        </View>
                      )}
                      <Text style={styles.feedbackText}>{evaluation.feedback}</Text>
                      {evaluation.issues && evaluation.issues.length > 0 && (
                        <View style={styles.issuesContainer}>
                          <Text style={styles.issuesTitle}>Areas to improve:</Text>
                          {evaluation.issues.map((issue, idx) => (
                            <Text key={idx} style={styles.issueItem}>• {issue}</Text>
                          ))}
                        </View>
                      )}
                      {evaluation.suggestions && evaluation.suggestions.length > 0 && (
                        <View style={styles.suggestionsContainer}>
                          <Text style={styles.suggestionsTitle}>Suggestions:</Text>
                          {evaluation.suggestions.map((suggestion, idx) => (
                            <Text key={idx} style={styles.suggestionItem}>• {suggestion}</Text>
                          ))}
                        </View>
                      )}
                    </View>
                  ) : null}
                  
                  <View style={styles.actionButtons}>
                    <PremiumEmbossedButton
                      title="Try Again"
                      onPress={handleRetry}
                      variant="secondary"
                      size="medium"
                      style={styles.actionButton}
                    />
                    {speakingTasks.length > 1 && (
                      <PremiumEmbossedButton
                        title="Next Task"
                        onPress={handleNextTask}
                        variant="primary"
                        size="medium"
                        style={styles.actionButton}
                      />
                    )}
                  </View>
                  {evaluation?.scores && (
                    <View style={styles.rubricSection}>
                      <Text style={styles.rubricTitle}>Rubric Highlights</Text>
                      <View style={styles.rubricGrid}>
                        {RUBRIC_BUCKETS.map(bucket => {
                          const score = evaluation?.scores?.[bucket.key];
                          return (
                            <View key={bucket.key} style={styles.rubricCard}>
                              <Text style={styles.rubricLabel}>{bucket.label}</Text>
                              <View style={styles.rubricScoreRow}>
                                <Text style={styles.rubricScore}>
                                  {typeof score === 'number' ? `${score.toFixed(1)} / 4` : '–'}
                                </Text>
                                <View style={[styles.rubricDot, { backgroundColor: getBucketColor(score ?? 0) }]} />
                              </View>
                              <Text style={styles.rubricHint}>{bucket.hint}</Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  )}
                  {fixPack.length > 0 && (
                    <View style={styles.fixPackSection}>
                      <Text style={styles.fixPackTitle}>Fix Pack</Text>
                      {fixPack.map((item, idx) => (
                        <View key={`${item.title}-${idx}`} style={styles.fixPackCard}>
                          <Text style={styles.fixPackHeading}>{item.title}</Text>
                          <Text style={styles.fixPackDetail}>{item.detail}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  {readiness && (
                    <View style={styles.readinessSection}>
                      <Text style={styles.readinessTitle}>Readiness Snapshot</Text>
                      <View style={styles.readinessRow}>
                        <Text style={styles.readinessLabel}>Band</Text>
                        <Text style={styles.readinessValue}>{readiness.band}</Text>
                      </View>
                      <View style={styles.readinessRow}>
                        <Text style={styles.readinessLabel}>Confidence</Text>
                        <Text style={styles.readinessValue}>{readiness.confidence}</Text>
                      </View>
                      <View style={styles.readinessRow}>
                        <Text style={styles.readinessLabel}>Top blocker</Text>
                        <Text style={styles.readinessValue}>{readiness.weakest?.label}</Text>
                      </View>
                      <View style={styles.readinessPlan}>
                        {readiness.plan.map((step) => (
                          <View key={step.title} style={styles.readinessPlanItem}>
                            <Text style={styles.readinessPlanTitle}>{step.title}</Text>
                            <Text style={styles.readinessPlanDetail}>{step.detail}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </Background>
  );
}

const RUBRIC_BUCKETS = [
  { key: 'fluency', label: 'Fluency', hint: 'Pace, rhythm, and hesitation.' },
  { key: 'flexibility', label: 'Flexibility', hint: 'Ability to reformulate and repair when needed.' },
  { key: 'coherence', label: 'Coherence', hint: 'Connectors, structure, clarity.' },
  { key: 'vocabulary_range', label: 'Vocabulary Range', hint: 'Variety and breadth of words used.' },
  { key: 'vocabulary_precision', label: 'Vocabulary Precision', hint: 'Accuracy and appropriateness of word choice.' },
  { key: 'pronunciation', label: 'Pronunciation', hint: 'Clarity and phonological control.' },
  { key: 'grammar', label: 'Grammar', hint: 'Verb forms, case accuracy, agreement.' },
];

const buildFixPack = (evaluation, prompt) => {
  const scores = evaluation?.scores || {};
  const pack = [];

  if (scores.fluency != null && scores.fluency < 3) {
    pack.push({
      title: 'Fluency Warm-up',
      detail: 'Record the prompt again focusing on a steady rhythm and reducing pauses. Shadow the sample sentence “Minä jatkan nyt ideaa…” twice.',
    });
  }
  if (scores.grammar != null && scores.grammar < 3) {
    pack.push({
      title: 'Grammar Micro-drill',
      detail: 'Rewrite three sentences from the prompt using “kun”, “koska”, or “siksi” to reinforce subordination patterns.',
    });
  }
  if (scores.vocabulary_range != null && scores.vocabulary_range < 3) {
    pack.push({
      title: 'Vocabulary Range',
      detail: 'Use more varied words. Replace common words with synonyms. Practice with a word list of 10 new words.',
    });
  }
  if (scores.vocabulary_precision != null && scores.vocabulary_precision < 3) {
    pack.push({
      title: 'Vocabulary Precision',
      detail: 'Review word choices for accuracy. Check if words match the intended meaning and context.',
    });
  }
  if (scores.flexibility != null && scores.flexibility < 3) {
    pack.push({
      title: 'Flexibility Practice',
      detail: 'Practice reformulation: If you get stuck, try saying "tai siis" or "tarkoitin" and then rephrase. Practice 3 repair phrases.',
    });
  }
  if (scores.pronunciation != null && scores.pronunciation < 3) {
    pack.push({
      title: 'Pronunciation Focus',
      detail: 'Practice vowel length and stress patterns. Record yourself and compare to native pronunciation.',
    });
  }
  if (scores.coherence != null && scores.coherence < 3) {
    pack.push({
      title: 'Connector Practice',
      detail: 'Add linking words (“sitten”, “siksi”, “vaikka”) to your next response to improve flow.',
    });
  }

  if (evaluation?.issues?.length) {
    pack.push({
      title: 'Issue Drill',
      detail: `Fix this: ${evaluation.issues[0]}. Record a short response that demonstrates the correction.`,
    });
  }

  pack.push({
    title: 'Shadowing Clip',
    detail: `Listen to the model line, then repeat it: "${prompt || 'Kerro päivästäsi.'}"`,
  });

  return pack;
};

const buildReadiness = (evaluation) => {
  const scores = evaluation?.scores || {};
  const values = Object.values(scores);
  const average = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
  const confidence =
    average >= 3.2 ? 'High' : average >= 2.6 ? 'Medium' : 'Low';
  const weakest = getWeakestBucket(scores);

  return {
    band: evaluation?.band || 'A2.1',
    confidence,
    weakest,
    plan: [
      {
        title: 'Today',
        detail: `Redo the same prompt while focusing on ${weakest?.label || 'steady speech'}.`,
      },
      {
        title: 'In 3 days',
        detail: 'Complete a connector-rich speaking drill and compare your transcript with a model.',
      },
      {
        title: 'In 1 week',
        detail: 'Combine this prompt with a new opinion task and shadow the recording afterwards.',
      },
    ],
  };
};

const getWeakestBucket = (scores = {}) => {
  const entries = RUBRIC_BUCKETS.map(bucket => ({
    key: bucket.key,
    label: bucket.label,
    score: scores[bucket.key] ?? 4,
  }));
  return entries.reduce((lowest, current) => (current.score < lowest.score ? current : lowest), entries[0] || { label: 'Confidence', score: 4 });
};

const getBucketColor = (score) => {
  if (score >= 3.5) return palette?.accentSuccess || '#22C55E';
  if (score >= 2.5) return palette?.accentWarning || '#FBBF24';
  return palette?.accentError || '#F87171';
};

const styles = StyleSheet.create({
  modeBanner: {
    marginBottom: 16,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    paddingTop: spacing?.xxl || 40,
    paddingBottom: spacing?.md || 16,
    paddingHorizontal: spacing?.lg || 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: spacing?.sm || 8,
  },
  backButtonText: {
    fontSize: typography?.scale?.h3?.size || 20,
    color: textColor?.primary || palette.textPrimary,
  },
  headerTitle: {
    fontSize: typography?.scale?.h2?.size || 24,
    fontWeight: typography?.scale?.h2?.weight || '600',
    color: textColor?.primary || palette.textPrimary,
    flex: 1,
    textAlign: 'center',
    fontFamily: typography?.fontFamily || 'Inter',
  },
  homeButton: {
    position: 'absolute',
    top: spacing?.xl || 32,
    right: spacing?.lg || 24,
  },
  content: {
    padding: spacing?.lg || 24,
  },
  startContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing?.xl || 32,
  },
  startTitle: {
    fontSize: typography?.scale?.h2?.size || 24,
    fontWeight: typography?.scale?.h2?.weight || '600',
    color: textColor?.primary || palette.textPrimary,
    marginBottom: spacing?.sm || 8,
    fontFamily: typography?.fontFamily || 'Inter',
  },
  startDescription: {
    fontSize: typography?.scale?.body?.size || 16,
    color: textColor?.secondary || palette.textSecondary,
    textAlign: 'center',
    marginBottom: spacing?.xl || 32,
  },
  startButton: {
    width: '100%',
    maxWidth: 320,
  },
  exerciseContainer: {
    alignItems: 'center',
    marginTop: spacing?.lg || 24,
  },
  exercisePrompt: {
    fontSize: typography?.scale?.body?.size || 16,
    color: textColor?.primary || palette.textPrimary,
    textAlign: 'center',
    marginBottom: spacing?.sm || 8,
    fontFamily: typography?.fontFamily || 'Inter',
  },
  timeLimit: {
    fontSize: typography?.scale?.small?.size || 14,
    color: textColor?.secondary || palette.textSecondary,
  },
  recordButton: {
    backgroundColor: palette.surface,
    borderRadius: designTokens?.borderRadius?.lg || 16,
    paddingVertical: spacing?.md || 16,
    paddingHorizontal: spacing?.xl || 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: palette.divider,
    width: '80%',
    marginVertical: spacing?.lg || 24,
  },
  recordButtonActive: {
    backgroundColor: `${palette.accentError}33`,
    borderColor: palette.accentError,
  },
  recordButtonText: {
    fontSize: typography?.scale?.body?.size || 16,
    fontWeight: typography?.scale?.body?.weight || '400',
    color: textColor?.primary || palette.textPrimary,
    fontFamily: typography?.fontFamily || 'Inter',
  },
  processingContainer: {
    alignItems: 'center',
    paddingVertical: spacing?.sm || 8,
  },
  processingText: {
    fontSize: typography?.scale?.small?.size || 14,
    color: textColor?.secondary || palette.textSecondary,
  },
  exerciseDescription: {
    fontSize: typography?.scale?.small?.size || 14,
    color: textColor?.secondary || palette.textSecondary,
    textAlign: 'center',
    marginBottom: spacing?.sm || 8,
    fontStyle: 'italic',
    fontFamily: typography?.fontFamily || 'Inter',
  },
  resultContainer: {
    width: '100%',
    marginTop: spacing?.lg || 24,
  },
  transcriptSection: {
    backgroundColor: palette?.surface || palette?.backgroundSecondary || '#1E293B',
    borderRadius: designTokens?.borderRadius?.lg || 16,
    padding: spacing?.lg || 24,
    marginBottom: spacing?.md || 16,
  },
  sectionTitle: {
    fontSize: typography?.scale?.cardTitle?.size || 18,
    fontWeight: typography?.scale?.cardTitle?.weight || '600',
    color: textColor?.primary || palette.textPrimary,
    marginBottom: spacing?.sm || 8,
    fontFamily: typography?.fontFamily || 'Inter',
  },
  transcriptText: {
    fontSize: typography?.scale?.body?.size || 16,
    color: textColor?.primary || palette.textPrimary,
    lineHeight: typography?.scale?.body?.lineHeight || 24,
    fontFamily: typography?.fontFamily || 'Inter',
  },
  evaluatingContainer: {
    alignItems: 'center',
    paddingVertical: spacing?.xl || 32,
  },
  evaluatingText: {
    fontSize: typography?.scale?.body?.size || 16,
    color: textColor?.secondary || palette.textSecondary,
    marginTop: spacing?.md || 16,
    fontFamily: typography?.fontFamily || 'Inter',
  },
  evaluationSection: {
    backgroundColor: palette?.surface || palette?.backgroundSecondary || '#1E293B',
    borderRadius: designTokens?.borderRadius?.lg || 16,
    padding: spacing?.lg || 24,
    marginBottom: spacing?.md || 16,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing?.md || 16,
    paddingBottom: spacing?.md || 16,
    borderBottomWidth: 1,
    borderBottomColor: palette?.divider || 'rgba(255,255,255,0.1)',
  },
  scoreLabel: {
    fontSize: typography?.scale?.body?.size || 16,
    fontWeight: '600',
    color: textColor?.primary || palette.textPrimary,
    marginRight: spacing?.sm || 8,
    fontFamily: typography?.fontFamily || 'Inter',
  },
  scoreValue: {
    fontSize: typography?.scale?.h2?.size || 24,
    fontWeight: '700',
    color: palette?.accentPrimary || '#4ECDC4',
    fontFamily: typography?.fontFamily || 'Inter',
  },
  feedbackText: {
    fontSize: typography?.scale?.body?.size || 16,
    color: textColor?.primary || palette.textPrimary,
    lineHeight: typography?.scale?.body?.lineHeight || 24,
    marginBottom: spacing?.md || 16,
    fontFamily: typography?.fontFamily || 'Inter',
  },
  issuesContainer: {
    marginTop: spacing?.md || 16,
    marginBottom: spacing?.md || 16,
  },
  issuesTitle: {
    fontSize: typography?.scale?.body?.size || 16,
    fontWeight: '600',
    color: textColor?.primary || palette.textPrimary,
    marginBottom: spacing?.sm || 8,
    fontFamily: typography?.fontFamily || 'Inter',
  },
  issueItem: {
    fontSize: typography?.scale?.small?.size || 14,
    color: textColor?.secondary || palette.textSecondary,
    marginBottom: spacing?.xs || 4,
    fontFamily: typography?.fontFamily || 'Inter',
  },
  suggestionsContainer: {
    marginTop: spacing?.md || 16,
  },
  suggestionsTitle: {
    fontSize: typography?.scale?.body?.size || 16,
    fontWeight: '600',
    color: textColor?.primary || palette.textPrimary,
    marginBottom: spacing?.sm || 8,
    fontFamily: typography?.fontFamily || 'Inter',
  },
  suggestionItem: {
    fontSize: typography?.scale?.small?.size || 14,
    color: textColor?.secondary || palette.textSecondary,
    marginBottom: spacing?.xs || 4,
    fontFamily: typography?.fontFamily || 'Inter',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing?.md || 16,
    justifyContent: 'center',
    marginTop: spacing?.lg || 24,
  },
  actionButton: {
    flex: 1,
    maxWidth: 200,
  },
  examSummaryCard: {
    backgroundColor: palette?.surfaceVariant || '#18212A',
    borderRadius: designTokens?.borderRadius?.lg || 16,
    padding: spacing?.md || 16,
    width: '100%',
    marginBottom: spacing?.md || 16,
  },
  examSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing?.sm || 8,
  },
  examSummaryLabel: {
    fontSize: typography?.scale?.small?.size || 12,
    color: textColor?.secondary || palette.textSecondary,
  },
  examSummaryValue: {
    fontSize: typography?.scale?.body?.size || 16,
    fontWeight: '600',
    color: textColor?.primary || palette.textPrimary,
  },
  rubricSection: {
    backgroundColor: palette?.surface || '#13233F',
    borderRadius: designTokens?.borderRadius?.lg || 16,
    padding: spacing?.md || 16,
    marginTop: spacing?.md || 16,
  },
  rubricTitle: {
    fontSize: typography?.scale?.body?.size || 16,
    fontWeight: '600',
    color: textColor?.primary || palette.textPrimary,
    marginBottom: spacing?.sm || 12,
  },
  rubricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing?.sm || 8,
  },
  rubricCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: designTokens?.borderRadius?.md || 12,
    padding: spacing?.sm || 12,
    marginBottom: spacing?.sm || 8,
  },
  rubricLabel: {
    fontSize: typography?.scale?.caption?.size || 12,
    color: textColor?.secondary || palette.textSecondary,
    marginBottom: spacing?.xs || 4,
  },
  rubricScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rubricScore: {
    fontSize: typography?.scale?.body?.size || 16,
    fontWeight: '700',
    color: textColor?.primary || palette.textPrimary,
  },
  rubricDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  rubricHint: {
    fontSize: typography?.scale?.small?.size || 12,
    color: textColor?.secondary || palette.textSecondary,
    marginTop: spacing?.xs || 4,
  },
  fixPackSection: {
    backgroundColor: palette?.surface || '#13233F',
    borderRadius: designTokens?.borderRadius?.lg || 16,
    padding: spacing?.md || 16,
    marginTop: spacing?.md || 16,
  },
  fixPackTitle: {
    fontSize: typography?.scale?.body?.size || 16,
    fontWeight: '600',
    color: textColor?.primary || palette.textPrimary,
    marginBottom: spacing?.sm || 12,
  },
  fixPackCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: designTokens?.borderRadius?.md || 12,
    padding: spacing?.sm || 12,
    marginBottom: spacing?.sm || 8,
  },
  fixPackHeading: {
    fontSize: typography?.scale?.body?.size || 15,
    fontWeight: '600',
    color: textColor?.primary || palette.textPrimary,
  },
  fixPackDetail: {
    fontSize: typography?.scale?.small?.size || 13,
    color: textColor?.secondary || palette.textSecondary,
    marginTop: spacing?.xs || 4,
  },
  readinessSection: {
    backgroundColor: palette?.surface || '#0F172A',
    borderRadius: designTokens?.borderRadius?.lg || 16,
    padding: spacing?.md || 16,
    marginTop: spacing?.md || 16,
  },
  readinessTitle: {
    fontSize: typography?.scale?.body?.size || 16,
    fontWeight: '600',
    color: textColor?.primary || palette.textPrimary,
    marginBottom: spacing?.sm || 12,
  },
  readinessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing?.xs || 6,
  },
  readinessLabel: {
    fontSize: typography?.scale?.small?.size || 12,
    color: textColor?.secondary || palette.textSecondary,
  },
  readinessValue: {
    fontSize: typography?.scale?.body?.size || 14,
    color: textColor?.primary || palette.textPrimary,
    fontWeight: '600',
  },
  readinessPlan: {
    marginTop: spacing?.sm || 12,
  },
  readinessPlanItem: {
    marginBottom: spacing?.sm || 8,
  },
  readinessPlanTitle: {
    fontSize: typography?.scale?.small?.size || 12,
    fontWeight: '600',
    color: textColor?.primary || palette.textPrimary,
  },
  readinessPlanDetail: {
    fontSize: typography?.scale?.small?.size || 12,
    color: textColor?.secondary || palette.textSecondary,
  },
  modeSelector: {
    width: '100%',
    marginVertical: spacing?.md || 16,
    gap: spacing?.sm || 8,
  },
  modeCard: {
    backgroundColor: palette?.surface || '#1E293B',
    borderRadius: 12,
    padding: spacing?.md || 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: spacing?.sm || 8,
  },
  modeCardSelected: {
    borderColor: palette?.accentPrimary || '#4ECDC4',
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
  },
  modeTitle: {
    fontSize: typography?.scale?.body?.size || 16,
    fontWeight: '700',
    color: textColor?.primary || palette.textPrimary,
    marginBottom: spacing?.xs || 4,
  },
  modeDescription: {
    fontSize: typography?.scale?.small?.size || 14,
    color: textColor?.secondary || palette.textSecondary,
    marginBottom: spacing?.xs || 4,
  },
  modeMeta: {
    fontSize: typography?.scale?.caption?.size || 12,
    color: textColor?.secondary || palette.textSecondary,
    fontStyle: 'italic',
  },
  modeToggle: {
    flexDirection: 'row',
    gap: spacing?.sm || 8,
    marginBottom: spacing?.md || 16,
    width: '100%',
  },
  modeToggleButton: {
    flex: 1,
    padding: spacing?.sm || 12,
    borderRadius: 8,
    backgroundColor: palette?.surface || '#1E293B',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  modeToggleButtonActive: {
    backgroundColor: palette?.accentPrimary || '#4ECDC4',
    borderColor: palette?.accentPrimary || '#4ECDC4',
  },
  modeToggleText: {
    fontSize: typography?.scale?.body?.size || 14,
    color: textColor?.primary || palette.textPrimary,
    fontWeight: '600',
  },
  dialogueContainer: {
    width: '100%',
  },
  dialogueHeader: {
    marginBottom: spacing?.lg || 24,
    alignItems: 'center',
  },
  dialogueTitle: {
    fontSize: typography?.scale?.h2?.size || 24,
    fontWeight: '800',
    color: textColor?.primary || palette.textPrimary,
    marginBottom: spacing?.xs || 4,
  },
  dialogueSubtitle: {
    fontSize: typography?.scale?.body?.size || 16,
    color: textColor?.secondary || palette.textSecondary,
  },
  aiBubble: {
    backgroundColor: palette?.surface || '#1E293B',
    borderRadius: 16,
    padding: spacing?.md || 16,
    marginBottom: spacing?.md || 16,
    borderLeftWidth: 4,
    borderLeftColor: palette?.accentPrimary || '#4ECDC4',
  },
  aiBubbleText: {
    fontSize: typography?.scale?.body?.size || 16,
    color: textColor?.primary || palette.textPrimary,
    lineHeight: 22,
  },
  userBubble: {
    backgroundColor: 'rgba(78, 205, 196, 0.15)',
    borderRadius: 16,
    padding: spacing?.md || 16,
    marginBottom: spacing?.md || 16,
    borderLeftWidth: 4,
    borderLeftColor: palette?.accentPrimary || '#4ECDC4',
    alignSelf: 'flex-end',
    maxWidth: '85%',
  },
  userBubbleText: {
    fontSize: typography?.scale?.body?.size || 16,
    color: textColor?.primary || palette.textPrimary,
    lineHeight: 22,
  },
  historyContainer: {
    marginBottom: spacing?.md || 16,
    gap: spacing?.sm || 8,
  },
  recordingSection: {
    marginTop: spacing?.md || 16,
    marginBottom: spacing?.md || 16,
  },
  recordingLabel: {
    fontSize: typography?.scale?.body?.size || 16,
    fontWeight: '600',
    color: textColor?.primary || palette.textPrimary,
    marginBottom: spacing?.sm || 8,
  },
  errorCard: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 12,
    padding: spacing?.md || 16,
    marginBottom: spacing?.md || 16,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  errorTitle: {
    fontSize: typography?.scale?.body?.size || 16,
    fontWeight: '600',
    color: '#F44336',
    marginBottom: spacing?.xs || 4,
  },
  errorMessage: {
    fontSize: typography?.scale?.small?.size || 14,
    color: textColor?.secondary || palette.textSecondary,
    marginBottom: spacing?.sm || 8,
  },
  errorNote: {
    fontSize: typography?.scale?.caption?.size || 12,
    color: textColor?.tertiary || palette.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing?.sm || 8,
  },
  fixStepsContainer: {
    marginTop: spacing?.sm || 8,
    marginBottom: spacing?.md || 16,
  },
  fixStepText: {
    fontSize: typography?.scale?.small?.size || 14,
    color: textColor?.secondary || palette.textSecondary,
    marginBottom: spacing?.xs || 4,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: palette?.accentPrimary || '#4ECDC4',
    borderRadius: 8,
    padding: spacing?.sm || 12,
    alignItems: 'center',
    marginTop: spacing?.sm || 8,
  },
  retryButtonText: {
    fontSize: typography?.scale?.body?.size || 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  ttsIndicator: {
    marginTop: spacing?.xs || 4,
  },
  hintCard: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderRadius: 12,
    padding: spacing?.md || 16,
    marginTop: spacing?.md || 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FBBF24',
  },
  hintTitle: {
    fontSize: typography?.scale?.body?.size || 16,
    fontWeight: '700',
    color: textColor?.primary || palette.textPrimary,
    marginBottom: spacing?.xs || 4,
  },
  hintText: {
    fontSize: typography?.scale?.body?.size || 14,
    color: textColor?.primary || palette.textPrimary,
    lineHeight: 20,
  },
  dialogueActions: {
    marginTop: spacing?.lg || 24,
    alignItems: 'center',
  },
  scoreItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing?.xs || 4,
  },
  scoreLabel: {
    fontSize: typography?.scale?.body?.size || 14,
    color: textColor?.secondary || palette.textSecondary,
  },
  scoreValue: {
    fontSize: typography?.scale?.body?.size || 14,
    fontWeight: '700',
    color: textColor?.primary || palette.textPrimary,
  },
  bandText: {
    fontSize: typography?.scale?.body?.size || 16,
    fontWeight: '700',
    color: palette?.accentPrimary || '#4ECDC4',
    marginTop: spacing?.sm || 8,
  },
});
