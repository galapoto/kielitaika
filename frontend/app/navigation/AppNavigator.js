import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import MainStack from './MainStack';
import { linking } from './linking';
import { useTheme } from '../context/ThemeContext';

export default function AppNavigator() {
  const { colors, isDark } = useTheme();

  return (
    <NavigationContainer
      linking={linking}
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
      <MainStack />
    </NavigationContainer>
  );
}
