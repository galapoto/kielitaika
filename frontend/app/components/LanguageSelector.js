/**
 * LanguageSelector - Language selection component (English, Finnish, Swedish)
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fi', label: 'Suomi', flag: '🇫🇮' },
  { code: 'sv', label: 'Svenska', flag: '🇸🇪' },
];

const PREMIUM_BROWN = {
  darkest: '#1A0F0A',
  dark: '#2A1F16',
  medium: '#3A2A1E',
  highlight: 'rgba(255, 255, 255, 0.15)',
  shadow: 'rgba(0, 0, 0, 0.4)',
};

const LANGUAGE_STORAGE_KEY = '@ruka_app_language';

export async function getStoredLanguage() {
  try {
    const lang = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    return lang || 'en';
  } catch {
    return 'en';
  }
}

export async function setStoredLanguage(langCode) {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, langCode);
  } catch (error) {
    console.error('Failed to save language:', error);
  }
}

export default function LanguageSelector({ style, onLanguageChange }) {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isOpen, setIsOpen] = useState(false);

  React.useEffect(() => {
    getStoredLanguage().then(setSelectedLanguage);
  }, []);

  const handleSelectLanguage = async (langCode) => {
    setSelectedLanguage(langCode);
    await setStoredLanguage(langCode);
    setIsOpen(false);
    if (onLanguageChange) {
      onLanguageChange(langCode);
    }
  };

  const currentLang = LANGUAGES.find(l => l.code === selectedLanguage) || LANGUAGES[0];

  return (
    <>
      <TouchableOpacity
        style={[styles.selectorButton, style]}
        onPress={() => setIsOpen(true)}
      >
        <Text style={styles.selectorText}>{currentLang.flag} {currentLang.label}</Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            <LinearGradient
              colors={[PREMIUM_BROWN?.darkest || '#1A0F0A', PREMIUM_BROWN?.dark || '#2A1F16', PREMIUM_BROWN?.medium || '#3A2A1E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modalGradient}
            >
              <Text style={styles.modalTitle}>Select Language</Text>
              {LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageOption,
                    selectedLanguage === lang.code && styles.languageOptionActive,
                  ]}
                  onPress={() => handleSelectLanguage(lang.code)}
                >
                  <Text style={styles.languageFlag}>{lang.flag}</Text>
                  <Text style={[
                    styles.languageLabel,
                    selectedLanguage === lang.code && styles.languageLabelActive,
                  ]}>
                    {lang.label}
                  </Text>
                  {selectedLanguage === lang.code && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selectorButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  selectorText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxWidth: 300,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalGradient: {
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  languageOptionActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageLabel: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  languageLabelActive: {
    fontWeight: '700',
  },
  checkmark: {
    fontSize: 20,
    color: '#FFFFFF',
  },
});



















