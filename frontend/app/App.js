import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// Premium 2026 Screens
import HomeScreen from './screens/HomeScreen';
import ConversationScreen from './screens/ConversationScreen';
import PronunciationLabScreen from './screens/PronunciationLabScreen';
import PathSelectionScreen from './screens/PathSelectionScreen';
import SkillTreeScreen from './screens/SkillTreeScreen';
import CertificateListScreen from './screens/CertificateListScreen';
import CertificateDetailScreen from './screens/CertificateDetailScreen';
import TeacherDashboardScreen from './screens/TeacherDashboardScreen';
import SettingsScreen from './screens/SettingsScreen';

// Legacy screens (kept for backward compatibility)
import LessonScreen from './screens/LessonScreen';
import YKIScreen from './screens/YKIScreen';
import ProgressScreen from './screens/ProgressScreen';
import PronunciationScreen from './screens/PronunciationScreen';
import WorkplaceScreen from './screens/WorkplaceScreen';
import ProfessionDetailScreen from './screens/ProfessionDetailScreen';
import VocabularyScreen from './screens/VocabularyScreen';
import RoleplayScreen from './screens/RoleplayScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import YKISpeakingExamScreen from './screens/YKISpeakingExamScreen';
import YKIWritingExamScreen from './screens/YKIWritingExamScreen';
import RechargeScreen from './screens/RechargeScreen';
import MicroOutputScreen from './screens/MicroOutputScreen';
import ShadowingScreen from './screens/ShadowingScreen';
import SubscriptionScreen from './screens/SubscriptionScreen';
import NotificationSettingsScreen from './screens/NotificationSettingsScreen';
import { PathProvider } from './context/PathContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const Stack = createNativeStackNavigator();

function Navigation() {
  const { colors, isDark } = useTheme();
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // Show loading screen while checking auth
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <PathProvider>
      <NavigationContainer
        theme={{
          dark: isDark,
          colors: {
            primary: colors.primary,
            background: colors.background,
            card: colors.surface,
            text: colors.text,
            border: colors.border,
            notification: colors.primary,
          },
        }}
      >
        <Stack.Navigator
          initialRouteName={isAuthenticated ? "Home" : "Login"}
          screenOptions={{
            headerShown: false,
          }}
        >
          {/* Auth Screens */}
          {!isAuthenticated && (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </>
          )}

          {/* Onboarding */}
          {isAuthenticated && (
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          )}

          {/* Premium 2026 Screens */}
          {isAuthenticated && (
            <>
              <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Conversation" component={ConversationScreen} />
          <Stack.Screen name="PronunciationLab" component={PronunciationLabScreen} />
          <Stack.Screen name="PathSelection" component={PathSelectionScreen} />
          <Stack.Screen name="SkillTree" component={SkillTreeScreen} />
          <Stack.Screen name="Certificates" component={CertificateListScreen} />
          <Stack.Screen name="CertificateDetail" component={CertificateDetailScreen} />
          <Stack.Screen name="TeacherDashboard" component={TeacherDashboardScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          
          {/* Legacy Screens */}
          <Stack.Screen name="Lessons" component={LessonScreen} />
          <Stack.Screen name="Roleplay" component={RoleplayScreen} />
          <Stack.Screen name="YKI" component={YKIScreen} />
          <Stack.Screen name="Progress" component={ProgressScreen} />
          <Stack.Screen name="Recharge" component={RechargeScreen} />
          <Stack.Screen name="MicroOutput" component={MicroOutputScreen} />
          <Stack.Screen name="Shadowing" component={ShadowingScreen} />
          <Stack.Screen name="Subscription" component={SubscriptionScreen} />
          <Stack.Screen name="Notifications" component={NotificationSettingsScreen} />
          <Stack.Screen name="Pronunciation" component={PronunciationScreen} />
          <Stack.Screen name="Workplace" component={WorkplaceScreen} />
          <Stack.Screen name="ProfessionDetail" component={ProfessionDetailScreen} />
          <Stack.Screen name="Vocabulary" component={VocabularyScreen} />
          <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
          <Stack.Screen name="YKISpeakingExam" component={YKISpeakingExamScreen} />
          <Stack.Screen name="YKIWritingExam" component={YKIWritingExamScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PathProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
});

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <Navigation />
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
