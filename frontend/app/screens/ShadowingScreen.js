import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { fetchShadowLine, scoreShadowing } from '../utils/api';
import MicRecorder from '../components/MicRecorder';
import UpgradeNotice from '../components/UpgradeNotice';

export default function ShadowingScreen() {
  const [line, setLine] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(null);
  const [error, setError] = useState(null);
  const [upgradeReason, setUpgradeReason] = useState(null);

  const loadLine = async () => {
    try {
      setLoading(true);
      setError(null);
      setScore(null);
      setTranscript('');
      const data = await fetchShadowLine('A1');
      setLine(data.line || data);
    } catch (err) {
      if (err?.message?.includes('Upgrade required')) {
        setUpgradeReason(err.message);
      }
      setError(err.message || 'Failed to load line. Tap refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLine();
  }, []);

  const handleScore = async () => {
    if (!line) return;
    try {
      setLoading(true);
      const res = await scoreShadowing(line.text, transcript);
      setScore(res.result || res);
      setUpgradeReason(null);
    } catch (err) {
      if (err?.message?.includes('Upgrade required')) {
        setUpgradeReason(err.message);
      }
      setError(err.message || 'Could not score. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Whispered Shadowing</Text>
          <Text style={styles.subtitle}>Hear a short line, echo it back immediately</Text>
        </View>
        <TouchableOpacity style={styles.reload} onPress={loadLine} disabled={loading}>
          <Text style={styles.reloadText}>{loading ? '...' : 'Refresh'}</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingBlock}>
          <ActivityIndicator color="#0A3D62" />
          <Text style={styles.loadingText}>Preparing line...</Text>
        </View>
      )}

      {error && <Text style={styles.error}>{error}</Text>}
      {upgradeReason && (
        <UpgradeNotice
          reason={upgradeReason}
          onPress={() => navigation.navigate('Subscription')}
        />
      )}

      {line && (
        <View style={styles.card}>
          <Text style={styles.line}>{line.text}</Text>
          <Text style={styles.hint}>{line.hint}</Text>

          <MicRecorder onTranscript={setTranscript} />
          {transcript ? <Text style={styles.transcript}>You said: {transcript}</Text> : <Text style={styles.hint}>Tap mic and shadow right away</Text>}

          <TouchableOpacity
            style={[styles.cta, (!transcript || loading) && styles.ctaDisabled]}
            onPress={handleScore}
            disabled={!transcript || loading}
          >
            <Text style={styles.ctaText}>Score Shadowing</Text>
          </TouchableOpacity>
        </View>
      )}

      {score && (
        <View style={styles.scoreCard}>
          <Text style={styles.scoreTitle}>Feedback</Text>
          <Text style={styles.scoreText}>Score: {score.score}/4</Text>
          <Text style={styles.scoreText}>Rhythm: {score.rhythm}</Text>
          <Text style={styles.scoreText}>{score.feedback}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0A3D62',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  reload: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#0A3D62',
    borderRadius: 12,
  },
  reloadText: {
    color: '#fff',
    fontWeight: '600',
  },
  loadingBlock: {
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#64748b',
  },
  error: {
    color: '#EF4444',
    padding: 16,
    textAlign: 'center',
  },
  card: {
    margin: 16,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  line: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  hint: {
    color: '#475569',
  },
  transcript: {
    color: '#0F172A',
    fontWeight: '600',
  },
  cta: {
    backgroundColor: '#0A3D62',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  ctaDisabled: {
    backgroundColor: '#cbd5e1',
  },
  ctaText: {
    color: '#fff',
    fontWeight: '700',
  },
  scoreCard: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: '#0A3D62',
    padding: 14,
    borderRadius: 12,
    gap: 6,
  },
  scoreTitle: {
    color: '#E2E8F0',
    fontWeight: '700',
  },
  scoreText: {
    color: '#fff',
  },
});
