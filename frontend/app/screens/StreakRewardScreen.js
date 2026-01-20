import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AnimatedCTA from '../components/AnimatedCTA';
import StreakFlame from '../components/StreakFlame';
import XPBadge from '../components/XPBadge';

export default function StreakRewardScreen({ navigation, route }) {
  const { streak = 0, xp = 0 } = route?.params || {};
  return (
    <View style={styles.container}>
      <Text style={styles.title}>You're on fire!</Text>
      <StreakFlame streakCount={streak} />
      <XPBadge xp={xp} />
      <AnimatedCTA label="Back to Home" onPress={() => navigation.navigate('Home')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0A3D62',
  },
});
