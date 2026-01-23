/**
 * YKIModeBanner - Reusable component to display training vs exam mode
 * 
 * Shows the current mode consistently across all YKI screens
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function YKIModeBanner({ mode = 'training', style }) {
  const isExamMode = mode === 'exam';
  
  return (
    <View style={[styles.banner, isExamMode && styles.bannerExam, style]}>
      <Text style={[styles.bannerIcon, isExamMode && styles.bannerIconExam]}>
        {isExamMode ? '📝' : '🎓'}
      </Text>
      <View style={styles.bannerTextContainer}>
        <Text style={[styles.bannerTitle, isExamMode && styles.bannerTitleExam]}>
          {isExamMode ? 'Exam Mode' : 'Training Mode'}
        </Text>
        <Text style={[styles.bannerSubtitle, isExamMode && styles.bannerSubtitleExam]}>
          {isExamMode 
            ? 'Limited help, strict time limits, realistic constraints'
            : 'Supportive practice with feedback and retries'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(78, 205, 196, 0.15)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.30)',
    gap: 12,
  },
  bannerExam: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.30)',
  },
  bannerIcon: {
    fontSize: 24,
  },
  bannerIconExam: {
    // Same size, different context
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  bannerTitleExam: {
    color: 'rgba(255,255,255,0.95)',
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    lineHeight: 16,
  },
  bannerSubtitleExam: {
    color: 'rgba(255,255,255,0.75)',
  },
});



