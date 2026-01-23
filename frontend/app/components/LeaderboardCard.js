/**
 * LeaderboardCard Component
 * Displays leaderboard with opt-in functionality
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useLeaderboard } from '../hooks/useLeaderboard';
import PremiumEmbossedButton from './PremiumEmbossedButton';
import { designTokens } from '../styles/designTokens';
import { colors as palette } from '../styles/colors';

export default function LeaderboardCard({ type = 'xp', period = 'weekly', limit = 10 }) {
  const { 
    optedIn, 
    leaderboard, 
    loading, 
    optIn, 
    getLeaderboard,
    getCategories,
    getPeriods 
  } = useLeaderboard();

  React.useEffect(() => {
    if (optedIn) {
      getLeaderboard(type, period, limit);
    }
  }, [optedIn, type, period, limit]);

  const handleOptIn = async () => {
    try {
      await optIn();
      await getLeaderboard(type, period, limit);
    } catch (error) {
      console.error('Error opting in:', error);
    }
  };

  const renderLeaderboardItem = ({ item, index }) => {
    const isTopThree = index < 3;
    const badgeColors = {
      0: palette.accentGold, // Gold
      1: '#C0C0C0', // Silver
      2: '#CD7F32', // Bronze
    };

    return (
      <View style={[
        styles.leaderboardItem,
        isTopThree && styles.topThreeItem,
        isTopThree && { borderLeftColor: badgeColors[index] }
      ]}>
        <View style={styles.rankContainer}>
          {isTopThree ? (
            <View style={[styles.badge, { backgroundColor: badgeColors[index] }]}>
              <Text style={styles.badgeText}>{index + 1}</Text>
            </View>
          ) : (
            <Text style={styles.rankText}>{index + 1}</Text>
          )}
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.score}>{item.score.toLocaleString()} {type.toUpperCase()}</Text>
        </View>
      </View>
    );
  };

  if (!optedIn) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Leaderboards</Text>
        <Text style={styles.description}>
          Join leaderboards to compete with other learners! Your username will be anonymous.
        </Text>
        <PremiumEmbossedButton
          title="Join Leaderboards"
          onPress={handleOptIn}
          variant="primary"
          size="medium"
          style={styles.optInButton}
        />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={palette.accentPrimary} />
      </View>
    );
  }

  if (!leaderboard || !leaderboard.data || leaderboard.data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Leaderboards</Text>
        <Text style={styles.emptyText}>No data available yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboards</Text>
        <Text style={styles.period}>{leaderboard.period}</Text>
      </View>
      
      <FlatList
        data={leaderboard.data}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item, index) => `leaderboard-${index}`}
        scrollEnabled={false}
      />

      {leaderboard.userPosition && (
        <View style={styles.userPosition}>
          <Text style={styles.userPositionText}>
            Your rank: #{leaderboard.userPosition.rank}
          </Text>
          <Text style={styles.userPositionScore}>
            {leaderboard.userPosition.score.toLocaleString()} {type.toUpperCase()}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.surface,
    borderRadius: designTokens.borderRadius.lg,
    padding: designTokens.spacing.md,
    marginVertical: designTokens.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: designTokens.spacing.md,
  },
  title: {
    fontSize: designTokens.typography.scale.h3.size,
    fontWeight: designTokens.typography.scale.h3.weight,
    color: palette.textPrimary,
  },
  period: {
    fontSize: designTokens.typography.scale.small.size,
    color: palette.textSecondary,
    textTransform: 'capitalize',
  },
  description: {
    fontSize: designTokens.typography.scale.body.size,
    color: palette.textSecondary,
    marginBottom: designTokens.spacing.md,
    lineHeight: designTokens.typography.scale.body.lineHeight,
  },
  optInButton: {
    marginTop: designTokens.spacing.sm,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: designTokens.spacing.sm,
    paddingHorizontal: designTokens.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: palette.divider,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  topThreeItem: {
    backgroundColor: palette.neutralDark,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    fontSize: designTokens.typography.scale.body.size,
    fontWeight: '600',
    color: palette.textSecondary,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: designTokens.typography.scale.body.size,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  userInfo: {
    flex: 1,
    marginLeft: designTokens.spacing.md,
  },
  username: {
    fontSize: designTokens.typography.scale.body.size,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: designTokens.spacing.xs,
  },
  score: {
    fontSize: designTokens.typography.scale.small.size,
    color: palette.textSecondary,
  },
  userPosition: {
    marginTop: designTokens.spacing.md,
    paddingTop: designTokens.spacing.md,
    borderTopWidth: 1,
    borderTopColor: palette.divider,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userPositionText: {
    fontSize: designTokens.typography.scale.body.size,
    fontWeight: '600',
    color: palette.accentPrimary,
  },
  userPositionScore: {
    fontSize: designTokens.typography.scale.body.size,
    fontWeight: '600',
    color: palette.textPrimary,
  },
  emptyText: {
    fontSize: designTokens.typography.scale.body.size,
    color: palette.textSecondary,
    textAlign: 'center',
    marginTop: designTokens.spacing.md,
  },
});



















