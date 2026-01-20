// ============================================================================
// TabNavigator - Bottom tab navigation
// ============================================================================

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import HomeScreen from '../app/screens/HomeScreen';
import ConversationScreen from '../app/screens/ConversationScreen';
import ProgressScreen from '../app/screens/ProgressScreen';
import SettingsScreen from '../app/screens/SettingsScreen';
import { colors } from '../design/colors';
import { typography } from '../design/typography';

const Tab = createBottomTabNavigator();

/**
 * TabNavigator
 * 
 * TODO: Codex to implement:
 * - Custom tab bar with glassmorphism
 * - Tab icons
 * - Badge indicators
 * - Animation transitions
 */
export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background.elevated,
          borderTopColor: colors.glass.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
        },
        tabBarActiveTintColor: colors.accent.mint,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarLabelStyle: {
          ...typography.styles.caption,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Speak"
        component={ConversationScreen}
        options={{
          tabBarLabel: 'Speak',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>💬</Text>,
        }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          tabBarLabel: 'Progress',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📊</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}


