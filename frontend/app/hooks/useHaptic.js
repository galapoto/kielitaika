import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';

/**
 * Lightweight haptic feedback hook
 * Provides subtle haptic feedback for interactions
 */
export function useHaptic() {
  const light = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
      // Silently fail if haptics not available
    });
  }, []);

  const medium = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {
      // Silently fail if haptics not available
    });
  }, []);

  const heavy = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {
      // Silently fail if haptics not available
    });
  }, []);

  const success = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {
      // Silently fail if haptics not available
    });
  }, []);

  const error = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {
      // Silently fail if haptics not available
    });
  }, []);

  const selection = useCallback(() => {
    Haptics.selectionAsync().catch(() => {
      // Silently fail if haptics not available
    });
  }, []);

  return {
    light,
    medium,
    heavy,
    success,
    error,
    selection,
  };
}






























