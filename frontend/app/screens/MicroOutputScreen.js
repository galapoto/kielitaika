import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { fetchMicroTask, submitMicroTask } from '../utils/api';
import MicRecorder from '../components/MicRecorder';
import UpgradeNotice from '../components/UpgradeNotice';

export default function MicroOutputScreen({ navigation }) {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [upgradeReason, setUpgradeReason] = useState(null);

  const loadTask = async () => {
    try {
      setLoading(true);
      setError(null);
      setFeedback(null);
      const data = await fetchMicroTask();
      setTask(data.task || data);
    } catch (err) {
      if (err?.message?.includes('Upgrade required')) {
        setUpgradeReason(err.message);
      }
      setError(err.message || 'Could not load a micro task. Pull to retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTask();
  }, []);

  const handleSubmit = async () => {
    if (!task) return;
    try {
      setLoading(true);
      const result = await submitMicroTask(task.id, transcript);
      setFeedback(result.result || result);
      setUpgradeReason(null);
    } catch (err) {
      if (err?.message?.includes('Upgrade required')) {
        setUpgradeReason(err.message);
      }
      setError(err.message || 'Failed to submit. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>10s Output Task</Text>
          <Text style={styles.subtitle}>Fast speaking nudge to build fluency</Text>
        </View>
        <TouchableOpacity style={styles.reload} onPress={loadTask} disabled={loading}>
          <Text style={styles.reloadText}>{loading ? '...' : 'New Task'}</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingBlock}>
          <ActivityIndicator color="#0A3D62" />
          <Text style={styles.loadingText}>Preparing task...</Text>
        </View>
      )}

      {error && <Text style={styles.error}>{error}</Text>}
      {upgradeReason && (
        <UpgradeNotice
          reason={upgradeReason}
          onPress={() => navigation.navigate('Subscription')}
        />
      )}

      {!loading && task && (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <Text style={styles.timer}>{task.seconds || 10}s</Text>
            <Text style={styles.prompt}>{task.prompt}</Text>
            {task.hints && (
              <View style={styles.hints}>
                {task.hints.map((hint, idx) => (
                  <Text key={idx} style={styles.hintText}>• {hint}</Text>
                ))}
              </View>
            )}
            <MicRecorder onTranscript={setTranscript} />
            {transcript ? (
              <Text style={styles.transcript}>You said: {transcript}</Text>
            ) : (
              <Text style={styles.hint}>Tap mic and speak for ~10 seconds</Text>
            )}
            <TouchableOpacity style={styles.cta} onPress={() => navigation.navigate('Conversation')}>
              <Text style={styles.ctaText}>Start Speaking</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryCta} onPress={handleSubmit} disabled={loading || !transcript}>
              <Text style={styles.secondaryText}>I’m done (log quick check)</Text>
            </TouchableOpacity>
          </View>

          {feedback && (
            <View style={styles.cardAlt}>
              <Text style={styles.feedbackTitle}>Quick Feedback</Text>
              <Text style={styles.feedbackText}>{feedback.feedback}</Text>
              <Text style={styles.feedbackMeta}>Words: {feedback.transcript_word_count}</Text>
              <Text style={styles.feedbackMeta}>Completeness: {feedback.completeness}</Text>
            </View>
          )}
        </ScrollView>
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
    marginTop: 8,
  },
  error: {
    color: '#EF4444',
    padding: 16,
    textAlign: 'center',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  timer: {
    fontSize: 14,
    color: '#0A3D62',
    fontWeight: '700',
  },
  prompt: {
    fontSize: 18,
    color: '#0F172A',
    fontWeight: '700',
  },
  hints: {
    gap: 4,
  },
  hintText: {
    color: '#334155',
  },
  transcript: {
    color: '#0F172A',
    fontWeight: '600',
  },
  hint: {
    color: '#94a3b8',
  },
  cta: {
    backgroundColor: '#0A3D62',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  ctaText: {
    color: '#fff',
    fontWeight: '700',
  },
  secondaryCta: {
    backgroundColor: '#E2E8F0',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryText: {
    color: '#0F172A',
    fontWeight: '600',
  },
  cardAlt: {
    backgroundColor: '#0A3D62',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  feedbackTitle: {
    color: '#E2E8F0',
    fontWeight: '700',
    fontSize: 16,
  },
  feedbackText: {
    color: '#fff',
  },
  feedbackMeta: {
    color: '#cbd5e1',
    fontSize: 12,
  },
});
