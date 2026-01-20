import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { fetchVocab, listPaths } from '../utils/api';

export default function VocabularyScreen({ route, navigation }) {
  const { path: initialPath = 'general', field = null } = route?.params || {};
  const [vocabItems, setVocabItems] = useState([]);
  const [paths, setPaths] = useState([]);
  const [selectedPath, setSelectedPath] = useState(initialPath);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flipMode, setFlipMode] = useState(false); // Show English or Finnish first

  useEffect(() => {
    loadPaths();
    loadVocab();
  }, [selectedPath, field]);

  const loadPaths = async () => {
    try {
      const response = await listPaths();
      setPaths(response.paths || []);
    } catch (err) {
      console.error('Error loading paths:', err);
    }
  };

  const loadVocab = async () => {
    try {
      setIsLoading(true);
      const response = await fetchVocab(selectedPath, field, 20);
      setVocabItems(response.items || []);
    } catch (err) {
      console.error('Error loading vocabulary:', err);
      setError('Failed to load vocabulary');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePathChange = (pathId) => {
    setSelectedPath(pathId);
  };

  if (isLoading && vocabItems.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0A3D62" />
        <Text style={styles.loadingText}>Loading vocabulary...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Vocabulary</Text>
        <Text style={styles.subtitle}>Learn and practice Finnish words</Text>
      </View>

      {paths.length > 0 && (
        <View style={styles.pathSelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {paths.map((path) => (
              <TouchableOpacity
                key={path.id}
                style={[
                  styles.pathButton,
                  selectedPath === path.id && styles.pathButtonActive,
                ]}
                onPress={() => handlePathChange(path.id)}
              >
                <Text
                  style={[
                    styles.pathButtonText,
                    selectedPath === path.id && styles.pathButtonTextActive,
                  ]}
                >
                  {path.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.flipButton}
          onPress={() => setFlipMode(!flipMode)}
        >
          <Text style={styles.flipButtonText}>
            {flipMode ? 'Show Finnish First' : 'Show English First'}
          </Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadVocab}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.vocabGrid}>
        {vocabItems.map((item, idx) => (
          <VocabCard
            key={idx}
            item={item}
            flipMode={flipMode}
          />
        ))}
      </View>

      {vocabItems.length === 0 && !isLoading && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No vocabulary items found</Text>
        </View>
      )}
    </ScrollView>
  );
}

function VocabCard({ item, flipMode }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const frontText = flipMode ? item.en : item.fi;
  const backText = flipMode ? item.fi : item.en;
  const frontLabel = flipMode ? 'English' : 'Finnish';
  const backLabel = flipMode ? 'Finnish' : 'English';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => setIsFlipped(!isFlipped)}
    >
      <View style={styles.cardContent}>
        <Text style={styles.cardLabel}>{frontLabel}</Text>
        <Text style={styles.cardText}>{isFlipped ? backText : frontText}</Text>
        {isFlipped && (
          <Text style={styles.cardHint}>Tap to flip back</Text>
        )}
      </View>
    </TouchableOpacity>
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
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0A3D62',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  pathSelector: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  pathButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  pathButtonActive: {
    backgroundColor: '#0A3D62',
  },
  pathButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  pathButtonTextActive: {
    color: '#fff',
  },
  controls: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  flipButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#eef2ff',
    borderRadius: 8,
  },
  flipButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0A3D62',
  },
  vocabGrid: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  cardText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0A3D62',
    textAlign: 'center',
    marginBottom: 8,
  },
  cardHint: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
    marginTop: 8,
  },
  errorContainer: {
    padding: 24,
    alignItems: 'center',
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
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
});

