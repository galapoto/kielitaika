import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { analyzePronunciation, fetchPronunciationNudge } from '../utils/api';
import MicRecorder from '../components/MicRecorder';
import RukaButton from '../ui/components/Button';
import RukaCard from '../ui/components/Card';
import { IconMic, IconPlay, IconSettings } from '../ui/icons/IconPack';
import Background from '../components/ui/Background';

const onDark = '#E6F2FF';
const onDarkMuted = '#BFD7E8';

export default function PronunciationScreen() {
  const [expectedText, setExpectedText] = useState('Minä menen kauppaan');
  const [transcript, setTranscript] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [score, setScore] = useState(null);
  const [nudge, setNudge] = useState(null);

  const handleAnalyze = async () => {
    if (!expectedText.trim() || !transcript.trim()) {
      alert('Please provide both expected text and transcript');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzePronunciation(expectedText, transcript);
      setAnalysis(result.pronunciation);
      setScore(result.score);
    } catch (error) {
      console.error('Error analyzing pronunciation:', error);
      alert('Failed to analyze pronunciation. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNudge = async () => {
    try {
      setIsAnalyzing(true);
      const res = await fetchPronunciationNudge(expectedText, transcript);
      setNudge(res.nudge);
    } catch (error) {
      console.error('Error fetching nudge:', error);
      alert('Failed to fetch nudge. Try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleVoiceTranscript = (voiceTranscript) => {
    setTranscript(voiceTranscript);
  };

  const getScoreColor = (score) => {
    if (score >= 4) return '#24CBA4'; // Green
    if (score >= 3) return '#F6C400'; // Yellow
    if (score >= 2) return '#FFA500'; // Orange
    return '#FF6B6B'; // Red
  };

  const getScoreLabel = (score) => {
    if (score >= 4) return 'Excellent';
    if (score >= 3) return 'Good';
    if (score >= 2) return 'Fair';
    return 'Needs Practice';
  };

  return (
    <Background module="practice" variant="brown" solidContentZone>
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Ääntämisharjoitus</Text>
          <Text style={styles.subtitle}>
            Harjoittele suomen ääntämistä ja saat tarkkaa palautetta
          </Text>

        <View style={styles.inputSection}>
          <Text style={styles.label}>Tavoitelause (suomeksi):</Text>
          <View style={styles.textInputContainer}>
            <Text style={styles.textInput}>{expectedText}</Text>
            <RukaButton
              title="Muokkaa"
              icon={IconSettings}
              onPress={() => alert('Muokkaus ei ole käytettävissä tässä versiossa.')}
              style={styles.editButton}
              textStyle={styles.editButtonText}
            />
          </View>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>Ääntäminen:</Text>
          <MicRecorder onTranscript={handleVoiceTranscript} />
          {transcript ? (
            <View style={styles.transcriptContainer}>
              <Text style={styles.transcriptLabel}>Tunnistettu:</Text>
              <Text style={styles.transcriptText}>{transcript}</Text>
            </View>
          ) : (
            <Text style={styles.hint}>Paina mikrofonia nauhoittaaksesi</Text>
          )}
        </View>

        <RukaButton
          title={isAnalyzing ? 'Analysoidaan…' : 'Analysoi ääntämistä'}
          icon={IconPlay}
          onPress={handleAnalyze}
          disabled={!transcript || isAnalyzing}
          style={styles.analyzeButton}
        />

        <RukaButton
          title="Mini Pronunciation Nudge"
          icon={IconSettings}
          onPress={handleNudge}
          disabled={!transcript || isAnalyzing}
          style={styles.nudgeButton}
        />

        {score !== null && (
          <RukaCard title="Your Results" icon={IconMic} style={styles.resultsContainer}>
            <View style={[styles.scoreCircle, { borderColor: getScoreColor(score) }]}>
              <Text style={[styles.scoreText, { color: getScoreColor(score) }]}>
                {score}/4
              </Text>
              <Text style={styles.scoreLabel}>{getScoreLabel(score)}</Text>
            </View>

            {analysis && (
              <>
                <View style={styles.feedbackContainer}>
                  <Text style={styles.feedbackTitle}>Feedback:</Text>
                  <Text style={styles.feedbackText}>{analysis.feedback}</Text>
                </View>

                {analysis.vowel_issues && analysis.vowel_issues.length > 0 && (
                  <View style={styles.issuesContainer}>
                    <Text style={styles.issuesTitle}>Vowel Length Issues:</Text>
                    {analysis.vowel_issues.map((issue, idx) => (
                      <View key={idx} style={styles.issueItem}>
                        <Text style={styles.issueWord}>{issue.word}</Text>
                        <Text style={styles.issueDetail}>
                          Expected: {issue.expected}, Detected: {issue.detected}
                        </Text>
                        <Text style={styles.issueExample}>{issue.example}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {analysis.consonant_issues && analysis.consonant_issues.length > 0 && (
                  <View style={styles.issuesContainer}>
                    <Text style={styles.issuesTitle}>Consonant Length Issues:</Text>
                    {analysis.consonant_issues.map((issue, idx) => (
                      <View key={idx} style={styles.issueItem}>
                        <Text style={styles.issueWord}>{issue.word}</Text>
                        <Text style={styles.issueDetail}>
                          Expected: {issue.expected}, Detected: {issue.detected}
                        </Text>
                        <Text style={styles.issueExample}>{issue.example}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {analysis.rhythm && (
                  <View style={styles.rhythmContainer}>
                    <Text style={styles.rhythmTitle}>Rhythm:</Text>
                    <Text style={styles.rhythmText}>
                      {analysis.rhythm === 'good'
                        ? '✓ Good rhythm and pace'
                        : analysis.rhythm === 'too_fast'
                        ? '⚠ Speaking too fast'
                        : '⚠ Speaking too slow'}
                    </Text>
                  </View>
                )}

                {analysis.vowel_issues?.length === 0 &&
                  analysis.consonant_issues?.length === 0 && (
                    <View style={styles.successContainer}>
                      <Text style={styles.successText}>
                        ✓ No vowel or consonant length issues detected!
                      </Text>
                    </View>
                  )}
              </>
            )}

            {nudge && (
              <View style={styles.nudgeCard}>
                <Text style={styles.nudgeTitle}>Mini Nudge</Text>
                <Text style={styles.nudgeText}>Vokaali: {nudge.vowel_length}</Text>
                <Text style={styles.nudgeText}>Konsonantti: {nudge.consonant}</Text>
                <Text style={styles.nudgeText}>Harjoitus: {nudge.phrase}</Text>
              </View>
            )}
          </RukaCard>
        )}
        </View>
      </ScrollView>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0A3D62',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 24,
  },
  inputSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  editButton: {
    marginLeft: 12,
    width: 120,
  },
  editButtonText: {
    fontSize: 14,
  },
  transcriptContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  transcriptLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  transcriptText: {
    fontSize: 16,
    color: '#1e293b',
  },
  hint: {
    fontSize: 14,
    color: '#94a3b8',
    fontStyle: 'italic',
    marginTop: 8,
  },
  analyzeButton: {
    marginBottom: 16,
  },
  resultsContainer: {
    marginTop: 8,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  scoreText: {
    fontSize: 36,
    fontWeight: '700',
  },
  scoreLabel: {
    fontSize: 14,
    color: onDarkMuted,
    marginTop: 4,
  },
  feedbackContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: onDark,
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 16,
    color: onDark,
    lineHeight: 22,
  },
  issuesContainer: {
    marginBottom: 16,
  },
  issuesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: onDark,
    marginBottom: 12,
  },
  issueItem: {
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#7EDBFF',
  },
  issueWord: {
    fontSize: 16,
    fontWeight: '600',
    color: onDark,
    marginBottom: 4,
  },
  issueDetail: {
    fontSize: 13,
    color: onDarkMuted,
    marginBottom: 4,
  },
  issueExample: {
    fontSize: 12,
    color: onDarkMuted,
    fontStyle: 'italic',
  },
  rhythmContainer: {
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    marginBottom: 12,
  },
  rhythmTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: onDark,
    marginBottom: 4,
  },
  rhythmText: {
    fontSize: 14,
    color: onDarkMuted,
  },
  successContainer: {
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
  },
  successText: {
    fontSize: 14,
    color: onDark,
    fontWeight: '600',
  },
  nudgeButton: {
    marginBottom: 24,
  },
  nudgeCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    gap: 4,
  },
  nudgeTitle: {
    fontWeight: '700',
    color: onDark,
  },
  nudgeText: {
    color: onDarkMuted,
  },
});
