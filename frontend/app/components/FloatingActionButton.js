/**
 * FloatingActionButton - home screen floating action for conversation.
 * Uses design tokens for glowing gradient and icon.
 */

import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors as palette } from '../styles/colors';
import { designTokens } from '../styles/designTokens';

const FAB_SIZE = 64;

export default function FloatingActionButton({ style, label = 'Conversation' }) {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation?.navigate?.('Conversation');
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.glow} />
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handlePress}
        style={styles.touchable}
      >
        <LinearGradient
          colors={[palette.accentPrimary, palette.accentSecondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Ionicons name="chatbox-ellipses" size={26} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24 + FAB_SIZE,
    right: 20,
    zIndex: 1000,
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    width: FAB_SIZE + 16,
    height: FAB_SIZE + 16,
    borderRadius: (FAB_SIZE + 16) / 2,
    backgroundColor: 'rgba(78,205,196,0.35)',
    top: -8,
    right: -8,
  },
  touchable: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    shadowColor: palette.accentPrimary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: FAB_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});



















