// Performance monitoring and Core Web Vitals tracking
interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

interface WebVitalsMetric {
  id: string;
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  navigationType: string;
}

// Core Web Vitals thresholds
const THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
};

// Performance observer for monitoring metrics
class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers();
    }
  }

  private initializeObservers(): void {
    // Largest Contentful Paint (LCP)
    this.observeMetric('largest-contentful-paint', (entries) => {
      const lastEntry = entries[entries.length - 1];
      this.recordMetric('LCP', lastEntry.startTime);
    });

    // First Input Delay (FID)
    this.observeMetric('first-input', (entries) => {
      const firstEntry = entries[0] as any;
      this.recordMetric('FID', firstEntry.processingStart - firstEntry.startTime);
    });

    // Cumulative Layout Shift (CLS)
    this.observeMetric('layout-shift', (entries) => {
      let clsValue = 0;
      for (const entry of entries) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      this.recordMetric('CLS', clsValue);
    });

    // Navigation timing
    this.observeNavigationTiming();
  }

  private observeMetric(type: string, callback: (entries: PerformanceEntry[]) => void): void {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      observer.observe({ type, buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.warn(`Failed to observe ${type}:`, error);
    }
  }

  private observeNavigationTiming(): void {
    if ('navigation' in performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      // Time to First Byte (TTFB)
      const ttfb = navigation.responseStart - navigation.requestStart;
      this.recordMetric('TTFB', ttfb);

      // First Contentful Paint (FCP)
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        this.recordMetric('FCP', fcpEntry.startTime);
      }
    }
  }

  private recordMetric(name: string, value: number): void {
    const rating = this.getRating(name as keyof typeof THRESHOLDS, value);
    const metric: PerformanceMetric = {
      name,
      value,
      rating,
      timestamp: Date.now(),
    };

    this.metrics.push(metric);
    this.reportMetric(metric);
  }

  private getRating(name: keyof typeof THRESHOLDS, value: number): 'good' | 'needs-improvement' | 'poor' {
    const threshold = THRESHOLDS[name];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  private reportMetric(metric: PerformanceMetric): void {
    // Send to analytics service (replace with your analytics provider)
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(metric);
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance Metric - ${metric.name}:`, {
        value: `${metric.value.toFixed(2)}ms`,
        rating: metric.rating,
      });
    }
  }

  private sendToAnalytics(metric: PerformanceMetric): void {
    // Example: Send to Google Analytics 4
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'web_vitals', {
        event_category: 'Performance',
        event_label: metric.name,
        value: Math.round(metric.value),
        custom_map: {
          metric_rating: metric.rating,
        },
      });
    }

    // Example: Send to custom analytics endpoint
    fetch('/api/analytics/performance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metric),
    }).catch(error => {
      console.warn('Failed to send performance metric:', error);
    });
  }

  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  public getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.name === name);
  }

  public disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Resource timing monitoring
export const monitorResourceTiming = (): void => {
  if (typeof window === 'undefined') return;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const resource = entry as PerformanceResourceTiming;
      
      // Monitor slow resources
      if (resource.duration > 1000) {
        console.warn('Slow resource detected:', {
          name: resource.name,
          duration: `${resource.duration.toFixed(2)}ms`,
          size: resource.transferSize,
        });
      }

      // Monitor failed resources
      if (resource.transferSize === 0 && resource.duration > 0) {
        console.warn('Failed resource detected:', resource.name);
      }
    }
  });

  observer.observe({ type: 'resource', buffered: true });
};

// Memory usage monitoring
export const monitorMemoryUsage = (): any => {
  if (typeof window === 'undefined' || !('memory' in performance)) return null;

  const memory = (performance as any).memory;
  const memoryInfo = {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
    usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
  };

  if (memoryInfo.usagePercentage > 80) {
    console.warn('High memory usage detected:', memoryInfo);
  }

  return memoryInfo;
};

// Bundle size monitoring
export const getBundleSize = async (): Promise<number> => {
  if (typeof window === 'undefined') return 0;

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const jsResources = resources.filter(resource => 
    resource.name.includes('/_next/static/chunks/') && 
    resource.name.endsWith('.js')
  );

  return jsResources.reduce((total, resource) => total + (resource.transferSize || 0), 0);
};

// Initialize performance monitoring
export const initializePerformanceMonitoring = (): PerformanceMonitor => {
  const monitor = new PerformanceMonitor();
  
  // Monitor resources
  monitorResourceTiming();
  
  // Monitor memory usage periodically
  if (typeof window !== 'undefined') {
    setInterval(() => {
      monitorMemoryUsage();
    }, 30000); // Every 30 seconds
  }

  return monitor;
};

// Web Vitals reporting function (compatible with web-vitals library)
export const reportWebVitals = (metric: WebVitalsMetric): void => {
  console.log('Web Vital:', metric);
  
  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    // Example: Google Analytics 4
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', metric.name, {
        event_category: 'Web Vitals',
        value: Math.round(metric.value),
        event_label: metric.id,
        non_interaction: true,
      });
    }
  }
};

export default PerformanceMonitor;