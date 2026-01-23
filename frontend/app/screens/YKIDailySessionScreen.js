import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import Background from '../components/ui/Background';
import HomeButton from '../components/HomeButton';
import PremiumEmbossedButton from '../components/PremiumEmbossedButton';
import MicRecorder from '../components/MicRecorder';
import { playTTS } from '../services/tts';
import { evaluateYkiSpeaking, evaluateYkiWriting, getYkiLearnerState, getYkiTodaySession, submitYkiAttempt, getYkiProgressSignals } from '../utils/api';

function summarizeSpeakingFeedback(scores = {}) {
  const fluency = scores.fluency ?? 0;
  const grammar = (scores.grammar ?? scores.accuracy) ?? 0;
  const vocab = scores.vocabulary ?? 0;
  const coherence = scores.coherence ?? scores.structure ?? 0;

  const best = [
    { k: 'fluency', v: fluency, label: 'sujuvuus' },
    { k: 'grammar', v: grammar, label: 'kielioppi' },
    { k: 'vocabulary', v: vocab, label: 'sanasto' },
    { k: 'coherence', v: coherence, label: 'rakenne' },
  ].sort((a, b) => (b.v || 0) - (a.v || 0));

  const top = best[0];
  const bottom = best[best.length - 1];

  return {
    one_big_win: top?.label ? `Vahvuus nyt: ${top.label}.` : 'Vahvuus: selkeä vastaus.',
    one_fix_now: bottom?.label ? `Korjaa seuraavaksi: ${bottom.label} (yksi selkeä parannus).` : 'Korjaa seuraavaksi: rakenne (selkeä alku–keskiosa–loppu).',
  };
}

function isTruthyStringBool(v) {
  return v === true || v === 'true';
}

export default function YKIDailySessionScreen({ navigation, route }) {
  const initialMode = route?.params?.mode || 'training';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [mode, setMode] = useState(initialMode);
  const [session, setSession] = useState(null);
  const tasks = useMemo(() => session?.plan?.tasks || [], [session]);

  const [taskIndex, setTaskIndex] = useState(0);
  const currentTask = tasks[taskIndex] || null;
  const refreshTask = tasks.find(t => t.is_refresh === true);
  const refreshMessage = refreshTask?.refresh_message;

  const [speakingTranscript, setSpeakingTranscript] = useState('');
  const [writingText, setWritingText] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [nextDirective, setNextDirective] = useState(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [calibrationStatus, setCalibrationStatus] = useState(null);
  const [showCalibrationPrompt, setShowCalibrationPrompt] = useState(false);

  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Ensure state exists (and keeps subscription gating consistent).
      await getYkiLearnerState(null);
      const res = await getYkiTodaySession(mode);
      if (!res?.session?.plan) {
        throw new Error('Daily session plan missing from server response.');
      }
      if (!mountedRef.current) return;
      setSession(res.session);
      setCalibrationStatus(res.calibration);
      // Show calibration prompt if needed and user hasn't dismissed it
      if (res.calibration?.calibration_needed) {
        setShowCalibrationPrompt(true);
      }
      setTaskIndex(0);
      setSpeakingTranscript('');
      setWritingText('');
      setEvaluation(null);
      setNextDirective(null);
    } catch (e) {
      if (!mountedRef.current) return;
      setError(e?.message || 'Failed to load today’s YKI session. Please try again.');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const canEvaluate = useMemo(() => {
    if (!currentTask) return false;
    if (currentTask.is_skill_lab) return false;  // Skill labs are handled separately
    if (currentTask.task_type === 'speaking') return speakingTranscript.trim().length > 0;
    if (currentTask.task_type === 'writing') return writingText.trim().length > 0;
    return false;
  }, [currentTask, speakingTranscript, writingText]);

  const playPrompt = useCallback(async () => {
    if (!currentTask?.prompt_fi) return;
    const provider = await playTTS(currentTask.prompt_fi, 'yki', { playbackRate: mode === 'exam' ? 1.0 : 0.95 });
    if (!provider) {
      Alert.alert('Audio failed', 'We could not play the prompt audio. Please check your connection and try again.', [
        { text: 'Retry', onPress: () => playPrompt() },
        { text: 'OK' },
      ]);
    }
  }, [currentTask, mode]);

  const evaluateAndSubmit = useCallback(async () => {
    if (!currentTask) return;
    setEvaluating(true);
    setError('');
    try {
      let score = null;
      let feedback = {};
      let pass = false;

      if (currentTask.task_type === 'speaking') {
        const res = await evaluateYkiSpeaking(speakingTranscript.trim());
        score = res?.scores || {};
        const fb = summarizeSpeakingFeedback(score);
        feedback = {
          one_big_win: fb.one_big_win,
          one_fix_now: fb.one_fix_now,
          band: res?.band,
        };
        const numeric = Object.values(score).filter((v) => typeof v === 'number');
        const avg = numeric.length ? numeric.reduce((a, b) => a + b, 0) / numeric.length : 0;
        pass = avg >= 3.0;
        setEvaluation({ kind: 'speaking', scores: score, band: res?.band, feedback });
      } else if (currentTask.task_type === 'writing') {
        const res = await evaluateYkiWriting(writingText.trim());
        score = res?.scores || {};
        const fb = summarizeSpeakingFeedback(score);
        feedback = {
          one_big_win: fb.one_big_win,
          one_fix_now: fb.one_fix_now,
          band: res?.band,
        };
        const numeric = Object.values(score).filter((v) => typeof v === 'number');
        const avg = numeric.length ? numeric.reduce((a, b) => a + b, 0) / numeric.length : 0;
        pass = avg >= 3.0;
        setEvaluation({ kind: 'writing', scores: score, band: res?.band, feedback });
      }

      const submitRes = await submitYkiAttempt({
        task_id: currentTask.task_id,
        task_type: currentTask.task_type,
        level: currentTask.level,
        mode: currentTask.mode,
        user_text: currentTask.task_type === 'writing' ? writingText.trim() : null,
        transcript: currentTask.task_type === 'speaking' ? speakingTranscript.trim() : null,
        score_json: score || {},
        feedback_json: feedback || {},
        pass_criteria_met: pass,
        time_on_task_seconds: null,
      });

      setNextDirective(submitRes?.next || null);
      if (submitRes?.next?.auto_advance) {
        const nextIdx = taskIndex + 1;
        if (nextIdx < tasks.length) {
          setTaskIndex(nextIdx);
          setSpeakingTranscript('');
          setWritingText('');
          setEvaluation(null);
          setNextDirective(null);
        } else {
          // Session complete moment.
          setShowCompletion(true);
        }
      }
    } catch (e) {
      setError(e?.message || 'Failed to evaluate. Please try again.');
    } finally {
      setEvaluating(false);
    }
  }, [currentTask, speakingTranscript, writingText, taskIndex, tasks.length, navigation]);

  const manualContinue = useCallback(() => {
    const nextIdx = taskIndex + 1;
    if (nextIdx < tasks.length) {
      setTaskIndex(nextIdx);
      setSpeakingTranscript('');
      setWritingText('');
      setEvaluation(null);
      setNextDirective(null);
      return;
    }
    setShowCompletion(true);
  }, [taskIndex, tasks.length, navigation]);

  // SessionCompletionView component
  const SessionCompletionView = ({ session, tasks, navigation, onBack }) => {
    const [progressSignals, setProgressSignals] = useState([]);
    const [loadingSignals, setLoadingSignals] = useState(true);

    useEffect(() => {
      async function fetchSignals() {
        try {
          const sessionDate = session?.session_date || new Date().toISOString().split('T')[0];
          const res = await getYkiProgressSignals(sessionDate);
          setProgressSignals(res.signals || []);
        } catch (e) {
          console.error('Failed to fetch progress signals:', e);
          setProgressSignals([]);
        } finally {
          setLoadingSignals(false);
        }
      }
      fetchSignals();
    }, [session]);

    return (
      <View style={styles.completionContainer}>
        <View style={styles.completionCard}>
          <Text style={styles.completionEmoji}>🎉</Text>
          <Text style={styles.completionTitle}>Session Complete!</Text>
          <Text style={styles.completionSubtitle}>
            You finished all {session?.total_count || tasks.length} tasks in today's YKI session.
          </Text>
          <View style={styles.completionStats}>
            <View style={styles.completionStat}>
              <Text style={styles.completionStatLabel}>Tasks completed</Text>
              <Text style={styles.completionStatValue}>{session?.total_count || tasks.length}</Text>
            </View>
            <View style={styles.completionStat}>
              <Text style={styles.completionStatLabel}>Estimated time</Text>
              <Text style={styles.completionStatValue}>≈ {session?.plan?.estimated_minutes || 15} min</Text>
            </View>
          </View>

          {/* Progress Signals */}
          {!loadingSignals && progressSignals.length > 0 && (
            <View style={styles.signalsCard}>
              <Text style={styles.signalsTitle}>Your Progress</Text>
              {progressSignals.map((signal, idx) => (
                <View key={idx} style={styles.signalItem}>
                  <Text style={styles.signalIcon}>✓</Text>
                  <Text style={styles.signalText}>{signal}</Text>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.completionMessage}>
            Great work! Keep practicing daily to build your skills for the YKI exam.
          </Text>
          <PremiumEmbossedButton
            title="Back to YKI Home"
            onPress={onBack}
            variant="primary"
            size="large"
            style={styles.completionButton}
          />
        </View>
      </View>
    );
  };

  return (
    <Background module="yki_read" variant="blue">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Today's YKI Session</Text>
            <View style={styles.modeBadge}>
              <Text style={[styles.modeBadgeText, mode === 'exam' && styles.modeBadgeExam]}>
                {mode === 'exam' ? '📝 Exam Mode' : '🎓 Training Mode'}
              </Text>
            </View>
            <Text style={styles.headerSubtitle}>
              {mode === 'exam' ? 'Limited help, strict time limits' : 'Supportive practice with feedback and retries'}
            </Text>
          </View>
          <HomeButton navigation={navigation} style={styles.homeButton} homeType="yki" />
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#EAF5FF" />
            <Text style={styles.centerText}>Building your session…</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{error}</Text>
            <PremiumEmbossedButton title="Retry" onPress={refresh} variant="primary" size="large" />
          </View>
        ) : showCompletion ? (
          <SessionCompletionView
            session={session}
            tasks={tasks}
            navigation={navigation}
            onBack={() => {
              setShowCompletion(false);
              navigation.navigate('YKI');
            }}
          />
        ) : (
          <ScrollView contentContainerStyle={styles.content}>
            {/* Missed days return flow - show refresh message if user has been away */}
            {refreshMessage && (
              <View style={styles.refreshCard}>
                <Text style={styles.refreshIcon}>🔄</Text>
                <Text style={styles.refreshMessage}>{refreshMessage}</Text>
              </View>
            )}

            {/* Calibration Prompt */}
            {showCalibrationPrompt && calibrationStatus?.calibration_needed && (
              <View style={styles.calibrationCard}>
                <Text style={styles.calibrationIcon}>🔄</Text>
                <Text style={styles.calibrationTitle}>Level Assessment Recommended</Text>
                <Text style={styles.calibrationText}>
                  {calibrationStatus.reason || "It's time to recalibrate your level to ensure your training matches your current skills."}
                </Text>
                {calibrationStatus.days_since_last && (
                  <Text style={styles.calibrationMeta}>
                    Last assessment: {calibrationStatus.days_since_last} days ago
                  </Text>
                )}
                {calibrationStatus.attempts_since_last && (
                  <Text style={styles.calibrationMeta}>
                    Attempts since: {calibrationStatus.attempts_since_last}
                  </Text>
                )}
                <View style={styles.calibrationActions}>
                  <PremiumEmbossedButton
                    title="Take Assessment"
                    onPress={() => {
                      setShowCalibrationPrompt(false);
                      navigation.navigate('YKIPlacement');
                    }}
                    variant="primary"
                    size="medium"
                    style={styles.calibrationButton}
                  />
                  <TouchableOpacity
                    onPress={() => setShowCalibrationPrompt(false)}
                    style={styles.calibrationDismiss}
                  >
                    <Text style={styles.calibrationDismissText}>Maybe later</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.sessionCard}>
              <View style={styles.sessionRow}>
                <View>
                  <Text style={styles.sessionLabel}>Estimated</Text>
                  <Text style={styles.sessionValue}>≈ {session?.plan?.estimated_minutes || 15} min</Text>
                </View>
                <View>
                  <Text style={styles.sessionLabel}>Progress</Text>
                  <Text style={styles.sessionValue}>
                    {session?.completed_count || session?.plan?.progress?.completed || 0} / {session?.total_count || session?.plan?.progress?.total || tasks.length || 0}
                  </Text>
                </View>
                <View>
                  <Text style={styles.sessionLabel}>Task</Text>
                  <Text style={styles.sessionValue}>{taskIndex + 1} / {tasks.length}</Text>
                </View>
              </View>
              <Text style={styles.sessionHint}>
                You don't need to choose what to practice. We'll run a short, focused set of tasks and then finish.
              </Text>
            </View>

            {currentTask ? (
              <View style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskTitle}>
                    {currentTask.is_skill_lab 
                      ? currentTask.title || 'Skill Lab'
                      : currentTask.task_type === 'speaking' ? 'Speaking' 
                      : currentTask.task_type === 'writing' ? 'Writing' 
                      : currentTask.task_type === 'skill_lab' ? 'Skill Lab'
                      : currentTask.task_type}
                  </Text>
                  <Text style={styles.taskMeta}>
                    {currentTask.is_skill_lab 
                      ? `Targeting: ${currentTask.target_weakness || 'weakness'} • ${currentTask.constraints?.estimated_minutes || 5} min`
                      : `Level ${currentTask.level} • ${mode === 'exam' ? 'Exam constraints' : 'Training with feedback'}`}
                  </Text>
                </View>

                {currentTask.is_skill_lab ? (
                  <View style={styles.skillLabCard}>
                    <Text style={styles.skillLabDescription}>
                      {currentTask.description || 'Practice drill to improve your skills.'}
                    </Text>
                    <PremiumEmbossedButton
                      title={`Start ${currentTask.title || 'Lab'}`}
                      onPress={() => {
                        const route = currentTask.screen_route;
                        const params = currentTask.params || {};
                        navigation.navigate(route, { ...params, ykiMode: mode });
                      }}
                      variant="primary"
                      size="large"
                      style={styles.primaryBtn}
                    />
                  </View>
                ) : (
                  <>
                    <Text style={styles.prompt}>{currentTask.prompt_fi}</Text>

                <View style={styles.primaryActions}>
                  <PremiumEmbossedButton
                    title="Play prompt audio"
                    onPress={playPrompt}
                    variant="secondary"
                    size="large"
                    style={styles.secondaryBtn}
                  />
                </View>

                {currentTask.task_type === 'speaking' ? (
                  <View style={styles.block}>
                    <Text style={styles.blockTitle}>Record your answer</Text>
                    <MicRecorder onTranscript={setSpeakingTranscript} minSeconds={mode === 'exam' ? 10 : 0} />
                    {!!speakingTranscript && (
                      <View style={styles.responseBox}>
                        <Text style={styles.responseLabel}>Transcript</Text>
                        <Text style={styles.responseText}>{speakingTranscript}</Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.block}>
                    <Text style={styles.blockTitle}>Write your answer</Text>
                    <TextInput
                      value={writingText}
                      onChangeText={setWritingText}
                      placeholder="Write in Finnish…"
                      placeholderTextColor="rgba(255,255,255,0.45)"
                      multiline
                      style={styles.textInput}
                    />
                    <Text style={styles.helperText}>{writingText.trim().split(/\s+/).filter(Boolean).length} words</Text>
                  </View>
                )}

                {!!error && <Text style={styles.errorText}>{error}</Text>}

                {!currentTask.is_skill_lab && (
                  <PremiumEmbossedButton
                    title={evaluating ? 'Evaluating…' : 'Submit & get next step'}
                    onPress={evaluateAndSubmit}
                    disabled={!canEvaluate || evaluating}
                    variant="primary"
                    size="large"
                    style={styles.primaryBtn}
                  />
                )}
                  </>
                )}

                {evaluation && (
                  <View style={styles.feedbackCard}>
                    <Text style={styles.feedbackTitle}>Feedback</Text>
                    <Text style={styles.feedbackLine}><Text style={styles.feedbackStrong}>Win:</Text> {evaluation.feedback?.one_big_win}</Text>
                    <Text style={styles.feedbackLine}><Text style={styles.feedbackStrong}>Fix now:</Text> {evaluation.feedback?.one_fix_now}</Text>
                    <Text style={styles.feedbackLine}><Text style={styles.feedbackStrong}>Band:</Text> {evaluation.band || '—'}</Text>
                  </View>
                )}

                {nextDirective && !nextDirective.auto_advance && (
                  <View style={styles.nextCard}>
                    <Text style={styles.nextTitle}>What’s next</Text>
                    <Text style={styles.nextReason}>{nextDirective.reason}</Text>
                    <Text style={styles.nextProgress}>{nextDirective.progress_message}</Text>
                    <PremiumEmbossedButton
                      title="Continue"
                      onPress={manualContinue}
                      variant="primary"
                      size="large"
                      style={styles.primaryBtn}
                    />
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.center}>
                <Text style={styles.centerText}>No tasks in today’s plan.</Text>
                <PremiumEmbossedButton title="Back to YKI Home" onPress={() => navigation.navigate('YKI')} variant="primary" size="large" />
              </View>
            )}
          </ScrollView>
        )}
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
  headerCenter: { flex: 1, paddingHorizontal: 10 },
  headerTitle: { color: 'rgba(255,255,255,0.95)', fontSize: 16, fontWeight: '800' },
  headerSubtitle: { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 },
  homeButton: { marginLeft: 8 },
  backButton: { padding: 8 },
  backButtonText: { color: 'rgba(255,255,255,0.92)', fontSize: 20 },
  content: { padding: 16, paddingBottom: 32 },
  center: { padding: 22, alignItems: 'center', gap: 12 },
  centerText: { color: 'rgba(255,255,255,0.78)' },
  errorText: { color: '#fecaca', textAlign: 'center' },
  sessionCard: {
    backgroundColor: 'rgba(16, 22, 40, 0.78)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    marginBottom: 16,
  },
  sessionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  sessionLabel: { color: 'rgba(255,255,255,0.55)', fontSize: 12 },
  sessionValue: { color: 'rgba(255,255,255,0.92)', fontSize: 14, fontWeight: '700', marginTop: 2 },
  sessionHint: { color: 'rgba(255,255,255,0.65)', marginTop: 10, lineHeight: 18 },
  taskCard: {
    backgroundColor: 'rgba(16, 22, 40, 0.78)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  taskHeader: { marginBottom: 10 },
  taskTitle: { color: 'rgba(255,255,255,0.95)', fontSize: 18, fontWeight: '800' },
  taskMeta: { color: 'rgba(255,255,255,0.65)', marginTop: 4, fontSize: 12 },
  prompt: { color: 'rgba(255,255,255,0.88)', lineHeight: 20, marginBottom: 12 },
  primaryActions: { marginBottom: 10 },
  secondaryBtn: { alignSelf: 'flex-start' },
  block: { marginTop: 8, gap: 10 },
  blockTitle: { color: 'rgba(255,255,255,0.92)', fontWeight: '700' },
  responseBox: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  responseLabel: { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginBottom: 6 },
  responseText: { color: 'rgba(255,255,255,0.92)', lineHeight: 20 },
  textInput: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    padding: 12,
    color: 'rgba(255,255,255,0.92)',
    minHeight: 140,
    textAlignVertical: 'top',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  helperText: { color: 'rgba(255,255,255,0.55)', fontSize: 12, textAlign: 'right' },
  primaryBtn: { marginTop: 12 },
  feedbackCard: {
    marginTop: 14,
    borderRadius: 14,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  feedbackTitle: { color: 'rgba(255,255,255,0.92)', fontSize: 14, fontWeight: '800', marginBottom: 10 },
  feedbackLine: { color: 'rgba(255,255,255,0.80)', lineHeight: 20, marginBottom: 6 },
  feedbackStrong: { color: 'rgba(255,255,255,0.95)', fontWeight: '800' },
  nextCard: {
    marginTop: 14,
    borderRadius: 14,
    padding: 14,
    backgroundColor: 'rgba(27, 78, 218, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(27, 78, 218, 0.30)',
  },
  nextTitle: { color: 'rgba(255,255,255,0.95)', fontSize: 14, fontWeight: '900', marginBottom: 6 },
  nextReason: { color: 'rgba(255,255,255,0.85)', lineHeight: 20 },
  nextProgress: { color: 'rgba(255,255,255,0.70)', lineHeight: 20, marginTop: 6 },
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  completionCard: {
    backgroundColor: 'rgba(16, 22, 40, 0.95)',
    borderRadius: 20,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  completionEmoji: { fontSize: 64, marginBottom: 16 },
  completionTitle: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  completionSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  completionStats: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 24,
    width: '100%',
    justifyContent: 'center',
  },
  completionStat: {
    alignItems: 'center',
  },
  completionStatLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    marginBottom: 4,
  },
  completionStatValue: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 18,
    fontWeight: '700',
  },
  completionMessage: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  completionButton: {
    width: '100%',
  },
  refreshCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.30)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  refreshIcon: {
    fontSize: 24,
  },
  refreshMessage: {
    flex: 1,
    color: 'rgba(255,255,255,0.90)',
    fontSize: 14,
    lineHeight: 20,
  },
  calibrationCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.30)',
  },
  calibrationIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  calibrationTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.95)',
    marginBottom: 8,
  },
  calibrationText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.90)',
    lineHeight: 20,
    marginBottom: 12,
  },
  calibrationMeta: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 4,
  },
  calibrationActions: {
    marginTop: 12,
    gap: 8,
  },
  calibrationButton: {
    width: '100%',
  },
  calibrationDismiss: {
    padding: 8,
    alignItems: 'center',
  },
  calibrationDismissText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.70)',
    textDecorationLine: 'underline',
  },
  skillLabCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.30)',
  },
  skillLabDescription: {
    color: 'rgba(255,255,255,0.90)',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  signalsCard: {
    backgroundColor: 'rgba(16, 22, 40, 0.78)',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  signalsTitle: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  signalItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  signalIcon: {
    color: '#4ECDC4',
    fontSize: 16,
    marginTop: 2,
  },
  signalText: {
    flex: 1,
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    lineHeight: 20,
  },
});



