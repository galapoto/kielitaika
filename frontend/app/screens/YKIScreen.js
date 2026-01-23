import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import MicRecorder from '../components/MicRecorder';
import { generateYkiExam, submitYkiExam } from '../utils/api';
import { getYkiTodaySession } from '../utils/api';
import UpgradeNotice from '../components/UpgradeNotice';
import Background from '../components/ui/Background';
import NeumorphicButton from '../ui/components/NeumorphicButton';
import EnhancedCard from '../ui/components/EnhancedCard';
import DecorativeText from '../ui/components/DecorativeText';
import { IconPlay, IconMic, IconLightning } from '../ui/icons/IconPack';
import HomeButton from '../components/HomeButton';
import ProfileImage from '../components/ProfileImage';

const onDark = '#E6F2FF';
const onDarkMuted = '#BFD7E8';

const YKI_LEVELS = [
  { key: 'basic', label: 'A1-A2', description: 'Perusteet' },
  { key: 'intermediate', label: 'B1-B2', description: 'Keskitaso' },
  { key: 'advanced', label: 'C1-C2 (Ylin taso)', description: 'Ylin' },
];

const YKI_PRACTICE_CARDS = [
  {
    id: 'reading',
    icon: '📖',
    label: 'Reading',
    description: 'Timed articles, comprehension questions',
    screen: 'YKIPracticeReading',
    gradientColors: ['#0f172a', '#1e293b'],
    glowColor: '#38bdf8',
  },
  {
    id: 'speaking',
    icon: '🎤',
    label: 'Speaking',
    description: 'Prompts + guided recorders',
    screen: 'YKIPracticeSpeaking',
    gradientColors: ['#111827', '#312e81'],
    glowColor: '#a855f7',
  },
  {
    id: 'writing',
    icon: '✍️',
    label: 'Writing',
    description: 'Plan + polish short essays',
    screen: 'YKIPracticeWriting',
    gradientColors: ['#0f172a', '#1c1917'],
    glowColor: '#f97316',
  },
  {
    id: 'listening',
    icon: '👂',
    label: 'Listening',
    description: 'Fast speech, quizzes, transcript reviews',
    screen: 'YKIPracticeListening',
    gradientColors: ['#0f172a', '#0f766e'],
    glowColor: '#14b8a6',
  },
];

export default function YKIScreen({ navigation }) {
  const { user } = useAuth();
  const [examType, setExamType] = useState('full');
  const [level, setLevel] = useState('intermediate');
  const [exam, setExam] = useState(null);
  const [speakingResponses, setSpeakingResponses] = useState({});
  const [writingResponses, setWritingResponses] = useState({});
  const [evaluation, setEvaluation] = useState(null);
  const [loadingExam, setLoadingExam] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [upgradeReason, setUpgradeReason] = useState(null);
  const [todaySession, setTodaySession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(false);

  useEffect(() => {
    loadExam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examType, level]);

  useEffect(() => {
    // Fetch today's session for the Daily Session Contract CTA.
    // This is intentionally independent of exam generation.
    let cancelled = false;
    (async () => {
      setLoadingSession(true);
      try {
        const res = await getYkiTodaySession('training');
        if (!cancelled) setTodaySession(res?.session || null);
      } catch (_) {
        if (!cancelled) setTodaySession(null);
      } finally {
        if (!cancelled) setLoadingSession(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const speakingTasks = useMemo(
    () => (exam?.tasks || []).filter((t) => (t.id || '').startsWith('speaking')),
    [exam]
  );
  const writingTasks = useMemo(
    () => (exam?.tasks || []).filter((t) => (t.id || '').startsWith('writing')),
    [exam]
  );
  const currentLevelInfo = useMemo(
    () => YKI_LEVELS.find((item) => item.key === level) ?? YKI_LEVELS[0],
    [level]
  );

  const loadExam = async () => {
    setLoadingExam(true);
    setError('');
    setEvaluation(null);
    setExam(null); // Clear previous exam while loading
    try {
      console.log('[YKIScreen] Loading exam...', { examType, level, user: user?.email || user?.id });
      const { exam: newExam } = await generateYkiExam(examType, level);
      console.log('[YKIScreen] Exam loaded successfully:', newExam?.exam_id, 'tasks:', newExam?.tasks?.length);
      if (!newExam || !newExam.tasks || newExam.tasks.length === 0) {
        throw new Error('Exam generated but contains no tasks. Please try again.');
      }
      setExam(newExam);
      setSpeakingResponses({});
      setWritingResponses({});
      setUpgradeReason(null);
    } catch (err) {
      console.error('[YKIScreen] Failed to load exam:', err);
      const errorMessage = err?.message || 'Failed to load YKI exam. Please check your connection and try again.';
      setError(errorMessage);
      if (err?.message?.includes('Upgrade required') || err?.message?.includes('Subscription required')) {
        setUpgradeReason(err.message);
      }
    } finally {
      setLoadingExam(false);
    }
  };

  const handlePracticePress = useCallback((card) => {
    // Pass training mode by default (practice cards are always training mode)
    navigation.navigate(card.screen, { level, ykiMode: 'training' });
  }, [navigation, level]);

  const updateResponse = (taskId, value, type) => {
    if (type === 'speaking') {
      setSpeakingResponses((prev) => ({ ...prev, [taskId]: value }));
    } else {
      setWritingResponses((prev) => ({ ...prev, [taskId]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!exam) return;
    setSubmitting(true);
    setError('');
    try {
      const speakingPayload = speakingTasks
        .map((task) => ({
          task_id: task.id,
          transcript: (speakingResponses[task.id] || '').trim(),
        }))
        .filter((item) => item.transcript.length > 0);

      const writingPayload = writingTasks
        .map((task) => ({
          task_id: task.id,
          text: (writingResponses[task.id] || '').trim(),
        }))
        .filter((item) => item.text.length > 0);

      const { evaluation: evalResult } = await submitYkiExam(
        exam.exam_id,
        speakingPayload,
        writingPayload
      );
      setEvaluation(evalResult);
      setUpgradeReason(null);
    } catch (err) {
      setError(err.message || 'Failed to submit exam');
      if (err?.message?.includes('Upgrade required')) {
        setUpgradeReason(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const wordCount = (text) => (text ? text.trim().split(/\s+/).filter(Boolean).length : 0);

  return (
    <Background module="yki_read" variant="blue">
      <View style={styles.ykiContainer}>
      {/* Header - Dark Blue/Purple with Profile */}
      <View style={styles.ykiHeader}>
        <View style={styles.headerLeft}>
          <ProfileImage size={40} />
          <Text style={styles.headerGreeting}>Good Morning {user?.name || 'User'}</Text>
        </View>
        <View style={styles.headerRight}>
          <HomeButton navigation={navigation} style={styles.homeButtonHeader} homeType="yki" />
          <TouchableOpacity style={styles.settingsButton} onPress={() => navigation?.navigate('Settings')}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.infoButton} onPress={() => navigation?.navigate('YKIInfo')}>
            <Text style={styles.infoIcon}>ℹ️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Title */}
      <View style={styles.titleSection}>
        <Text style={styles.mainTitle}>YKI Exam Preparation</Text>
      </View>

      <ScrollView style={styles.ykiScrollView} contentContainerStyle={styles.ykiScrollContent}>
        {/* Daily Session Contract (dominant primary action) */}
        <EnhancedCard
          variant="gradient"
          gradientColors={['#111827', '#041536']}
          glowColor="#38bdf8"
          style={[styles.examConfigCard, { marginBottom: 16 }]}
          onPress={() => navigation.navigate('YKIDailySession', { mode: 'training' })}
        >
          <Text style={styles.practiceTitle}>Today's YKI Session</Text>
          <View style={styles.modeIndicator}>
            <Text style={styles.modeIndicatorText}>🎓 Training Mode</Text>
          </View>
          <Text style={styles.practiceSubtitle}>
            A short plan picked by the system so you never need to decide what to practice next.
          </Text>
          <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={styles.inputLabel}>Estimated</Text>
              <Text style={styles.inputValue}>
                {loadingSession ? '…' : `≈ ${(todaySession?.plan?.estimated_minutes || 15)} min`}
              </Text>
            </View>
            <View>
              <Text style={styles.inputLabel}>Progress</Text>
              <Text style={styles.inputValue}>
                {loadingSession ? '…' : `${todaySession?.completed_count || 0}/${todaySession?.total_count || todaySession?.plan?.progress?.total || 0}`}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.searchButton, { marginTop: 14 }]}
            onPress={() => navigation.navigate('YKIDailySession', { mode: 'training' })}
          >
            <Text style={styles.searchButtonText}>
              {(todaySession?.completed === true || todaySession?.completed === 'true') ? "Review today's session" : "Start / Continue today's session"}
            </Text>
          </TouchableOpacity>
        </EnhancedCard>

        {/* Placement Diagnostic (for new users) */}
        {!todaySession && (
          <EnhancedCard
            variant="gradient"
            gradientColors={['#1e3a5f', '#0a1f3a']}
            glowColor="#60a5fa"
            style={[styles.examConfigCard, { marginBottom: 16 }]}
            onPress={() => navigation.navigate('YKIPlacement')}
          >
            <Text style={styles.practiceTitle}>📊 Placement Diagnostic</Text>
            <Text style={styles.practiceSubtitle}>
              New to YKI? Take a 10-15 minute diagnostic to determine your level and get a personalized training plan.
            </Text>
            <TouchableOpacity
              style={[styles.searchButton, { marginTop: 14 }]}
              onPress={() => navigation.navigate('YKIPlacement')}
            >
              <Text style={styles.searchButtonText}>Start Placement</Text>
            </TouchableOpacity>
          </EnhancedCard>
        )}

        {/* Goal Setting */}
        <EnhancedCard
          variant="gradient"
          gradientColors={['#2d4a3e', '#1a2e24']}
          glowColor="#10b981"
          style={[styles.examConfigCard, { marginBottom: 16 }]}
          onPress={() => navigation.navigate('YKIGoal')}
        >
          <Text style={styles.practiceTitle}>🎯 Set Your Goal</Text>
          <Text style={styles.practiceSubtitle}>
            Set your target exam date and level band. We'll create a personalized training plan to get you ready.
          </Text>
          <TouchableOpacity
            style={[styles.searchButton, { marginTop: 14 }]}
            onPress={() => navigation.navigate('YKIGoal')}
          >
            <Text style={styles.searchButtonText}>Set Goal</Text>
          </TouchableOpacity>
        </EnhancedCard>

        {/* Progress Overview */}
        <EnhancedCard
          variant="gradient"
          gradientColors={['#3d2a4e', '#2a1a3a']}
          glowColor="#a855f7"
          style={[styles.examConfigCard, { marginBottom: 16 }]}
          onPress={() => navigation.navigate('YKIProgress')}
        >
          <Text style={styles.practiceTitle}>📊 Your Progress</Text>
          <Text style={styles.practiceSubtitle}>
            View your progress across all skills and see how close you are to YKI Level 3.
          </Text>
          <TouchableOpacity
            style={[styles.searchButton, { marginTop: 14 }]}
            onPress={() => navigation.navigate('YKIProgress')}
          >
            <Text style={styles.searchButtonText}>View Progress</Text>
          </TouchableOpacity>
        </EnhancedCard>

        {/* Attempt History */}
        <EnhancedCard
          variant="gradient"
          gradientColors={['#1e3a5f', '#0a1f3a']}
          glowColor="#60a5fa"
          style={[styles.examConfigCard, { marginBottom: 16 }]}
          onPress={() => navigation.navigate('YKIAttemptHistory')}
        >
          <Text style={styles.practiceTitle}>📋 Attempt History</Text>
          <Text style={styles.practiceSubtitle}>
            Review your past attempts, see feedback, and track your improvement over time.
          </Text>
          <TouchableOpacity
            style={[styles.searchButton, { marginTop: 14 }]}
            onPress={() => navigation.navigate('YKIAttemptHistory')}
          >
            <Text style={styles.searchButtonText}>View History</Text>
          </TouchableOpacity>
        </EnhancedCard>

        <View style={styles.practiceSection}>
          <View style={styles.practiceHeader}>
            <View>
              <Text style={styles.practiceTitle}>YKI Practice</Text>
              <Text style={styles.practiceSubtitle}>
                Short drills per skill so you can warm up before attempting a full mock exam.
              </Text>
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.practiceScroll}
            contentContainerStyle={styles.practiceScrollContent}
          >
            {YKI_PRACTICE_CARDS.map((card) => (
              <EnhancedCard
                key={card.id}
                variant="premium"
                glowColor={card.glowColor}
                gradientColors={card.gradientColors}
                onPress={() => handlePracticePress(card)}
                style={styles.practiceCard}
              >
                <Text style={styles.practiceIcon}>{card.icon}</Text>
                <Text style={styles.practiceLabel}>{card.label}</Text>
                <Text style={styles.practiceDescription}>{card.description}</Text>
                <Text style={styles.practiceAction}>Launch practice</Text>
              </EnhancedCard>
            ))}
          </ScrollView>
        </View>

        <EnhancedCard
          variant="gradient"
          gradientColors={['#111827', '#041536']}
          glowColor="#1B4EDA"
          style={styles.examConfigCard}
        >
          {/* Exam Type */}
          <View style={styles.inputRow}>
            <View style={styles.inputIconContainer}>
              <Text style={styles.inputIcon}>📝</Text>
            </View>
            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>Exam Type</Text>
              <TouchableOpacity onPress={() => {
                const types = ['full', 'speaking_only', 'writing_only'];
                const currentIndex = types.indexOf(examType);
                setExamType(types[(currentIndex + 1) % types.length]);
              }}>
                <Text style={styles.inputValue}>
                  {examType === 'full' ? 'Full Exam' : examType === 'speaking_only' ? 'Speaking Only' : 'Writing Only'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Level */}
          <View style={styles.inputRow}>
            <View style={styles.inputIconContainer}>
              <Text style={styles.inputIcon}>📊</Text>
            </View>
            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>Difficulty Level</Text>
              <TouchableOpacity onPress={() => {
                const currentIndex = YKI_LEVELS.findIndex((item) => item.key === level);
                setLevel(YKI_LEVELS[(currentIndex + 1) % YKI_LEVELS.length].key);
              }}>
                <Text style={styles.inputValue}>
                  {currentLevelInfo.label}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Level Selection Chips */}
          <View style={styles.levelChipsContainer}>
            {YKI_LEVELS.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.levelChip,
                  level === item.key && styles.levelChipActive,
                ]}
                onPress={() => setLevel(item.key)}
              >
                <Text style={[
                  styles.levelChipLabel,
                  level === item.key && styles.levelChipLabelActive,
                ]}>
                  {item.label}
                </Text>
                <Text style={styles.levelChipDescription}>{item.description}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Generate Exam Button */}
          <TouchableOpacity
            style={[styles.searchButton, loadingExam && styles.searchButtonDisabled]}
            onPress={loadExam}
            disabled={loadingExam}
          >
            <Text style={styles.searchButtonText}>
              {loadingExam ? 'Generating Exam...' : 'Generate Exam'}
            </Text>
          </TouchableOpacity>
        </EnhancedCard>

        {/* Upcoming Exams Section */}
        {exam && (
          <View style={styles.upcomingSection}>
            <View style={styles.upcomingHeader}>
              <Text style={styles.upcomingTitle}>Upcoming exams</Text>
              <TouchableOpacity onPress={() => navigation.navigate('YKIDailySession', { mode: 'exam' })}>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>

            {/* Exam Card - Flight Listing Style */}
            <TouchableOpacity 
              style={styles.examCard}
              onPress={() => {
                if (!exam) return;
                const speakingTasks = exam.tasks?.filter(t => t.id?.startsWith('speaking')) || [];
                const writingTasks = exam.tasks?.filter(t => t.id?.startsWith('writing')) || [];
                
                if (examType === 'speaking_only' || (examType === 'full' && speakingTasks.length > 0)) {
                  navigation.navigate('YKISpeakingExam', {
                    tasks: speakingTasks,
                    examId: exam.exam_id,
                    level: level,
                  });
                } else if (examType === 'writing_only' || (examType === 'full' && writingTasks.length > 0)) {
                  navigation.navigate('YKIWritingExam', {
                    tasks: writingTasks,
                    examId: exam.exam_id,
                    level: level,
                  });
                }
              }}
            >
              <View style={styles.examCardLeft}>
                <Text style={styles.examAirline}>YKI Exam</Text>
                <Text style={styles.examRoute}>
                  {examType.replace('_', ' ').toUpperCase()}
                </Text>
                <Text style={styles.examDate}>
                  Level: {currentLevelInfo.label}
                </Text>
              </View>
              <View style={styles.examCardRight}>
                <Text style={styles.examPrice}>
                  {exam.total_time_minutes} min
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Error and Upgrade Notices */}
        {error && <Text style={styles.errorText}>{error}</Text>}
        {upgradeReason && (
          <UpgradeNotice
            reason={upgradeReason}
            onPress={() => navigation.navigate('Subscription')}
          />
        )}

        {/* Exam Tasks Display */}
        {exam && (
          <View style={styles.examTasksSection}>
            {speakingTasks.length > 0 && (
              <View style={styles.taskSection}>
                <Text style={styles.taskSectionTitle}>Speaking Tasks</Text>
                {speakingTasks.map((task) => (
                  <View key={task.id} style={styles.taskItem}>
                    <Text style={styles.taskTitle}>{task.description || 'Speaking Task'}</Text>
                    <Text style={styles.taskDescription}>{task.prompt}</Text>
                    <Text style={styles.taskTime}>~{task.time_limit}s</Text>
                  </View>
                ))}
              </View>
            )}

            {writingTasks.length > 0 && (
              <View style={styles.taskSection}>
                <Text style={styles.taskSectionTitle}>Writing Tasks</Text>
                {writingTasks.map((task) => (
                  <View key={task.id} style={styles.taskItem}>
                    <Text style={styles.taskTitle}>{task.description || 'Writing Task'}</Text>
                    <Text style={styles.taskDescription}>{task.prompt}</Text>
                    <Text style={styles.taskTime}>
                      {task.word_limit} words • {task.time_limit} min
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={[styles.navItem, styles.navItemActive]}
          onPress={() => navigation?.navigate('Home')}
        >
          <Text style={[styles.navIcon, styles.navIconActive]}>🏠</Text>
          <Text style={[styles.navLabel, styles.navLabelActive]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => {
            // Stay on YKI screen (already here)
            loadExam();
          }}
        >
          <Text style={styles.navIcon}>🎫</Text>
          <Text style={styles.navLabel}>Exams</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation?.navigate('Conversation')}
        >
          <Text style={styles.navIcon}>💬</Text>
          <Text style={styles.navLabel}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation?.navigate('Settings')}
        >
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 20,
    gap: 16,
  },
  header: {
    gap: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0A3D62',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
  },
  practiceSection: {
    marginBottom: 24,
  },
  practiceHeader: {
    marginBottom: 12,
  },
  practiceTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  practiceSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 8,
    maxWidth: '80%',
  },
  modeIndicator: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(78, 205, 196, 0.20)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.40)',
  },
  modeIndicatorText: {
    color: '#4ECDC4',
    fontSize: 12,
    fontWeight: '700',
  },
  practiceScroll: {
    marginTop: 4,
  },
  practiceScrollContent: {
    paddingBottom: 8,
  },
  practiceCard: {
    width: 220,
    marginRight: 14,
    padding: 20,
  },
  practiceIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  practiceLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EAF5FF',
  },
  practiceDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
  },
  practiceAction: {
    marginTop: 12,
    fontSize: 12,
    color: '#38bdf8',
    fontWeight: '600',
  },
  configCard: {
    marginBottom: 16,
    padding: 20,
  },
  configTitle: {
    marginBottom: 8,
  },
  configSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16,
  },
  examCard: {
    marginBottom: 16,
    padding: 20,
  },
  examTitle: {
    marginBottom: 8,
  },
  examSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16,
  },
  resultsCard: {
    marginBottom: 16,
    padding: 20,
  },
  resultsTitle: {
    marginBottom: 8,
  },
  resultsSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16,
  },
  taskPrompt: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: onDark,
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    minWidth: 120,
    flexGrow: 1,
  },
  chipActive: {
    borderColor: 'rgba(174,226,255,0.6)',
    borderWidth: 1,
  },
  primaryButton: {
    marginTop: 8,
  },
  secondaryButton: {
    flex: 1,
  },
  errorText: {
    color: '#dc2626',
  },
  sectionBlock: {
    gap: 12,
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: onDark,
  },
  levelChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  levelChip: {
    flex: 1,
    minWidth: 110,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  levelChipActive: {
    borderColor: '#1B4EDA',
    backgroundColor: 'rgba(27,78,218,0.15)',
  },
  levelChipLabel: {
    color: '#E2EEF8',
    fontSize: 14,
    fontWeight: '600',
  },
  levelChipLabelActive: {
    color: '#1B4EDA',
  },
  levelChipDescription: {
    fontSize: 12,
    color: '#A0B8CE',
    marginTop: 4,
  },
  taskCard: {
    marginVertical: 6,
    gap: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(174,226,255,0.15)',
    borderRadius: 8,
    fontSize: 12,
    color: onDark,
  },
  prompt: {
    fontSize: 14,
    color: onDark,
    lineHeight: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fff',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  writingInput: {
    minHeight: 120,
  },
  helperText: {
    fontSize: 12,
    color: onDarkMuted,
    textAlign: 'right',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  resultLabel: {
    fontSize: 13,
    color: onDarkMuted,
  },
  resultValue: {
    fontSize: 20,
    fontWeight: '700',
    color: onDark,
  },
  recommendationItem: {
    flexDirection: 'row',
    gap: 6,
  },
  bullet: {
    color: onDark,
  },
  recommendationText: {
    flex: 1,
    color: onDarkMuted,
  },
  scoreCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 4,
  },
  metricTitle: {
    fontWeight: '700',
    color: onDark,
  },
  metricValue: {
    color: onDark,
    fontWeight: '700',
  },
  metricDetail: {
    color: onDarkMuted,
    fontSize: 13,
  },
  // New YKI design styles (matching 6th image - flight booking app style)
  ykiContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  homeButtonHeader: {
    marginLeft: 8,
  },
  ykiHeader: {
    backgroundColor: 'rgba(10, 14, 39, 0.78)', // dark blue foundation
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.10)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  profileImageText: {
    fontSize: 20,
  },
  headerGreeting: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.92)',
  },
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.92)',
  },
  titleSection: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.95)',
  },
  ykiScrollView: {
    flex: 1,
  },
  ykiScrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  examConfigCard: {
    backgroundColor: 'rgba(16, 22, 40, 0.78)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  inputIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(27, 78, 218, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  inputContent: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 4,
  },
  inputValue: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.90)',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    padding: 12,
  },
  dateLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.88)',
  },
  travelersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.10)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.10)',
  },
  travelersLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.88)',
  },
  travelersControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  travelerButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(27, 78, 218, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  travelerButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  travelersCount: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.88)',
    minWidth: 60,
    textAlign: 'center',
  },
  searchButton: {
    backgroundColor: 'rgba(27, 78, 218, 0.92)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  upcomingSection: {
    marginBottom: 24,
  },
  upcomingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  upcomingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.92)',
  },
  seeAllText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
  },
  examCard: {
    backgroundColor: 'rgba(16, 22, 40, 0.78)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  examCardLeft: {
    flex: 1,
  },
  examAirline: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.92)',
    marginBottom: 4,
  },
  examRoute: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 4,
  },
  examDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
  },
  examCardRight: {
    alignItems: 'flex-end',
  },
  examPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.92)',
  },
  examTasksSection: {
    marginBottom: 24,
  },
  taskSection: {
    marginBottom: 24,
  },
  taskSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.92)',
    marginBottom: 12,
  },
  taskItem: {
    backgroundColor: 'rgba(16, 22, 40, 0.78)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.92)',
    marginBottom: 8,
  },
  taskDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 8,
    lineHeight: 20,
  },
  taskTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'rgba(10, 14, 39, 0.86)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.10)',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  navItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  navIcon: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  navIconActive: {
    color: '#FFFFFF',
  },
  navLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  navLabelActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
