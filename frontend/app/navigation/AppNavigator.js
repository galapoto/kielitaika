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
          primary: colors.primary,
          background: colors.background,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
          notification: colors.primary,
        },
      }}
    >
      <MainStack />
    </NavigationContainer>
  );
}
