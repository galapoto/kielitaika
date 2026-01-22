/**
 * Performance Service
 * Team CU - Performance Optimization
 * Tracks performance metrics, implements optimizations, and ensures 60fps
 */

// ============================================
// PERFORMANCE METRICS
// ============================================

export const PERFORMANCE_METRICS = {
  TTI: 'time_to_interactive', // Target: < 3s
  FCP: 'first_contentful_paint', // Target: < 1.5s
  LCP: 'largest_contentful_paint', // Target: < 2.5s
  CLS: 'cumulative_layout_shift', // Target: < 0.1
  FPS: 'frames_per_second', // Target: 60
};

// ============================================
// PERFORMANCE SERVICE
// ============================================

class PerformanceService {
  constructor() {
    this.metrics = {};
    this.frameCount = 0;
    this.lastFrameTime = Date.now();
    this.fps = 60;
    this.measurements = [];
    // Throttle warnings to reduce verbosity
    this.lastFPSWarning = 0;
    this.fpsWarningInterval = 5000; // Only warn every 5 seconds
    this.consecutiveLowFPS = 0;
  }

  /**
   * Measure performance metric
   */
  measure(metricName, value) {
    this.metrics[metricName] = value;
    this.measurements.push({
      metric: metricName,
      value,
      timestamp: Date.now(),
    });

    // Check if metric exceeds threshold
    this.checkThreshold(metricName, value);
  }

  /**
   * Check if metric exceeds threshold
   */
  checkThreshold(metricName, value) {
    const thresholds = {
      [PERFORMANCE_METRICS.TTI]: 3000,
      [PERFORMANCE_METRICS.FCP]: 1500,
      [PERFORMANCE_METRICS.LCP]: 2500,
      [PERFORMANCE_METRICS.CLS]: 0.1,
      [PERFORMANCE_METRICS.FPS]: 60,
    };

    const threshold = thresholds[metricName];
    if (!threshold) return;

    if (value > threshold && metricName !== PERFORMANCE_METRICS.FPS) {
      console.warn(`[PerformanceService] ${metricName} exceeds threshold: ${value}ms > ${threshold}ms`);
    } else if (metricName === PERFORMANCE_METRICS.FPS && value < threshold) {
      // Throttle FPS warnings - only warn every 5 seconds or if FPS drops below 50
      const now = Date.now();
      // More aggressive throttling for very low FPS (below 30)
      const warningInterval = value < 30 ? 10000 : this.fpsWarningInterval; // 10s for very low FPS
      const shouldWarn = (now - this.lastFPSWarning) >= warningInterval || (value < 30 && (now - this.lastFPSWarning) >= 5000);
      
      if (shouldWarn) {
        this.consecutiveLowFPS++;
        // Only log if it's been a while or FPS is really low
        // For very low FPS (< 30), only log every 20th occurrence
        const logFrequency = value < 30 ? 20 : (value < 50 ? 10 : 5);
        if (value < 30 || value < 50 || this.consecutiveLowFPS % logFrequency === 0) {
          console.warn(`[PerformanceService] FPS below threshold: ${value} < ${threshold}`);
          this.lastFPSWarning = now;
        }
      }
    } else if (metricName === PERFORMANCE_METRICS.FPS && value >= threshold) {
      // Reset counter when FPS is good
      this.consecutiveLowFPS = 0;
    }
  }

  /**
   * Track FPS
   */
  trackFPS() {
    const now = Date.now();
    const delta = now - this.lastFrameTime;
    
    if (delta > 0) {
      this.frameCount++;
      const currentFPS = 1000 / delta;
      
      // Smooth FPS calculation
      this.fps = this.fps * 0.9 + currentFPS * 0.1;
      
      this.measure(PERFORMANCE_METRICS.FPS, Math.round(this.fps));
    }
    
    this.lastFrameTime = now;
    
    // Continue tracking
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(() => this.trackFPS());
    }
  }

  /**
   * Start performance monitoring
   */
  startMonitoring() {
    // Track FPS
    if (typeof requestAnimationFrame !== 'undefined') {
      this.trackFPS();
    }

    // Track other metrics if available (web)
    if (typeof window !== 'undefined' && window.performance) {
      this.trackWebMetrics();
    }
  }

  /**
   * Track web-specific metrics
   */
  trackWebMetrics() {
    if (typeof window === 'undefined' || !window.performance) return;

    try {
      // Check if getEntriesByType is available (not available in React Native)
      if (typeof window.performance.getEntriesByType !== 'function') {
        return; // Silently skip in React Native environment
      }
      
      const perfData = window.performance.getEntriesByType('navigation')[0];
      if (perfData) {
        // Time to Interactive
        const tti = perfData.domInteractive - perfData.fetchStart;
        this.measure(PERFORMANCE_METRICS.TTI, tti);

        // First Contentful Paint
        const fcp = perfData.domContentLoadedEventStart - perfData.fetchStart;
        this.measure(PERFORMANCE_METRICS.FCP, fcp);
      }
    } catch (error) {
      // Only log error once, not repeatedly
      if (!this._webMetricsErrorLogged) {
        console.error('[PerformanceService] Error tracking web metrics:', error);
        this._webMetricsErrorLogged = true;
      }
    }
  }

  /**
   * Get performance report
   */
  getReport() {
    return {
      metrics: { ...this.metrics },
      fps: this.fps,
      measurements: this.measurements.slice(-50), // Last 50 measurements
      summary: this.getSummary(),
    };
  }

  /**
   * Get performance summary
   */
  getSummary() {
    const summary = {};
    
    Object.entries(this.metrics).forEach(([metric, value]) => {
      const thresholds = {
        [PERFORMANCE_METRICS.TTI]: 3000,
        [PERFORMANCE_METRICS.FCP]: 1500,
        [PERFORMANCE_METRICS.LCP]: 2500,
        [PERFORMANCE_METRICS.CLS]: 0.1,
        [PERFORMANCE_METRICS.FPS]: 60,
      };

      const threshold = thresholds[metric];
      if (!threshold) return;

      let status = 'good';
      if (metric === PERFORMANCE_METRICS.FPS) {
        status = value >= threshold ? 'good' : value >= threshold * 0.8 ? 'fair' : 'poor';
      } else {
        status = value <= threshold ? 'good' : value <= threshold * 1.5 ? 'fair' : 'poor';
      }

      summary[metric] = {
        value,
        threshold,
        status,
      };
    });

    return summary;
  }

  /**
   * Debounce function for performance
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Throttle function for performance
   */
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Lazy load image
   */
  lazyLoadImage(src, placeholder) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(src);
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = src;
    });
  }

  /**
   * Preload critical resources
   */
  preloadResources(resources) {
    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = resource.type || 'fetch';
      link.href = resource.url;
      document.head.appendChild(link);
    });
  }
}

// Export singleton instance
export const performanceService = new PerformanceService();

// Export convenience functions
export const measurePerformance = (metric, value) => performanceService.measure(metric, value);
export const getPerformanceReport = () => performanceService.getReport();
export const debounce = (func, wait) => performanceService.debounce(func, wait);
export const throttle = (func, limit) => performanceService.throttle(func, limit);



















