import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GrammarBiteCard from '../components/GrammarBiteCard';
import { fetchRecharge } from '../utils/api';
import HomeButton from '../components/HomeButton';
import Background from '../components/ui/Background';

export default function GrammarBiteScreen({ navigation }) {
  const [grammar, setGrammar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchRecharge();
        setGrammar(data.recharge?.grammar || data.grammar || null);
      } catch (err) {
        setError(err.message || 'Failed to load grammar bite');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Combine all designs: Quiz design (4th), Flight booking (6th), Vocabulary practice (7th)
  if (loading) {
    return (
      <Background module="practice" variant="brown">
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#FF6B35" style={styles.loader} />
          <Text style={styles.hint}>Loading grammar...</Text>
        </View>
      </Background>
    );
  }

  if (error || !grammar) {
    return (
      <Background module="practice" variant="brown">
        <View style={styles.container}>
          <Text style={styles.error}>{error || 'No grammar bite'}</Text>
        </View>
      </Background>
    );
  }

  return (
    <Background module="practice" variant="brown">
      <View style={styles.container}>
        <LinearGradient
          colors={['#4A148C', '#1A237E', '#0D47A1']} // Dark purple gradient from 4th picture
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[StyleSheet.absoluteFill, { opacity: 0.55 }]}
        />

        {/* Header - From 4th picture (Quiz design) */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack?.()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Grammar Bite</Text>
          <HomeButton navigation={navigation} style={styles.homeButtonHeader} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Grammar Card - From 4th picture (Question card style) */}
          <View style={styles.grammarCard}>
            <Text style={styles.grammarNumber}>
              Grammar <Text style={styles.grammarNumberHighlight}>01</Text>
            </Text>
            <Text style={styles.grammarCategory}>Daily Grammar</Text>
            <Text style={styles.grammarTitle}>{grammar.title}</Text>
          </View>

          {/* Grammar Content - Flight Booking Card from 6th picture */}
          <View style={styles.contentCard}>
            <View style={styles.contentCardLeft}>
              <Text style={styles.contentCardTitle}>Explanation</Text>
              <Text style={styles.contentCardDescription}>
                {grammar.explanation || grammar.meaning || 'Grammar rule explanation'}
              </Text>
            </View>
          </View>

          {/* Examples - Flight Booking Cards */}
          {grammar.examples && grammar.examples.length > 0 && (
            <View style={styles.examplesSection}>
              <Text style={styles.sectionTitle}>Examples</Text>
              {grammar.examples.map((example, idx) => (
                <View key={idx} style={styles.exampleCard}>
                  <View style={styles.exampleCardLeft}>
                    <Text style={styles.exampleCardTitle}>Example {idx + 1}</Text>
                    <Text style={styles.exampleCardText}>{example}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Grammar Bite Card Component */}
          <View style={styles.grammarBiteContainer}>
            <GrammarBiteCard
              title={grammar.title}
              meaning={grammar.explanation || grammar.meaning}
              examples={grammar.examples || []}
            />
          </View>

          {/* Next Button */}
          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => navigation.navigate('MiniChallenge')}
          >
            <Text style={styles.nextButtonText}>Next → Mini Challenge</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loader: {
    marginTop: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  grammarCard: {
    backgroundColor: '#1A0B2E', // Dark indigo from 4th picture
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    position: 'relative',
  },
  grammarNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  grammarNumberHighlight: {
    color: '#FF6B35',
  },
  grammarCategory: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 16,
  },
  grammarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
  },
  contentCard: {
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
  contentCardLeft: {
    flex: 1,
  },
  contentCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  contentCardDescription: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.7)',
    lineHeight: 20,
  },
  examplesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  exampleCard: {
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
  exampleCardLeft: {
    flex: 1,
  },
  exampleCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.6)',
    marginBottom: 4,
  },
  exampleCardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  grammarBiteContainer: {
    marginBottom: 24,
  },
  nextButton: {
    backgroundColor: '#FF6B35',
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
    color: '#FFFFFF',
    marginTop: 12,
  },
  error: {
    color: '#FF6B35',
    textAlign: 'center',
  },
});
