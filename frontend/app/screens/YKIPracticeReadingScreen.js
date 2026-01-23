/**
 * YKIPracticeReadingScreen - Short YKI reading practice exercises
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Background from '../components/ui/Background';
import PremiumEmbossedButton from '../components/PremiumEmbossedButton';
import HomeButton from '../components/HomeButton';
import YKIModeBanner from '../components/YKIModeBanner';

import { colors as palette } from '../styles/colors';
import { designTokens } from '../styles/designTokens';

const { typography, spacing, textColor } = designTokens || {};

function QuestionList({ questions }) {
  const [selectedOptions, setSelectedOptions] = useState({});
  
  const handleOptionSelect = (questionId, optionIdx, correctIdx, options) => {
    setSelectedOptions(prev => ({ ...prev, [questionId]: optionIdx }));
    if (correctIdx === optionIdx) {
      Alert.alert('Correct!', 'Well done!');
    } else {
      Alert.alert('Incorrect', `The correct answer is: ${options[correctIdx]}`);
    }
  };
  
  return (
    <View style={styles.questionsContainer}>
      <Text style={styles.questionsTitle}>Questions:</Text>
      {questions.map((q, idx) => (
        <View key={q.id || idx} style={styles.questionCard}>
          <Text style={styles.questionText}>{q.question}</Text>
          {q.options && q.options.map((opt, optIdx) => (
            <TouchableOpacity
              key={optIdx}
              style={[
                styles.optionButton,
                selectedOptions[q.id || idx] === optIdx && styles.optionButtonSelected,
              ]}
              onPress={() => handleOptionSelect(q.id || idx, optIdx, q.correct, q.options)}
            >
              <Text style={styles.optionText}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
}

export default function YKIPracticeReadingScreen({ navigation, route } = {}) {
  const { ykiMode = 'training' } = route?.params || {};
  const [loading, setLoading] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [readingTasks, setReadingTasks] = useState([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);

  const currentTask = readingTasks[currentTaskIndex];

  const handleStartPractice = async () => {
    setLoading(true);
    try {
      // Generate a reading practice exam from backend
      const { generateYkiPractice } = require('../utils/api');
      const exam = await generateYkiPractice('reading', 'intermediate');
      const availableReadingTasks = exam?.exam?.tasks?.filter(t => t.type === 'reading') || [];
      
      if (availableReadingTasks.length > 0) {
        setReadingTasks(availableReadingTasks);
        setCurrentTaskIndex(0);
        setCurrentExercise(buildExercise(availableReadingTasks[0]));
      } else {
        // Fallback if no reading tasks - create practice content
        setCurrentExercise({
          text: 'Lue seuraava teksti ja vastaa kysymyksiin.\n\nHelsinki on Suomen pääkaupunki. Se sijaitsee Etelä-Suomessa ja on maan suurin kaupunki. Helsingissä asuu noin 650 000 ihmistä. Kaupunki on tunnettu modernista arkkitehtuuristaan ja kulttuurielämästään.',
          questions: [
            { id: 1, question: 'Mikä on Suomen pääkaupunki?', options: ['Helsinki', 'Tampere', 'Turku'], correct: 0 },
            { id: 2, question: 'Kuinka monta ihmistä asuu Helsingissä?', options: ['500 000', '650 000', '800 000'], correct: 1 },
            { id: 3, question: 'Mistä Helsinki on tunnettu?', options: ['Arkkitehtuurista', 'Urheilusta', 'Teknologiasta'], correct: 0 },
          ],
        });
        setReadingTasks([{
          id: 'fallback_1',
          text: 'Lue seuraava teksti ja vastaa kysymyksiin.\n\nHelsinki on Suomen pääkaupunki.',
          questions: [
            { id: 1, question: 'Mikä on Suomen pääkaupunki?', options: ['Helsinki', 'Tampere', 'Turku'], correct: 0 },
          ],
        }]);
        setCurrentTaskIndex(0);
      }
    } catch (error) {
      console.error('Failed to load reading exercise:', error);
      // Fallback exercise
      const fallback = {
        id: 'fallback_1',
        text: 'Lue seuraava teksti ja vastaa kysymyksiin.\n\nHelsinki on Suomen pääkaupunki.',
        questions: [
          { id: 1, question: 'Mikä on Suomen pääkaupunki?', options: ['Helsinki', 'Tampere', 'Turku'], correct: 0 },
        ],
      };
      setCurrentExercise({
        text: fallback.text,
        questions: fallback.questions,
      });
      setReadingTasks([fallback]);
      setCurrentTaskIndex(0);
    } finally {
      setLoading(false);
    }
  };

  const buildExercise = (task) => ({
    text: task.text || task.prompt || 'Reading text…',
    questions: task.questions || [],
  });

  const goToNextTask = () => {
    if (currentTaskIndex >= readingTasks.length - 1) {
      Alert.alert('Great job!', 'You have reached the end of available reading tasks. Tap start practice again for a new set.');
      return;
    }
    const nextIndex = currentTaskIndex + 1;
    setCurrentTaskIndex(nextIndex);
    setCurrentExercise(buildExercise(readingTasks[nextIndex]));
  };

  return (
    <Background module="yki_read" variant="blue">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>YKI Reading Practice</Text>
          <HomeButton navigation={navigation} style={styles.homeButton} homeType="yki" />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <YKIModeBanner mode={ykiMode} style={styles.modeBanner} />
          
          {!currentExercise ? (
            <View style={styles.startContainer}>
              <Text style={styles.startTitle}>Practice YKI Reading</Text>
              <Text style={styles.startDescription}>
                Short reading comprehension exercises to prepare for the YKI exam.
              </Text>
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
              <Text style={styles.exerciseText}>{currentExercise.text}</Text>
              {currentExercise.questions && currentExercise.questions.length > 0 && (
                <QuestionList questions={currentExercise.questions} />
              )}
              {readingTasks.length > 1 && (
                <PremiumEmbossedButton
                  title="Next Reading Task"
                  onPress={goToNextTask}
                  variant="secondary"
                  style={styles.nextButton}
                />
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.backgroundPrimary,
  },
  modeBanner: {
    marginBottom: 16,
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
    padding: spacing.sm,
  },
  backButtonText: {
    fontSize: typography.scale.h3.size,
    color: textColor.primary,
  },
  headerTitle: {
    fontSize: typography.scale.h2.size,
    fontFamily: typography.fontFamily,
    fontWeight: typography.scale.h2.weight,
    color: textColor.primary,
    flex: 1,
    textAlign: 'center',
  },
  homeButton: {
    position: 'absolute',
    top: spacing?.xl || 32,
    right: spacing?.lg || 24,
  },
  content: {
    padding: spacing.lg,
  },
  startContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing?.xxl || 40,
  },
  startTitle: {
    fontSize: typography?.scale?.h2?.size || 24,
    fontWeight: typography?.scale?.h2?.weight || '600',
    color: textColor?.primary || palette.textPrimary,
    marginBottom: spacing?.sm || 8,
    fontFamily: typography?.fontFamily || 'Inter',
  },
  startDescription: {
    fontSize: typography.scale.body.size,
    color: textColor.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: typography.scale.body.lineHeight,
  },
  startButton: {
    width: '100%',
    maxWidth: 320,
  },
  exerciseContainer: {
    marginBottom: spacing?.lg || 24,
  },
  exerciseText: {
    fontSize: typography.scale.body.size,
    color: textColor.primary,
    lineHeight: typography.scale.body.lineHeight,
    marginBottom: spacing?.lg || 24,
  },
  questionsContainer: {
    marginTop: spacing?.lg || 24,
  },
  questionsTitle: {
    fontSize: typography?.scale?.cardTitle?.size || 18,
    fontWeight: typography?.scale?.cardTitle?.weight || '600',
    color: textColor?.primary || palette.textPrimary,
    marginBottom: spacing?.sm || 8,
    fontFamily: typography?.fontFamily || 'Inter',
  },
  questionCard: {
    backgroundColor: palette.surface,
    borderRadius: designTokens?.borderRadius?.lg || 16,
    padding: spacing?.lg || 24,
    marginBottom: spacing?.md || 16,
    borderWidth: 1,
    borderColor: palette.divider,
  },
  questionText: {
    fontSize: typography?.scale?.body?.size || 16,
    fontWeight: typography?.scale?.body?.weight || '400',
    color: textColor?.primary || palette.textPrimary,
    marginBottom: spacing?.sm || 8,
    fontFamily: typography?.fontFamily || 'Inter',
  },
  optionButton: {
    backgroundColor: palette.backgroundSecondary,
    borderRadius: designTokens?.borderRadius?.md || 12,
    padding: spacing?.sm || 8,
    marginBottom: spacing?.xs || 4,
  },
  optionText: {
    fontSize: typography?.scale?.small?.size || 14,
    color: textColor?.primary || palette.textPrimary,
    fontFamily: typography?.fontFamily || 'Inter',
  },
  optionButtonSelected: {
    backgroundColor: `${palette.accentSecondary}33`,
    borderWidth: 2,
    borderColor: palette.accentSecondary,
  },
});
