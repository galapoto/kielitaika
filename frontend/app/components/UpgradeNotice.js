import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function UpgradeNotice({ reason, onPress }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upgrade required</Text>
      <Text style={styles.text}>{reason || 'This feature needs a paid plan.'}</Text>
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>View plans</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(16, 22, 40, 0.78)',
    borderColor: 'rgba(27,78,218,0.35)',
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 8,
    gap: 6,
  },
  title: {
    color: 'rgba(255,255,255,0.92)',
    fontWeight: '700',
  },
  text: {
    color: 'rgba(255,255,255,0.72)',
  },
  button: {
    backgroundColor: 'rgba(27,78,218,0.92)',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '700',
  },
});
