// RootNavigator - Drawer navigation wrapper
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import YKIScreen from "../screens/YKIScreen";
import YKIDailySessionScreen from "../screens/YKIDailySessionScreen";
import YKIGoalScreen from "../screens/YKIGoalScreen";
import YKIPlacementScreen from "../screens/YKIPlacementScreen";
import YKIProgressScreen from "../screens/YKIProgressScreen";
import YKIAttemptHistoryScreen from "../screens/YKIAttemptHistoryScreen";
import YKIPracticeReadingScreen from "../screens/YKIPracticeReadingScreen";
import YKIPracticeWritingScreen from "../screens/YKIPracticeWritingScreen";
import YKIPracticeListeningScreen from "../screens/YKIPracticeListeningScreen";
import YKIPracticeSpeakingScreen from "../screens/YKIPracticeSpeakingScreen";
import YKISpeakingExamScreen from "../screens/YKISpeakingExamScreen";
import YKIWritingExamScreen from "../screens/YKIWritingExamScreen";
import YKIInfoScreen from "../screens/YKIInfoScreen";
import ConversationScreen from "../screens/ConversationScreen";
import WorkplaceScreen from "../screens/WorkplaceScreen";
import ProfessionDetailScreen from "../screens/ProfessionDetailScreen";
import RoleplayScreen from "../screens/RoleplayScreen";
import PracticeRoundScreen from "../screens/PracticeRoundScreen";
import CompetenceDashboardScreen from "../screens/CompetenceDashboardScreen";
import VocabularyScreen from "../screens/VocabularyScreen";
import QuizScreen from "../screens/QuizScreen";
import NotesScreen from "../screens/NotesScreen";
import LessonDetailScreen from "../screens/LessonDetailScreen";
import SettingsScreen from "../screens/SettingsScreen";
import NotificationSettingsScreen from "../screens/NotificationSettingsScreen";
import PrivacySettingsScreen from "../screens/PrivacySettingsScreen";
import SubscriptionScreen from "../screens/SubscriptionScreen";

const Drawer = createDrawerNavigator();
const YKIStack = createNativeStackNavigator();
const WorkStack = createNativeStackNavigator();

function YKIPlanStack() {
  return (
    <YKIStack.Navigator screenOptions={{ headerShown: false }}>
      <YKIStack.Screen name="YKI" component={YKIScreen} />
      <YKIStack.Screen name="YKIDailySession" component={YKIDailySessionScreen} />
      <YKIStack.Screen name="YKIPlacement" component={YKIPlacementScreen} />
      <YKIStack.Screen name="YKIGoal" component={YKIGoalScreen} />
      <YKIStack.Screen name="YKIProgress" component={YKIProgressScreen} />
      <YKIStack.Screen name="YKIAttemptHistory" component={YKIAttemptHistoryScreen} />
      <YKIStack.Screen name="YKIPracticeReading" component={YKIPracticeReadingScreen} />
      <YKIStack.Screen name="YKIPracticeWriting" component={YKIPracticeWritingScreen} />
      <YKIStack.Screen name="YKIPracticeListening" component={YKIPracticeListeningScreen} />
      <YKIStack.Screen name="YKIPracticeSpeaking" component={YKIPracticeSpeakingScreen} />
      <YKIStack.Screen name="YKISpeakingExam" component={YKISpeakingExamScreen} />
      <YKIStack.Screen name="YKIWritingExam" component={YKIWritingExamScreen} />
      <YKIStack.Screen name="YKIInfo" component={YKIInfoScreen} />
      <YKIStack.Screen name="Conversation" component={ConversationScreen} />
      <YKIStack.Screen name="Settings" component={SettingsScreen} />
      <YKIStack.Screen name="Notifications" component={NotificationSettingsScreen} />
      <YKIStack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
      <YKIStack.Screen name="Subscription" component={SubscriptionScreen} />
    </YKIStack.Navigator>
  );
}

function WorkPlanStack() {
  return (
    <WorkStack.Navigator screenOptions={{ headerShown: false }}>
      <WorkStack.Screen name="Workplace" component={WorkplaceScreen} />
      <WorkStack.Screen name="ProfessionDetail" component={ProfessionDetailScreen} />
      <WorkStack.Screen name="Roleplay" component={RoleplayScreen} />
      <WorkStack.Screen name="PracticeRound" component={PracticeRoundScreen} />
      <WorkStack.Screen name="CompetenceDashboard" component={CompetenceDashboardScreen} />
      <WorkStack.Screen name="Vocabulary" component={VocabularyScreen} />
      <WorkStack.Screen name="Quiz" component={QuizScreen} />
      <WorkStack.Screen name="Notes" component={NotesScreen} />
      <WorkStack.Screen name="LessonDetail" component={LessonDetailScreen} />
      <WorkStack.Screen name="Subscription" component={SubscriptionScreen} />
      <WorkStack.Screen name="Settings" component={SettingsScreen} />
      <WorkStack.Screen name="Notifications" component={NotificationSettingsScreen} />
      <WorkStack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
    </WorkStack.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: "#0f172a",
        },
        drawerActiveTintColor: "#7dd3fc",
        drawerInactiveTintColor: "#94a3b8",
      }}
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{
          drawerItemStyle: { display: "none" },
        }}
      />
      <Drawer.Screen
        name="YKIPlan"
        component={YKIPlanStack}
        options={{
          title: "YKI Pass Plan",
        }}
      />
      <Drawer.Screen
        name="WorkPlan"
        component={WorkPlanStack}
        options={{
          title: "Work Readiness Plan",
        }}
      />
    </Drawer.Navigator>
  );
}
