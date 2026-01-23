/**
 * YKIProgressScreen - Progress overview with per-skill distance-to-YKI-3 display
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Background from '../components/ui/Background';
import HomeButton from '../components/HomeButton';
import { colors as palette } from '../styles/colors';
import { getYkiLearnerState, getYkiProgress, checkYkiCalibration } from '../utils/api';

export default function YKIProgressScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState(null);
  const [progress, setProgress] = useState(null);
  const [calibrationStatus, setCalibrationStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    setLoading(true);
    setError(null);
    try {
      const [stateData, progressData, calibrationData] = await Promise.all([
        getYkiLearnerState(),
        getYkiProgress(),
        checkYkiCalibration().catch(() => null), // Don't fail if calibration check fails
      ]);
      setState(stateData);
      setProgress(progressData);
      setCalibrationStatus(calibrationData?.calibration);
    } catch (e) {
      setError(e?.message || 'Failed to load progress. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateDistanceToYki3 = (skillState) => {
    if (!skillState || typeof skillState !== 'object') return null;
    
    // Extract average score from last scores
    const lastScores = skillState.last_scores || {};
    const scores = Object.values(lastScores).filter(v => typeof v === 'number');
    if (scores.length === 0) return null;
    
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const distance = Math.max(0, 3.0 - avgScore); // YKI Level 3 = 3.0 on 0-4 scale
    return distance;
  };

  const getDistanceColor = (distance) => {
    if (distance === null) return 'rgba(255,255,255,0.5)';
    if (distance <= 0.5) return '#10b981'; // Green - close
    if (distance <= 1.0) return '#f59e0b'; // Yellow - moderate
    return '#ef4444'; // Red - far
  };

  const getDistanceLabel = (distance) => {
    if (distance === null) return 'No data yet';
    if (distance <= 0.0) return 'At or above Level 3';
    if (distance <= 0.5) return 'Very close';
    if (distance <= 1.0) return 'Getting close';
    if (distance <= 1.5) return 'Moderate distance';
    return 'Needs significant work';
  };

  if (loading) {
    return (
      <Background module="yki_read" variant="blue">
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>YKI Progress</Text>
            <HomeButton navigation={navigation} style={styles.homeButton} homeType="yki" />
          </View>
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#EAF5FF" />
            <Text style={styles.centerText}>Loading progress...</Text>
          </View>
        </View>
      </Background>
    );
  }

  const skills = ['speaking', 'listening', 'reading', 'writing'];
  const skillLabels = {
    speaking: 'Speaking',
    listening: 'Listening',
    reading: 'Reading',
    writing: 'Writing',
  };

  return (
    <Background module="yki_read" variant="blue">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>YKI Progress</Text>
          <HomeButton navigation={navigation} style={styles.homeButton} homeType="yki" />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Overall Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Status</Text>
            <View style={styles.statusCard}>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Target Level</Text>
                <Text style={styles.statusValue}>{state?.target_level_band || 'Not set'}</Text>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Current Level</Text>
                <Text style={styles.statusValue}>{state?.current_level || 'Not assessed'}</Text>
              </View>
              {state?.goal_date && (
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Target Date</Text>
                  <Text style={styles.statusValue}>{state.goal_date}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Per-Skill Distance to YKI Level 3 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Distance to YKI Level 3</Text>
            <Text style={styles.sectionDescription}>
              This shows how close you are to YKI Level 3 (intermediate pass) for each skill.
              Lower is better—0.0 means you're at or above Level 3.
            </Text>
            {skills.map((skill) => {
              const skillState = state?.[`${skill}_state`] || {};
              const distance = calculateDistanceToYki3(skillState);
              const color = getDistanceColor(distance);
              const label = getDistanceLabel(distance);
              
              return (
                <View key={skill} style={styles.skillCard}>
                  <View style={styles.skillHeader}>
                    <Text style={styles.skillName}>{skillLabels[skill]}</Text>
                    <View style={[styles.distanceBadge, { backgroundColor: `${color}20`, borderColor: color }]}>
                      <Text style={[styles.distanceValue, { color }]}>
                        {distance !== null ? distance.toFixed(1) : '—'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.distanceLabel}>{label}</Text>
                  {skillState.completed_tasks > 0 && (
                    <Text style={styles.skillStats}>
                      {skillState.completed_tasks} tasks completed
                    </Text>
                  )}
                </View>
              );
            })}
          </View>

          {/* Recent Activity */}
          {progress && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                <TouchableOpacity onPress={() => navigation.navigate('YKIAttemptHistory')}>
                  <Text style={styles.viewAllLink}>View History →</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.activityCard}>
                <View style={styles.activityRow}>
                  <Text style={styles.activityLabel}>Total sessions</Text>
                  <Text style={styles.activityValue}>{progress.total_sessions || 0}</Text>
                </View>
                <View style={styles.activityRow}>
                  <Text style={styles.activityLabel}>Total attempts</Text>
                  <Text style={styles.activityValue}>{progress.total_attempts || 0}</Text>
                </View>
                <View style={styles.activityRow}>
                  <Text style={styles.activityLabel}>Last active</Text>
                  <Text style={styles.activityValue}>
                    {progress.last_active ? new Date(progress.last_active).toLocaleDateString() : 'Never'}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Calibration Check */}
          {calibrationStatus && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Level Calibration</Text>
              {calibrationStatus.calibration_needed ? (
                <View style={[styles.calibrationCard, styles.calibrationCardNeeded]}>
                  <Text style={styles.calibrationTitle}>🔄 Recalibration Recommended</Text>
                  <Text style={styles.calibrationText}>{calibrationStatus.reason}</Text>
                  {calibrationStatus.days_since_last && (
                    <Text style={styles.calibrationMeta}>
                      Last assessment: {calibrationStatus.days_since_last} days ago
                    </Text>
                  )}
                  {calibrationStatus.attempts_since_last && (
                    <Text style={styles.calibrationMeta}>
                      Attempts since: {calibrationStatus.attempts_since_last}
                    </Text>
                  )}
                  <TouchableOpacity
                    style={styles.calibrationButton}
                    onPress={() => navigation.navigate('YKIPlacement')}
                  >
                    <Text style={styles.calibrationButtonText}>Take Level Assessment</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.calibrationCard}>
                  <Text style={styles.calibrationText}>
                    Your level is up to date. Periodic reassessments happen every 30 days or after 50+ attempts.
                  </Text>
                  {calibrationStatus.last_calibration_at && (
                    <Text style={styles.calibrationMeta}>
                      Last assessment: {new Date(calibrationStatus.last_calibration_at).toLocaleDateString()}
                    </Text>
                  )}
                  <TouchableOpacity
                    style={[styles.calibrationButton, styles.calibrationButtonSecondary]}
                    onPress={() => navigation.navigate('YKIPlacement')}
                  >
                    <Text style={[styles.calibrationButtonText, styles.calibrationButtonTextSecondary]}>
                      Retake Assessment
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* Recommendations */}
          {state?.recommended_next_action && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What's Next</Text>
              <View style={styles.recommendationCard}>
                <Text style={styles.recommendationText}>
                  {state.recommended_next_action === 'continue_daily_session'
                    ? 'Continue with today\'s daily session to keep building your skills.'
                    : state.recommended_next_action === 'take_placement'
                    ? 'Take the placement diagnostic to assess your current level.'
                    : 'Keep practicing regularly to reach your YKI goal.'}
                </Text>
              </View>
            </View>
          )}

          {/* Attempt History Link */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.historyCard}
              onPress={() => navigation.navigate('YKIAttemptHistory')}
            >
              <Text style={styles.historyIcon}>📋</Text>
              <View style={styles.historyContent}>
                <Text style={styles.historyTitle}>View Attempt History</Text>
                <Text style={styles.historySubtitle}>
                  Review your past attempts, see detailed feedback, and track improvement over time
                </Text>
              </View>
              <Text style={styles.historyArrow}>→</Text>
            </TouchableOpacity>
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}
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
  content: { padding: 16, paddingBottom: 32 },
  center: { padding: 22, alignItems: 'center', gap: 12 },
  centerText: { color: 'rgba(255,255,255,0.78)' },
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 20,
    fontWeight: '800',
  },
  viewAllLink: {
    color: '#4ECDC4',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionDescription: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  statusCard: {
    backgroundColor: 'rgba(16, 22, 40, 0.78)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
  },
  statusValue: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 14,
    fontWeight: '700',
  },
  skillCard: {
    backgroundColor: 'rgba(16, 22, 40, 0.78)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  skillName: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 16,
    fontWeight: '700',
  },
  distanceBadge: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  distanceValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  distanceLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    marginBottom: 4,
  },
  skillStats: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    marginTop: 4,
  },
  activityCard: {
    backgroundColor: 'rgba(16, 22, 40, 0.78)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  activityLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
  },
  activityValue: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 14,
    fontWeight: '700',
  },
  recommendationCard: {
    backgroundColor: 'rgba(27, 78, 218, 0.14)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(27, 78, 218, 0.30)',
  },
  recommendationText: {
    color: 'rgba(255,255,255,0.90)',
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    color: '#fecaca',
    textAlign: 'center',
    marginTop: 16,
  },
  calibrationCard: {
    backgroundColor: 'rgba(27, 78, 218, 0.14)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(27, 78, 218, 0.30)',
  },
  calibrationCardNeeded: {
    backgroundColor: 'rgba(245, 158, 11, 0.14)',
    borderColor: 'rgba(245, 158, 11, 0.30)',
  },
  calibrationTitle: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  calibrationText: {
    color: 'rgba(255,255,255,0.90)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  calibrationMeta: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    marginBottom: 4,
  },
  calibrationButton: {
    backgroundColor: 'rgba(27, 78, 218, 0.30)',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  calibrationButtonSecondary: {
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  calibrationButtonText: {
    color: '#4ECDC4',
    fontSize: 14,
    fontWeight: '700',
  },
  calibrationButtonTextSecondary: {
    color: 'rgba(255,255,255,0.85)',
  },
});

