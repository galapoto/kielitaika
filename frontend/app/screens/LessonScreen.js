import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Background from '../components/ui/Background';
import {
  listPaths,
  listWorkplaceFields,
  fetchWorkplaceLesson,
  fetchVocab,
  fetchSrsQueue,
} from '../utils/api';
import { usePath } from '../context/PathContext';
import { RukaButton, IconLightning, IconBook } from '../ui';
import HomeButton from '../components/HomeButton';
import PremiumEmbossedButton from '../components/PremiumEmbossedButton';

export default function LessonScreen() {
  const navigation = useNavigation();
  const { setPath, setProfession } = usePath();
  const [paths, setPaths] = useState([]);
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState('sairaanhoitaja');
  const [lesson, setLesson] = useState(null);
  const [vocab, setVocab] = useState([]);
  const [srsQueue, setSrsQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [{ paths: apiPaths }, { fields: apiFields }] = await Promise.all([
          listPaths(),
          listWorkplaceFields(),
        ]);
        setPaths(apiPaths || []);
        setFields(apiFields || []);
      } catch (err) {
        setError(err.message || 'Failed to load metadata');
      }
    };
    bootstrap();
  }, []);

  useEffect(() => {
    const loadLesson = async () => {
      if (!selectedField) return;
      setLoading(true);
      setError('');
      try {
        const [lessonRes, vocabRes] = await Promise.all([
          fetchWorkplaceLesson(selectedField),
          fetchVocab('workplace', selectedField, 8),
        ]);
        setLesson(lessonRes);
        setVocab(vocabRes.items || []);
      } catch (err) {
        setError(err.message || 'Failed to load lesson');
      } finally {
        setLoading(false);
      }
    };
    loadLesson();
  }, [selectedField]);

  useEffect(() => {
    const loadSrs = async () => {
      try {
        const { queue } = await fetchSrsQueue([], selectedField, 8);
        setSrsQueue(queue || []);
      } catch (err) {
        // non-blocking
      }
    };
    loadSrs();
  }, [selectedField]);

  const pathPills = (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
      {paths.map((p) => (
        <RukaButton
          key={p.id}
          title={p.label}
          icon={IconLightning}
          onPress={() => setPath(p.id)}
          style={{ marginRight: 8 }}
        />
      ))}
    </ScrollView>
  );

  const fieldPills = (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
      {fields.map((f) => (
        <RukaButton
          key={f.id}
          title={f.label}
          icon={IconBook}
          onPress={() => {
            setSelectedField(f.id);
            setPath('workplace');
            setProfession(f.id);
          }}
          style={{ marginRight: 8, opacity: selectedField === f.id ? 1 : 0.8 }}
        />
      ))}
    </ScrollView>
  );

  // Lesson cards - combining card grid (2nd picture) and schedule layout (3rd picture)
  const lessonCards = [
    // Keep within allowed palette (blue/white/black/brown only)
    { id: 'grammar', icon: '📝', label: 'Grammar', color: '#1B4EDA' },
    { id: 'vocabulary', icon: '📚', label: 'Vocabulary', color: '#1B4EDA' },
    { id: 'speaking', icon: '🎤', label: 'Speaking', color: '#1B4EDA' },
    { id: 'reading', icon: '📖', label: 'Reading', color: '#1B4EDA' },
    { id: 'writing', icon: '✍️', label: 'Writing', color: '#1B4EDA' },
    { id: 'listening', icon: '👂', label: 'Listening', color: '#1B4EDA' },
  ];

  // Lesson schedule items (from 3rd picture style)
  const lessonSchedule = [
    { id: '1', time: '9:00', title: 'Grammar Basics', subtitle: 'Present tense practice', status: 'completed' },
    { id: '2', time: '10:00', title: 'Vocabulary Building', subtitle: '20 new words', status: 'active' },
    { id: '3', time: '11:00', title: 'Speaking Practice', subtitle: 'Conversation exercises', status: 'pending' },
  ];

  return (
    <Background module="home" variant="brown">
      <View style={styles.container}>
      {/* Header - Dark Blue from 3rd picture */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (navigation?.canGoBack?.() && navigation.canGoBack()) navigation.goBack();
            else navigation?.navigate?.('Home');
          }}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>LESSONS</Text>
        <HomeButton navigation={navigation} style={styles.homeButtonHeader} />
      </View>

      {/* Date/Day Selection - From 3rd picture */}
      <View style={styles.dateSection}>
        <View style={styles.dateDisplay}>
          <Text style={styles.dateNumber}>{new Date().getDate()}</Text>
          <Text style={styles.dateDay}>{['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][new Date().getDay()]}</Text>
        </View>
        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, styles.tabActive]}>
            <Text style={[styles.tabText, styles.tabTextActive]}>TODAY LIST</Text>
          </TouchableOpacity>
          <Text style={styles.taskCount}>{lessonSchedule.length} lessons</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Card Grid - From 2nd picture (3x2 grid) */}
        <View style={styles.cardGrid}>
          {lessonCards.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={styles.lessonCard}
              onPress={() => {
                // Navigate to specific lesson type
                navigation?.navigate('LessonDetail', { type: card.id });
              }}
            >
              <Text style={styles.cardIcon}>{card.icon}</Text>
              <Text style={styles.cardLabel}>{card.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Lesson Schedule - From 3rd picture (white card with time markers) */}
        <View style={styles.scheduleCard}>
          <View style={styles.timeAxis}>
            {['9:00', '10:00', '11:00'].map((time) => (
              <View key={time} style={styles.timeMarker}>
                <Text style={styles.timeText}>{time}</Text>
              </View>
            ))}
          </View>

          <View style={styles.lessonsList}>
            {lessonSchedule.map((item) => (
              <View key={item.id} style={styles.lessonItem}>
                <View style={styles.lessonContent}>
                  <Text style={styles.lessonTitle}>{item.title}</Text>
                  <Text style={styles.lessonSubtitle}>{item.subtitle}</Text>
                </View>
                <View style={styles.lessonStatus}>
                  {item.status === 'completed' && (
                    <Text style={styles.statusIcon}>✓</Text>
                  )}
                  {item.status === 'active' && (
                    <Text style={[styles.statusIcon, styles.statusActive]}>★</Text>
                  )}
                  {item.status === 'pending' && (
                    <Text style={[styles.statusIcon, styles.statusPending]}>⚠</Text>
                  )}
                  <Text style={styles.moreIcon}>...</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Current Lesson Card - Flight booking style from 6th picture */}
        {lesson && (
          <TouchableOpacity
            style={styles.currentLessonCard}
            onPress={() => navigation.navigate('LessonDetail', { lessonId: lesson.id })}
          >
            <View style={styles.lessonCardLeft}>
              <Text style={styles.lessonCardTitle}>{lesson.title || 'Current Lesson'}</Text>
              <Text style={styles.lessonCardDescription}>{lesson.summary || 'Continue your learning'}</Text>
              <Text style={styles.lessonCardProgress}>Progress: 60%</Text>
            </View>
            <View style={styles.lessonCardRight}>
              <Text style={styles.lessonCardTime}>30 min</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Vocabulary Section */}
        {vocab.length > 0 && (
          <View style={styles.vocabSection}>
            <Text style={styles.sectionTitle}>Vocabulary</Text>
            {vocab.slice(0, 5).map((item, idx) => (
              <View key={idx} style={styles.vocabItem}>
                <Text style={styles.vocabWord}>{item.fi}</Text>
                <Text style={styles.vocabTranslation}>{item.en}</Text>
              </View>
            ))}
          </View>
        )}

        {loading && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#1E3A8A" />
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button - From 3rd picture */}
      <TouchableOpacity style={styles.fab}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    backgroundColor: '#1E3A8A', // Dark blue from 3rd picture
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  homeButtonHeader: {
    marginLeft: 'auto',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  calendarButton: {
    padding: 8,
  },
  calendarIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  dateSection: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  dateDisplay: {
    alignItems: 'center',
  },
  dateNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dateDay: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  taskCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  lessonCard: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#2A2A2A', // Dark gray from 2nd picture
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    padding: 16,
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  scheduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    minHeight: 300,
    flexDirection: 'row',
  },
  timeAxis: {
    width: 60,
    marginRight: 16,
  },
  timeMarker: {
    marginBottom: 40,
  },
  timeText: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  lessonsList: {
    flex: 1,
  },
  lessonItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  lessonContent: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  lessonSubtitle: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
  },
  lessonStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIcon: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.85)',
  },
  statusActive: {
    color: 'rgba(255,255,255,0.92)',
  },
  statusPending: {
    color: 'rgba(255,255,255,0.65)',
  },
  moreIcon: {
    fontSize: 18,
    color: 'rgba(0, 0, 0, 0.4)',
  },
  currentLessonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  lessonCardLeft: {
    flex: 1,
  },
  lessonCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  lessonCardDescription: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
    marginBottom: 4,
  },
  lessonCardProgress: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  lessonCardRight: {
    alignItems: 'flex-end',
  },
  lessonCardTime: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  vocabSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
  },
  vocabItem: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  vocabWord: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  vocabTranslation: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
  },
  loader: {
    marginTop: 40,
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  errorText: {
    color: '#DC2626',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1E3A8A',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '300',
  },
});
