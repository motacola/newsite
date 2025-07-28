'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { usePerformance } from '@/components/providers/PerformanceProvider';

interface UsePerformanceOptimizationOptions {
  enableLazyLoading?: boolean;
  enableImageOptimization?: boolean;
  enableAnimationOptimization?: boolean;
  enableMemoryMonitoring?: boolean;
}

interface PerformanceOptimizationState {
  isLowEndDevice: boolean;
  shouldReduceAnimations: boolean;
  shouldOptimizeImages: boolean;
  memoryUsage: number;
  networkSpeed: 'slow' | 'fast' | 'unknown';
}

export function usePerformanceOptimization(options: UsePerformanceOptimizationOptions = {}) {
  const {
    enableLazyLoading = true,
    enableImageOptimization = true,
    enableAnimationOptimization = true,
    enableMemoryMonitoring = true,
  } = options;

  const { networkStatus, performanceMonitor } = usePerformance();
  const [state, setState] = useState<PerformanceOptimizationState>({
    isLowEndDevice: false,
    shouldReduceAnimations: false,
    shouldOptimizeImages: true,
    memoryUsage: 0,
    networkSpeed: 'unknown',
  });

  const performanceObserverRef = useRef<PerformanceObserver | null>(null);

  // Detect device capabilities
  const detectDeviceCapabilities = useCallback(() => {
    if (typeof window === 'undefined') return;

    const navigator = window.navigator as any;
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    // Detect low-end device
    const isLowEndDevice = 
      navigator.hardwareConcurrency <= 2 ||
      (navigator.deviceMemory && navigator.deviceMemory <= 2) ||
      connection?.effectiveType === 'slow-2g' ||
      connection?.effectiveType === '2g';

    // Detect network speed
    let networkSpeed: 'slow' | 'fast' | 'unknown' = 'unknown';
    if (connection) {
      const effectiveType = connection.effectiveType;
      networkSpeed = ['slow-2g', '2g'].includes(effectiveType) ? 'slow' : 'fast';
    }

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    setState(prev => ({
      ...prev,
      isLowEndDevice,
      shouldReduceAnimations: isLowEndDevice || prefersReducedMotion,
      shouldOptimizeImages: isLowEndDevice || networkSpeed === 'slow',
      networkSpeed,
    }));
  }, []);

  // Monitor memory usage
  const monitorMemoryUsage = useCallback(() => {
    if (!enableMemoryMonitoring || typeof window === 'undefined') return;

    const memory = (performance as any).memory;
    if (memory) {
      const usagePercentage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
      setState(prev => ({ ...prev, memoryUsage: usagePercentage }));

      // Trigger garbage collection hint if memory usage is high
      if (usagePercentage > 80 && 'gc' in window) {
        (window as any).gc();
      }
    }
  }, [enableMemoryMonitoring]);

  // Optimize images based on device capabilities
  const getOptimizedImageProps = useCallback((src: string, alt: string) => {
    const baseProps = { src, alt };
    
    if (!enableImageOptimization) return baseProps;

    return {
      ...baseProps,
      loading: enableLazyLoading ? 'lazy' as const : 'eager' as const,
      decoding: 'async' as const,
      sizes: state.isLowEndDevice 
        ? '(max-width: 768px) 100vw, 50vw'
        : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
      quality: state.isLowEndDevice ? 75 : 90,
    };
  }, [enableImageOptimization, enableLazyLoading, state.isLowEndDevice]);

  // Get animation configuration based on device capabilities
  const getAnimationConfig = useCallback(() => {
    if (!enableAnimationOptimization) {
      return { duration: 0.3, ease: 'easeOut' };
    }

    if (state.shouldReduceAnimations) {
      return { duration: 0.1, ease: 'linear' };
    }

    return state.isLowEndDevice 
      ? { duration: 0.2, ease: 'easeOut' }
      : { duration: 0.3, ease: 'easeOut' };
  }, [enableAnimationOptimization, state.shouldReduceAnimations, state.isLowEndDevice]);

  // Debounced scroll handler for performance
  const createOptimizedScrollHandler = useCallback((handler: () => void, delay = 16) => {
    let timeoutId: NodeJS.Timeout;
    let lastExecution = 0;

    return () => {
      const now = Date.now();
      
      if (now - lastExecution > delay) {
        handler();
        lastExecution = now;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          handler();
          lastExecution = Date.now();
        }, delay);
      }
    };
  }, []);

  // Intersection observer with performance optimizations
  const createOptimizedIntersectionObserver = useCallback((
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit
  ) => {
    const defaultOptions: IntersectionObserverInit = {
      rootMargin: state.isLowEndDevice ? '50px' : '100px',
      threshold: state.isLowEndDevice ? 0.1 : 0.25,
      ...options,
    };

    return new IntersectionObserver(callback, defaultOptions);
  }, [state.isLowEndDevice]);

  // Resource preloading based on network conditions
  const preloadResource = useCallback((href: string, as: string) => {
    if (state.networkSpeed === 'slow' || networkStatus === 'offline') {
      return; // Skip preloading on slow connections
    }

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  }, [state.networkSpeed, networkStatus]);

  useEffect(() => {
    detectDeviceCapabilities();
    
    // Set up memory monitoring
    const memoryInterval = setInterval(monitorMemoryUsage, 5000);

    // Listen for connection changes
    const handleConnectionChange = () => detectDeviceCapabilities();
    if (typeof window !== 'undefined') {
      const navigator = window.navigator as any;
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      
      if (connection) {
        connection.addEventListener('change', handleConnectionChange);
      }
    }

    return () => {
      clearInterval(memoryInterval);
      if (typeof window !== 'undefined') {
        const navigator = window.navigator as any;
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        if (connection) {
          connection.removeEventListener('change', handleConnectionChange);
        }
      }
    };
  }, [detectDeviceCapabilities, monitorMemoryUsage]);

  return {
    ...state,
    networkStatus,
    getOptimizedImageProps,
    getAnimationConfig,
    createOptimizedScrollHandler,
    createOptimizedIntersectionObserver,
    preloadResource,
  };
}