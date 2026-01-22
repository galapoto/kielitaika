/**
 * RukaCard - core card component for premium UI surfaces
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { designTokens } from '../../styles/designTokens';
import { colors as palette } from '../../styles/colors';

export default function RukaCard({
  children,
  accent = false,
  style,
  innerStyle,
  ...props
}) {
  const gradient = accent
    ? [palette?.accentPrimary || '#4ECDC4', palette?.accentSecondary || '#1B4EDA']
    : [
        palette?.backgroundSecondary || 'rgba(45,36,24,0.8)', 
        palette?.backgroundTertiary || 'rgba(45,36,24,0.6)'
      ];

  return (
    <View style={[styles.wrapper, style]} {...props}>
      <LinearGradient colors={gradient} style={[styles.card, innerStyle]}>
        {children}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: designTokens?.card?.radius || 16,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    marginBottom: designTokens?.spacing?.md || 16,
  },
  card: {
    padding: designTokens?.card?.padding || 20,
    borderRadius: designTokens?.card?.radius || 16,
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    shadowColor: designTokens?.card?.shadowColor || 'rgba(0,0,0,0.25)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 22,
    elevation: designTokens?.card?.elevation || 12,
    minHeight: 120,
  },
});
