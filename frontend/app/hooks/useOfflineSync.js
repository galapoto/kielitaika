/**
 * useOfflineSync Hook
 * React hook for offline sync service
 */

import { useState, useEffect, useCallback } from 'react';
import { offlineSyncService, SYNC_STATUS } from '../services/offlineSyncService';

export function useOfflineSync() {
  const [syncStatus, setSyncStatus] = useState(SYNC_STATUS.ONLINE);
  const [pendingCount, setPendingCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Initialize service
    offlineSyncService.initialize();

    // Subscribe to status changes
    const unsubscribe = offlineSyncService.subscribe((status, pending) => {
      setSyncStatus(status);
      setPendingCount(pending);
      setIsOnline(status !== SYNC_STATUS.OFFLINE);
    });

    // Get initial status
    const stats = offlineSyncService.getSyncStats();
    setSyncStatus(stats.status);
    setPendingCount(stats.pendingCount);
    setIsOnline(stats.isOnline);

    return () => {
      unsubscribe();
      offlineSyncService.cleanup();
    };
  }, []);

  const queueForSync = useCallback(async (type, data) => {
    return await offlineSyncService.queueForSync(type, data);
  }, []);

  const syncPending = useCallback(async () => {
    return await offlineSyncService.syncPendingChanges();
  }, []);

  const cacheContent = useCallback(async (type, content) => {
    return await offlineSyncService.cacheContent(type, content);
  }, []);

  const getCachedContent = useCallback(async (type) => {
    return await offlineSyncService.getCachedContent(type);
  }, []);

  const clearCache = useCallback(async (type = null) => {
    return await offlineSyncService.clearCache(type);
  }, []);

  const getSyncStats = useCallback(() => {
    return offlineSyncService.getSyncStats();
  }, []);

  return {
    syncStatus,
    pendingCount,
    isOnline,
    queueForSync,
    syncPending,
    cacheContent,
    getCachedContent,
    clearCache,
    getSyncStats,
  };
}



















