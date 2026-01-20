import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import MicRecorder from '../components/MicRecorder';
import { generateYkiExam, submitYkiExam } from '../utils/api';
import UpgradeNotice from '../components/UpgradeNotice';

export default function YKIScreen({ navigation }) {
  const [examType, setExamType] = useState('full');
  const [level, setLevel] = useState('intermediate');
  const [exam, setExam] = useState(null);
  const [speakingResponses, setSpeakingResponses] = useState({});
  const [writingResponses, setWritingResponses] = useState({});
  const [evaluation, setEvaluation] = useState(null);
  const [loadingExam, setLoadingExam] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [upgradeReason, setUpgradeReason] = useState(null);

  useEffect(() => {
    loadExam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const speakingTasks = useMemo(
    () => (exam?.tasks || []).filter((t) => (t.id || '').startsWith('speaking')),
    [exam]
  );
  const writingTasks = useMemo(
    () => (exam?.tasks || []).filter((t) => (t.id || '').startsWith('writing')),
    [exam]
  );

  const loadExam = async () => {
    setLoadingExam(true);
    setError('');
    setEvaluation(null);
    try {
      const { exam: newExam } = await generateYkiExam(examType, level);
      setExam(newExam);
      setSpeakingResponses({});
      setWritingResponses({});
      setUpgradeReason(null);
    } catch (err) {
      setError(err.message || 'Failed to load YKI exam');
      if (err?.message?.includes('Upgrade required')) {
        setUpgradeReason(err.message);
      }
    } finally {
      setLoadingExam(false);
    }
  };

  const updateResponse = (taskId, value, type) => {
    if (type === 'speaking') {
      setSpeakingResponses((prev) => ({ ...prev, [taskId]: value }));
    } else {
      setWritingResponses((prev) => ({ ...prev, [taskId]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!exam) return;
    setSubmitting(true);
    setError('');
    try {
      const speakingPayload = speakingTasks
        .map((task) => ({
          task_id: task.id,
          transcript: (speakingResponses[task.id] || '').trim(),
        }))
        .filter((item) => item.transcript.length > 0);

      const writingPayload = writingTasks
        .map((task) => ({
          task_id: task.id,
          text: (writingResponses[task.id] || '').trim(),
        }))
        .filter((item) => item.text.length > 0);

      const { evaluation: evalResult } = await submitYkiExam(
        exam.exam_id,
        speakingPayload,
        writingPayload
      );
      setEvaluation(evalResult);
      setUpgradeReason(null);
    } catch (err) {
      setError(err.message || 'Failed to submit exam');
      if (err?.message?.includes('Upgrade required')) {
        setUpgradeReason(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const wordCount = (text) => (text ? text.trim().split(/\s+/).filter(Boolean).length : 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>YKI Exam Simulation</Text>
        <Text style={styles.subtitle}>Generate full speaking & writing practice with scoring</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Configure exam</Text>
        <View style={styles.row}>
          {['full', 'speaking_only', 'writing_only'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.chip, examType === type && styles.chipActive]}
              onPress={() => setExamType(type)}
            >
              <Text style={[styles.chipText, examType === type && styles.chipTextActive]}>
                {type.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.row}>
          {['basic', 'intermediate'].map((lvl) => (
            <TouchableOpacity
              key={lvl}
              style={[styles.chip, level === lvl && styles.chipActive]}
              onPress={() => setLevel(lvl)}
            >
              <Text style={[styles.chipText, level === lvl && styles.chipTextActive]}>
                {lvl === 'basic' ? 'A1-A2' : 'B1-B2'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.primaryButton} onPress={loadExam} disabled={loadingExam}>
          {loadingExam ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Generate new exam</Text>
          )}
        </TouchableOpacity>
       {error ? <Text style={styles.errorText}>{error}</Text> : null}
       {upgradeReason ? (
         <UpgradeNotice
           reason={upgradeReason}
           onPress={() => navigation.navigate('Subscription')}
         />
       ) : null}
      </View>

      {exam && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Exam tasks</Text>
          <Text style={styles.metaText}>
            Exam ID: {exam.exam_id} • Level: {exam.level} • Total time: {exam.total_time_minutes} min
          </Text>
          <View style={styles.row}>
            {speakingTasks.length > 0 && (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() =>
                  navigation.navigate('YKISpeakingExam', {
                    tasks: speakingTasks,
                  })
                }
              >
                <Text style={styles.secondaryButtonText}>View speaking tasks</Text>
              </TouchableOpacity>
            )}
            {writingTasks.length > 0 && (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() =>
                  navigation.navigate('YKIWritingExam', {
                    tasks: writingTasks,
                    examId: exam.exam_id,
                  })
                }
              >
                <Text style={styles.secondaryButtonText}>View writing tasks</Text>
              </TouchableOpacity>
            )}
          </View>

          {speakingTasks.length > 0 && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionLabel}>Speaking tasks</Text>
              {speakingTasks.map((task) => (
                <View key={task.id} style={styles.taskCard}>
                  <View style={styles.taskHeader}>
                    <Text style={styles.taskTitle}>{task.description || 'Speaking task'}</Text>
                    <Text style={styles.badge}>~{task.time_limit}s</Text>
                  </View>
                  <Text style={styles.prompt}>{task.prompt}</Text>
                  <MicRecorder onTranscript={(t) => updateResponse(task.id, t, 'speaking')} />
                  <TextInput
                    style={styles.textInput}
                    multiline
                    placeholder="Type or paste your response transcript..."
                    value={speakingResponses[task.id] || ''}
                    onChangeText={(val) => updateResponse(task.id, val, 'speaking')}
                  />
                </View>
              ))}
            </View>
          )}

          {writingTasks.length > 0 && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionLabel}>Writing tasks</Text>
              {writingTasks.map((task) => {
                const response = writingResponses[task.id] || '';
                return (
                  <View key={task.id} style={styles.taskCard}>
                    <View style={styles.taskHeader}>
                      <Text style={styles.taskTitle}>{task.description || 'Writing task'}</Text>
                      <Text style={styles.badge}>
                        {task.word_limit} words • {task.time_limit} min
                      </Text>
                    </View>
                    <Text style={styles.prompt}>{task.prompt}</Text>
                    <TextInput
                      style={[styles.textInput, styles.writingInput]}
                      multiline
                      placeholder="Write your answer here..."
                      value={response}
                      onChangeText={(val) => updateResponse(task.id, val, 'writing')}
                    />
                    <Text style={styles.helperText}>
                      {wordCount(response)} / {task.word_limit} words
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          <TouchableOpacity
            style={[styles.primaryButton, submitting && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Submit for evaluation</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {evaluation && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Results</Text>
          <View style={styles.resultRow}>
            <View>
              <Text style={styles.resultLabel}>Overall band</Text>
              <Text style={styles.resultValue}>{evaluation.overall_band}</Text>
            </View>
            <View>
              <Text style={styles.resultLabel}>Ready for YKI?</Text>
              <Text style={styles.resultValue}>
                {evaluation.readiness?.ready ? 'Ready' : 'Needs practice'}
              </Text>
            </View>
          </View>

          {evaluation.recommendations && evaluation.recommendations.length > 0 && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionLabel}>Recommendations</Text>
              {evaluation.recommendations.map((rec, idx) => (
                <View key={idx} style={styles.recommendationItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.recommendationText}>{rec}</Text>
                </View>
              ))}
            </View>
          )}

          {evaluation.speaking_results && evaluation.speaking_results.length > 0 && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionLabel}>Speaking scores</Text>
              {evaluation.speaking_results.map((res) => (
                <View key={res.task_id} style={styles.scoreCard}>
                  <Text style={styles.metricTitle}>{res.task_id}</Text>
                  <Text style={styles.metricValue}>Band: {res.band}</Text>
                  <Text style={styles.metricDetail}>
                    Fluency {res.scores?.fluency ?? '-'} | Vocabulary {res.scores?.vocabulary ?? '-'}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {evaluation.writing_results && evaluation.writing_results.length > 0 && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionLabel}>Writing scores</Text>
              {evaluation.writing_results.map((res) => (
                <View key={res.task_id} style={styles.scoreCard}>
                  <Text style={styles.metricTitle}>{res.task_id}</Text>
                  <Text style={styles.metricValue}>Band: {res.band}</Text>
                  <Text style={styles.metricDetail}>
                    Task {res.scores?.task_completion ?? '-'} | Structure{' '}
                    {res.scores?.structure ?? '-'}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 20,
    gap: 16,
  },
  header: {
    gap: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0A3D62',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  metaText: {
    fontSize: 13,
    color: '#64748b',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  chipActive: {
    backgroundColor: '#0A3D62',
    borderColor: '#0A3D62',
  },
  chipText: {
    color: '#334155',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fff',
  },
  primaryButton: {
    backgroundColor: '#0A3D62',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0A3D62',
  },
  secondaryButtonText: {
    color: '#0A3D62',
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.7,
  },
  errorText: {
    color: '#dc2626',
  },
  sectionBlock: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A3D62',
  },
  taskCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    fontSize: 12,
    color: '#334155',
    marginLeft: 8,
  },
  prompt: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fff',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  writingInput: {
    minHeight: 120,
  },
  helperText: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'right',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  resultLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  resultValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0A3D62',
  },
  recommendationItem: {
    flexDirection: 'row',
    gap: 6,
  },
  bullet: {
    color: '#0A3D62',
  },
  recommendationText: {
    flex: 1,
    color: '#1e293b',
  },
  scoreCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 4,
  },
  metricTitle: {
    fontWeight: '700',
    color: '#1f2937',
  },
  metricValue: {
    color: '#0A3D62',
    fontWeight: '700',
  },
  metricDetail: {
    color: '#475569',
    fontSize: 13,
  },
});
