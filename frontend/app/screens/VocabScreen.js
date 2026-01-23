import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import VocabCard from '../components/VocabCard';
import { fetchRecharge } from '../utils/api';
import HomeButton from '../components/HomeButton';

export default function VocabScreen({ navigation }) {
  const [vocab, setVocab] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchRecharge();
        setVocab(data.recharge?.vocab || data.vocab || []);
      } catch (err) {
        setError(err.message || 'Failed to load vocabulary');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Combine all designs: Purple header (7th), Card grid (2nd), Flight cards (6th)
  if (loading) {
    return (
      <View style={styles.center}> 
        <ActivityIndicator size="large" color="#6F42C1" />
        <Text style={styles.hint}>Loading vocab...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}> 
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Purple Header - From 7th picture */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vocabulary Boost</Text>
        <HomeButton navigation={navigation} style={styles.homeButtonHeader} />
      </View>

      {/* Progress Indicator - From 7th picture */}
      <View style={styles.progressIndicator}>
        {[1, 2, 3].map((step) => (
          <View
            key={step}
            style={[
              styles.progressDash,
              step === 1 && styles.progressDashActive,
            ]}
          />
        ))}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Vocabulary Cards - Flight Booking Style from 6th picture */}
        {vocab.length > 0 ? (
          <View style={styles.vocabList}>
            {vocab.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.vocabCard}
                onPress={() => navigation?.navigate('Vocabulary', { word: item.fi || item.word })}
              >
                <View style={styles.vocabCardLeft}>
                  <Text style={styles.vocabCardTitle}>{item.fi || item.word}</Text>
                  <Text style={styles.vocabCardDescription}>{item.en || item.translation || 'Vocabulary word'}</Text>
                </View>
                <View style={styles.vocabCardRight}>
                  <Text style={styles.vocabCardArrow}>→</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No vocabulary items available</Text>
          </View>
        )}

        {/* Next Button */}
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => navigation.navigate('GrammarBite')}
        >
          <Text style={styles.nextButtonText}>Next → Grammar Bite</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2EEFF', // Light lavender from 7th picture
  },
  header: {
    backgroundColor: '#6F42C1', // Medium purple from 7th picture
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
  headerRight: {
    width: 36,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  vocabList: {
    gap: 12,
    marginBottom: 24,
  },
  vocabCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  vocabCardLeft: {
    flex: 1,
  },
  vocabCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  vocabCardDescription: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
  },
  vocabCardRight: {
    alignItems: 'flex-end',
  },
  vocabCardArrow: {
    fontSize: 20,
    color: '#1E3A8A',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.6)',
  },
  nextButton: {
    backgroundColor: '#6F42C1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  hint: {
    color: '#64748b',
  },
  error: {
    color: '#dc2626',
  },
});
