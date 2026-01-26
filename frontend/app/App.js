// RECOVERY MODE: Architecture restoration in progress. Feature work frozen.
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { HTTP_API_BASE } from './config/backend';
import * as Reanimated from 'react-native-reanimated';

const runtimeBuildId = new Date().toISOString();
import { PathProvider } from './context/PathContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { PreferencesProvider } from './context/PreferencesContext';
const ensureReanimatedGestureHandler = () => {
  if (typeof Reanimated.useAnimatedGestureHandler !== 'function') {
    Reanimated.useAnimatedGestureHandler = () => () => {};
  }
};

function NavigationRoot() {
  const { colors, isDark } = useTheme();
  ensureReanimatedGestureHandler();
  const RootNavigator = require('./navigation/RootNavigator').default;

  return (
    <PathProvider>
      <NavigationContainer
        theme={{
          dark: isDark,
          colors: {
            primary: colors.primary || '#0A3D62',
            background: colors.background || '#F8FAFC',
            card: colors.surface || colors.card || '#FFFFFF',
            text: colors.text || '#1e293b',
            border: colors.border || '#e2e8f0',
            notification: colors.primary || '#0A3D62',
          },
        }}
      >
        <RootNavigator />
      </NavigationContainer>
    </PathProvider>
  );
}

export default function App() {
  useEffect(() => {
    console.log('RUNTIME BUILD ID (App.js):', runtimeBuildId);
    // Verification: Test backend connection on app start
    fetch(`${HTTP_API_BASE}/`)
      .then(r => r.json().catch(() => ({ status: 'ok' })))
      .then(d => console.log('Backend OK:', d))
      .catch(e => console.error('Backend FAIL:', e));
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <PreferencesProvider>
            <NavigationRoot />
          </PreferencesProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
