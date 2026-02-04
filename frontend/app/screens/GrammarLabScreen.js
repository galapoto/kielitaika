import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Switch,
} from 'react-native';
import Background from '../components/ui/Background';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';
import { radius } from '../styles/radius';
import { shadows } from '../styles/shadows';
import WindGlyphs from '../components/WindGlyphs';
import { RukaButton, RukaCard } from '../ui';
import { IconPlay, IconLightning } from '../ui/icons/IconPack';
import { useToast } from '../context/ToastContext';
import PremiumEmbossedButton from '../components/PremiumEmbossedButton';
import HomeButton from '../components/HomeButton';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:8000';

export default function GrammarLabScreen({ navigation }) {
  const [errorClusters, setErrorClusters] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showKirjakieli, setShowKirjakieli] = useState(true);
  const [grammarMode, setGrammarMode] = useState('cases');
  const { showSuccess } = useToast();

  useEffect(() => {
    loadErrorClusters();
  }, []);

  const loadErrorClusters = async () => {
    try {
      setLoading(true);
      const mockClusters = [
        {
          id: 'partitive',
          title: 'Partitive Case',
          description: 'Errors with partitive case usage',
          errorCount: 12,
          severity: 'high',
          examples: [
            { incorrect: 'Minä syön omena', correct: 'Minä syön omenaa', explanation: 'Partitive after quantity/verb' },
            { incorrect: 'Hän juo vesi', correct: 'Hän juo vettä', explanation: 'Partitive for uncountable' },
          ],
        },
        {
          id: 'verb_forms',
          title: 'Verb Conjugation',
          description: 'Errors with verb forms and tenses',
          errorCount: 8,
          severity: 'medium',
          examples: [
            { incorrect: 'Minä menen eilen', correct: 'Minä menin eilen', explanation: 'Past tense for past time' },
            { incorrect: 'Hän tulevat', correct: 'Hän tulee', explanation: 'Subject-verb agreement' },
          ],
        },
        {
          id: 'word_order',
          title: 'Word Order',
          description: 'Errors with sentence structure',
          errorCount: 5,
          severity: 'low',
          examples: [
            { incorrect: 'Minä menen kauppaan nyt', correct: 'Minä menen nyt kauppaan', explanation: 'Time adverb placement' },
          ],
        },
        {
          id: 'cases',
          title: 'Case Endings',
          description: 'Errors with case marking',
          errorCount: 15,
          severity: 'high',
          examples: [
            { incorrect: 'Minä asun Helsinki', correct: 'Minä asun Helsingissä', explanation: 'Inessive case for location' },
          ],
        },
      ];
      setErrorClusters(mockClusters);
    } catch (err) {
      setError(err.message || 'Failed to load error clusters');
    } finally {
      setLoading(false);
    }
  };

  const handleClusterSelect = (cluster) => setSelectedCluster(cluster);
  const handleBackToClusters = () => setSelectedCluster(null);
  const handleUseInConversation = (example) => {
    const prompt = example?.correct || 'Kokeillaan tätä esimerkkilauseena.';
    showSuccess('Injecting into conversation…');
    navigation?.navigate('Conversation', { prompt });
  };

  if (loading && errorClusters.length === 0) {
    return (
      <Background module="home" variant="brown" solidContentZone>
        <View style={styles.container}>
          <View style={styles.center}>
            <ActivityIndicator color="#FFFFFF" />
            <Text style={styles.hint}>Loading grammar analysis...</Text>
          </View>
        </View>
      </Background>
    );
  }

  if (selectedCluster) {
    return (
      <Background module="home" variant="brown" solidContentZone>
        <View style={styles.container}>
        <WindGlyphs mood={grammarMode} active />
        <View style={styles.header}>
          <RukaButton title="Back" onPress={handleBackToClusters} icon={IconPlay} style={{ width: 120 }} />
          <Text style={styles.title}>{selectedCluster.title}</Text>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <RukaCard
            title={selectedCluster.title}
            subtitle={`${selectedCluster.errorCount} errors • ${selectedCluster.severity} priority`}
            icon={IconLightning}
            style={styles.infoCard}
          >
            <Text style={styles.infoText}>{selectedCluster.description}</Text>
          </RukaCard>

          <RukaCard title="Register Mode" subtitle={showKirjakieli ? 'Kirjakieli (Formal)' : 'Puhekieli (Informal)'} icon={IconLightning} style={styles.toggleCard}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleLabel}>
                <Text style={styles.toggleTitle}>Register Mode</Text>
                <Text style={styles.toggleSubtitle}>
                  {showKirjakieli ? 'Kirjakieli (Formal)' : 'Puhekieli (Informal)'}
                </Text>
              </View>
              <Switch
                value={showKirjakieli}
                onValueChange={setShowKirjakieli}
                trackColor={{ false: colors.grayLine, true: colors.blueMain }}
                thumbColor={colors.white}
              />
            </View>
            <Text style={styles.toggleHint}>
              {showKirjakieli
                ? 'Showing formal Finnish (kirjakieli) with standard grammar rules.'
                : 'Showing informal Finnish (puhekieli) with colloquial forms.'}
            </Text>
          </RukaCard>

          <View style={styles.examplesSection}>
            <Text style={styles.sectionTitle}>Common Mistakes & Corrections</Text>
            {selectedCluster.examples.map((example, idx) => (
              <RukaCard key={idx} title={example.explanation} icon={IconLightning} style={styles.exampleCard}>
                <View style={styles.exampleRow}>
                  <View style={styles.incorrectBox}>
                    <Text style={styles.exampleLabel}>❌ Incorrect</Text>
                    <Text style={styles.exampleText}>{example.incorrect}</Text>
                  </View>
                  <View style={styles.correctBox}>
                    <Text style={styles.exampleLabel}>✅ Correct</Text>
                    <Text style={styles.exampleText}>{example.correct}</Text>
                  </View>
                </View>
                {!showKirjakieli && (
                  <View style={styles.transformationBox}>
                    <Text style={styles.transformationLabel}>Kirjakieli equivalent:</Text>
                    <Text style={styles.transformationText}>{example.correct}</Text>
                  </View>
                )}
                <RukaButton
                  title="Use it now in conversation"
                  onPress={() => handleUseInConversation(example)}
                  style={{ marginTop: spacing.s }}
                />
              </RukaCard>
            ))}
          </View>

          <View style={styles.practiceSection}>
            <Text style={styles.sectionTitle}>Practice Exercises</Text>
            <RukaButton
              title="Practice Drill"
              onPress={() => {}}
              icon={IconPlay}
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <Background module="home" variant="brown" solidContentZone>
      <View style={styles.container}>
        <View style={styles.header}>
        <Text style={styles.title}>Grammar Lab</Text>
        <Text style={styles.subtitle}>Error clusters and drills tailored to your path</Text>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {errorClusters.map((cluster) => (
          <RukaCard
            key={cluster.id}
            title={cluster.title}
            subtitle={`${cluster.errorCount} errors • ${cluster.severity} priority`}
            icon={IconLightning}
            onPress={() => handleClusterSelect(cluster)}
            style={styles.clusterCard}
          >
            <Text style={styles.clusterText}>{cluster.description}</Text>
          </RukaCard>
        ))}
        <View style={styles.heatmapRow}>
          <Text style={styles.sectionTitle}>Your error heatmap</Text>
          <View style={styles.heatmapChips}>
            {errorClusters.map((c) => (
              <View
                key={`chip-${c.id}`}
                style={[
                  styles.chip,
                  c.severity === 'high' && styles.chipHigh,
                  c.severity === 'medium' && styles.chipMedium,
                ]}
              >
                <Text style={styles.chipLabel}>{c.title}</Text>
                <Text style={styles.chipValue}>{c.errorCount} hits</Text>
              </View>
            ))}
          </View>
        </View>
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s,
  },
  hint: {
    color: '#64748b',
  },
  error: {
    color: '#dc2626',
  },
  header: {
    padding: spacing.l,
    gap: spacing.xs,
  },
  title: {
    ...typography.titleL,
    fontWeight: '700',
    color: colors.textMain,
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.textSoft,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.l,
    gap: spacing.m,
  },
  infoCard: {
    width: '100%',
  },
  infoText: {
    ...typography.body,
    color: colors.textMain,
  },
  toggleCard: {
    width: '100%',
    gap: spacing.s,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabel: {
    flex: 1,
  },
  toggleTitle: {
    ...typography.titleM,
    color: colors.textMain,
  },
  toggleSubtitle: {
    ...typography.bodySm,
    color: colors.textSoft,
  },
  toggleHint: {
    ...typography.bodySm,
    color: colors.textSoft,
  },
  examplesSection: {
    gap: spacing.s,
  },
  sectionTitle: {
    ...typography.titleM,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: spacing.s,
  },
  exampleCard: {
    width: '100%',
  },
  exampleRow: {
    flexDirection: 'row',
    gap: spacing.s,
  },
  incorrectBox: {
    flex: 1,
    padding: spacing.s,
    backgroundColor: '#fee2e2',
    borderRadius: radius.m,
  },
  correctBox: {
    flex: 1,
    padding: spacing.s,
    backgroundColor: '#dcfce7',
    borderRadius: radius.m,
  },
  exampleLabel: {
    ...typography.bodySm,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: spacing.xs,
  },
  exampleText: {
    ...typography.body,
    color: colors.textMain,
  },
  transformationBox: {
    marginTop: spacing.s,
    padding: spacing.s,
    backgroundColor: colors.grayBg,
    borderRadius: radius.m,
  },
  transformationLabel: {
    ...typography.bodySm,
    color: colors.textSoft,
  },
  transformationText: {
    ...typography.body,
    color: colors.textMain,
  },
  practiceSection: {
    marginTop: spacing.m,
    gap: spacing.s,
  },
  clusterCard: {
    width: '100%',
  },
  heatmapRow: {
    marginTop: spacing.m,
    gap: spacing.s,
    width: '100%',
  },
  heatmapChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
  },
  chip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.m,
    borderRadius: spacing.m,
    backgroundColor: '#e2e8f0',
  },
  chipHigh: { backgroundColor: '#fee2e2' },
  chipMedium: { backgroundColor: '#fef3c7' },
  chipLabel: {
    ...typography.bodySm,
    color: '#0f172a',
    fontWeight: '700',
  },
  chipValue: {
    ...typography.bodySm,
    color: '#334155',
  },
  clusterText: {
    ...typography.body,
    color: colors.textMain,
  },
  errorText: {
    color: '#dc2626',
    paddingHorizontal: spacing.l,
  },
});
