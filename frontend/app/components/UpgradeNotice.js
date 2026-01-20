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
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 8,
    gap: 6,
  },
  title: {
    color: '#92400E',
    fontWeight: '700',
  },
  text: {
    color: '#92400E',
  },
  button: {
    backgroundColor: '#F59E0B',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
