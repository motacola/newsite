/**
 * Performance Monitoring Utilities for Testing
 * Provides tools for measuring and validating performance metrics
 */

export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  frameRate?: number;
  bundleSize?: number;
  networkRequests?: number;
}

export interface PerformanceBudget {
  renderTime: number;
  memoryUsage?: number;
  frameRate?: number;
  bundleSize?: number;
  networkRequests?: number;
}

export class PerformanceMonitor {
  private startTime: number = 0;
  private endTime: number = 0;
  private frameCount: number = 0;
  private lastFrameTime: number = 0;
  private rafId: number | null = null;

  constructor() {
    this.startTime = performance.now();
  }

  /**
   * Start monitoring render performance
   */
  startRenderMonitoring(): void {
    this.startTime = performance.now();
  }

  /**
   * Stop monitoring and get render time
   */
  stopRenderMonitoring(): number {
    this.endTime = performance.now();
    return this.endTime - this.startTime;
  }

  /**
   * Monitor frame rate over a period
   */
  startFrameRateMonitoring(duration: number = 1000): Promise<number> {
    return new Promise((resolve) => {
      this.frameCount = 0;
      this.lastFrameTime = performance.now();
      
      const countFrames = () => {
        this.frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - this.lastFrameTime < duration) {
          this.rafId = requestAnimationFrame(countFrames);
        } else {
          const fps = this.frameCount / (duration / 1000);
          resolve(fps);
        }
      };
      
      this.rafId = requestAnimationFrame(countFrames);
    });
  }

  /**
   * Stop frame rate monitoring
   */
  stopFrameRateMonitoring(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Get memory usage (if available)
   */
  getMemoryUsage(): number | undefined {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return undefined;
  }

  /**
   * Monitor network requests
   */
  getNetworkMetrics(): Promise<PerformanceEntry[]> {
    return new Promise((resolve) => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          observer.disconnect();
          resolve(entries);
        });
        
        observer.observe({ entryTypes: ['resource'] });
        
        // Timeout after 5 seconds
        setTimeout(() => {
          observer.disconnect();
          resolve([]);
        }, 5000);
      } else {
        resolve([]);
      }
    });
  }

  /**
   * Validate performance against budget
   */
  validatePerformance(metrics: PerformanceMetrics, budget: PerformanceBudget): {
    passed: boolean;
    violations: string[];
  } {
    const violations: string[] = [];

    if (metrics.renderTime > budget.renderTime) {
      violations.push(`Render time ${metrics.renderTime}ms exceeds budget ${budget.renderTime}ms`);
    }

    if (budget.memoryUsage && metrics.memoryUsage && metrics.memoryUsage > budget.memoryUsage) {
      violations.push(`Memory usage ${metrics.memoryUsage} exceeds budget ${budget.memoryUsage}`);
    }

    if (budget.frameRate && metrics.frameRate && metrics.frameRate < budget.frameRate) {
      violations.push(`Frame rate ${metrics.frameRate}fps below budget ${budget.frameRate}fps`);
    }

    if (budget.bundleSize && metrics.bundleSize && metrics.bundleSize > budget.bundleSize) {
      violations.push(`Bundle size ${metrics.bundleSize} exceeds budget ${budget.bundleSize}`);
    }

    if (budget.networkRequests && metrics.networkRequests && metrics.networkRequests > budget.networkRequests) {
      violations.push(`Network requests ${metrics.networkRequests} exceed budget ${budget.networkRequests}`);
    }

    return {
      passed: violations.length === 0,
      violations,
    };
  }

  /**
   * Create a performance report
   */
  createReport(metrics: PerformanceMetrics): string {
    const report = [
      '=== Performance Report ===',
      `Render Time: ${metrics.renderTime.toFixed(2)}ms`,
    ];

    if (metrics.memoryUsage) {
      report.push(`Memory Usage: ${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
    }

    if (metrics.frameRate) {
      report.push(`Frame Rate: ${metrics.frameRate.toFixed(2)}fps`);
    }

    if (metrics.bundleSize) {
      report.push(`Bundle Size: ${(metrics.bundleSize / 1024).toFixed(2)}KB`);
    }

    if (metrics.networkRequests) {
      report.push(`Network Requests: ${metrics.networkRequests}`);
    }

    return report.join('\n');
  }
}

/**
 * Device capability detection for performance testing
 */
export class DeviceCapabilityDetector {
  /**
   * Detect if device is low-end based on available metrics
   */
  static isLowEndDevice(): boolean {
    const memory = (navigator as any).deviceMemory;
    const cores = navigator.hardwareConcurrency;
    
    // Consider low-end if memory <= 2GB or cores <= 2
    return (memory && memory <= 2) || (cores && cores <= 2);
  }

  /**
   * Detect if user prefers reduced motion
   */
  static prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Detect if device is on battery power
   */
  static async isBatteryLow(): Promise<boolean> {
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        return battery.level < 0.3 && !battery.charging;
      } catch {
        return false;
      }
    }
    return false;
  }

  /**
   * Detect network connection quality
   */
  static getNetworkQuality(): 'slow' | 'fast' | 'unknown' {
    const connection = (navigator as any).connection;
    
    if (connection) {
      const effectiveType = connection.effectiveType;
      
      if (effectiveType === 'slow-2g' || effectiveType === '2g') {
        return 'slow';
      } else if (effectiveType === '3g' || effectiveType === '4g') {
        return 'fast';
      }
    }
    
    return 'unknown';
  }

  /**
   * Get recommended performance budget based on device capabilities
   */
  static getRecommendedBudget(): PerformanceBudget {
    const isLowEnd = this.isLowEndDevice();
    const prefersReducedMotion = this.prefersReducedMotion();
    
    return {
      renderTime: isLowEnd ? 200 : 100,
      memoryUsage: isLowEnd ? 50 * 1024 * 1024 : 100 * 1024 * 1024, // 50MB vs 100MB
      frameRate: prefersReducedMotion ? 30 : 60,
      bundleSize: isLowEnd ? 200 * 1024 : 500 * 1024, // 200KB vs 500KB
      networkRequests: isLowEnd ? 10 : 20,
    };
  }
}

/**
 * Cross-browser compatibility detector
 */
export class BrowserCompatibilityDetector {
  /**
   * Detect browser and version
   */
  static getBrowserInfo(): { name: string; version: string; mobile: boolean } {
    const userAgent = navigator.userAgent;
    
    let name = 'unknown';
    let version = 'unknown';
    const mobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    
    if (userAgent.includes('Chrome')) {
      name = 'chrome';
      const match = userAgent.match(/Chrome\/(\d+)/);
      version = match ? match[1] : 'unknown';
    } else if (userAgent.includes('Firefox')) {
      name = 'firefox';
      const match = userAgent.match(/Firefox\/(\d+)/);
      version = match ? match[1] : 'unknown';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      name = 'safari';
      const match = userAgent.match(/Version\/(\d+)/);
      version = match ? match[1] : 'unknown';
    } else if (userAgent.includes('Edge')) {
      name = 'edge';
      const match = userAgent.match(/Edge\/(\d+)/);
      version = match ? match[1] : 'unknown';
    }
    
    return { name, version, mobile };
  }

  /**
   * Check for specific browser features
   */
  static checkFeatureSupport(): Record<string, boolean> {
    return {
      intersectionObserver: 'IntersectionObserver' in window,
      resizeObserver: 'ResizeObserver' in window,
      requestAnimationFrame: 'requestAnimationFrame' in window,
      webp: this.supportsWebP(),
      cssGrid: CSS.supports('display', 'grid'),
      cssFlexbox: CSS.supports('display', 'flex'),
      cssCustomProperties: CSS.supports('--test', 'value'),
      fetch: 'fetch' in window,
      promise: 'Promise' in window,
      asyncAwait: this.supportsAsyncAwait(),
      es6Modules: this.supportsES6Modules(),
      serviceWorker: 'serviceWorker' in navigator,
      webWorker: 'Worker' in window,
    };
  }

  private static supportsWebP(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  private static supportsAsyncAwait(): boolean {
    try {
      eval('(async () => {})');
      return true;
    } catch {
      return false;
    }
  }

  private static supportsES6Modules(): boolean {
    const script = document.createElement('script');
    return 'noModule' in script;
  }

  /**
   * Get compatibility recommendations
   */
  static getCompatibilityRecommendations(): {
    shouldUsePolyfills: boolean;
    recommendedFeatures: string[];
    unsupportedFeatures: string[];
  } {
    const features = this.checkFeatureSupport();
    const unsupportedFeatures: string[] = [];
    const recommendedFeatures: string[] = [];
    
    Object.entries(features).forEach(([feature, supported]) => {
      if (!supported) {
        unsupportedFeatures.push(feature);
      } else {
        recommendedFeatures.push(feature);
      }
    });
    
    return {
      shouldUsePolyfills: unsupportedFeatures.length > 0,
      recommendedFeatures,
      unsupportedFeatures,
    };
  }
}

/**
 * Responsive design testing utilities
 */
export class ResponsiveTestingUtils {
  /**
   * Common viewport sizes for testing
   */
  static readonly VIEWPORTS = {
    mobile: { width: 375, height: 667, name: 'iPhone SE' },
    mobileLarge: { width: 414, height: 896, name: 'iPhone 11 Pro Max' },
    tablet: { width: 768, height: 1024, name: 'iPad' },
    tabletLarge: { width: 1024, height: 1366, name: 'iPad Pro' },
    desktop: { width: 1024, height: 768, name: 'Desktop Small' },
    desktopLarge: { width: 1440, height: 900, name: 'Desktop Large' },
    ultraWide: { width: 1920, height: 1080, name: 'Ultra Wide' },
  };

  /**
   * Set viewport size for testing
   */
  static setViewport(width: number, height: number): void {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
    
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height,
    });
    
    window.dispatchEvent(new Event('resize'));
  }

  /**
   * Test component across all viewport sizes
   */
  static async testAcrossViewports<T>(
    renderFn: (viewport: { width: number; height: number; name: string }) => T,
    testFn: (result: T, viewport: { width: number; height: number; name: string }) => Promise<void>
  ): Promise<void> {
    for (const viewport of Object.values(this.VIEWPORTS)) {
      this.setViewport(viewport.width, viewport.height);
      const result = renderFn(viewport);
      await testFn(result, viewport);
    }
  }

  /**
   * Check if element is responsive
   */
  static isElementResponsive(element: HTMLElement): boolean {
    const computedStyle = window.getComputedStyle(element);
    
    // Check for responsive CSS properties
    const hasFlexbox = computedStyle.display === 'flex';
    const hasGrid = computedStyle.display === 'grid';
    const hasRelativeWidth = computedStyle.width.includes('%') || computedStyle.width === 'auto';
    const hasMediaQueries = computedStyle.getPropertyValue('--responsive') === 'true';
    
    return hasFlexbox || hasGrid || hasRelativeWidth || hasMediaQueries;
  }
}