/**
 * Offline Sync Service
 * Team CU - Offline Sync Behavior
 * Manages offline content, sync status, and data synchronization
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// NetInfo is optional - handle gracefully if not installed
let NetInfo = null;
try {
  NetInfo = require('@react-native-community/netinfo').default;
} catch (e) {
  console.warn('[OfflineSyncService] NetInfo not available, using fallback');
}

// ============================================
// SYNC STATUS
// ============================================

export const SYNC_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  SYNCING: 'syncing',
  ERROR: 'error',
};

// ============================================
// OFFLINE SYNC SERVICE
// ============================================

class OfflineSyncService {
  constructor() {
    this.syncStatus = SYNC_STATUS.ONLINE;
    this.pendingSync = [];
    this.syncListeners = [];
    this.networkListeners = [];
    this.isInitialized = false;
  }

  /**
   * Initialize offline sync service
   */
  async initialize() {
    if (this.isInitialized) return;

    // Check network status
    if (NetInfo) {
      const netInfo = await NetInfo.fetch();
      this.syncStatus = netInfo.isConnected ? SYNC_STATUS.ONLINE : SYNC_STATUS.OFFLINE;

      // Listen to network changes
      this.networkUnsubscribe = NetInfo.addEventListener(state => {
        const wasOffline = this.syncStatus === SYNC_STATUS.OFFLINE;
        this.syncStatus = state.isConnected ? SYNC_STATUS.ONLINE : SYNC_STATUS.OFFLINE;
        
        if (wasOffline && this.syncStatus === SYNC_STATUS.ONLINE) {
          // Auto-sync when coming back online
          this.syncPendingChanges();
        }

        this.notifyListeners();
      });
    } else {
      // Fallback: assume online
      this.syncStatus = SYNC_STATUS.ONLINE;
    }

    // Load pending sync queue
    await this.loadPendingSync();

    this.isInitialized = true;
  }

  /**
   * Get current sync status
   */
  getSyncStatus() {
    return this.syncStatus;
  }

  /**
   * Check if online
   */
  async isOnline() {
    if (NetInfo) {
      const netInfo = await NetInfo.fetch();
      return netInfo.isConnected;
    }
    // Fallback: assume online if NetInfo not available
    return true;
  }

  /**
   * Add item to sync queue
   */
  async queueForSync(type, data) {
    const syncItem = {
      id: `${type}_${Date.now()}_${Math.random()}`,
      type,
      data,
      timestamp: new Date().toISOString(),
      retries: 0,
    };

    this.pendingSync.push(syncItem);
    await this.savePendingSync();

    // Try to sync immediately if online
    if (await this.isOnline()) {
      await this.syncPendingChanges();
    }

    return syncItem.id;
  }

  /**
   * Sync pending changes
   */
  async syncPendingChanges() {
    if (this.syncStatus === SYNC_STATUS.SYNCING) return;
    if (!(await this.isOnline())) return;

    this.syncStatus = SYNC_STATUS.SYNCING;
    this.notifyListeners();

    const itemsToSync = [...this.pendingSync];
    const successful = [];
    const failed = [];

    for (const item of itemsToSync) {
      try {
        await this.syncItem(item);
        successful.push(item.id);
      } catch (error) {
        console.error('[OfflineSyncService] Sync error:', error);
        item.retries++;
        if (item.retries < 3) {
          failed.push(item);
        }
      }
    }

    // Remove successful items
    this.pendingSync = failed;
    await this.savePendingSync();

    this.syncStatus = SYNC_STATUS.ONLINE;
    this.notifyListeners();

    return {
      successful: successful.length,
      failed: failed.length,
    };
  }

  /**
   * Sync a single item
   */
  async syncItem(item) {
    // This would call appropriate API endpoint based on item.type
    // For now, just simulate
    switch (item.type) {
      case 'lesson_progress':
        // await updateLessonProgress(item.data);
        break;
      case 'vocabulary_review':
        // await updateVocabularyReview(item.data);
        break;
      case 'analytics':
        // await sendAnalyticsEvent(item.data.eventType, item.data.data);
        break;
      default:
        console.warn('[OfflineSyncService] Unknown sync type:', item.type);
    }
  }

  /**
   * Cache content for offline use
   */
  async cacheContent(type, content) {
    try {
      const key = `@ruka_cache_${type}`;
      await AsyncStorage.setItem(key, JSON.stringify({
        content,
        cachedAt: new Date().toISOString(),
        version: 1,
      }));
    } catch (error) {
      console.error('[OfflineSyncService] Error caching content:', error);
    }
  }

  /**
   * Get cached content
   */
  async getCachedContent(type) {
    try {
      const key = `@ruka_cache_${type}`;
      const data = await AsyncStorage.getItem(key);
      if (!data) return null;

      const cached = JSON.parse(data);
      // Check if cache is still valid (e.g., 7 days)
      const cacheAge = Date.now() - new Date(cached.cachedAt).getTime();
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

      if (cacheAge > maxAge) {
        await AsyncStorage.removeItem(key);
        return null;
      }

      return cached.content;
    } catch (error) {
      console.error('[OfflineSyncService] Error getting cached content:', error);
      return null;
    }
  }

  /**
   * Clear cache
   */
  async clearCache(type = null) {
    try {
      if (type) {
        await AsyncStorage.removeItem(`@ruka_cache_${type}`);
      } else {
        // Clear all cache
        const keys = await AsyncStorage.getAllKeys();
        const cacheKeys = keys.filter(k => k.startsWith('@ruka_cache_'));
        await AsyncStorage.multiRemove(cacheKeys);
      }
    } catch (error) {
      console.error('[OfflineSyncService] Error clearing cache:', error);
    }
  }

  /**
   * Save pending sync queue
   */
  async savePendingSync() {
    try {
      await AsyncStorage.setItem('@ruka_pending_sync', JSON.stringify(this.pendingSync));
    } catch (error) {
      console.error('[OfflineSyncService] Error saving pending sync:', error);
    }
  }

  /**
   * Load pending sync queue
   */
  async loadPendingSync() {
    try {
      const data = await AsyncStorage.getItem('@ruka_pending_sync');
      this.pendingSync = data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[OfflineSyncService] Error loading pending sync:', error);
      this.pendingSync = [];
    }
  }

  /**
   * Subscribe to sync status changes
   */
  subscribe(listener) {
    this.syncListeners.push(listener);
    return () => {
      this.syncListeners = this.syncListeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify listeners of status change
   */
  notifyListeners() {
    this.syncListeners.forEach(listener => {
      try {
        listener(this.syncStatus, this.pendingSync.length);
      } catch (error) {
        console.error('[OfflineSyncService] Listener error:', error);
      }
    });
  }

  /**
   * Get sync statistics
   */
  getSyncStats() {
    return {
      status: this.syncStatus,
      pendingCount: this.pendingSync.length,
      isOnline: this.syncStatus !== SYNC_STATUS.OFFLINE,
    };
  }

  /**
   * Cleanup
   */
  cleanup() {
    if (this.networkUnsubscribe) {
      this.networkUnsubscribe();
    }
    this.syncListeners = [];
  }
}

// Export singleton instance
export const offlineSyncService = new OfflineSyncService();

// Export convenience functions
export const getSyncStatus = () => offlineSyncService.getSyncStatus();
export const isOnline = () => offlineSyncService.isOnline();
export const queueForSync = (type, data) => offlineSyncService.queueForSync(type, data);
export const syncPending = () => offlineSyncService.syncPendingChanges();
export const cacheContent = (type, content) => offlineSyncService.cacheContent(type, content);
export const getCachedContent = (type) => offlineSyncService.getCachedContent(type);



















