// ============================================================================
// AppNavigator - Main app navigation structure
// ============================================================================

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator();

/**
 * AppNavigator
 * 
 * TODO: Codex to implement:
 * - Modal navigation
 * - Deep linking
 * - Navigation state persistence
 */
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Main" component={TabNavigator} />
        {/* Modal screens can be added here */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}


