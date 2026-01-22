/**
 * useAnalytics Hook
 * React hook for analytics service
 */

import { useEffect, useCallback } from 'react';
import { analyticsService } from '../services/analyticsService';

export function useAnalytics() {
  useEffect(() => {
    // Start session on mount
    analyticsService.startSession();

    // End session on unmount
    return () => {
      analyticsService.endSession();
    };
  }, []);

  const track = useCallback((eventType, data) => {
    analyticsService.track(eventType, data);
  }, []);

  const trackScreen = useCallback((screenName, params = {}) => {
    analyticsService.trackScreenView(screenName, params);
  }, []);

  const trackLesson = useCallback((lessonId, metrics) => {
    analyticsService.trackLessonComplete(lessonId, metrics);
  }, []);

  const trackMistake = useCallback((type, details) => {
    analyticsService.trackMistake(type, details);
  }, []);

  const trackLoading = useCallback((screenName, loadTime) => {
    analyticsService.trackLoadingTime(screenName, loadTime);
  }, []);

  const trackInteraction = useCallback((interactionType, target, metadata = {}) => {
    analyticsService.trackInteraction(interactionType, target, metadata);
  }, []);

  const trackFeature = useCallback((featureName, context = {}) => {
    analyticsService.trackFeatureUsed(featureName, context);
  }, []);

  return {
    track,
    trackScreen,
    trackLesson,
    trackMistake,
    trackLoading,
    trackInteraction,
    trackFeature,
  };
}



















