/**
 * PreferencesContext - User preferences for animations and backgrounds
 * 
 * Manages:
 * - Animation enabled/disabled
 * - Background images enabled/disabled (blank mode)
 * - Persists to AsyncStorage
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';

// Use AsyncStorage for native, localStorage for web
let AsyncStorage;
if (Platform.OS === 'web') {
  AsyncStorage = {
    getItem: async (key) => {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        return null;
      }
    },
    setItem: async (key, value) => {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      }
    },
  };
} else {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
}

if (!AsyncStorage) {
  AsyncStorage = {
    getItem: async () => null,
    setItem: async () => {},
  };
}

const PreferencesContext = createContext();

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }
  return context;
};

export const PreferencesProvider = ({ children }) => {
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [backgroundsEnabled, setBackgroundsEnabled] = useState(true);
  // Speech rate: 'slow' | 'normal' | 'fast'
  const [speechRate, setSpeechRateState] = useState('slow');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const savedAnimations = await AsyncStorage.getItem('preferences_animations');
      const savedBackgrounds = await AsyncStorage.getItem('preferences_backgrounds');
      const savedSpeechRate = await AsyncStorage.getItem('preferences_speech_rate');
      
      if (savedAnimations !== null) {
        setAnimationsEnabled(savedAnimations === 'true');
      }
      if (savedBackgrounds !== null) {
        setBackgroundsEnabled(savedBackgrounds === 'true');
      }
      if (savedSpeechRate) {
        setSpeechRateState(savedSpeechRate);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAnimations = async () => {
    const newValue = !animationsEnabled;
    setAnimationsEnabled(newValue);
    try {
      await AsyncStorage.setItem('preferences_animations', String(newValue));
    } catch (error) {
      console.error('Error saving animation preference:', error);
    }
  };

  const toggleBackgrounds = async () => {
    const newValue = !backgroundsEnabled;
    setBackgroundsEnabled(newValue);
    try {
      await AsyncStorage.setItem('preferences_backgrounds', String(newValue));
    } catch (error) {
      console.error('Error saving background preference:', error);
    }
  };

  const setSpeechRate = async (rate) => {
    setSpeechRateState(rate);
    try {
      await AsyncStorage.setItem('preferences_speech_rate', String(rate));
    } catch (error) {
      console.error('Error saving speech rate preference:', error);
    }
  };

  const value = {
    animationsEnabled,
    backgroundsEnabled,
    speechRate,
    toggleAnimations,
    toggleBackgrounds,
    setSpeechRate,
    isLoading,
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};











