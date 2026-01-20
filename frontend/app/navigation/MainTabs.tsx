// MainTabs - Bottom tab navigation
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import PracticeScreen from "../screens/PracticeScreen";
import ConversationStack from "./ConversationStack";
import ProfileScreen from "../screens/ProfileScreen";

const Tabs = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0f172a",
          borderTopWidth: 0,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarActiveTintColor: "#7dd3fc",
        tabBarInactiveTintColor: "#64748b",
      }}
    >
      <Tabs.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
        }}
      />
      <Tabs.Screen
        name="Practice"
        component={PracticeScreen}
        options={{
          tabBarLabel: "Practice",
        }}
      />
      <Tabs.Screen
        name="Speak"
        component={ConversationStack}
        options={{
          tabBarLabel: "Speak",
        }}
      />
      <Tabs.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profile",
        }}
      />
    </Tabs.Navigator>
  );
}
