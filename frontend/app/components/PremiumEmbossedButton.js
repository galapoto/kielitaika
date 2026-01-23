/**
 * PremiumEmbossedButton - pronounced tactile CTA that reflects the Nordic premium system.
 */

import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { designTokens } from '../styles/designTokens';
import { colors as palette } from '../styles/colors';

const sizeMap = {
  small: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    minHeight: 44,
  },
  medium: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    minHeight: 52,
  },
  large: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    minHeight: 60,
  },
};

const getVariant = (variant = 'primary') => {
  if (!designTokens || !designTokens.button) {
    return {
      background: [palette?.backgroundSecondary || '#2D2418', palette?.backgroundPrimary || '#0A1F2E'],
      borderRadius: 12,
      textColor: palette?.textPrimary || '#F8F9FA',
    };
  }
  return designTokens.button[variant] || designTokens.button.primary;
};

export default function PremiumEmbossedButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  textStyle,
  size = 'medium',
  children,
}) {
  const config = getVariant(variant);
  const gradientColors = config?.background || [palette?.backgroundSecondary || '#2D2418', palette?.backgroundPrimary || '#0A1F2E'];

  const sizeConfig = sizeMap[size] || sizeMap.medium || sizeMap.small;
  
  const buttonStyles = [
    styles.button,
    {
      borderRadius: config?.borderRadius || 16,
      ...sizeConfig,
    },
    style,
    disabled && styles.disabled,
  ];

  const labelStyles = [
    styles.text,
    { color: config?.textColor || '#FFFFFF' },
    textStyle,
  ];

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
      style={buttonStyles}
    >
      <View style={styles.shadow} />
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          { borderRadius: config?.borderRadius || 16 },
          config?.shadow ? { shadowColor: config.shadow } : null,
        ]}
      >
        <View style={styles.glow} />
        <View style={styles.content}>
          {children || <Text style={labelStyles}>{title}</Text>}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'relative',
    overflow: 'hidden',
  },
  shadow: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: -6,
    bottom: -6,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 18,
    zIndex: -1,
  },
  gradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    shadowOffset: { width: 8, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 12,
  },
  glow: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
  },
  content: {
    paddingHorizontal: 4,
  },
  text: {
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.25,
  },
  disabled: {
    opacity: 0.6,
  },
});
