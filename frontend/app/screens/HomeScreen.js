/**
 * HomeScreen - Personalized based on intent_type
 * 
 * Routes directly to:
 * - YKI dashboard (if intent_type === 'YKI')
 * - Profession dashboard (if intent_type === 'PROFESSIONAL')
 * - Daily practice dashboard (if intent_type === 'DAILY')
 * 
 * No generic home.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Background from '../components/ui/Background';
import { useAuth } from '../context/AuthContext';
import { getCurrentUser } from '../services/authService';

export default function HomeScreen({ navigation }) {
  const { token, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [intentType, setIntentType] = useState(null);

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
        } else if (intent === 'PROFESSIONAL') {
          navigation?.replace('WorkPlan');
        } else if (intent === 'DAILY') {
          // For daily users, show practice options
          // For now, route to a practice screen or show practice dashboard
          // This can be customized based on available screens
          navigation?.replace('YKIPlan'); // Fallback for now
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [isAuthenticated, token, navigation]);

  if (loading) {
    return (
      <Background module="home" variant="brown" imageVariant="home">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7dd3fc" />
        </View>
      </Background>
    );
  }

  // Fallback if intent_type is not available
  return (
    <Background module="home" variant="brown" imageVariant="home">
      <View style={styles.container}>
        <Text style={styles.title}>Tervetuloa</Text>
        <Text style={styles.subtitle}>Ladataan henkilökohtaista kokemusta...</Text>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#cbd5f5',
  },
});
