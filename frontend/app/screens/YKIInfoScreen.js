/**
 * YKIInfoScreen - Information about YKI exam, grading, and official sources
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import Background from '../components/ui/Background';
import HomeButton from '../components/HomeButton';
import { colors as palette } from '../styles/colors';

export default function YKIInfoScreen({ navigation }) {
  const openLink = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.error(`Cannot open URL: ${url}`);
      }
    } catch (error) {
      console.error('Error opening link:', error);
    }
  };

  return (
    <Background module="yki_read" variant="blue">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>About YKI</Text>
          <HomeButton navigation={navigation} style={styles.homeButton} homeType="yki" />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What is YKI?</Text>
            <Text style={styles.sectionText}>
              YKI (Yleinen kielitutkinto) is Finland's national language proficiency test. 
              It assesses your ability to use Finnish in real-world situations across four skills: 
              speaking, listening, reading, and writing.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>The Four YKI Subtests</Text>
            <Text style={styles.sectionText}>
              YKI has four subtests, each graded separately on a scale of 1-6. 
              You receive a separate grade for each subtest (no single overall grade).
            </Text>
            
            {/* Speaking Subtest */}
            <View style={styles.subtestCard}>
              <Text style={styles.subtestTitle}>🎤 Speaking</Text>
              <Text style={styles.subtestDescription}>
                You'll be asked to speak about topics, describe situations, and engage in conversations. 
                Tasks may include:
              </Text>
              <View style={styles.bulletList}>
                <Text style={styles.bullet}>• Describing pictures or situations</Text>
                <Text style={styles.bullet}>• Expressing opinions and giving reasons</Text>
                <Text style={styles.bullet}>• Turn-by-turn conversations</Text>
                <Text style={styles.bullet}>• Roleplay scenarios (booking, complaints, workplace)</Text>
              </View>
              <Text style={styles.subtestGrading}>
                Graded on: Fluency, Flexibility, Coherence, Vocabulary (range & precision), 
                Pronunciation, and Grammar accuracy.
              </Text>
            </View>

            {/* Listening Subtest */}
            <View style={styles.subtestCard}>
              <Text style={styles.subtestTitle}>👂 Listening</Text>
              <Text style={styles.subtestDescription}>
                You'll listen to audio recordings and answer comprehension questions. 
                Tasks test:
              </Text>
              <View style={styles.bulletList}>
                <Text style={styles.bullet}>• Gist understanding (main ideas)</Text>
                <Text style={styles.bullet}>• Detail extraction (who, where, when, why, how)</Text>
                <Text style={styles.bullet}>• Inference (implied meaning)</Text>
                <Text style={styles.bullet}>• Practical information (times, dates, numbers, schedules)</Text>
              </View>
              <Text style={styles.subtestGrading}>
                Question formats: Multiple choice, True/False, Matching, Ordering, Fill-in-the-blank.
              </Text>
            </View>

            {/* Reading Subtest */}
            <View style={styles.subtestCard}>
              <Text style={styles.subtestTitle}>📖 Reading</Text>
              <Text style={styles.subtestDescription}>
                You'll read texts and answer comprehension questions. 
                Skills tested:
              </Text>
              <View style={styles.bulletList}>
                <Text style={styles.bullet}>• Skimming for main ideas</Text>
                <Text style={styles.bullet}>• Scanning for specific details</Text>
                <Text style={styles.bullet}>• Inference and interpretation</Text>
                <Text style={styles.bullet}>• Reference tracking (pronouns, ellipsis)</Text>
              </View>
              <Text style={styles.subtestGrading}>
                Texts cover: Daily life, services, work, news, and informational content.
              </Text>
            </View>

            {/* Writing Subtest */}
            <View style={styles.subtestCard}>
              <Text style={styles.subtestTitle}>✍️ Writing</Text>
              <Text style={styles.subtestDescription}>
                You'll write texts based on prompts. 
                Tasks may include:
              </Text>
              <View style={styles.bulletList}>
                <Text style={styles.bullet}>• Short messages or emails (50-120 words)</Text>
                <Text style={styles.bullet}>• Descriptions and narratives</Text>
                <Text style={styles.bullet}>• Opinion pieces with reasons</Text>
                <Text style={styles.bullet}>• Formal and informal register</Text>
              </View>
              <Text style={styles.subtestGrading}>
                Graded on: Task fulfilment, Coherence, Vocabulary (range & precision), 
                Register control, and Grammar accuracy.
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How YKI is Graded</Text>
            <Text style={styles.sectionText}>
              YKI uses official criteria aligned with CEFR levels. For intermediate level (Level 3-4), 
              each subtest is evaluated using specific rubric buckets:
            </Text>
            <View style={styles.levelList}>
              <View style={styles.levelItem}>
                <Text style={styles.levelNumber}>1-2</Text>
                <Text style={styles.levelDescription}>Basic level (A1-A2)</Text>
              </View>
              <View style={styles.levelItem}>
                <Text style={styles.levelNumber}>3-4</Text>
                <Text style={styles.levelDescription}>Intermediate level (B1-B2) - Most common target</Text>
              </View>
              <View style={styles.levelItem}>
                <Text style={styles.levelNumber}>5-6</Text>
                <Text style={styles.levelDescription}>Advanced level (C1-C2)</Text>
              </View>
            </View>
            <Text style={styles.sectionText}>
              To pass at intermediate level, you need a grade of 3 or 4 in each subtest. 
              There is no single overall grade—each skill is assessed independently.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Grading Criteria</Text>
            <Text style={styles.sectionText}>
              YKI graders evaluate your performance based on official criteria from Opetushallitus 
              (Finnish National Agency for Education). The criteria focus on:
            </Text>
            <View style={styles.criteriaList}>
              <Text style={styles.criteriaItem}>• Fluency and naturalness</Text>
              <Text style={styles.criteriaItem}>• Grammar accuracy</Text>
              <Text style={styles.criteriaItem}>• Vocabulary range and precision</Text>
              <Text style={styles.criteriaItem}>• Coherence and structure</Text>
              <Text style={styles.criteriaItem}>• Task completion</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Official Resources</Text>
            <TouchableOpacity 
              style={styles.linkCard}
              onPress={() => openLink('https://ykitesti.solki.jyu.fi')}
            >
              <Text style={styles.linkTitle}>YKI Test Platform</Text>
              <Text style={styles.linkUrl}>ykitesti.solki.jyu.fi</Text>
              <Text style={styles.linkDescription}>
                Official YKI test platform with practice materials and information
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.linkCard}
              onPress={() => openLink('https://www.oph.fi/fi/koulutus-ja-tutkinnot/yleinen-kielitutkinto')}
            >
              <Text style={styles.linkTitle}>Opetushallitus - YKI</Text>
              <Text style={styles.linkUrl}>oph.fi</Text>
              <Text style={styles.linkDescription}>
                Official information about YKI from the Finnish National Agency for Education
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How This App Helps</Text>
            <Text style={styles.sectionText}>
              This YKI preparation module is designed to:
            </Text>
            <View style={styles.helpList}>
              <Text style={styles.helpItem}>• Train you with performance-based tasks (not just content browsing)</Text>
              <Text style={styles.helpItem}>• Provide adaptive practice that increases in complexity over 3-4 months</Text>
              <Text style={styles.helpItem}>• Give you immediate, actionable feedback aligned to official criteria</Text>
              <Text style={styles.helpItem}>• Track your progress and identify areas that need more practice</Text>
              <Text style={styles.helpItem}>• Prepare you for the time constraints and format of the real exam</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Training vs Exam Mode</Text>
            <Text style={styles.sectionText}>
              <Text style={styles.bold}>Training Mode:</Text> Supportive practice with feedback, retries, and hints. 
              Focus on learning and improvement.
            </Text>
            <Text style={styles.sectionText}>
              <Text style={styles.bold}>Exam Mode:</Text> Simulates the real test with limited help, strict time limits, 
              and no retries. Use this to assess your readiness.
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              This app uses official YKI criteria and research-backed training methods to help you prepare effectively.
            </Text>
          </View>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
  },
  sectionText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  bold: {
    fontWeight: '700',
    color: 'rgba(255,255,255,0.95)',
  },
  levelList: {
    marginVertical: 12,
  },
  levelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingLeft: 8,
  },
  levelNumber: {
    color: '#4ECDC4',
    fontSize: 18,
    fontWeight: '800',
    width: 50,
  },
  levelDescription: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    flex: 1,
  },
  criteriaList: {
    marginTop: 8,
    paddingLeft: 8,
  },
  criteriaItem: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 4,
  },
  linkCard: {
    backgroundColor: 'rgba(16, 22, 40, 0.78)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  linkTitle: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  linkUrl: {
    color: '#4ECDC4',
    fontSize: 14,
    marginBottom: 8,
    textDecorationLine: 'underline',
  },
  linkDescription: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    lineHeight: 20,
  },
  helpList: {
    marginTop: 8,
    paddingLeft: 8,
  },
  helpItem: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 4,
  },
  footer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.10)',
  },
  footerText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  subtestCard: {
    backgroundColor: 'rgba(16, 22, 40, 0.78)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  subtestTitle: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtestDescription: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  bulletList: {
    marginLeft: 8,
    marginBottom: 12,
  },
  bullet: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 4,
  },
  subtestGrading: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    lineHeight: 20,
    fontStyle: 'italic',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.10)',
  },
});

