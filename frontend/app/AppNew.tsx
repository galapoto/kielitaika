// New App entry point with TypeScript navigation structure
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { RukaTheme } from "./theme/RukaTheme";
import RootNavigator from "./navigation/RootNavigator";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { PathProvider } from "./context/PathContext";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <PathProvider>
            <NavigationContainer theme={RukaTheme}>
              <RootNavigator />
            </NavigationContainer>
          </PathProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
