/**
 * Lottie-based Snowfall Animation
 * Lightweight, cross-platform snowfall effect using Lottie
 */
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

let LottieView: any = null;
if (Platform.OS !== 'web') {
  try {
    LottieView = require('lottie-react-native').default;
  } catch (e) {
    // Lottie not available
  }
}

interface LottieSnowfallProps {
  opacity?: number;
  speed?: number;
}

export default function LottieSnowfall({ opacity = 0.6, speed = 1.0 }: LottieSnowfallProps) {
  // Temporarily disable Lottie on native to avoid crash; use static fallback
  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
  animation: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
