import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { fetchWorkplaceLesson } from '../utils/api';
import ConversationScreen from './ConversationScreen';
import UpgradeNotice from '../components/UpgradeNotice';

export default function ProfessionDetailScreen({ route, navigation }) {
  const { field, fieldName } = route?.params || {};
  const [lesson, setLesson] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConversation, setShowConversation] = useState(false);
  const [error, setError] = useState(null);
  const [upgradeReason, setUpgradeReason] = useState(null);

  useEffect(() => {
    if (field) {
      loadLesson();
    }
  }, [field]);

  const loadLesson = async () => {
    try {
      setIsLoading(true);
      const response = await fetchWorkplaceLesson(field, 'B1');
      setLesson(response.lesson || response);
      setUpgradeReason(null);
    } catch (err) {
      console.error('Error loading lesson:', err);
      if (err?.message?.includes('Upgrade required')) {
        setUpgradeReason(err.message);
      }
      setError(err.message || 'Failed to load lesson');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartPractice = () => {
    setShowConversation(true);
  };

  const handleStartRoleplay = () => {
    navigation.navigate('Roleplay', {
      field: field,
      scenarioTitle: lesson.title,
      level: 'B1',
    });
  };

  if (showConversation) {
    return (
      <ConversationScreen
        route={{ params: { level: 'B1', path: 'workplace', profession: field } }}
        navigation={navigation}
      />
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0A3D62" />
        <Text style={styles.loadingText}>Loading lesson...</Text>
      </View>
    );
  }

  if (error || !lesson) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Lesson not found'}</Text>
        {upgradeReason && (
          <UpgradeNotice
            reason={upgradeReason}
            onPress={() => navigation.navigate('Subscription')}
          />
        )}
        <TouchableOpacity style={styles.retryButton} onPress={loadLesson}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{fieldName || lesson.field}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lesson: {lesson.title}</Text>
          <Text style={styles.prompt}>{lesson.prompt}</Text>
        </View>

        {lesson.vocabulary && lesson.vocabulary.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Vocabulary</Text>
            <View style={styles.vocabGrid}>
              {lesson.vocabulary.map((word, idx) => (
                <View key={idx} style={styles.vocabItem}>
                  <Text style={styles.vocabText}>{word}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {lesson.grammar_tip && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Grammar Tip</Text>
            <View style={styles.tipContainer}>
              <Text style={styles.tipText}>{lesson.grammar_tip}</Text>
            </View>
          </View>
        )}

        {lesson.writing_task && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Writing Task</Text>
            <View style={styles.taskContainer}>
              <Text style={styles.taskText}>{lesson.writing_task}</Text>
            </View>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartPractice}
          >
            <Text style={styles.startButtonText}>Start Practice Conversation</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.roleplayButton}
            onPress={handleStartRoleplay}
          >
            <Text style={styles.roleplayButtonText}>Start Roleplay Scenario</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#0A3D62',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0A3D62',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  prompt: {
    fontSize: 16,
    color: '#1e293b',
    lineHeight: 24,
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 8,
  },
  vocabGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  vocabItem: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  vocabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A3D62',
  },
  tipContainer: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F6C400',
  },
  tipText: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 20,
  },
  taskContainer: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#24CBA4',
  },
  taskText: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 20,
  },
  buttonContainer: {
    gap: 12,
    marginTop: 8,
  },
  startButton: {
    backgroundColor: '#0A3D62',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  roleplayButton: {
    backgroundColor: '#24CBA4',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  roleplayButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#0A3D62',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
