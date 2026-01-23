/**
 * YKIAttemptHistoryScreen - View and review past YKI attempts
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import Background from '../components/ui/Background';
import HomeButton from '../components/HomeButton';
import { getYkiAttemptHistory } from '../utils/api';

const SKILL_LABELS = {
  speaking: 'Speaking',
  listening: 'Listening',
  reading: 'Reading',
  writing: 'Writing',
  vocab: 'Vocabulary',
  quiz: 'Quiz',
};

const SKILL_ICONS = {
  speaking: '🎤',
  listening: '👂',
  reading: '📖',
  writing: '✍️',
  vocab: '📚',
  quiz: '📝',
};

export default function YKIAttemptHistoryScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [attempts, setAttempts] = useState([]);
  const [selectedTaskType, setSelectedTaskType] = useState(null);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [error, setError] = useState(null);

  const loadAttempts = useCallback(async (taskType = null) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getYkiAttemptHistory(taskType, 50, 0);
      setAttempts(res.attempts || []);
    } catch (e) {
      setError(e?.message || 'Failed to load attempt history. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAttempts(selectedTaskType);
  }, [loadAttempts, selectedTaskType]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAttempts(selectedTaskType);
  }, [loadAttempts, selectedTaskType]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateString;
    }
  };

  const getScoreColor = (avgScore) => {
    if (avgScore >= 3.0) return '#10b981'; // Green - pass
    if (avgScore >= 2.0) return '#f59e0b'; // Yellow - near pass
    return '#ef4444'; // Red - fail
  };

  const getScoreLabel = (avgScore) => {
    if (avgScore >= 3.0) return 'Pass';
    if (avgScore >= 2.0) return 'Near Pass';
    return 'Needs Work';
  };

  const taskTypes = ['all', 'speaking', 'listening', 'reading', 'writing'];

  if (loading && attempts.length === 0) {
    return (
      <Background module="yki_read" variant="blue">
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Attempt History</Text>
            <HomeButton navigation={navigation} style={styles.homeButton} homeType="yki" />
          </View>
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#EAF5FF" />
            <Text style={styles.centerText}>Loading history...</Text>
          </View>
        </View>
      </Background>
    );
  }

  return (
    <Background module="yki_read" variant="blue">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Attempt History</Text>
          <HomeButton navigation={navigation} style={styles.homeButton} homeType="yki" />
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          {taskTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterButton,
                (type === 'all' && !selectedTaskType) || (type === selectedTaskType) ? styles.filterButtonActive : null,
              ]}
              onPress={() => setSelectedTaskType(type === 'all' ? null : type)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  (type === 'all' && !selectedTaskType) || (type === selectedTaskType) ? styles.filterButtonTextActive : null,
                ]}
              >
                {type === 'all' ? 'All' : SKILL_LABELS[type] || type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {error && <Text style={styles.errorText}>{error}</Text>}

          {attempts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>No attempts found</Text>
              <Text style={styles.emptySubtext}>
                {selectedTaskType ? `Try a different filter or complete some ${SKILL_LABELS[selectedTaskType]} tasks.` : 'Complete some YKI tasks to see your history here.'}
              </Text>
            </View>
          ) : (
            attempts.map((attempt) => (
              <TouchableOpacity
                key={attempt.id}
                style={styles.attemptCard}
                onPress={() => setSelectedAttempt(selectedAttempt?.id === attempt.id ? null : attempt)}
              >
                <View style={styles.attemptHeader}>
                  <View style={styles.attemptHeaderLeft}>
                    <Text style={styles.attemptIcon}>{SKILL_ICONS[attempt.task_type] || '📝'}</Text>
                    <View>
                      <Text style={styles.attemptSkill}>{SKILL_LABELS[attempt.task_type] || attempt.task_type}</Text>
                      <Text style={styles.attemptDate}>{formatDate(attempt.created_at)}</Text>
                    </View>
                  </View>
                  <View style={[styles.scoreBadge, { backgroundColor: `${getScoreColor(attempt.avg_score)}20`, borderColor: getScoreColor(attempt.avg_score) }]}>
                    <Text style={[styles.scoreValue, { color: getScoreColor(attempt.avg_score) }]}>
                      {attempt.avg_score.toFixed(1)}
                    </Text>
                    <Text style={[styles.scoreLabel, { color: getScoreColor(attempt.avg_score) }]}>
                      {getScoreLabel(attempt.avg_score)}
                    </Text>
                  </View>
                </View>

                <View style={styles.attemptMeta}>
                  <Text style={styles.attemptMetaText}>Level: {attempt.level || 'N/A'}</Text>
                  <Text style={styles.attemptMetaText}>Mode: {attempt.mode === 'exam' ? '📝 Exam' : '🎓 Training'}</Text>
                  {attempt.pass_criteria_met && (
                    <View style={styles.passBadge}>
                      <Text style={styles.passBadgeText}>✓ Passed</Text>
                    </View>
                  )}
                </View>

                {selectedAttempt?.id === attempt.id && (
                  <View style={styles.attemptDetails}>
                    {/* User Response */}
                    {(attempt.transcript || attempt.user_text) && (
                      <View style={styles.detailSection}>
                        <Text style={styles.detailSectionTitle}>Your Response</Text>
                        <Text style={styles.detailText}>{attempt.transcript || attempt.user_text}</Text>
                      </View>
                    )}

                    {/* Scores */}
                    {attempt.score_json && Object.keys(attempt.score_json).length > 0 && (
                      <View style={styles.detailSection}>
                        <Text style={styles.detailSectionTitle}>Scores</Text>
                        {Object.entries(attempt.score_json).map(([key, value]) => (
                          <View key={key} style={styles.scoreRow}>
                            <Text style={styles.scoreKey}>{key.replace(/_/g, ' ')}:</Text>
                            <Text style={styles.scoreValueDetail}>{typeof value === 'number' ? value.toFixed(1) : value}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Feedback */}
                    {attempt.feedback_json && Object.keys(attempt.feedback_json).length > 0 && (
                      <View style={styles.detailSection}>
                        <Text style={styles.detailSectionTitle}>Feedback</Text>
                        {attempt.feedback_json.one_big_win && (
                          <View style={styles.feedbackItem}>
                            <Text style={styles.feedbackLabel}>✓ Win:</Text>
                            <Text style={styles.feedbackText}>{attempt.feedback_json.one_big_win}</Text>
                          </View>
                        )}
                        {attempt.feedback_json.one_fix_now && (
                          <View style={styles.feedbackItem}>
                            <Text style={styles.feedbackLabel}>🔧 Fix:</Text>
                            <Text style={styles.feedbackText}>{attempt.feedback_json.one_fix_now}</Text>
                          </View>
                        )}
                        {attempt.feedback_json.band && (
                          <View style={styles.feedbackItem}>
                            <Text style={styles.feedbackLabel}>📊 Band:</Text>
                            <Text style={styles.feedbackText}>{attempt.feedback_json.band}</Text>
                          </View>
                        )}
                      </View>
                    )}

                    {attempt.time_on_task_seconds && (
                      <Text style={styles.timeText}>Time: {attempt.time_on_task_seconds}s</Text>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(10, 14, 39, 0.78)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.10)',
  },
  backButton: { padding: 8 },
  backButtonText: { color: 'rgba(255,255,255,0.92)', fontSize: 20 },
  headerTitle: { color: 'rgba(255,255,255,0.95)', fontSize: 16, fontWeight: '800', flex: 1, textAlign: 'center' },
  homeButton: { marginLeft: 8 },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(10, 14, 39, 0.50)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.10)',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
  },
  filterButtonActive: {
    backgroundColor: 'rgba(27, 78, 218, 0.30)',
    borderColor: 'rgba(27, 78, 218, 0.60)',
  },
  filterButtonText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '700',
  },
  content: { padding: 16, paddingBottom: 32 },
  center: { padding: 22, alignItems: 'center', gap: 12 },
  centerText: { color: 'rgba(255,255,255,0.78)' },
  errorText: {
    color: '#fecaca',
    textAlign: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtext: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 14,
    textAlign: 'center',
  },
  attemptCard: {
    backgroundColor: 'rgba(16, 22, 40, 0.78)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  attemptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  attemptHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  attemptIcon: { fontSize: 24 },
  attemptSkill: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 16,
    fontWeight: '700',
  },
  attemptDate: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    marginTop: 2,
  },
  scoreBadge: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  attemptMeta: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  attemptMetaText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
  },
  passBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.20)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.40)',
  },
  passBadgeText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '700',
  },
  attemptDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.10)',
  },
  detailSection: {
    marginBottom: 16,
  },
  detailSectionTitle: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  detailText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    lineHeight: 20,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  scoreKey: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    textTransform: 'capitalize',
  },
  scoreValueDetail: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 13,
    fontWeight: '700',
  },
  feedbackItem: {
    marginBottom: 8,
  },
  feedbackLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  feedbackText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    lineHeight: 18,
  },
  timeText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    marginTop: 8,
  },
});



