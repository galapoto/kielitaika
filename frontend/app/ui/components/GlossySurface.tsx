/**
 * GlossySurface - Creates a polished, shiny surface with reflection
 * For that premium, glossy look
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface GlossySurfaceProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  borderRadius?: number;
  variant?: 'default' | 'premium' | 'glass';
}

export default function GlossySurface({
  children,
  style,
  intensity = 20,
  borderRadius = 16,
  variant = 'default',
}: GlossySurfaceProps) {
  return (
    <View
      style={[
        styles.container,
        { borderRadius },
        style,
      ]}
    >
      {variant === 'glass' && (
        Platform.OS === 'web' ? (
          <View
            style={[
              StyleSheet.absoluteFill,
              { borderRadius, backgroundColor: 'rgba(0, 0, 0, 0.3)' },
            ]}
          />
        ) : (
          <BlurView
            intensity={intensity}
            tint="dark"
            style={[StyleSheet.absoluteFill, { borderRadius }]}
          />
        )
      )}

      {/* Base gradient */}
      <LinearGradient
        colors={
          variant === 'premium'
            ? ['#2A2A3A', '#1C1C28', '#2A2A3A']
            : ['#2A2A3A', '#1C1C28']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius }]}
      />

      {/* Shine overlay - top highlight */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.3 }}
        style={[StyleSheet.absoluteFill, { borderRadius }]}
      />

      {/* Side shine */}
      <LinearGradient
        colors={['rgba(90, 208, 255, 0.1)', 'transparent', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[StyleSheet.absoluteFill, { borderRadius }]}
      />

      {/* Content */}
      <View style={[styles.content, { borderRadius }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
});





























