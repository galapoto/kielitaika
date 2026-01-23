// PracticeScreen - Practice mode screen using combination of all designs
import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function PracticeScreen({ navigation }) {
  // Practice options - Card grid from 2nd picture
  const practiceOptions = [
    { id: 'vocabulary', icon: '📚', label: 'Vocabulary', color: '#E91E63' },
    { id: 'grammar', icon: '📝', label: 'Grammar', color: '#4A90E2' },
    { id: 'speaking', icon: '🎤', label: 'Speaking', color: '#22C55E' },
    { id: 'listening', icon: '👂', label: 'Listening', color: '#FF9800' },
    { id: 'reading', icon: '📖', label: 'Reading', color: '#9C27B0' },
    { id: 'writing', icon: '✍️', label: 'Writing', color: '#2196F3' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4A148C', '#1A237E', '#0D47A1']} // Dark purple gradient from 4th/5th pictures
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Header - From 4th picture (Quiz design) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Practice Mode</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Practice Options Grid - From 2nd picture (3x2 grid) */}
        <View style={styles.optionsGrid}>
          {practiceOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.practiceCard}
              onPress={() => {
                if (option.id === 'vocabulary') navigation?.navigate('Vocabulary');
                else if (option.id === 'grammar') navigation?.navigate('GrammarLab');
                else if (option.id === 'speaking') navigation?.navigate('Conversation');
              }}
            >
              <Text style={styles.cardIcon}>{option.icon}</Text>
              <Text style={styles.cardLabel}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Practice Schedule - From 3rd picture */}
        <View style={styles.scheduleSection}>
          <View style={styles.scheduleHeader}>
            <Text style={styles.scheduleTitle}>PRACTICE SCHEDULE</Text>
          </View>

          <View style={styles.scheduleCard}>
            <View style={styles.timeAxis}>
              {['9:00', '11:00', '14:00'].map((time) => (
                <View key={time} style={styles.timeMarker}>
                  <Text style={styles.timeText}>{time}</Text>
                </View>
              ))}
            </View>

            <View style={styles.practiceList}>
              <View style={styles.practiceItem}>
                <View style={styles.practiceContent}>
                  <Text style={styles.practiceTitle}>Vocabulary Practice</Text>
                  <Text style={styles.practiceSubtitle}>20 words completed</Text>
                </View>
                <Text style={styles.statusIcon}>✓</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A148C',
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
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  practiceCard: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#1A0B2E',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  scheduleSection: {
    marginTop: 8,
  },
  scheduleHeader: {
    marginBottom: 16,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scheduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    minHeight: 200,
    flexDirection: 'row',
  },
  timeAxis: {
    width: 60,
    marginRight: 16,
  },
  timeMarker: {
    marginBottom: 40,
  },
  timeText: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  practiceList: {
    flex: 1,
  },
  practiceItem: {
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
  practiceContent: {
    flex: 1,
  },
  practiceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  practiceSubtitle: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
  },
  statusIcon: {
    fontSize: 18,
    color: '#22C55E',
  },
});
