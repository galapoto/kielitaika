import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import RechargeScreen from '../screens/RechargeScreen';
import VocabScreen from '../screens/VocabScreen';
import GrammarBiteScreen from '../screens/GrammarBiteScreen';
import MiniChallengeScreen from '../screens/MiniChallengeScreen';
import ConversationScreen from '../screens/ConversationScreen';
import StreakRewardScreen from '../screens/StreakRewardScreen';
import ProfessionDetailScreen from '../screens/ProfessionDetailScreen';
import YKISpeakingExamScreen from '../screens/YKISpeakingExamScreen';
import YKIWritingExamScreen from '../screens/YKIWritingExamScreen';
import LessonScreen from '../screens/LessonScreen';
import LessonDetailScreen from '../screens/LessonDetailScreen';
import RoleplayScreen from '../screens/RoleplayScreen';
import YKIScreen from '../screens/YKIScreen';
import MicroOutputScreen from '../screens/MicroOutputScreen';
import ShadowingScreen from '../screens/ShadowingScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import PronunciationScreen from '../screens/PronunciationScreen';
import VocabularyScreen from '../screens/VocabularyScreen';
import PaywallScreen from '../screens/PaywallScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import TeacherDashboardScreen from '../screens/TeacherDashboardScreen';
import PersonalizedPlanScreen from '../screens/PersonalizedPlanScreen';
import OrbGardenScreen from '../screens/OrbGardenScreen';
import SkillTreeScreen from '../screens/SkillTreeScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

const Stack = createNativeStackNavigator();

export default function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="Lessons" component={LessonScreen} />
      <Stack.Screen name="LessonDetail" component={LessonDetailScreen} />
      <Stack.Screen name="Roleplay" component={RoleplayScreen} />
      <Stack.Screen name="YKI" component={YKIScreen} />
      <Stack.Screen name="MicroOutput" component={MicroOutputScreen} />
      <Stack.Screen name="Shadowing" component={ShadowingScreen} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} />
      <Stack.Screen name="Notifications" component={NotificationSettingsScreen} />
      <Stack.Screen name="Pronunciation" component={PronunciationScreen} />
      <Stack.Screen name="Vocabulary" component={VocabularyScreen} />
      <Stack.Screen name="Paywall" component={PaywallScreen} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="TeacherDashboard" component={TeacherDashboardScreen} />
      <Stack.Screen name="PersonalizedPlan" component={PersonalizedPlanScreen} />
      <Stack.Screen name="OrbGarden" component={OrbGardenScreen} />
      <Stack.Screen name="SkillTree" component={SkillTreeScreen} />
      <Stack.Screen name="Recharge" component={RechargeScreen} />
      <Stack.Screen name="Vocab" component={VocabScreen} />
      <Stack.Screen name="GrammarBite" component={GrammarBiteScreen} />
      <Stack.Screen name="MiniChallenge" component={MiniChallengeScreen} />
      <Stack.Screen name="Conversation" component={ConversationScreen} />
      <Stack.Screen name="StreakReward" component={StreakRewardScreen} />
      <Stack.Screen name="ProfessionDetail" component={ProfessionDetailScreen} />
      <Stack.Screen name="YKISpeakingExam" component={YKISpeakingExamScreen} />
      <Stack.Screen name="YKIWritingExam" component={YKIWritingExamScreen} />
    </Stack.Navigator>
  );
}
