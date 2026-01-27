/**
 * HomeScreen - Personalized based on intent_type
 * 
 * Routes directly to:
 * - YKI dashboard (if intent_type === 'YKI')
 * - Profession dashboard (if intent_type === 'PROFESSIONAL')
 * - Daily practice dashboard (if intent_type === 'DAILY')
 * 
 * Shows welcome content with sidebar instructions and user progress when no intent_type.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Background from '../components/ui/Background';
import { useAuth } from '../context/AuthContext';
import { getCurrentUser } from '../services/authService';
import StreakFlame from '../components/StreakFlame';
import XPBadge from '../components/XPBadge';
import { useXPStore } from '../state/useXPStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';

const RECHARGE_STORAGE_KEY = '@recharge_state';

export default function HomeScreen({ navigation }) {
  const { token, isAuthenticated, user } = useAuth();
  const { xp, streak } = useXPStore();
  const [loading, setLoading] = useState(true);
  const [intentType, setIntentType] = useState(null);
  const [userStreak, setUserStreak] = useState(0);
  const [userXP, setUserXP] = useState(0);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!isAuthenticated || !token) {
        setLoading(false);
        return;
      }

      try {
        const userData = await getCurrentUser(token);
        const intent = userData?.intent_type || userData?.profile?.intent_type;
        setIntentType(intent);

        // Route based on intent_type
        if (intent === 'YKI') {
          navigation?.replace('YKIPlan');
          return;
        } else if (intent === 'PROFESSIONAL') {
          navigation?.replace('WorkPlan');
          return;
        } else if (intent === 'DAILY') {
          // For daily users, show practice options
          navigation?.replace('YKIPlan'); // Fallback for now
          return;
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [isAuthenticated, token, navigation]);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const raw = await AsyncStorage.getItem(RECHARGE_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.date === new Date().toDateString()) {
            setUserStreak(Number(parsed.streak || 0));
            setUserXP(Number(parsed.xp_today || 0));
          }
        }
      } catch (e) {
        // ignore
      }
    };
    loadProgress();
  }, []);

  if (loading) {
    return (
      <Background module="home" variant="brown" imageVariant="home">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7dd3fc" />
        </View>
      </Background>
    );
  }

  // Welcome screen with instructions and progress
  return (
    <Background module="home" variant="brown" imageVariant="home">
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Tervetuloa</Text>
          
          {/* Sidebar Instructions */}
          <View style={styles.instructionCard}>
            <View style={styles.instructionHeader}>
              <Ionicons name="menu-outline" size={24} color="#7dd3fc" />
              <Text style={styles.instructionTitle}>Navigointi</Text>
            </View>
            <Text style={styles.instructionText}>
              Avaa valikko vasemmasta reunasta navigoidaksesi sovelluksessa. Valikosta löydät kaikki sivut ja asetukset.
            </Text>
            <TouchableOpacity
              style={styles.openDrawerButton}
              onPress={() => navigation?.openDrawer?.()}
              activeOpacity={0.7}
            >
              <Ionicons name="menu" size={20} color="#f8fafc" />
              <Text style={styles.openDrawerText}>Avaa valikko</Text>
            </TouchableOpacity>
          </View>

          {/* User Progress */}
          <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>Edistymisesi</Text>
            <View style={styles.progressRow}>
              <View style={styles.progressItem}>
                <StreakFlame streakCount={userStreak || streak} />
              </View>
              <View style={styles.progressItem}>
                <XPBadge xp={userXP || xp} />
              </View>
            </View>
          </View>
        </View>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.l,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing['2xl'],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.titleXL,
    color: '#f8fafc',
    marginBottom: spacing['2xl'],
    textAlign: 'center',
  },
  instructionCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 16,
    padding: spacing.l,
    marginBottom: spacing.l,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.35)',
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    marginBottom: spacing.m,
  },
  instructionTitle: {
    ...typography.h3,
    color: '#e2e8f0',
  },
  instructionText: {
    ...typography.body,
    color: '#cbd5e1',
    marginBottom: spacing.m,
    lineHeight: 20,
  },
  openDrawerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(125, 211, 252, 0.15)',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: 12,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(125, 211, 252, 0.3)',
  },
  openDrawerText: {
    ...typography.body,
    color: '#f8fafc',
    fontWeight: '600',
  },
  progressCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 16,
    padding: spacing.l,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.35)',
  },
  progressTitle: {
    ...typography.h3,
    color: '#e2e8f0',
    marginBottom: spacing.m,
  },
  progressRow: {
    flexDirection: 'row',
    gap: spacing.m,
    alignItems: 'center',
  },
  progressItem: {
    flex: 1,
  },
});
