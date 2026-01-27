// RootNavigator - Drawer navigation wrapper
// Ensure Reanimated is configured before drawer is created
import Reanimated from 'react-native-reanimated';
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
import FluencyScreen from "../screens/FluencyScreen";
import GuidedTurnScreen from "../screens/GuidedTurnScreen";
import ShadowingScreen from "../screens/ShadowingScreen";
import MicroOutputScreen from "../screens/MicroOutputScreen";
import WorkplaceScreen from "../screens/WorkplaceScreen";
import ProfessionDetailScreen from "../screens/ProfessionDetailScreen";
import RoleplayScreen from "../screens/RoleplayScreen";
import VocabularyScreen from "../screens/VocabularyScreen";
import QuizScreen from "../screens/QuizScreen";
import LessonDetailScreen from "../screens/LessonDetailScreen";
import SettingsScreen from "../screens/SettingsScreen";
import NotificationSettingsScreen from "../screens/NotificationSettingsScreen";
import PrivacySettingsScreen from "../screens/PrivacySettingsScreen";
import SubscriptionScreen from "../screens/SubscriptionScreen";
import PracticeScreen from "../screens/PracticeScreen";
import { useAuth } from "../context/AuthContext";
import CustomDrawerContent from "../components/CustomDrawerContent";
import SpeakingScreenWrapper from "../components/SpeakingScreenWrapper";

// Create drawer after ensuring Reanimated is available
// Use a function to delay creation until runtime
let Drawer: ReturnType<typeof createDrawerNavigator>;
function getDrawer() {
  if (!Drawer) {
    // Ensure Reanimated is imported and available
    if (typeof Reanimated !== 'undefined') {
      Drawer = createDrawerNavigator();
    } else {
      throw new Error('Reanimated is not available');
    }
  }
  return Drawer;
}
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
      <YKIStack.Screen
        name="Conversation"
        component={(props) => <SpeakingScreenWrapper screenName="Conversation" ScreenComponent={ConversationScreen} {...props} />}
      />
      <YKIStack.Screen
        name="Fluency"
        component={(props) => <SpeakingScreenWrapper screenName="Fluency" ScreenComponent={FluencyScreen} {...props} />}
      />
      <YKIStack.Screen
        name="GuidedTurn"
        component={(props) => <SpeakingScreenWrapper screenName="GuidedTurn" ScreenComponent={GuidedTurnScreen} {...props} />}
      />
      <YKIStack.Screen
        name="Shadowing"
        component={(props) => <SpeakingScreenWrapper screenName="Shadowing" ScreenComponent={ShadowingScreen} {...props} />}
      />
      <YKIStack.Screen
        name="MicroOutput"
        component={(props) => <SpeakingScreenWrapper screenName="MicroOutput" ScreenComponent={MicroOutputScreen} {...props} />}
      />
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
      <WorkStack.Screen
        name="Roleplay"
        component={(props) => <SpeakingScreenWrapper screenName="Roleplay" ScreenComponent={RoleplayScreen} {...props} />}
      />
      <WorkStack.Screen name="Vocabulary" component={VocabularyScreen} />
      <WorkStack.Screen name="Quiz" component={QuizScreen} />
      <WorkStack.Screen name="LessonDetail" component={LessonDetailScreen} />
      <WorkStack.Screen
        name="Fluency"
        component={(props) => <SpeakingScreenWrapper screenName="Fluency" ScreenComponent={FluencyScreen} {...props} />}
      />
      <WorkStack.Screen
        name="GuidedTurn"
        component={(props) => <SpeakingScreenWrapper screenName="GuidedTurn" ScreenComponent={GuidedTurnScreen} {...props} />}
      />
      <WorkStack.Screen
        name="Shadowing"
        component={(props) => <SpeakingScreenWrapper screenName="Shadowing" ScreenComponent={ShadowingScreen} {...props} />}
      />
      <WorkStack.Screen
        name="MicroOutput"
        component={(props) => <SpeakingScreenWrapper screenName="MicroOutput" ScreenComponent={MicroOutputScreen} {...props} />}
      />
      <WorkStack.Screen
        name="Conversation"
        component={(props) => <SpeakingScreenWrapper screenName="Conversation" ScreenComponent={ConversationScreen} {...props} />}
      />
      <WorkStack.Screen name="Subscription" component={SubscriptionScreen} />
      <WorkStack.Screen name="Settings" component={SettingsScreen} />
      <WorkStack.Screen name="Notifications" component={NotificationSettingsScreen} />
      <WorkStack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
    </WorkStack.Navigator>
  );
}

export default function RootNavigator() {
  const { accessState } = useAuth();
  const canAccessYki = accessState?.yki === true;
  const canAccessWork = accessState?.work === true;
  
  const Drawer = getDrawer();

  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: "#0f172a",
          width: '75%', // Sidebar covers ~75% of screen based on attachment
        },
        drawerActiveTintColor: "#7dd3fc",
        drawerInactiveTintColor: "#94a3b8",
        overlayColor: 'rgba(0, 0, 0, 0.5)', // Dark overlay when drawer is open
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
        component={canAccessYki ? YKIPlanStack : HomeScreen}
        options={{
          title: "YKI‑suunnitelma",
        }}
      />
      <Drawer.Screen
        name="WorkPlan"
        component={canAccessWork ? WorkPlanStack : HomeScreen}
        options={{
          title: "Työvalmius‑suunnitelma",
        }}
      />
      <Drawer.Screen
        name="Practice"
        component={PracticeScreen}
        options={{
          title: "Harjoittelu",
          drawerItemStyle: { display: "none" }, // Hidden from default drawer, shown in custom content
        }}
      />
      <Drawer.Screen
        name="Conversation"
        component={(props) => <SpeakingScreenWrapper screenName="Conversation" ScreenComponent={ConversationScreen} {...props} />}
        options={{
          title: "Puhuminen",
          drawerItemStyle: { display: "none" }, // Hidden from default drawer, shown in custom content
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: "Asetukset",
          drawerItemStyle: { display: "none" }, // Hidden from default drawer, shown in custom content
        }}
      />
    </Drawer.Navigator>
  );
}
