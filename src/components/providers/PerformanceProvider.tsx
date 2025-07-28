'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { registerServiceWorker, getNetworkStatus, onNetworkChange } from '@/lib/serviceWorker';
import { initializePerformanceMonitoring, reportWebVitals } from '@/lib/performance';
import type PerformanceMonitor from '@/lib/performance';

interface PerformanceContextType {
  networkStatus: 'online' | 'offline';
  performanceMonitor: PerformanceMonitor | null;
  isServiceWorkerSupported: boolean;
  isServiceWorkerRegistered: boolean;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

interface PerformanceProviderProps {
  children: ReactNode;
}

export function PerformanceProvider({ children }: PerformanceProviderProps) {
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline'>('online');
  const [performanceMonitor, setPerformanceMonitor] = useState<PerformanceMonitor | null>(null);
  const [isServiceWorkerSupported, setIsServiceWorkerSupported] = useState(false);
  const [isServiceWorkerRegistered, setIsServiceWorkerRegistered] = useState(false);

  useEffect(() => {
    // Initialize network status
    setNetworkStatus(getNetworkStatus());

    // Set up network status monitoring
    const unsubscribe = onNetworkChange(setNetworkStatus);

    // Check service worker support
    setIsServiceWorkerSupported('serviceWorker' in navigator);

    // Register service worker
    if ('serviceWorker' in navigator) {
      registerServiceWorker()
        .then(() => setIsServiceWorkerRegistered(true))
        .catch(console.error);
    }

    // Initialize performance monitoring
    const monitor = initializePerformanceMonitoring();
    setPerformanceMonitor(monitor);

    // Set up Web Vitals reporting
    if (typeof window !== 'undefined') {
      // Dynamic import to avoid SSR issues
      import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB, onINP }) => {
        onCLS(reportWebVitals);
        onFID(reportWebVitals);
        onFCP(reportWebVitals);
        onLCP(reportWebVitals);
        onTTFB(reportWebVitals);
        onINP(reportWebVitals);
      }).catch(() => {
        // Fallback if web-vitals is not available
        console.log('Web Vitals library not available, using built-in monitoring');
      });
    }

    return () => {
      unsubscribe();
      if (monitor) {
        monitor.disconnect();
      }
    };
  }, []);

  const value: PerformanceContextType = {
    networkStatus,
    performanceMonitor,
    isServiceWorkerSupported,
    isServiceWorkerRegistered,
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformance() {
  const context = useContext(PerformanceContext);
  if (context === undefined) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
}