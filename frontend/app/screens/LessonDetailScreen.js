import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, findNodeHandle, UIManager } from 'react-native';
import Background from '../components/ui/Background';
import { useAuth } from '../context/AuthContext';
import { fetchLesson, fetchWorkplaceLesson } from '../utils/api';
import MicRecorder from '../components/MicRecorder';
import HomeButton from '../components/HomeButton';
import RukaCard from '../components/ui/RukaCard';
import { colors as palette } from '../styles/colors';
import { useVoice } from '../hooks/useVoice';

const LESSON_NORMALIZATION = {
  practice: 'speaking',
  review: 'listening',
  quiz: 'reading',
  notes: 'writing',
  resources: 'grammar',
  assessment: 'speaking',
};

const FALLBACK_LESSONS = {
  grammar: {
    id: 'grammar_fallback',
    type: 'grammar',
    title: 'Kieliopin perusteet',
    description: 'Opiskele suomen kielen perusrakenteita',
    steps: [
      { id: 'g1', title: 'Kieliopin johdanto', content: 'Keskity verbien taivutukseen ja sijamuotoihin.' },
      { id: 'g2', title: 'Sovella sääntöjä', content: 'Tee harjoituksia, joissa erotat subjektin ja objektin.' },
      { id: 'g3', title: 'Kertaus', content: 'Kertaa tärkeimmät asiat ja seuraa edistymistäsi.' },
    ],
  },
  vocabulary: {
    id: 'vocab_fallback',
    type: 'vocabulary',
    title: 'Sanaston kartuttaminen',
    description: 'Opettele ja harjoittele yleisiä sanoja',
    steps: [
      { id: 'v1', title: 'Opettele sanoja', content: 'Opi 10 uutta hyödyllistä sanaa.' },
      { id: 'v2', title: 'Harjoittele käyttöä', content: 'Käytä uusia sanoja lauseissa ääneen.' },
      { id: 'v3', title: 'Kertaus', content: 'Testaa itseäsi korteilla.' },
    ],
  },
  listening: {
    id: 'listening_fallback',
    type: 'listening',
    title: 'Kuullun ymmärtäminen',
    description: 'Harjoittele puhutun suomen ymmärtämistä',
    steps: [
      {
        id: 'l1',
        title: 'Kuuntele',
        content: 'Kuuntele suomenkielinen dialogi huolellisesti.',
        transcript: 'Hei! Tervetuloa. Olen täällä auttamassa sinua.',
      },
      {
        id: 'l2',
        title: 'Vastaa kysymyksiin',
        content: 'Vastaa kuulemaasi liittyviin kysymyksiin.',
        questions: [
          { id: 'q1', question: 'Kuka puhuu?', options: ['Mikko', 'Anni', 'Laura'], correct: 0 },
          { id: 'q2', question: 'Mistä puhutaan?', options: ['Veneestä', 'Huoneesta', 'Tapahtumasta'], correct: 1 },
        ],
      },
      {
        id: 'l3',
        title: 'Kertaus',
        content: 'Lue litterointi ja poimi uudet sanat.',
        vocabulary: ['tervetuloa', 'auttaa', 'huone'],
      },
    ],
  },
  speaking: {
    id: 'speaking_fallback',
    type: 'speaking',
    title: 'Puhumisharjoitus',
    description: 'Harjoittele suomen perusfraaseja puhumalla',
    steps: [
      {
        id: 's1',
        title: 'Lämmittely',
        content: 'Harjoittele tervehdyksiä ja esittäytymistä.',
        tips: ['Äännä vokaalit selkeästi', 'Käytä lyhyitä lauseita'],
      },
      {
        id: 's2',
        title: 'Nauhoita',
        content: 'Nauhoita lyhyt vastaus päivästäsi.',
        prompts: ['Kerrotko mitä teit tänään?', 'Mikä on suosikkiruokasi?'],
        requires_recording: true,
      },
      {
        id: 's3',
        title: 'Sanasto',
        content: 'Kertaa päivän avainfraasit.',
        vocabulary: ['minä olen', 'tykkään', 'tänään'],
      },
    ],
  },
  reading: {
    id: 'reading_fallback',
    type: 'reading',
    title: 'Luetun ymmärtäminen',
    description: 'Harjoittele suomenkielisten tekstien lukemista',
    steps: [
      { id: 'r1', title: 'Lue teksti', content: 'Lue teksti ja keskity pääajatuksiin.' },
      { id: 'r2', title: 'Vastaa kysymyksiin', content: 'Vastaa kysymyksiin lukemastasi.' },
      { id: 'r3', title: 'Kertaus', content: 'Kerro mitä opit tekstistä.' },
    ],
  },
  writing: {
    id: 'writing_fallback',
    type: 'writing',
    title: 'Kirjoitusharjoitus',
    description: 'Kirjoita lyhyitä tekstejä suomeksi',
    steps: [
      {
        id: 'w1',
        title: 'Vinkit',
        content: 'Kiinnitä huomiota lauserakenteeseen ja verbimuotoihin.',
        tips: ['Puhu minusta -muodossa', 'Yhdistä lauseet konjunktiolla'],
      },
      {
        id: 'w2',
        title: 'Kirjoita',
        content: 'Kirjoita pieni postausteksti omasta päivästäsi.',
        prompt: 'Kuvaile aamurutiinisi, lempiruoat ja mitä teet viikonloppuna.',
        requires_writing: true,
        word_limit: 60,
      },
      {
        id: 'w3',
        title: 'Kertaus',
        content: 'Tarkista kirjoituksesi ja hahmottele parannuksia.',
        vocabulary: ['kirjoittaa', 'kertoa', 'viikonloppu'],
      },
    ],
  },
};

const SECTION_FALLBACK_COPY = {
  introduction: 'Aloitetaan säännöistä ja perusasioista, joita tarvitset tämän oppitunnin ymmärtämiseen.',
  practice: 'Harjoittele sääntöä ohjatuilla tehtävillä, puhu ääneen ja tunnista toistuvat rakenteet.',
  review: 'Kertaa opittu, kirjaa tärkeimmät havainnot ja valmistele kysymykset seuraavaa kertaa varten.',
};

const cloneDeep = (target) => JSON.parse(JSON.stringify(target));

function getFallbackLesson(type, level, path) {
  const template = FALLBACK_LESSONS[type] || FALLBACK_LESSONS.grammar;
  const cloned = cloneDeep(template);
  return {
    ...cloned,
    id: `${type}_fallback_${level}`,
    level,
    path,
  };
}

/**
 * LessonDetailScreen - Using all designs + 11th picture
 * Combines: Quiz design (4th), Conversation (5th), Flight booking (6th), Schedule (3rd), Card grid (2nd)
 */
export default function LessonDetailScreen({ route, navigation } = {}) {
  const { trackScreen, trackLesson, trackMistake } = useAnalytics();
  
  // Track screen view
  useEffect(() => {
    const { type, level, title } = route?.params || {};
    trackScreen('LessonDetailScreen', { type, level, title });
  }, [trackScreen, route?.params]);
  const { user } = useAuth();
  if (!user) {
    return (
      <View style={styles.authGuard}>
        <Text style={styles.authGuardText}>Kirjaudu sisään jatkaaksesi.</Text>
      </View>
    );
  }
  const { lessonId, type = 'grammar', level = 'A1', path = 'general', field: routeField, professionId } = route?.params || {};
  const field = routeField || professionId || null;
  // For workplace we preserve module ids like "practice" and "review" to keep flows distinct.
  const canonicalType = path === 'workplace' ? type : (LESSON_NORMALIZATION[type] || type);
  const { speak } = useVoice();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [writingText, setWritingText] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [exerciseState, setExerciseState] = useState({});
  const [exerciseResults, setExerciseResults] = useState({});
  const scrollViewRef = useRef(null);
  const sectionRefs = {
    introduction: useRef(null),
    practice: useRef(null),
    review: useRef(null),
  };
  const sectionPositions = useRef({ introduction: 0, practice: 0, review: 0 });
  const stepsLayoutRef = useRef({ sectionTop: 0, positions: {} });
  const [activeSection, setActiveSection] = useState('introduction');
  const lessonIdentifier = useMemo(
    () => lesson?.id || lessonId || `${canonicalType}_${level}`,
    [lesson?.id, lessonId, canonicalType, level]
  );
  const [weaknesses, setWeaknesses] = useState({});
  const weaknessesCount = useMemo(() => Object.values(weaknesses).reduce((sum, value) => sum + (value > 0 ? 1 : 0), 0), [weaknesses]);

  const updateExerciseState = useCallback((exerciseId, updates) => {
    setExerciseState((prev) => ({
      ...prev,
      [exerciseId]: { ...prev[exerciseId], ...updates },
    }));
  }, []);

  const handleExerciseSubmit = useCallback(
    async (exercise, overrideValue = null, overrideOption = null) => {
      if (!exercise) return;
      const state = exerciseState[exercise.id] || {};
      const response =
        exercise.type === 'multiple-choice'
          ? overrideOption ?? state.selectedOption
          : (overrideValue ?? state.response ?? '').trim();
      let isCorrect = false;
      if (exercise.type === 'multiple-choice') {
        isCorrect = response === exercise.answerIndex;
      } else if (exercise.answer) {
        isCorrect = response.toLowerCase() === (exercise.answer || '').toLowerCase();
      }
      setExerciseResults((prev) => ({
        ...prev,
        [exercise.id]: { response, correct: !!isCorrect },
      }));
      const metrics = {
        lessonId: lessonIdentifier,
        exerciseId: exercise.id,
        topic: exercise.grammar?.topic || 'grammar_practice',
        correct: isCorrect ? 1 : 0,
        response,
      };
      if (!isCorrect) {
        const expectedLabel =
          exercise.type === 'multiple-choice'
            ? exercise.options?.[exercise.answerIndex]
            : exercise.answer;
        trackMistake('grammar_exercise', {
          lessonId: lessonIdentifier,
          exerciseId: exercise.id,
          expected: expectedLabel,
          response,
        });
        const topic = exercise.grammar?.topic || 'grammar_practice';
        setWeaknesses((prev) => ({
          ...prev,
          [topic]: (prev[topic] || 0) + 1,
        }));
      }
    },
    [exerciseState, lessonIdentifier, trackMistake]
  );

  const handleMultipleChoiceSelect = useCallback(
    (exercise, optionIdx) => {
      updateExerciseState(exercise.id, { selectedOption: optionIdx });
      handleExerciseSubmit(exercise, null, optionIdx);
    },
    [handleExerciseSubmit, updateExerciseState]
  );

  const findStepBySection = (sectionKey) => {
    if (!lesson?.steps?.length) return null;
    return lesson.steps.find((step) => step.section === sectionKey) || null;
  };

  const findStepIndexByPattern = (pattern) => {
    if (!lesson?.steps?.length) return -1;
    const regex = typeof pattern === 'string' ? new RegExp(pattern, 'i') : pattern;
    return lesson.steps.findIndex(({ title, content }) => {
      const combined = `${title || ''} ${content || ''}`;
      return regex.test(combined);
    });
  };

  const handleIntroduction = () => {
    const step = findStepBySection('introduction');
    if (step) {
      const idx = lesson.steps.indexOf(step);
      setCurrentStep(idx);
    }
    scrollToSection('introduction');
  };
  const handlePracticeAction = () => {
    const step = findStepBySection('practice');
    if (step) {
      const idx = lesson.steps.indexOf(step);
      setCurrentStep(idx);
    }
    scrollToSection('practice');
  };
  const handleReviewAction = () => {
    const step = findStepBySection('review');
    if (step) {
      const idx = lesson.steps.indexOf(step);
      setCurrentStep(idx);
    }
    scrollToSection('review');
  };

  const scrollToSection = (key) => {
    const storedTop = sectionPositions.current[key];
    const offset = storedTop != null ? storedTop - 84 : null;
    if (typeof offset === 'number') {
      scrollViewRef.current?.scrollTo({ y: offset, animated: true });
      setActiveSection(key);
      return;
    }

    const ref = sectionRefs[key];
    const scrollViewNode = findNodeHandle(scrollViewRef.current);
    const sectionNode = ref?.current ? findNodeHandle(ref.current) : null;
    if (scrollViewNode && sectionNode && UIManager.measureLayout) {
      UIManager.measureLayout(
        sectionNode,
        scrollViewNode,
        () => {},
        (x, y) => {
          scrollViewRef.current?.scrollTo({ y: y - 84, animated: true });
          handleSectionLayout(key, y);
        }
      );
    }
    setActiveSection(key);
  };

  const handleSectionLayout = (key, y) => {
    sectionPositions.current[key] = y;
  };

  const handleScroll = (event) => {
    const y = event.nativeEvent.contentOffset.y;
    const entries = Object.entries(sectionPositions.current);
    let nextActive = activeSection;
    entries.forEach(([key, top]) => {
      if (y + 120 >= top) {
        nextActive = key;
      }
    });
    if (nextActive !== activeSection) {
      setActiveSection(nextActive);
    }
  };

  const introductionStep = findStepBySection('introduction') || lesson?.steps?.[0] || null;
  const practiceStep = findStepBySection('practice') || lesson?.steps?.[1] || null;
  const reviewStep =
    findStepBySection('review') || lesson?.steps?.[lesson?.steps?.length - 1] || null;

  useEffect(() => {
    const loadLesson = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('[LessonDetailScreen] Loading lesson...', { requestedType: type, canonicalType, level, path });
        const response =
          path === 'workplace'
            ? await fetchWorkplaceLesson(field || 'workplace', level, (type || canonicalType))
            : await fetchLesson(canonicalType, level, path);
        console.log('[LessonDetailScreen] Lesson loaded:', response?.lesson?.id);
        if (response?.lesson) {
          setLesson(response.lesson);
        } else {
          throw new Error('No lesson data received');
        }
      } catch (err) {
        console.error('[LessonDetailScreen] Failed to load lesson:', err);
        setError(err.message || 'Failed to load lesson. Please try again.');
        setLesson(getFallbackLesson(canonicalType, level, path));
      } finally {
        setLoading(false);
      }
    };
    loadLesson();
  }, [lessonId, canonicalType, level, path, type, field]);

  useEffect(() => {
    setExerciseState({});
    setExerciseResults({});
  }, [lesson?.id]);

  // Reset writing text when step changes
  useEffect(() => {
    if (lesson?.type === 'writing') {
      setWritingText('');
      setWordCount(0);
    }
  }, [currentStep, lesson?.type]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1E3A8A" style={styles.loader} />
        <Text style={styles.loadingText}>Ladataan oppituntia…</Text>
      </View>
    );
  }

  if (error && !lesson) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => navigation?.goBack?.()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Takaisin</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Combine all designs: Quiz header (4th), Conversation gradient (5th), Flight cards (6th), Schedule (3rd), Card grid (2nd)
  return (
    <Background module="workplace" variant="blue" solidContentZone>
      <View style={styles.container}>
      {/* Header Bar - From 4th picture (Quiz design) */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()} style={styles.headerLeft}>
          <Text style={styles.headerIcon}>←</Text>
          <Text style={styles.headerText}>Oppitunti</Text>
        </TouchableOpacity>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${((currentStep + 1) / (lesson?.steps?.length || 3)) * 100}%` }]} />
        </View>
        <TouchableOpacity style={styles.headerRight}>
          <Text style={styles.headerIcon}>⚡</Text>
        </TouchableOpacity>
      </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          scrollEventThrottle={16}
          onScroll={handleScroll}
        >
        {/* Lesson Card - From 4th picture (Question card style) */}
        {lesson && (
        <RukaCard style={styles.lessonCard}>
          <Text style={styles.lessonNumber}>
            Oppitunti <Text style={styles.lessonNumberHighlight}>{String(currentStep + 1).padStart(2, '0')}</Text>
            </Text>
            <Text style={styles.lessonCategory}>{lesson.title}</Text>
            <Text style={styles.lessonText}>
              {lesson.steps?.[currentStep]?.content || lesson.description}
            </Text>
            <View style={styles.topActions}>
              {[{ label: 'Introduction', labelFi: 'Johdanto', desc: 'Learn grammar rules', descFi: 'Opiskele sääntöjä', onPress: handleIntroduction },
                { label: 'Practice', labelFi: 'Harjoittelu', desc: 'Practice exercises', descFi: 'Tee harjoituksia', onPress: handlePracticeAction },
                { label: 'Review', labelFi: 'Kertaus', desc: 'Review what you learned', descFi: 'Kertaa opittu', onPress: handleReviewAction }].map((item) => {
                const key = item.label.toLowerCase();
                return (
                  <TouchableOpacity
                    key={item.label}
                    style={[
                      styles.topActionButton,
                      activeSection === key && styles.topActionButtonActive,
                    ]}
                    onPress={item.onPress}
                  >
                    <Text style={styles.topActionLabel}>{item.labelFi || item.label}</Text>
                    <Text style={styles.topActionSubLabel}>{item.descFi || item.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {introductionStep && (
              <View
                ref={sectionRefs.introduction}
                onLayout={(event) => handleSectionLayout('introduction', event.nativeEvent.layout.y)}
                style={[
                  styles.sectionPanel,
                  activeSection === 'introduction' && styles.sectionActive,
                ]}
              >
                <Text style={styles.sectionHeading}>Introduction</Text>
                <Text style={styles.sectionSubtitle}>{introductionStep.title}</Text>
                <Text style={styles.sectionContent}>{introductionStep.content}</Text>
                {introductionStep.ruleHighlights?.length > 0 && (
                  <View style={styles.ruleList}>
                    {introductionStep.ruleHighlights.map((rule, idx) => (
                      <View key={idx} style={styles.ruleItem}>
                        <Text style={styles.ruleBullet}>•</Text>
                        <Text style={styles.ruleText}>{rule}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {introductionStep.examples?.length > 0 && (
                  <View style={styles.examplesContainer}>
                    <Text style={styles.examplesLabel}>Examples</Text>
                    {introductionStep.examples.map((example, idx) => (
                      <View key={idx} style={styles.exampleItem}>
                        <Text style={styles.exampleText}>{example}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {introductionStep.audioHint?.url && (
                  <TouchableOpacity
                    style={styles.playAudioButton}
                    onPress={() => speak?.(introductionStep.audioHint?.transcript, 'grammar_intro')}
                  >
                    <Text style={styles.playAudioText}>▶ Listen to rule</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            {practiceStep && (
              <View
                ref={sectionRefs.practice}
                onLayout={(event) => handleSectionLayout('practice', event.nativeEvent.layout.y)}
                style={[
                  styles.sectionPanel,
                  activeSection === 'practice' && styles.sectionActive,
                ]}
              >
                <Text style={styles.sectionHeading}>Harjoittelu</Text>
                <Text style={styles.sectionSubtitle}>{practiceStep.title}</Text>
                <Text style={styles.sectionContent}>{practiceStep.content}</Text>
                {practiceStep.exercises?.map((exercise) => (
                  <View key={exercise.id} style={styles.exerciseItem}>
                    <Text style={styles.exerciseLabel}>{exercise.prompt}</Text>
                    {['fill-in', 'case'].includes(exercise.type) && (
                      <>
                        <TextInput
                          style={styles.exerciseInput}
                          placeholder="Kirjoita vastauksesi"
                          placeholderTextColor="rgba(255,255,255,0.4)"
                          value={exerciseState[exercise.id]?.response || ''}
                          onChangeText={(value) => updateExerciseState(exercise.id, { response: value })}
                        />
                        <TouchableOpacity
                          style={styles.exerciseButton}
                          onPress={() =>
                            handleExerciseSubmit(exercise, exerciseState[exercise.id]?.response)
                          }
                        >
                          <Text style={styles.exerciseButtonText}>Tarkista</Text>
                        </TouchableOpacity>
                        {exercise.hint && (
                          <Text style={styles.exerciseHint}>Vihje: {exercise.hint}</Text>
                        )}
                      </>
                    )}
                    {exercise.type === 'multiple-choice' && exercise.options && (
                      <View style={styles.optionGrid}>
                        {exercise.options.map((option, idx) => (
                          <TouchableOpacity
                            key={idx}
                            style={[
                              styles.exerciseChoice,
                              exerciseState[exercise.id]?.selectedOption === idx &&
                                styles.exerciseChoiceSelected,
                            ]}
                            onPress={() => handleMultipleChoiceSelect(exercise, idx)}
                          >
                            <Text style={styles.exerciseChoiceText}>{option}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                    {exercise.type === 'rewrite' && exercise.answer && (
                      <View style={styles.reviewDetail}>
                        <Text style={styles.exerciseHint}>Model: {exercise.answer}</Text>
                        <Text style={styles.exerciseHint}>
                          Rewrite it keeping connectors and cases tidy.
                        </Text>
                      </View>
                    )}
                    {exerciseResults[exercise.id] && (
                      <Text
                        style={[
                          styles.exerciseHint,
                          exerciseResults[exercise.id].correct
                            ? styles.correctText
                            : styles.incorrectText,
                        ]}
                      >
                        {exerciseResults[exercise.id].message ||
                          (exerciseResults[exercise.id].correct
                            ? 'Nice! You understand the rule.'
                            : 'Keep trying — review the fix pack.')}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}
            {reviewStep && (
              <View
                ref={sectionRefs.review}
                onLayout={(event) => handleSectionLayout('review', event.nativeEvent.layout.y)}
                style={[
                  styles.sectionPanel,
                  activeSection === 'review' && styles.sectionActive,
                ]}
              >
                <Text style={styles.sectionHeading}>Review</Text>
                <Text style={styles.sectionSubtitle}>{reviewStep.title}</Text>
                <Text style={styles.sectionContent}>{reviewStep.content}</Text>
                {reviewStep.keyPoints?.length > 0 && (
                  <View style={styles.ruleList}>
                    {reviewStep.keyPoints.map((point, idx) => (
                      <View key={idx} style={styles.ruleItem}>
                        <Text style={styles.ruleBullet}>•</Text>
                        <Text style={styles.ruleText}>{point}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {reviewStep.fixPack?.length > 0 && (
                  <View style={styles.fixPackContainer}>
                    <Text style={styles.fixPackLabel}>Fix Pack</Text>
                    {reviewStep.fixPack.map((fix, idx) => (
                      <View key={idx} style={styles.fixPackItem}>
                        <Text style={styles.fixPackText}>{fix}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {weaknessesCount > 0 && (
                  <View style={styles.fixSummaryContainer}>
                    <Text style={styles.fixSummaryLabel}>Fix pack ready</Text>
                    <Text style={styles.fixSummaryText}>
                      {weaknessesCount} focus point{weaknessesCount === 1 ? '' : 's'} need reinforcement.
                    </Text>
                  </View>
                )}
                {Object.keys(weaknesses).length > 0 && (
                  <View style={styles.weaknessContainer}>
                    <Text style={styles.weaknessLabel}>Focus Areas</Text>
                    {Object.entries(weaknesses).map(([topic, count]) => (
                      <View key={topic} style={styles.weaknessRow}>
                        <Text style={styles.weaknessText}>{topic.replace('_', ' ')}</Text>
                        <Text style={styles.weaknessMeta}>{count} ❌ attempts</Text>
                      </View>
                    ))}
                  </View>
                )}
                {reviewStep.reviewPrompt && (
                  <View style={styles.promptContainer}>
                    <Text style={styles.promptLabel}>Prompt</Text>
                    <Text style={styles.promptText}>{reviewStep.reviewPrompt}</Text>
                  </View>
                )}
              </View>
            )}
            
            {/* Listening lesson specific content */}
            {lesson.type === 'listening' && lesson.steps?.[currentStep]?.transcript && (
              <View style={styles.transcriptContainer}>
                <Text style={styles.transcriptLabel}>Transcript:</Text>
                <Text style={styles.transcriptText}>{lesson.steps[currentStep].transcript}</Text>
                {lesson.steps?.[currentStep]?.audio_text && (
                  <TouchableOpacity
                    onPress={() => speak?.(lesson.steps[currentStep].audio_text, 'lesson_listening')}
                    style={styles.playAudioButton}
                  >
                    <Text style={styles.playAudioText}>▶ Play audio</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            {lesson.type === 'listening' && lesson.steps?.[currentStep]?.questions && (
              <View style={styles.questionsContainer}>
                <Text style={styles.questionsLabel}>Questions:</Text>
                {lesson.steps[currentStep].questions.map((q, idx) => (
                  <View key={q.id || idx} style={styles.questionItem}>
                    <Text style={styles.questionText}>{q.question}</Text>
                    {q.options && q.options.map((opt, optIdx) => (
                      <TouchableOpacity key={optIdx} style={styles.optionButton}>
                        <Text style={styles.optionText}>{opt}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
              </View>
            )}
            
            {/* Speaking lesson specific content */}
            {lesson.type === 'speaking' && lesson.steps?.[currentStep]?.tips && (
              <View style={styles.tipsContainer}>
                <Text style={styles.tipsLabel}>Tips:</Text>
                {lesson.steps[currentStep].tips.map((tip, idx) => (
                  <View key={idx} style={styles.tipItem}>
                    <Text style={styles.tipBullet}>•</Text>
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}
            {lesson.type === 'speaking' && lesson.steps?.[currentStep]?.prompts && (
              <View style={styles.promptsContainer}>
                <Text style={styles.promptsLabel}>Practice Phrases:</Text>
                {lesson.steps[currentStep].prompts.map((prompt, idx) => (
                  <View key={idx} style={styles.promptItem}>
                    <Text style={styles.promptText}>{prompt}</Text>
                  </View>
                ))}
              </View>
            )}
            {lesson.type === 'speaking' && lesson.steps?.[currentStep]?.requires_recording && (
              <View style={styles.recordingContainer}>
                <Text style={styles.recordingLabel}>Record Your Speech:</Text>
                <MicRecorder 
                  onTranscript={(transcript) => {
                    console.log('[LessonDetailScreen] Speaking transcript:', transcript);
                    // Could store transcript for review step
                  }}
                  minSeconds={lesson.steps?.[currentStep]?.min_seconds || 0}
                />
              </View>
            )}
            {lesson.type === 'speaking' && lesson.steps?.[currentStep]?.vocabulary && (
              <View style={styles.vocabContainer}>
                <Text style={styles.vocabLabel}>Key Vocabulary:</Text>
                <View style={styles.vocabList}>
                  {lesson.steps[currentStep].vocabulary.map((word, idx) => (
                    <View key={idx} style={styles.vocabItem}>
                      <Text style={styles.vocabText}>{word}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            {/* Writing lesson specific content */}
            {lesson.type === 'writing' && lesson.steps?.[currentStep]?.tips && (
              <View style={styles.tipsContainer}>
                <Text style={styles.tipsLabel}>Writing Tips:</Text>
                {lesson.steps[currentStep].tips.map((tip, idx) => (
                  <View key={idx} style={styles.tipItem}>
                    <Text style={styles.tipBullet}>•</Text>
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}
            {lesson.type === 'writing' && lesson.steps?.[currentStep]?.examples && (
              <View style={styles.examplesContainer}>
                <Text style={styles.examplesLabel}>Examples:</Text>
                {lesson.steps[currentStep].examples.map((example, idx) => (
                  <View key={idx} style={styles.exampleItem}>
                    <Text style={styles.exampleText}>{example}</Text>
                  </View>
                ))}
              </View>
            )}
            {lesson.type === 'writing' && lesson.steps?.[currentStep]?.prompt && (
              <View style={styles.promptContainer}>
                <Text style={styles.promptLabel}>Writing Prompt:</Text>
                <Text style={styles.promptText}>{lesson.steps[currentStep].prompt}</Text>
                {lesson.steps[currentStep].word_limit && (
                  <Text style={styles.wordLimitText}>
                    Target: {lesson.steps[currentStep].word_limit} words
                  </Text>
                )}
              </View>
            )}
            {lesson.type === 'writing' && lesson.steps?.[currentStep]?.requires_writing && (
              <View style={styles.writingContainer}>
                <Text style={styles.writingLabel}>Your Writing:</Text>
                <TextInput
                  style={styles.writingInput}
                  multiline
                  numberOfLines={8}
                  placeholder="Kirjoita tähän suomeksi..."
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={writingText}
                  onChangeText={(text) => {
                    setWritingText(text);
                    const words = text.trim().split(/\s+/).filter(Boolean);
                    setWordCount(words.length);
                  }}
                  textAlignVertical="top"
                />
                <View style={styles.wordCountContainer}>
                  <Text style={styles.wordCountText}>
                    {wordCount} {wordCount === 1 ? 'sana' : 'sanaa'}
                    {lesson.steps[currentStep]?.word_limit && 
                      ` / ${lesson.steps[currentStep].word_limit} tavoite`}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={[styles.submitButton, !writingText.trim() && styles.submitButtonDisabled]}
                  disabled={!writingText.trim()}
                  onPress={() => {
                    console.log('[LessonDetailScreen] Writing submitted:', writingText);
                    // Could send to backend for evaluation
                    alert('Teksti lähetetty.');
                  }}
                >
                  <Text style={styles.submitButtonText}>Lähetä teksti</Text>
                </TouchableOpacity>
              </View>
            )}
            {lesson.type === 'writing' && lesson.steps?.[currentStep]?.vocabulary && (
              <View style={styles.vocabContainer}>
                <Text style={styles.vocabLabel}>Keskeinen sanasto:</Text>
                <View style={styles.vocabList}>
                  {lesson.steps[currentStep].vocabulary.map((word, idx) => (
                    <View key={idx} style={styles.vocabItem}>
                      <Text style={styles.vocabText}>{word}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          {lesson.type === 'writing' && lesson.steps?.[currentStep]?.grammar_points && (
            <View style={styles.grammarContainer}>
              <Text style={styles.grammarLabel}>Kielioppikohdat:</Text>
              {lesson.steps[currentStep].grammar_points.map((point, idx) => (
                <View key={idx} style={styles.grammarItem}>
                  <Text style={styles.grammarBullet}>•</Text>
                  <Text style={styles.grammarText}>{point}</Text>
                </View>
              ))}
            </View>
          )}
        </RukaCard>
        )}

        {/* Scenario Insight */}
        {lesson && (
          <View style={styles.insightSection}>
            <Text style={styles.insightLabel}>Scenario</Text>
            <Text style={styles.insightTitle}>{lesson.scenario_title || lesson.title}</Text>
            <Text style={styles.insightPrompt}>{lesson.scenario_prompt || lesson.description}</Text>
            {(lesson.scenario_key_phrases?.length || lesson.vocabulary?.length) > 0 && (
              <View style={styles.phraseRow}>
                {(lesson.scenario_key_phrases || lesson.vocabulary || []).slice(0, 8).map((phrase, idx) => (
                  <View key={idx} style={styles.phraseChip}>
                    <Text style={styles.phraseText}>{phrase}</Text>
                  </View>
                ))}
              </View>
            )}
            {lesson.scenario_grammar_tip && (
              <View style={styles.tipWrapper}>
                <Text style={styles.tipTitle}>Grammar Focus</Text>
                <Text style={styles.tipBody}>{lesson.scenario_grammar_tip}</Text>
              </View>
            )}
            {lesson.scenario_writing_task && (
              <View style={styles.tipWrapper}>
                <Text style={styles.tipTitle}>Writing Task</Text>
                <Text style={styles.tipBody}>{lesson.scenario_writing_task}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.jumpSection}>
          <Text style={styles.sectionTitle}>Jump To</Text>
          <View style={styles.jumpRow}>
            {[
              { label: 'Introduction', onPress: handleIntroduction },
              { label: 'Practice', onPress: handlePracticeAction },
              { label: 'Review', onPress: handleReviewAction },
            ].map((item) => (
              <TouchableOpacity
                key={item.label}
                style={[
                  styles.jumpButton,
                  activeSection === item.label.toLowerCase() && styles.jumpButtonActive,
                ]}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                onPress={item.onPress}
              >
                <Text style={styles.jumpLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.jumpTextRow}>
            {[
              { label: 'Introduction', onPress: handleIntroduction },
              { label: 'Practice', onPress: handlePracticeAction },
              { label: 'Review', onPress: handleReviewAction },
            ].map((item) => (
              <TouchableOpacity
                key={`${item.label}-text`}
                style={[
                  styles.jumpTextItem,
                  activeSection === item.label.toLowerCase() && styles.jumpTextItemActive,
                ]}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <Text style={styles.jumpText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.sectionDetails}>
          <View
            ref={sectionRefs.introduction}
            onLayout={(event) => handleSectionLayout('introduction', event.nativeEvent.layout.y)}
            style={[
              styles.sectionPanel,
              activeSection === 'introduction' && styles.sectionPanelActive,
            ]}
          >
            <Text style={styles.sectionPanelHeader}>Introduction</Text>
            <Text style={styles.sectionPanelContent}>
              {introductionStep?.content || SECTION_FALLBACK_COPY.introduction}
            </Text>
            {(introductionStep?.tips || introductionStep?.prompts)?.length > 0 && (
              <View style={styles.sectionPanelList}>
                {(introductionStep?.tips || introductionStep?.prompts || []).map((item, idx) => (
                  <View key={`intro-${idx}`} style={styles.sectionPanelItem}>
                    <Text style={styles.sectionPanelBullet}>•</Text>
                    <Text style={styles.sectionPanelText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
          <View
            ref={sectionRefs.practice}
            onLayout={(event) => handleSectionLayout('practice', event.nativeEvent.layout.y)}
            style={[
              styles.sectionPanel,
              activeSection === 'practice' && styles.sectionPanelActive,
            ]}
          >
            <Text style={styles.sectionPanelHeader}>Practice</Text>
            <Text style={styles.sectionPanelContent}>
              {practiceStep?.content || SECTION_FALLBACK_COPY.practice}
            </Text>
            {practiceStep?.prompts && (
              <View style={styles.sectionPanelList}>
                {practiceStep.prompts.map((prompt, idx) => (
                  <View key={`practice-${idx}`} style={styles.sectionPanelItem}>
                    <Text style={styles.sectionPanelBullet}>»</Text>
                    <Text style={styles.sectionPanelText}>{prompt}</Text>
                  </View>
                ))}
              </View>
            )}
            {practiceStep?.requires_recording && (
              <Text style={styles.sectionPanelSubtext}>Record your response for review.</Text>
            )}
          </View>
          <View
            ref={sectionRefs.review}
            onLayout={(event) => handleSectionLayout('review', event.nativeEvent.layout.y)}
            style={[
              styles.sectionPanel,
              activeSection === 'review' && styles.sectionPanelActive,
            ]}
          >
            <Text style={styles.sectionPanelHeader}>Review</Text>
            <Text style={styles.sectionPanelContent}>
              {reviewStep?.content || SECTION_FALLBACK_COPY.review}
            </Text>
            {reviewStep?.tips && (
              <View style={styles.sectionPanelList}>
                {reviewStep.tips.map((tip, idx) => (
                  <View key={`review-${idx}`} style={styles.sectionPanelItem}>
                    <Text style={styles.sectionPanelBullet}>–</Text>
                    <Text style={styles.sectionPanelText}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Lesson Steps - Flight Booking Cards from 6th picture */}
        {lesson?.steps && (
          <View
            style={styles.stepsSection}
            onLayout={(event) => {
              stepsLayoutRef.current.sectionTop = event.nativeEvent.layout.y;
            }}
          >
            <Text style={styles.sectionTitle}>Oppitunnin vaiheet</Text>
            {lesson.steps.map((step, index) => (
              <TouchableOpacity
                key={step.id}
                style={[
                  styles.stepCard,
                  index === currentStep && styles.stepCardActive,
                ]}
                onPress={() => setCurrentStep(index)}
                onLayout={(event) => {
                  stepsLayoutRef.current.positions[index] = event.nativeEvent.layout.y;
                }}
              >
                <View style={styles.stepCardLeft}>
                  <Text style={styles.stepCardTitle}>{step.title}</Text>
                  <Text style={styles.stepCardDescription}>{step.content}</Text>
                </View>
                <View style={styles.stepCardRight}>
                  {index < currentStep && <Text style={styles.stepStatusIcon}>✓</Text>}
                  {index === currentStep && <Text style={styles.stepStatusIconActive}>●</Text>}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Quick Actions - Card Grid from 2nd picture */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Pikatoiminnot</Text>
          <View style={styles.actionsGrid}>
            {['Practice', 'Review', 'Quiz', 'Notes'].map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionCard}
                onPress={() => {
                  const steps = lesson?.steps || [];
                  if (action === 'Practice') {
                    // For listening, navigate to conversation practice
                    if (canonicalType === 'listening') {
                      navigation?.navigate('Conversation', {
                        path,
                        field: route?.params?.field || route?.params?.professionId || null,
                        level,
                        type: 'listening',
                        mode: 'practice',
                      });
                      return;
                    }
                    // For speaking, navigate to conversation practice
                    if (canonicalType === 'speaking') {
                      navigation?.navigate('Conversation', {
                        path,
                        field: route?.params?.field || route?.params?.professionId || null,
                        level,
                        type: 'speaking',
                        mode: 'practice',
                      });
                      return;
                    }
                    // For other types, find practice step
                    const idx =
                      steps.findIndex((s) => /practice|record|exercise/i.test(s?.title || '')) ??
                      -1;
                    setCurrentStep(idx >= 0 ? idx : Math.min(1, Math.max(0, steps.length - 1)));
                    scrollToSection('practice');
                    return;
                  }
                  if (action === 'Review') {
                    // For listening, navigate to conversation review
                    if (canonicalType === 'listening') {
                      navigation?.navigate('Conversation', {
                        path,
                        field: route?.params?.field || route?.params?.professionId || null,
                        level,
                        type: 'listening',
                        mode: 'review',
                      });
                      return;
                    }
                    // For other types, find review step
                    const idx = steps.findIndex((s) => /review/i.test(s?.title || ''));
                    setCurrentStep(idx >= 0 ? idx : Math.max(0, steps.length - 1));
                    scrollToSection('review');
                    return;
                  }
                  if (action === 'Quiz') {
                    // Temporary: use vocab units for the *current* path (and profession field if present),
                    // so quizzes are no longer incorrectly tied to general vocabulary.
                    navigation?.navigate('Quiz', {
                      path,
                      field: route?.params?.field || route?.params?.professionId || null,
                      sourceType: canonicalType,
                      level,
                      lessonId: lesson?.id || lessonId || null,
                      type: canonicalType,
                    });
                    return;
                  }
                  if (action === 'Notes') {
                    navigation?.navigate('Notes', {
                      path,
                      field: route?.params?.field || route?.params?.professionId || null,
                      sourceType: canonicalType,
                      level,
                      lessonId: lesson?.id || lessonId || null,
                      title: lesson?.title || route?.params?.title || null,
                    });
                  }
                }}
              >
                <Text style={styles.actionIcon}>{['💪', '📖', '📝', '📝'][index]}</Text>
                <Text style={styles.actionLabel}>
                  {{
                    Practice: 'Harjoittele',
                    Review: 'Kertaa',
                    Quiz: 'Koe',
                    Notes: 'Muistiinpanot',
                  }[action] || action}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  authGuard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 24,
  },
  authGuardText: {
    color: '#e2e8f0',
    fontSize: 16,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loader: {
    marginTop: 100,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  headerIcon: {
    fontSize: 16,
    color: palette.textPrimary,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.textPrimary,
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  lessonCard: {
    marginBottom: 24,
  },
  lessonNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  lessonNumberHighlight: {
    color: palette.accentWarning,
  },
  lessonCategory: {
    fontSize: 14,
    color: palette.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  lessonText: {
    fontSize: 16,
    color: palette.textPrimary,
    textAlign: 'center',
    lineHeight: 24,
  },
  topActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8,
  },
  topActionButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
  },
  topActionButtonActive: {
    borderColor: '#FF6B35',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  topActionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  topActionSubLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  stepsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.textPrimary,
    marginBottom: 16,
  },
  sectionDetails: {
    marginBottom: 24,
    gap: 12,
  },
  sectionPanel: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  sectionPanelActive: {
    borderColor: '#FF6B35',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  sectionPanelHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sectionPanelContent: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
    lineHeight: 20,
  },
  sectionPanelList: {
    gap: 6,
  },
  sectionPanelItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sectionPanelBullet: {
    color: '#FF6B35',
    marginRight: 6,
    fontSize: 12,
    lineHeight: 20,
  },
  sectionPanelText: {
    flex: 1,
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    lineHeight: 20,
  },
  sectionPanelSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 6,
  },
  stepCard: {
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
  stepCardActive: {
    borderWidth: 2,
    borderColor: '#1E3A8A',
  },
  stepCardLeft: {
    flex: 1,
  },
  stepCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  stepCardDescription: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
  },
  stepCardRight: {
    alignItems: 'flex-end',
  },
  stepStatusIcon: {
    fontSize: 20,
    color: '#22C55E',
  },
  stepStatusIconActive: {
    fontSize: 20,
    color: '#1E3A8A',
  },
  scheduleSection: {
    marginBottom: 24,
  },
  scheduleHeader: {
    marginBottom: 16,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scheduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    minHeight: 200,
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
  practiceList: {
    flex: 1,
  },
  practiceItem: {
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
  practiceContent: {
    flex: 1,
  },
  practiceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  practiceSubtitle: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
  },
  statusIcon: {
    fontSize: 18,
    color: '#22C55E',
  },
  actionsSection: {
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    padding: 16,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  jumpSection: {
    marginBottom: 24,
  },
  jumpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  jumpButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
  },
  jumpButtonActive: {
    borderColor: '#FF6B35',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  jumpLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  jumpTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  jumpTextItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  jumpTextItemActive: {
    borderColor: '#4ECDC4',
  },
  jumpText: {
    fontSize: 13,
    color: '#FFFFFF',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
  },
  errorText: {
    color: '#FF6B35',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
    padding: 20,
  },
  backButton: {
    backgroundColor: '#1E3A8A',
    padding: 12,
    borderRadius: 8,
    margin: 20,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  transcriptContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  transcriptLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  transcriptText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  playAudioButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  playAudioText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  questionsContainer: {
    marginTop: 16,
  },
  questionsLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  questionItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  questionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  optionButton: {
    padding: 10,
    marginVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 6,
  },
  optionText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  insightSection: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  insightLabel: {
    textTransform: 'uppercase',
    fontSize: 12,
    color: palette.accentSecondary,
    marginBottom: 4,
    letterSpacing: 1,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.textPrimary,
  },
  insightPrompt: {
    fontSize: 14,
    color: palette.textSecondary,
    marginTop: 6,
    marginBottom: 12,
  },
  phraseRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  phraseChip: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
  },
  phraseText: {
    color: palette.textPrimary,
    fontSize: 12,
  },
  tipWrapper: {
    marginTop: 8,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.accentSecondary,
  },
  tipBody: {
    fontSize: 14,
    color: palette.textSecondary,
    marginTop: 2,
  },
  tipsContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  tipsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  tipBullet: {
    fontSize: 14,
    color: '#FF6B35',
    marginRight: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  promptsContainer: {
    marginTop: 16,
  },
  promptsLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  promptItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  promptText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  recordingContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(27, 78, 218, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(27, 78, 218, 0.4)',
  },
  recordingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  vocabContainer: {
    marginTop: 16,
  },
  vocabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  vocabList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  vocabItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 6,
  },
  vocabText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  examplesContainer: {
    marginTop: 16,
  },
  examplesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  exampleItem: {
    marginBottom: 8,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
  },
  exampleText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontStyle: 'italic',
  },
  promptContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(27, 78, 218, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(27, 78, 218, 0.4)',
  },
  promptLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  promptText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    marginBottom: 8,
  },
  wordLimitText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
  },
  writingContainer: {
    marginTop: 16,
  },
  writingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  writingInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    minHeight: 150,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 8,
  },
  wordCountContainer: {
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  wordCountText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  submitButton: {
    backgroundColor: 'rgba(27, 78, 218, 0.92)',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  grammarContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  grammarLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  grammarItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  grammarBullet: {
    fontSize: 14,
    color: '#FF6B35',
    marginRight: 8,
  },
  grammarText: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  sectionPanel: {
    marginTop: 18,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  sectionActive: {
    borderColor: '#4EC9C8',
    backgroundColor: 'rgba(78, 201, 200, 0.1)',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 6,
  },
  sectionContent: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  ruleList: {
    marginTop: 12,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  ruleBullet: {
    color: '#FF6B35',
    marginRight: 8,
  },
  ruleText: {
    color: '#FFFFFF',
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  exerciseItem: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(27, 32, 66, 0.7)',
    borderRadius: 8,
  },
  exerciseLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  exerciseHint: {
    marginTop: 6,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  exerciseInput: {
    marginTop: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    padding: 10,
    color: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  exerciseButton: {
    marginTop: 8,
    backgroundColor: '#4EC9C8',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  exerciseButtonText: {
    color: '#0C1F2C',
    fontWeight: '700',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  correctBadge: {
    fontSize: 12,
    color: '#4EC9C8',
    fontWeight: '700',
  },
  exerciseChoice: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  exerciseChoiceText: {
    color: '#FFFFFF',
    marginRight: 6,
  },
  exerciseChoiceSelected: {
    backgroundColor: 'rgba(78, 201, 200, 0.2)',
    borderWidth: 1,
    borderColor: '#4EC9C8',
  },
  correctText: {
    color: '#4EC9C8',
  },
  incorrectText: {
    color: '#FF6B35',
  },
  reviewDetail: {
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 6,
  },
  fixPackContainer: {
    marginTop: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    padding: 10,
  },
  fixPackLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  fixPackItem: {
    marginBottom: 6,
  },
  fixPackText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  notesContainer: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  notesLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#C9D1FF',
    marginBottom: 8,
  },
  noteEntry: {
    marginBottom: 8,
  },
  noteEntryText: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  noteEntryMeta: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
    marginTop: 2,
  },
  weaknessContainer: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  weaknessLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#C9D1FF',
    marginBottom: 6,
  },
  weaknessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  weaknessText: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  weaknessMeta: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  fixSummaryContainer: {
    marginTop: 12,
    borderRadius: 8,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  fixSummaryLabel: {
    color: '#C9D1FF',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  fixSummaryText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  drillButton: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  drillLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  drillSubLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 2,
  },
});
