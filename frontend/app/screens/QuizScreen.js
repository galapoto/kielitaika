import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Background from '../components/ui/Background';
import HomeButton from '../components/HomeButton';
import { fetchLesson } from '../utils/api';
import { designTokens } from '../styles/designTokens';
import { colors as palette } from '../styles/colors';
import PremiumEmbossedButton from '../components/PremiumEmbossedButton';

const { spacing, typography, textColor } = designTokens || {};

const buildQuestions = (lesson) => {
  const questions = [];
  (lesson?.steps || []).forEach((step) => {
    if (Array.isArray(step.questions)) {
      step.questions.forEach((q, idx) => {
        questions.push({
          id: q.id || `${step.id}-${idx}`,
          question: q.question || q.prompt || `Kysymys ${idx + 1}`,
          options: q.options || q.choices || ['A', 'B', 'C'],
          correct: typeof q.correct === 'number' ? q.correct : 0,
        });
      });
    }
    if (step?.grammar && step?.grammar?.examples) {
      questions.push({
        id: `${step.id}-gap`,
        question: `Valitse oikea sana täydentämään: ${step.grammar.examples[0]}`,
        options: step.grammar.options || ['A', 'B', 'C'],
        correct: step.grammar.correct || 0,
      });
    }
  });
  if (questions.length === 0) {
    questions.push({
      id: 'fallback-1',
      question: 'Mikä sijamuoto on usein objektilla?',
      options: ['Partitiivi', 'Inessiivi', 'Allatiivi'],
      correct: 0,
    });
    questions.push({
      id: 'fallback-2',
      question: 'Mikä aikamuoto ilmaisee mennyttä aikaa?',
      options: ['Preesens', 'Imperfekti', 'Konditionaali'],
      correct: 1,
    });
  }
  return questions;
};

const AUTO_ADVANCE_KEY = '@kieli_taika_quiz_auto_advance';

const shuffleArray = (items = []) => {
  const cloned = [...items];
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
};

export default function QuizScreen({ route, navigation } = {}) {
  const { 
    path = 'general', 
    sourceType, 
    type: routeType, 
    level = 'A1',
    field,
  } = route?.params || {};
  const type = sourceType || routeType || 'grammar';

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [baseQuestions, setBaseQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [score, setScore] = useState(null);
  const [roundsCompleted, setRoundsCompleted] = useState(0);
  const correctCountRef = useRef(0);
  const [error, setError] = useState(null);
  const [autoAdvance, setAutoAdvance] = useState(true);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(AUTO_ADVANCE_KEY)
      .then((value) => {
        if (mounted && value !== null) {
          setAutoAdvance(value === 'true');
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(AUTO_ADVANCE_KEY, autoAdvance ? 'true' : 'false').catch(() => {});
  }, [autoAdvance]);

  useEffect(() => {
    const loadQuiz = async () => {
      setLoading(true);
      try {
        console.log('[QuizScreen] Loading quiz:', { type, level, path, field });
        // Pass field/professionId if available for workplace-specific quizzes
        const response = await fetchLesson(type, level, path);
        const lesson = response?.lesson;
        console.log('[QuizScreen] Lesson loaded:', lesson?.id, 'Type:', lesson?.type);
        const lessonQuestions = Array.isArray(lesson?.quizQuestions)
          ? lesson.quizQuestions
          : buildQuestions(lesson);
        const finalQuestions =
          lessonQuestions.length > 0 ? lessonQuestions : buildQuestions(null);
        setBaseQuestions(finalQuestions);
        setQuestions(shuffleArray(finalQuestions));
      } catch (err) {
        console.error('Quiz load failed', err);
        setError(err.message || 'Failed to load quiz');
        const fallback = buildQuestions(null);
        setBaseQuestions(fallback);
        setQuestions(shuffleArray(fallback));
      } finally {
        setLoading(false);
      }
    };
    loadQuiz();
  }, [type, level, path, field]);

  useEffect(() => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setShowAnswer(false);
    setCorrectCount(0);
    setScore(null);
    correctCountRef.current = 0;
    setRoundsCompleted(0);
  }, [baseQuestions]);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleSelect = (questionId, optionIdx) => {
    setSelectedOption(optionIdx);
    setShowAnswer(false);
  };

  const handleConfirmAnswer = () => {
    if (selectedOption == null || !currentQuestion) return;
    const delta = selectedOption === currentQuestion.correct ? 1 : 0;
    correctCountRef.current += delta;
    setCorrectCount(correctCountRef.current);
    setShowAnswer(true);
  };

  const restartQuiz = useCallback(() => {
    correctCountRef.current = 0;
    setCorrectCount(0);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setShowAnswer(false);
    setScore(null);
    setRoundsCompleted(0);
  }, []);

  const handleNextQuestion = useCallback(() => {
    if (questions.length === 0) return;
    const isWrap = currentQuestionIndex === questions.length - 1;
    if (isWrap) {
      const result = `${correctCountRef.current} / ${questions.length}`;
      setScore(result);
      setRoundsCompleted((prev) => prev + 1);
      correctCountRef.current = 0;
      setCorrectCount(0);
      const nextBatch = baseQuestions.length
        ? shuffleArray(baseQuestions)
        : shuffleArray(questions);
      setQuestions(nextBatch);
      setCurrentQuestionIndex(0);
    } else {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    }
    setSelectedOption(null);
    setShowAnswer(false);
  }, [questions.length, currentQuestionIndex, baseQuestions]);

  const toggleAutoAdvance = useCallback(() => {
    setAutoAdvance((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!showAnswer || !autoAdvance) return undefined;
    const timeout = setTimeout(() => {
      handleNextQuestion();
    }, 1300);
    return () => clearTimeout(timeout);
  }, [showAnswer, handleNextQuestion, autoAdvance]);

  const questionCard = currentQuestion && (
    <View key={currentQuestion.id} style={styles.questionCard}>
      <Text style={styles.questionTitle}>{currentQuestion.question}</Text>
      {currentQuestion.options.map((option, idx) => {
        const selected = selectedOption === idx;
        const correct = showAnswer && currentQuestion.correct === idx;
        return (
          <TouchableOpacity
            key={`${currentQuestion.id}-${idx}`}
            style={[
              styles.optionButton,
              selected && styles.optionButtonActive,
              correct && styles.optionButtonCorrect,
              showAnswer && !correct && selected && styles.optionButtonIncorrect,
            ]}
            onPress={() => handleSelect(currentQuestion.id, idx)}
          >
            <Text
              style={[
                styles.optionText,
                (selected || showAnswer) && styles.optionTextActive,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
      {showAnswer && (
        <Text style={styles.feedbackText}>
          {selectedOption === currentQuestion.correct ? 'Oikein! 🎉' : 'Melkein. Kertaa ja jatka.'}
        </Text>
      )}
    </View>
  );

  return (
    <Background module="practice" variant="brown">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack?.()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {type === 'grammar' ? 'Kielioppi' : 
             type === 'vocabulary' ? 'Sanasto' :
             type === 'reading' ? 'Lukeminen' :
             type === 'listening' ? 'Kuuntelu' :
             type === 'writing' ? 'Kirjoittaminen' :
             type === 'speaking' ? 'Puhuminen' :
             'Koe'}
          </Text>
          <HomeButton navigation={navigation} style={styles.homeButton} />
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{path} · {level.toUpperCase()}</Text>
          {score && <Text style={styles.scoreText}>{score}</Text>}
        </View>
        <View style={styles.autoRow}>
          <Text style={styles.metaText}>Automaattinen eteneminen</Text>
          <TouchableOpacity
            style={[
              styles.autoToggle,
              autoAdvance && styles.autoToggleActive,
            ]}
            onPress={toggleAutoAdvance}
          >
            <Text
              style={[
                styles.autoToggleText,
                autoAdvance && styles.autoToggleTextActive,
              ]}
            >
              {autoAdvance ? 'Päällä' : 'Pois'}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.scoreSummary}>
          <Text style={styles.scoreSummaryText}>
            {score ? `Edellisen kierroksen tulos: ${score}` : 'Tee yksi kierros nähdäksesi tilastot'}
          </Text>
          <Text style={styles.scoreSummaryMeta}>Kierroksia: {roundsCompleted}</Text>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          {loading ? (
            <ActivityIndicator color={palette.accentPrimary} size="large" />
          ) : (
            <>
              {questionCard}
              {!showAnswer ? (
                <PremiumEmbossedButton
                  title="Tarkista vastaus"
                  variant="primary"
                  onPress={handleConfirmAnswer}
                  style={styles.submitButton}
                  disabled={selectedOption == null}
                />
              ) : (
                <PremiumEmbossedButton
                  title="Seuraava kysymys"
                  variant="primary"
                  onPress={handleNextQuestion}
                  style={styles.submitButton}
                />
              )}
            </>
          )}
          {error && <Text style={styles.errorText}>{error}</Text>}
        </ScrollView>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: spacing?.xxl || 48,
    paddingHorizontal: spacing?.lg || 24,
    paddingBottom: spacing?.md || 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: spacing.sm,
  },
  backButtonText: {
    fontSize: typography.scale.h3.size,
    color: textColor.primary,
  },
  title: {
    flex: 1,
    color: textColor.primary,
    fontSize: typography.scale.h2.size,
    fontWeight: typography.scale.h2.weight,
    textAlign: 'center',
  },
  homeButton: {
    position: 'absolute',
    right: spacing.lg,
    top: spacing?.xxl || 48,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  metaText: {
    color: textColor.secondary,
  },
  autoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  scoreSummary: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  scoreSummaryText: {
    color: textColor.primary,
    fontSize: typography.body,
    fontWeight: '600',
  },
  scoreSummaryMeta: {
    color: textColor.secondary,
    fontSize: typography.small,
  },
  autoToggle: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  autoToggleActive: {
    borderColor: palette.accentPrimary,
  },
  autoToggleText: {
    color: textColor.secondary,
    fontSize: typography.scale.small.size,
  },
  autoToggleTextActive: {
    color: palette.accentPrimary,
    fontWeight: '700',
  },
  scoreText: {
    color: palette.accentPrimary,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  questionCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: spacing.sm,
  },
  questionTitle: {
    fontSize: typography.scale.body.size,
    fontWeight: '600',
    color: textColor.primary,
  },
  optionButton: {
    padding: spacing.sm,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginTop: spacing.xs,
  },
  optionButtonActive: {
    borderColor: palette.accentPrimary,
    backgroundColor: 'rgba(78,205,196,0.12)',
  },
  optionText: {
    color: textColor.secondary,
  },
  optionTextActive: {
    color: palette.accentPrimary,
    fontWeight: '700',
  },
  submitButton: {
    marginTop: spacing.lg,
  },
  completionCard: {
    marginTop: spacing.xxl,
    alignItems: 'center',
  },
  completionTitle: {
    fontSize: typography.scale.h3.size,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  completionScore: {
    fontSize: typography.scale.body.size,
    color: palette.accentPrimary,
    marginBottom: spacing.md,
  },
  completionFooter: {
    marginTop: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  completionMeta: {
    fontSize: typography.scale.small.size,
    color: textColor.secondary,
  },
  completionControl: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 999,
    borderColor: 'rgba(255,255,255,0.4)',
    borderWidth: 1,
  },
  completionControlText: {
    color: palette.accentPrimary,
    fontWeight: '600',
    fontSize: typography.scale.small.size,
  },
  feedbackText: {
    marginTop: spacing.sm,
    fontSize: typography.scale.small.size,
    color: textColor.secondary,
  },
  optionButtonCorrect: {
    borderColor: '#10B981',
  },
  optionButtonIncorrect: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: palette.accentError,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
