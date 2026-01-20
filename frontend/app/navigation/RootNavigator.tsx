// RootNavigator - Drawer navigation wrapper
import { createDrawerNavigator } from "@react-navigation/drawer";
import MainTabs from "./MainTabs";
import SettingsScreen from "../screens/SettingsScreen";

const Drawer = createDrawerNavigator();

export default function RootNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: "#0f172a",
        },
        drawerActiveTintColor: "#7dd3fc",
        drawerInactiveTintColor: "#94a3b8",
      }}
    >
      <Drawer.Screen name="Main" component={MainTabs} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
}
