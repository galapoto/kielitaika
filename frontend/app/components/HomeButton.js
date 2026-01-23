import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

/**
 * Reusable Home Button Component
 * Adds a consistent home navigation button to all screens
 * @param {string} homeType - 'general' (default), 'yki', 'workplace' - determines which home to navigate to
 */
export default function HomeButton({ navigation, style, textStyle, homeType = 'general' }) {
  const handlePress = () => {
    if (!navigation) {
      console.warn('[HomeButton] No navigation object provided');
      return;
    }
    
    try {
      // Navigate to appropriate home based on context
      if (homeType === 'yki') {
        // For YKI screens, navigate to YKI screen
        navigation.navigate('YKI');
      } else if (homeType === 'workplace') {
        // For workplace screens, navigate to Workplace screen
        navigation.navigate('Workplace');
      } else {
        // Default: navigate to main Home screen
        navigation.navigate('Home');
      }
    } catch (error) {
      console.error('[HomeButton] Navigation error:', error);
      // Fallback: try to navigate to Home
      try {
        navigation.navigate('Home');
      } catch (fallbackError) {
        console.error('[HomeButton] Fallback navigation also failed:', fallbackError);
      }
    }
  };

  return (
    <TouchableOpacity
      style={[styles.homeButton, style]}
      onPress={handlePress}
      accessibilityLabel="Go to Home"
      accessibilityRole="button"
    >
      <Text style={[styles.homeButtonText, textStyle]}>🏠</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  homeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3A2A1E', // Brown matching theme
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(27, 78, 218, 0.25)', // Blue edge accent
    shadowColor: '#000',
    shadowOpacity: 0.85,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 14 },
    elevation: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  homeButtonText: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.92)',
  },
});
