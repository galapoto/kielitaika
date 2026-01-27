/**
 * AppNavigator - Top-level navigation that handles onboarding vs main app
 * 
 * Flow:
 * - If not authenticated → AuthCheck → Login/Register
 * - If authenticated but onboarding not completed → Onboarding flow
 * - If authenticated and onboarding completed → Main app (RootNavigator)
 */

import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { getCurrentUser } from '../services/authService';
import RootNavigator from './RootNavigator';
import WelcomeScreen from '../screens/WelcomeScreen';
import IntentQuizScreen from '../screens/IntentQuizScreen';
import PlanSelectionScreen from '../screens/PlanSelectionScreen';
import ProfessionSelectionScreen from '../screens/ProfessionSelectionScreen';
import PracticeFrequencyScreen from '../screens/PracticeFrequencyScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

const LoadingScreen = () => (
  <View style={loadingStyles.container}>
    <ActivityIndicator size="large" color="#7dd3fc" />
  </View>
);

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
});

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, loading, token, user } = useAuth();
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  // Debug logging
  useEffect(() => {
    console.log('AppNavigator state:', { isAuthenticated, loading, checkingOnboarding, onboardingCompleted, hasToken: !!token, userId: user?.id });
  }, [isAuthenticated, loading, checkingOnboarding, onboardingCompleted, token, user]);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!isAuthenticated || !token) {
        setOnboardingCompleted(null);
        setCheckingOnboarding(false);
        return;
      }

      try {
        const userData = await getCurrentUser(token);
        console.log('AppNavigator: User data from /auth/me:', userData);
        // Check if user profile has onboarding_completed flag
        // If not present, assume existing users have completed onboarding
        const completed = userData?.onboarding_completed === true 
          || userData?.profile?.onboarding_completed === true
          || userData?.onboarding_completed === undefined; // Default to true for existing users
        console.log('AppNavigator: Onboarding completed status:', completed);
        setOnboardingCompleted(completed);
      } catch (error) {
        console.error('Failed to check onboarding status:', error);
        // For returning authenticated users, default to completed onboarding
        // This allows them to access the app even if the check fails
        setOnboardingCompleted(true);
      } finally {
        setCheckingOnboarding(false);
      }
    };

    checkOnboardingStatus();
  }, [isAuthenticated, token]);

  // Show loading screen while checking auth/onboarding status
  if (loading || checkingOnboarding) {
    // Return a minimal loading state - don't return null as it causes blank screen
    // Use key to force re-render when auth state changes
    return (
      <Stack.Navigator key="loading" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Loading" component={LoadingScreen} />
      </Stack.Navigator>
    );
  }

  // Not authenticated - show auth screens
  if (!isAuthenticated) {
    return (
      <Stack.Navigator key="auth" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="IntentQuiz" component={IntentQuizScreen} />
        <Stack.Screen name="PlanSelection" component={PlanSelectionScreen} />
        <Stack.Screen name="ProfessionSelection" component={ProfessionSelectionScreen} />
        <Stack.Screen name="Auth" component={RegisterScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="PracticeFrequency" component={PracticeFrequencyScreen} />
      </Stack.Navigator>
    );
  }

  // Authenticated but onboarding not completed - show onboarding flow
  if (!onboardingCompleted) {
    return (
      <Stack.Navigator key="onboarding" screenOptions={{ headerShown: false }} initialRouteName="Welcome">
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="IntentQuiz" component={IntentQuizScreen} />
        <Stack.Screen name="PlanSelection" component={PlanSelectionScreen} />
        <Stack.Screen name="ProfessionSelection" component={ProfessionSelectionScreen} />
        <Stack.Screen name="Auth" component={RegisterScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="PracticeFrequency" component={PracticeFrequencyScreen} />
        <Stack.Screen name="MainApp" component={RootNavigator} />
      </Stack.Navigator>
    );
  }

  // Authenticated and onboarding completed - show main app
  // Wrap in Stack to allow navigation from onboarding flow
  // Use key to force re-render when transitioning from auth to authenticated
  return (
    <Stack.Navigator key="main" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainApp" component={RootNavigator} />
      <Stack.Screen name="Home" component={RootNavigator} />
    </Stack.Navigator>
  );
}
