import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PRODUCT_NAME } from '../utils/constants';

/**
 * Kieli Taika Logo - Text-based logo to avoid SVG Fabric issues
 * 
 * Replaced SVG version to fix "topSvgLayout" error in React Native Fabric.
 * Uses simple text rendering instead.
 */
export default function RukaLogo3D({
  width = 420,
  height = 140,
  style,
  label = PRODUCT_NAME,
}) {
  const logoText = label || PRODUCT_NAME;

  return (
    <View style={[styles.container, { width, height }, style]}>
      <View style={styles.logoContainer}>
        <Text style={styles.snowflake}>❄</Text>
        <Text style={styles.logoText}>{logoText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  snowflake: {
    fontSize: 48,
    color: '#A7D4FF',
  },
  logoText: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#FFFFFF',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
});
