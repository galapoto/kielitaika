/**
 * Analytics Service
 * Team CU - Analytics Instrumentation
 * Tracks engagement, learning outcomes, UX metrics, and business metrics
 */

import { sendAnalyticsEvent } from '../utils/api';

// ============================================
// EVENT TYPES
// ============================================

export const ANALYTICS_EVENTS = {
  // Engagement
  APP_OPEN: 'app_open',
  SCREEN_VIEW: 'screen_view',
  SESSION_START: 'session_start',
  SESSION_END: 'session_end',
  
  // Learning
  LESSON_START: 'lesson_start',
  LESSON_COMPLETE: 'lesson_complete',
  LESSON_ABANDON: 'lesson_abandon',
  EXERCISE_COMPLETE: 'exercise_complete',
  MISTAKE_MADE: 'mistake_made',
  MISTAKE_REVIEWED: 'mistake_reviewed',
  
  // Navigation
  NAVIGATION: 'navigation',
  SEARCH: 'search',
  FILTER_APPLIED: 'filter_applied',
  
  // Gamification
  XP_GAINED: 'xp_gained',
  LEVEL_UP: 'level_up',
  STREAK_UPDATED: 'streak_updated',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  
  // Conversion
  SUBSCRIPTION_VIEW: 'subscription_view',
  SUBSCRIPTION_START: 'subscription_start',
  UPGRADE_PROMPT_SHOWN: 'upgrade_prompt_shown',
  UPGRADE_CLICKED: 'upgrade_clicked',
  
  // UX
  ERROR_OCCURRED: 'error_occurred',
  LOADING_TIME: 'loading_time',
  INTERACTION: 'interaction',
  FEATURE_USED: 'feature_used',
  
  // YKI Specific
  YKI_EXAM_START: 'yki_exam_start',
  YKI_EXAM_COMPLETE: 'yki_exam_complete',
  YKI_PRACTICE_START: 'yki_practice_start',
  
  // Workplace
  WORKPLACE_LESSON_START: 'workplace_lesson_start',
  ROLEPLAY_START: 'roleplay_start',
  ROLEPLAY_COMPLETE: 'roleplay_complete',
};

// ============================================
// ANALYTICS SERVICE
// ============================================

class AnalyticsService {
  constructor() {
    this.sessionStartTime = null;
    this.pendingEvents = [];
    this.flushInterval = null;
    this.batchSize = 10;
  }

  /**
   * Track an event
   */
  async track(eventType, data = {}) {
    const event = {
      event_type: eventType,
      timestamp: new Date().toISOString(),
      data: {
        ...data,
        platform: 'mobile', // or 'web'
      },
    };

    try {
      // Send immediately for critical events
      if (this.isCriticalEvent(eventType)) {
        await sendAnalyticsEvent(eventType, event.data);
      } else {
        // Batch non-critical events
        this.pendingEvents.push(event);
        if (this.pendingEvents.length >= this.batchSize) {
          await this.flush();
        }
      }
    } catch (error) {
      console.error('[AnalyticsService] Error tracking event:', error);
      // Store locally for retry
      this.storeEventLocally(event);
    }
  }

  /**
   * Check if event is critical (send immediately)
   */
  isCriticalEvent(eventType) {
    const criticalEvents = [
      ANALYTICS_EVENTS.SUBSCRIPTION_START,
      ANALYTICS_EVENTS.ERROR_OCCURRED,
      ANALYTICS_EVENTS.YKI_EXAM_COMPLETE,
    ];
    return criticalEvents.includes(eventType);
  }

  /**
   * Flush pending events
   */
  async flush() {
    if (this.pendingEvents.length === 0) return;

    const events = [...this.pendingEvents];
    this.pendingEvents = [];

    try {
      // Batch send events
      for (const event of events) {
        await sendAnalyticsEvent(event.event_type, event.data);
      }
    } catch (error) {
      console.error('[AnalyticsService] Error flushing events:', error);
      // Re-add to pending
      this.pendingEvents.unshift(...events);
    }
  }

  /**
   * Store event locally for retry
   */
  async storeEventLocally(event) {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const stored = await AsyncStorage.getItem('@ruka_analytics_queue');
      const queue = stored ? JSON.parse(stored) : [];
      queue.push(event);
      // Keep only last 100 events
      const trimmed = queue.slice(-100);
      await AsyncStorage.setItem('@ruka_analytics_queue', JSON.stringify(trimmed));
    } catch (error) {
      console.error('[AnalyticsService] Error storing event locally:', error);
    }
  }

  /**
   * Retry stored events
   */
  async retryStoredEvents() {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const stored = await AsyncStorage.getItem('@ruka_analytics_queue');
      if (!stored) return;

      const queue = JSON.parse(stored);
      for (const event of queue) {
        await sendAnalyticsEvent(event.event_type, event.data);
      }
      
      await AsyncStorage.removeItem('@ruka_analytics_queue');
    } catch (error) {
      console.error('[AnalyticsService] Error retrying stored events:', error);
    }
  }

  /**
   * Start session tracking
   */
  startSession() {
    this.sessionStartTime = Date.now();
    this.track(ANALYTICS_EVENTS.SESSION_START, {
      timestamp: new Date().toISOString(),
    });

    // Set up periodic flush
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 30000); // Flush every 30 seconds
  }

  /**
   * End session tracking
   */
  async endSession() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }

    if (this.sessionStartTime) {
      const duration = Date.now() - this.sessionStartTime;
      await this.track(ANALYTICS_EVENTS.SESSION_END, {
        duration_ms: duration,
        duration_seconds: Math.round(duration / 1000),
      });
      this.sessionStartTime = null;
    }

    // Flush any pending events
    await this.flush();
  }

  /**
   * Track screen view
   */
  trackScreenView(screenName, params = {}) {
    this.track(ANALYTICS_EVENTS.SCREEN_VIEW, {
      screen_name: screenName,
      ...params,
    });
  }

  /**
   * Track lesson completion with metrics
   */
  trackLessonComplete(lessonId, metrics) {
    this.track(ANALYTICS_EVENTS.LESSON_COMPLETE, {
      lesson_id: lessonId,
      accuracy: metrics.accuracy,
      time_spent: metrics.timeSpent,
      mistakes_count: metrics.mistakesCount,
      xp_gained: metrics.xpGained,
    });
  }

  /**
   * Track mistake with details
   */
  trackMistake(mistakeType, details) {
    this.track(ANALYTICS_EVENTS.MISTAKE_MADE, {
      mistake_type: mistakeType, // 'grammar', 'vocabulary', 'pronunciation', etc.
      details,
    });
  }

  /**
   * Track loading performance
   */
  trackLoadingTime(screenName, loadTime) {
    this.track(ANALYTICS_EVENTS.LOADING_TIME, {
      screen_name: screenName,
      load_time_ms: loadTime,
    });
  }

  /**
   * Track user interaction
   */
  trackInteraction(interactionType, target, metadata = {}) {
    this.track(ANALYTICS_EVENTS.INTERACTION, {
      interaction_type: interactionType, // 'tap', 'swipe', 'long_press', etc.
      target,
      ...metadata,
    });
  }

  /**
   * Track feature usage
   */
  trackFeatureUsed(featureName, context = {}) {
    this.track(ANALYTICS_EVENTS.FEATURE_USED, {
      feature_name: featureName,
      ...context,
    });
  }

  /**
   * Track conversion funnel
   */
  trackConversionStep(step, data = {}) {
    this.track(`conversion_${step}`, data);
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

// Export convenience functions
export const trackEvent = (eventType, data) => analyticsService.track(eventType, data);
export const trackScreen = (screenName, params) => analyticsService.trackScreenView(screenName, params);
export const trackLesson = (lessonId, metrics) => analyticsService.trackLessonComplete(lessonId, metrics);
export const trackMistake = (type, details) => analyticsService.trackMistake(type, details);



















