/**
 * Performance Monitoring Utilities
 * Web Vitals tracking and performance metrics
 */

import type { Metric } from 'web-vitals';

// Performance metrics storage
const metrics: Record<string, number> = {};

/**
 * Report Web Vitals to analytics
 */
export function reportWebVitals(metric: Metric) {
  // Store metric
  metrics[metric.name] = metric.value;

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vital] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
    });
  }

  // Send to Google Analytics 4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_category: 'Web Vitals',
      event_label: metric.id,
      non_interaction: true,
    });
  }

  // Send to custom analytics endpoint
  sendToAnalytics(metric);
}

/**
 * Send metric to analytics endpoint
 */
async function sendToAnalytics(metric: Metric) {
  // Skip in development unless explicitly enabled
  if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_ANALYTICS_DEV) {
    return;
  }

  const analyticsUrl = process.env.NEXT_PUBLIC_ANALYTICS_URL;
  if (!analyticsUrl) return;

  try {
    const body = JSON.stringify({
      metric: metric.name,
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
      page: typeof window !== 'undefined' ? window.location.pathname : '',
      timestamp: new Date().toISOString(),
    });

    // Use sendBeacon if available for better reliability
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon(analyticsUrl, body);
    } else {
      await fetch(analyticsUrl, {
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      });
    }
  } catch (error) {
    // Silently fail analytics - don't affect user experience
    console.debug('Analytics send failed:', error);
  }
}

/**
 * Measure custom performance marks
 */
export function measurePerformance(name: string, fn: () => void | Promise<void>) {
  const start = performance.now();
  
  const result = fn();
  
  if (result instanceof Promise) {
    return result.finally(() => {
      const duration = performance.now() - start;
      logPerformance(name, duration);
    });
  }
  
  const duration = performance.now() - start;
  logPerformance(name, duration);
  return result;
}

/**
 * Log performance measurement
 */
function logPerformance(name: string, duration: number) {
  metrics[name] = duration;
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
  }
  
  // Warn for slow operations
  if (duration > 1000) {
    console.warn(`[Performance Warning] ${name} took ${duration.toFixed(2)}ms`);
  }
}

/**
 * Create performance observer for specific entry types
 */
export function observePerformance(
  entryTypes: PerformanceObserverEntryList['getEntries'] extends () => infer R
    ? R extends PerformanceEntry[]
      ? PerformanceEntry['entryType'][]
      : string[]
    : string[],
  callback: (entries: PerformanceEntry[]) => void
) {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return () => {};
  }

  try {
    const observer = new PerformanceObserver((list) => {
      callback(list.getEntries());
    });

    observer.observe({ entryTypes: entryTypes as string[] });

    return () => observer.disconnect();
  } catch (error) {
    console.debug('PerformanceObserver not supported:', error);
    return () => {};
  }
}

/**
 * Track component render time
 */
export function useRenderTime(componentName: string) {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const start = performance.now();
  
  // Use requestAnimationFrame to measure after render
  requestAnimationFrame(() => {
    const duration = performance.now() - start;
    if (duration > 16) { // More than one frame
      console.debug(`[Render] ${componentName}: ${duration.toFixed(2)}ms`);
    }
  });
}

/**
 * Get all collected metrics
 */
export function getMetrics() {
  return { ...metrics };
}

/**
 * Clear all collected metrics
 */
export function clearMetrics() {
  Object.keys(metrics).forEach((key) => delete metrics[key]);
}

/**
 * Track Time to Interactive (TTI) approximation
 */
export function trackTTI() {
  if (typeof window === 'undefined') return;

  // Simple TTI approximation - when main thread is idle
  let lastBusy = performance.now();
  let checkCount = 0;
  const maxChecks = 50;

  const check = () => {
    const now = performance.now();
    
    // Check if we've had 5 seconds of relative quiet
    if (now - lastBusy > 5000) {
      const tti = lastBusy;
      metrics['TTI'] = tti;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] TTI: ${tti.toFixed(2)}ms`);
      }
      return;
    }
    
    checkCount++;
    if (checkCount < maxChecks) {
      requestIdleCallback ? requestIdleCallback(check) : setTimeout(check, 100);
    }
  };

  requestIdleCallback ? requestIdleCallback(check) : setTimeout(check, 100);
}

/**
 * Track long tasks that block the main thread
 */
export function trackLongTasks() {
  return observePerformance(['longtask'], (entries) => {
    entries.forEach((entry) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[Long Task] Duration: ${entry.duration.toFixed(2)}ms`, {
          startTime: entry.startTime,
          name: entry.name,
        });
      }
    });
  });
}

/**
 * Track resource loading times
 */
export function trackResources() {
  return observePerformance(['resource'], (entries) => {
    entries.forEach((entry) => {
      const resourceEntry = entry as PerformanceResourceTiming;
      
      // Only track slow resources (>1s)
      if (resourceEntry.duration > 1000) {
        console.warn(`[Slow Resource] ${resourceEntry.name}: ${resourceEntry.duration.toFixed(2)}ms`);
      }
    });
  });
}

export default {
  reportWebVitals,
  measurePerformance,
  observePerformance,
  getMetrics,
  clearMetrics,
  trackTTI,
  trackLongTasks,
  trackResources,
};

