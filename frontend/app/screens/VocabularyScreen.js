import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { fetchVocab, listPaths } from '../utils/api';
import { RukaButton, RukaCard, Toggle, SearchBar } from '../ui';
import NeumorphicButton from '../ui/components/NeumorphicButton';
import InfoCard from '../ui/components/InfoCard';
import EnhancedCard from '../ui/components/EnhancedCard';
import DecorativeText from '../ui/components/DecorativeText';
import { IconLightning, IconBook } from '../ui/icons/IconPack';
import { theme } from '../ui/themes/theme';
import { SkeletonCard, SkeletonListItem } from '../components/SkeletonScreen';
import { EmptyVocabulary, EmptyError } from '../components/EmptyState';
import { useToast } from '../context/ToastContext';
import Background from '../components/ui/Background';
import { useVoiceStreaming } from '../hooks/useVoiceStreaming';
import { useVoice } from '../hooks/useVoice';
import PremiumEmbossedButton from '../components/PremiumEmbossedButton';
import HomeButton from '../components/HomeButton';

const FALLBACK_PATHS = [
  { id: 'general', label: 'Yleinen suomi', description: 'Everyday Finnish conversation and grammar practice.' },
  { id: 'workplace', label: 'Töihin', description: 'Profession-specific Finnish with roleplay and vocabulary drills.' },
  { id: 'yki', label: 'YKI', description: 'Exam-style speaking and writing prep.' },
];

const FALLBACK_VOCAB = [
  { fi: 'hei', en: 'hello' },
  { fi: 'kiitos', en: 'thank you' },
  { fi: 'anteeksi', en: 'sorry / excuse me' },
  { fi: 'missä', en: 'where' },
  { fi: 'milloin', en: 'when' },
  { fi: 'paljonko', en: 'how much' },
  { fi: 'haluaisin', en: 'I would like' },
  { fi: 'tarvitsen apua', en: 'I need help' },
];

export default function VocabularyScreen({ route, navigation } = {}) {
  const { path: initialPath = 'general', field = null } = route?.params || {};
  const [vocabItems, setVocabItems] = useState([]);
  const [paths, setPaths] = useState([]);
  const [selectedPath, setSelectedPath] = useState(initialPath);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flipMode, setFlipMode] = useState(false);
  const [search, setSearch] = useState('');
  const { showError, showSuccess } = useToast();
  const [drillMode, setDrillMode] = useState('meaning'); // meaning | cloze | speak
  const [currentIndex, setCurrentIndex] = useState(0);
  const { speakText } = useVoiceStreaming();
  const { speak } = useVoice();
  const lastSpokenWordRef = useRef('');
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 3;

  useEffect(() => {
    loadPaths();
    loadVocab();
  }, [selectedPath, field]);

  const loadPaths = async () => {
    try {
      const response = await listPaths();
      const resolved = response.paths || [];
      setPaths(resolved.length ? resolved : FALLBACK_PATHS);
    } catch (err) {
      console.error('Error loading paths:', err);
      setPaths(FALLBACK_PATHS);
    }
  };

  const loadVocab = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchVocab(selectedPath, field, 20);
      const items = response.items || [];
      setVocabItems(items.length ? items : FALLBACK_VOCAB);
    } catch (err) {
      console.error('Error loading vocabulary:', err);
      const errorMessage = err?.message || 'Failed to load vocabulary. Please check your connection and try again.';
      setError(errorMessage);
      showError(errorMessage);
      setVocabItems(FALLBACK_VOCAB);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = vocabItems.filter(
    (item) =>
      item.fi?.toLowerCase().includes(search.toLowerCase()) ||
      item.en?.toLowerCase().includes(search.toLowerCase())
  );

  const activeItem = useMemo(() => filteredItems[currentIndex] || filteredItems[0], [filteredItems, currentIndex]);

  const handleNext = useCallback(() => {
    if (!filteredItems.length) return;
    setCurrentIndex((idx) => (idx + 1) % filteredItems.length);
  }, [filteredItems]);

  const handleReveal = useCallback(() => {
    if (!activeItem) return;
    const phrase = drillMode === 'cloze' ? activeItem.en : activeItem.en || activeItem.fi;
    speakText?.(phrase);
    showSuccess('Revealed');
  }, [activeItem, drillMode, speakText, showSuccess]);

  // Get current word for practice - use actual vocabulary data, no banana fallback
  const currentWord = activeItem || filteredItems[0];

  useEffect(() => {
    const word = currentWord?.fi || '';
    if (!word || lastSpokenWordRef.current === word) return;
    lastSpokenWordRef.current = word;
    speak?.(word, 'vocab').catch(() => {});
  }, [currentWord?.fi, speak]);

  // Generate image URL for the current word (using Unsplash API for educational images)
  const getImageUrl = useCallback((word) => {
    if (!word) return null;
    // Use Unsplash API to get relevant images for vocabulary words
    const searchTerm = encodeURIComponent(word.en || word.fi || '');
    return `https://source.unsplash.com/400x400/?${searchTerm}&educational`;
  }, []);
  
  // Generate answer options (correct answer + 3 distractors)
  const answerOptions = useMemo(() => {
    if (!currentWord || !filteredItems.length) return [];
    // For translation practice, we show Finnish word and ask for English translation
    const correct = currentWord.en || currentWord.fi;
    const otherWords = filteredItems
      .filter(item => item !== currentWord && (item.en || item.fi) !== correct)
      .slice(0, 3)
      .map(item => item.en || item.fi)
      .filter(Boolean);
    
    // If we don't have enough options, pad with generic distractors
    const genericOptions = ['hello', 'thank you', 'please', 'yes', 'no', 'good', 'bad'];
    while (otherWords.length < 3 && genericOptions.length > 0) {
      const generic = genericOptions.shift();
      if (generic !== correct && !otherWords.includes(generic)) {
        otherWords.push(generic);
      }
    }
    
    const options = [correct, ...otherWords].slice(0, 4);
    // Shuffle options
    return options.sort(() => Math.random() - 0.5);
  }, [currentWord, filteredItems]);

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleCheck = () => {
    const correct = currentWord.en || currentWord.fi;
    if (selectedAnswer === correct) {
      showSuccess('Correct!');
      // Move to next word
      handleNext();
      setSelectedAnswer(null);
      setCurrentStep(Math.min(currentStep + 1, totalSteps - 1));
    } else {
      showError('Incorrect. Try again!');
    }
  };

  if (isLoading && vocabItems.length === 0) {
    return (
      <Background module="practice">
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
          <SkeletonCard style={{ marginBottom: 16 }} />
          <SkeletonCard style={{ marginBottom: 16 }} />
          <SkeletonCard style={{ marginBottom: 16 }} />
        </ScrollView>
      </Background>
    );
  }
  
  if (error && vocabItems.length === 0) {
    return (
      <Background module="practice">
        <EmptyError 
          errorMessage={error}
          onRetry={loadVocab}
        />
      </Background>
    );
  }
  
  if (!isLoading && filteredItems.length === 0 && search) {
    return (
      <Background module="practice">
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
          <EmptyVocabulary onBrowseVocabulary={() => setSearch('')} />
        </ScrollView>
      </Background>
    );
  }

  return (
    <Background module="practice" variant="brown">
      <View style={styles.vocabContainer}>
      {/* Purple Header */}
      <View style={styles.vocabHeader}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()} style={styles.vocabBackButton}>
          <Text style={styles.vocabBackIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.vocabHeaderTitle}>Vocabulary Practice</Text>
        <HomeButton navigation={navigation} style={styles.homeButtonHeader} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressIndicator}>
        {[0, 1, 2].map((step) => (
          <View
            key={step}
            style={[
              styles.progressDash,
              step === currentStep && styles.progressDashActive,
              step < currentStep && styles.progressDashCompleted,
            ]}
          />
        ))}
      </View>

      {/* Main Content Card */}
      <ScrollView style={styles.vocabScrollView} contentContainerStyle={styles.vocabScrollContent}>
        {currentWord ? (
          <View style={styles.vocabMainCard}>
            {/* Image Display Card */}
            <View style={styles.imageCard}>
              {currentWord.fi ? (
                <View style={styles.imageContainer}>
                  <Text style={styles.finnishWord}>{currentWord.fi}</Text>
                  {currentWord.en && (
                    <Text style={styles.wordHint}>What does this mean?</Text>
                  )}
                </View>
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderText}>📚</Text>
                </View>
              )}
            </View>

            {/* Instruction Text */}
            <Text style={styles.instructionText}>
              {currentWord.fi ? `Translate "${currentWord.fi}"` : 'Translate the word'}
            </Text>

            {/* Answer Options Grid - 2x2 */}
            <View style={styles.answerGrid}>
              {answerOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.answerButton,
                    selectedAnswer === option && styles.answerButtonSelected,
                  ]}
                  onPress={() => handleAnswerSelect(option)}
                >
                  <Text style={styles.answerButtonText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Check Button */}
            <TouchableOpacity
              style={styles.checkButton}
              onPress={handleCheck}
              disabled={!selectedAnswer}
            >
              <Text style={styles.checkButtonText}>Check</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.vocabMainCard}>
            <Text style={styles.emptyText}>No vocabulary items available. Please try again.</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🏠</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>📊</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
          <Text style={[styles.navIcon, styles.navIconActive]}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🔔</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>👤</Text>
        </TouchableOpacity>
      </View>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    color: theme.dark.subtext,
    marginTop: 12,
  },
  header: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.dark.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: theme.dark.subtext,
  },
  pathSelector: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  pathButton: {
    marginRight: 8,
  },
  pathButtonActive: {
    shadowColor: '#7EDBFF',
    shadowOpacity: 0.4,
  },
  controls: {
    padding: 16,
    gap: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlLabel: {
    color: theme.dark.text,
    fontWeight: '600',
  },
  errorContainer: {
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,0,0,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,0,0,0.3)',
    gap: 12,
  },
  errorText: {
    color: '#f87171',
  },
  drillModes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  modeChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#152238',
    borderRadius: 12,
  },
  modeChipActive: {
    backgroundColor: '#1B4EDA',
  },
  modeText: {
    color: '#BFD7E8',
    fontSize: 13,
  },
  modeTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  drillCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  term: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  prompt: {
    color: '#BFD7E8',
    fontSize: 14,
    marginBottom: 12,
  },
  drillActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vocabGrid: {
    padding: 16,
    gap: 12,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.dark.subtext,
  },
  bar: {
    paddingHorizontal: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  // New styles for redesigned vocabulary practice (matching 7th image)
  vocabContainer: {
    flex: 1,
    backgroundColor: '#F2EEFF', // Light lavender background
  },
  vocabHeader: {
    backgroundColor: '#6F42C1', // Medium purple
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  vocabBackButton: {
    marginRight: 16,
  },
  vocabBackIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  vocabHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  homeButtonHeader: {
    marginLeft: 'auto',
  },
  progressIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  progressDash: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(111, 66, 193, 0.2)',
    borderWidth: 1,
    borderColor: '#6F42C1',
  },
  progressDashActive: {
    backgroundColor: '#6F42C1',
  },
  progressDashCompleted: {
    backgroundColor: '#6F42C1',
  },
  vocabScrollView: {
    flex: 1,
  },
  vocabScrollContent: {
    padding: 16,
  },
  vocabMainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: 64,
  },
  imageContainer: {
    width: '100%',
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  finnishWord: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  wordHint: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.6)',
    textAlign: 'center',
    padding: 24,
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 24,
    textAlign: 'left',
  },
  answerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  answerButton: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    minHeight: 60,
  },
  answerButtonSelected: {
    borderWidth: 2,
    borderColor: '#6F42C1',
  },
  answerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  checkButton: {
    backgroundColor: '#6F42C1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#6F42C1',
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  navItemActive: {
    backgroundColor: '#8A56FF',
    borderRadius: 20,
    width: 40,
    height: 40,
  },
  navIcon: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  navIconActive: {
    color: '#FFFFFF',
  },
});
