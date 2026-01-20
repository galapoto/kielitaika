// ============================================================================
// SkillConnector - Connection line between skill nodes
// ============================================================================

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../../design/colors';
import { gradients } from '../../../design/gradients';

/**
 * SkillConnector
 * 
 * TODO: Codex to implement:
 * - Animated connection progress
 * - Direction-based rendering (horizontal/vertical/diagonal)
 * - Glow animation when path is active
 */
export default function SkillConnector({ 
  from,
  to,
  completed = false,
  style,
  ...props 
}) {
  // TODO: Codex - Calculate connector position and length based on from/to nodes
  
  return (
    <View style={[styles.container, style]} {...props}>
      {completed ? (
        <LinearGradient
          colors={gradients.accent.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.line}
        />
      ) : (
        <View style={[styles.line, styles.incomplete]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  line: {
    height: 3,
    width: 60,
  },
  incomplete: {
    backgroundColor: colors.gray[700],
  },
});


