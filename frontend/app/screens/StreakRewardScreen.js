import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AnimatedCTA from '../components/AnimatedCTA';
import StreakFlame from '../components/StreakFlame';
import XPBadge from '../components/XPBadge';
import { RukaCard, RukaButton } from '../ui';
import { IconPlay } from '../ui/icons/IconPack';

export default function StreakRewardScreen({ navigation, route } = {}) {
  const { streak = 0, xp = 0 } = route?.params || {};
  return (
    <View style={styles.container}>
      <RukaCard title="You're on fire!" subtitle={`Streak: ${streak} • XP: ${xp}`} icon={IconPlay} style={{ width: '100%', alignItems: 'center', gap: 16 }}>
        <StreakFlame streakCount={streak} />
        <XPBadge xp={xp} />
      </RukaCard>
      <RukaButton title="Back to Home" onPress={() => navigation.navigate('Home')} icon={IconPlay} />
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
