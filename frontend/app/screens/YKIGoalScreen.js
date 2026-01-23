/**
 * YKIGoalScreen - Goal setting wizard for YKI target date and weekly plan
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Background from '../components/ui/Background';
import HomeButton from '../components/HomeButton';
import PremiumEmbossedButton from '../components/PremiumEmbossedButton';
import { colors as palette } from '../styles/colors';
import { getYkiLearnerState, setYkiGoal } from '../utils/api';

const LEVEL_BANDS = [
  { key: 'A1-A2', label: 'A1-A2', description: 'Basic level' },
  { key: 'B1-B2', label: 'B1-B2', description: 'Intermediate (YKI Level 3-4)' },
  { key: 'C1-C2', label: 'C1-C2', description: 'Advanced level' },
];

export default function YKIGoalScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [targetBand, setTargetBand] = useState('B1-B2');
  const [targetDate, setTargetDate] = useState('');
  const [weeklyPlan, setWeeklyPlan] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCurrentGoal();
  }, []);

  const loadCurrentGoal = async () => {
    setLoading(true);
    try {
      const state = await getYkiLearnerState();
      if (state?.target_level_band) {
        setTargetBand(state.target_level_band);
      }
      if (state?.goal_date) {
        setTargetDate(state.goal_date);
      }
      if (state?.weekly_plan) {
        setWeeklyPlan(state.weekly_plan);
      }
    } catch (e) {
      console.error('Failed to load goal:', e);
    } finally {
      setLoading(false);
    }
  };

  const calculateWeeklyPlan = (band, date) => {
    if (!date) return null;
    
    const target = new Date(date);
    const today = new Date();
    const weeksUntilTarget = Math.ceil((target - today) / (1000 * 60 * 60 * 24 * 7));
    
    if (weeksUntilTarget < 1) {
      return {
        weeks: 0,
        message: 'Target date is too soon. Please select a date at least 1 week away.',
      };
    }
    
    const sessionsPerWeek = Math.max(3, Math.min(5, Math.ceil(12 / weeksUntilTarget)));
    const tasksPerSession = 3;
    
    return {
      weeks: weeksUntilTarget,
      sessions_per_week: sessionsPerWeek,
      tasks_per_session: tasksPerSession,
      estimated_total_sessions: weeksUntilTarget * sessionsPerWeek,
      message: `You'll practice ${sessionsPerWeek} times per week with ${tasksPerSession} tasks per session.`,
    };
  };

  const handleDateChange = (date) => {
    setTargetDate(date);
    const plan = calculateWeeklyPlan(targetBand, date);
    setWeeklyPlan(plan);
  };

  const handleSave = async () => {
    if (!targetDate) {
      Alert.alert('Select a date', 'Please choose your target exam date.');
      return;
    }
    
    const plan = calculateWeeklyPlan(targetBand, targetDate);
    if (plan?.weeks < 1) {
      Alert.alert('Invalid date', plan.message);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await setYkiGoal(targetBand, targetDate, plan);
      Alert.alert(
        'Goal saved',
        'Your YKI goal and training plan have been saved. The system will now generate daily sessions based on this plan.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('YKI'),
          },
        ]
      );
    } catch (e) {
      setError(e?.message || 'Failed to save goal. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Simple date picker (in production, use a proper date picker component)
  const showDatePicker = () => {
    Alert.prompt(
      'Target Exam Date',
      'Enter date in YYYY-MM-DD format (e.g., 2025-06-15)',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'OK',
          onPress: (date) => {
            if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
              handleDateChange(date);
            } else {
              Alert.alert('Invalid format', 'Please use YYYY-MM-DD format.');
            }
          },
        },
      ],
      'plain-text',
      targetDate
    );
  };

  if (loading) {
    return (
      <Background module="yki_read" variant="blue">
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Set Your YKI Goal</Text>
            <HomeButton navigation={navigation} style={styles.homeButton} homeType="yki" />
          </View>
          <View style={styles.center}>
            <Text style={styles.centerText}>Loading...</Text>
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
          <Text style={styles.headerTitle}>Set Your YKI Goal</Text>
          <HomeButton navigation={navigation} style={styles.homeButton} homeType="yki" />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Target Level Band</Text>
            <Text style={styles.sectionDescription}>
              Choose the level you're aiming for. Most people target B1-B2 (YKI Level 3-4).
            </Text>
            <View style={styles.bandList}>
              {LEVEL_BANDS.map((band) => (
                <TouchableOpacity
                  key={band.key}
                  style={[
                    styles.bandCard,
                    targetBand === band.key && styles.bandCardActive,
                  ]}
                  onPress={() => {
                    setTargetBand(band.key);
                    if (targetDate) {
                      const plan = calculateWeeklyPlan(band.key, targetDate);
                      setWeeklyPlan(plan);
                    }
                  }}
                >
                  <Text style={[
                    styles.bandLabel,
                    targetBand === band.key && styles.bandLabelActive,
                  ]}>
                    {band.label}
                  </Text>
                  <Text style={[
                    styles.bandDescription,
                    targetBand === band.key && styles.bandDescriptionActive,
                  ]}>
                    {band.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Target Exam Date</Text>
            <Text style={styles.sectionDescription}>
              When do you plan to take the YKI exam? We'll create a training plan to get you ready by this date.
            </Text>
            <TouchableOpacity style={styles.dateCard} onPress={showDatePicker}>
              <Text style={styles.dateLabel}>Target Date</Text>
              <Text style={styles.dateValue}>
                {targetDate || 'Tap to select date (YYYY-MM-DD)'}
              </Text>
            </TouchableOpacity>
          </View>

          {weeklyPlan && weeklyPlan.weeks > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Weekly Plan</Text>
              <View style={styles.planCard}>
                <View style={styles.planRow}>
                  <Text style={styles.planLabel}>Weeks until exam</Text>
                  <Text style={styles.planValue}>{weeklyPlan.weeks}</Text>
                </View>
                <View style={styles.planRow}>
                  <Text style={styles.planLabel}>Sessions per week</Text>
                  <Text style={styles.planValue}>{weeklyPlan.sessions_per_week}</Text>
                </View>
                <View style={styles.planRow}>
                  <Text style={styles.planLabel}>Tasks per session</Text>
                  <Text style={styles.planValue}>{weeklyPlan.tasks_per_session}</Text>
                </View>
                <View style={styles.planRow}>
                  <Text style={styles.planLabel}>Total sessions</Text>
                  <Text style={styles.planValue}>{weeklyPlan.estimated_total_sessions}</Text>
                </View>
                <Text style={styles.planMessage}>{weeklyPlan.message}</Text>
              </View>
            </View>
          )}

          {error && <Text style={styles.errorText}>{error}</Text>}

          <PremiumEmbossedButton
            title={saving ? 'Saving...' : 'Save Goal & Start Training'}
            onPress={handleSave}
            disabled={saving || !targetDate}
            variant="primary"
            size="large"
            style={styles.saveButton}
          />
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
  center: { padding: 22, alignItems: 'center' },
  centerText: { color: 'rgba(255,255,255,0.78)' },
  section: { marginBottom: 24 },
  sectionTitle: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  sectionDescription: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  bandList: { gap: 12 },
  bandCard: {
    backgroundColor: 'rgba(16, 22, 40, 0.78)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  bandCardActive: {
    backgroundColor: 'rgba(27, 78, 218, 0.20)',
    borderColor: '#1B4EDA',
  },
  bandLabel: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  bandLabelActive: {
    color: '#4ECDC4',
  },
  bandDescription: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
  },
  bandDescriptionActive: {
    color: 'rgba(255,255,255,0.90)',
  },
  dateCard: {
    backgroundColor: 'rgba(16, 22, 40, 0.78)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  dateLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    marginBottom: 6,
  },
  dateValue: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 16,
    fontWeight: '700',
  },
  planCard: {
    backgroundColor: 'rgba(16, 22, 40, 0.78)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.30)',
  },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  planLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
  },
  planValue: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: '700',
  },
  planMessage: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.10)',
  },
  errorText: {
    color: '#fecaca',
    textAlign: 'center',
    marginBottom: 16,
  },
  saveButton: {
    width: '100%',
    marginTop: 8,
  },
});



