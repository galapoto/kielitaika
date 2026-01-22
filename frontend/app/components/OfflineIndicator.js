/**
 * OfflineIndicator Component
 * Shows offline status and sync progress
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useOfflineSync, SYNC_STATUS } from '../hooks/useOfflineSync';
import { designTokens } from '../styles/designTokens';
import { colors as palette } from '../styles/colors';

export default function OfflineIndicator() {
  const { syncStatus, pendingCount, isOnline } = useOfflineSync();

  if (isOnline && pendingCount === 0) {
    return null; // Don't show when online and synced
  }

  const getStatusText = () => {
    switch (syncStatus) {
      case SYNC_STATUS.OFFLINE:
        return 'Offline - Changes will sync when online';
      case SYNC_STATUS.SYNCING:
        return `Syncing ${pendingCount} change${pendingCount !== 1 ? 's' : ''}...`;
      case SYNC_STATUS.ERROR:
        return 'Sync error - Retrying...';
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (syncStatus) {
      case SYNC_STATUS.OFFLINE:
        return palette.accentWarning;
      case SYNC_STATUS.SYNCING:
        return palette.accentPrimary;
      case SYNC_STATUS.ERROR:
        return palette.accentError;
      default:
        return palette.textMuted;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: getStatusColor() }]}>
      {syncStatus === SYNC_STATUS.SYNCING && (
        <ActivityIndicator size="small" color={palette.textPrimary} style={styles.indicator} />
      )}
      <Text style={styles.text}>{getStatusText()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: designTokens.spacing.xs,
    paddingHorizontal: designTokens.spacing.md,
  },
  indicator: {
    marginRight: designTokens.spacing.xs,
  },
  text: {
    color: palette.textPrimary,
    fontSize: designTokens.typography.scale.small.size,
    fontWeight: '500',
  },
});



















