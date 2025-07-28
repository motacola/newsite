'use client';

import { useState, useEffect } from 'react';

interface NetworkInfo {
  effectiveType: '2g' | '3g' | '4g' | 'slow-2g' | undefined;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

interface NetworkOptimization {
  shouldLoadVideo: boolean;
  shouldPreloadMedia: boolean;
  recommendedQuality: 'low' | 'medium' | 'high';
  connectionType: 'fast' | 'medium' | 'slow';
  isOnline: boolean;
}

export const useNetworkOptimization = (): NetworkOptimization => {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    effectiveType: undefined,
    downlink: 10,
    rtt: 100,
    saveData: false
  });
  
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return;
    }

    // Update online status
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    // Get network information if available
    const updateNetworkInfo = () => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;

      if (connection) {
        setNetworkInfo({
          effectiveType: connection.effectiveType,
          downlink: connection.downlink || 10,
          rtt: connection.rtt || 100,
          saveData: connection.saveData || false
        });
      }
    };

    // Initial setup
    updateOnlineStatus();
    updateNetworkInfo();

    // Event listeners
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Listen for network changes if supported
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateNetworkInfo);
    }

    // Cleanup
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      
      if (connection) {
        connection.removeEventListener('change', updateNetworkInfo);
      }
    };
  }, []);

  // Determine connection speed category
  const getConnectionType = (): 'fast' | 'medium' | 'slow' => {
    if (!networkInfo.effectiveType) {
      // Fallback based on downlink speed
      if (networkInfo.downlink >= 5) return 'fast';
      if (networkInfo.downlink >= 1.5) return 'medium';
      return 'slow';
    }

    switch (networkInfo.effectiveType) {
      case '4g':
        return networkInfo.downlink >= 5 ? 'fast' : 'medium';
      case '3g':
        return 'medium';
      case '2g':
      case 'slow-2g':
        return 'slow';
      default:
        return 'medium';
    }
  };

  const connectionType = getConnectionType();

  // Determine if video should be loaded
  const shouldLoadVideo = isOnline && 
                         !networkInfo.saveData && 
                         connectionType !== 'slow' &&
                         networkInfo.downlink >= 1.5;

  // Determine if media should be preloaded
  const shouldPreloadMedia = isOnline && 
                            !networkInfo.saveData && 
                            connectionType === 'fast' &&
                            networkInfo.downlink >= 3;

  // Recommend quality based on connection
  const getRecommendedQuality = (): 'low' | 'medium' | 'high' => {
    if (!isOnline || networkInfo.saveData) return 'low';
    
    switch (connectionType) {
      case 'fast':
        return 'high';
      case 'medium':
        return 'medium';
      case 'slow':
        return 'low';
      default:
        return 'medium';
    }
  };

  return {
    shouldLoadVideo,
    shouldPreloadMedia,
    recommendedQuality: getRecommendedQuality(),
    connectionType,
    isOnline
  };
};

// Hook for adaptive media loading
export const useAdaptiveMediaLoading = () => {
  const networkOptimization = useNetworkOptimization();
  const [deviceCapabilities, setDeviceCapabilities] = useState({
    isLowPowerMode: false,
    prefersReducedMotion: false,
    screenSize: 'desktop' as 'mobile' | 'tablet' | 'desktop',
    pixelRatio: 1
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect device capabilities
    const updateDeviceCapabilities = () => {
      const screenSize = window.innerWidth < 768 ? 'mobile' : 
                        window.innerWidth < 1024 ? 'tablet' : 'desktop';
      
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const isLowPowerMode = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
      const pixelRatio = window.devicePixelRatio || 1;

      setDeviceCapabilities({
        isLowPowerMode: Boolean(isLowPowerMode),
        prefersReducedMotion,
        screenSize,
        pixelRatio
      });
    };

    updateDeviceCapabilities();
    window.addEventListener('resize', updateDeviceCapabilities);

    return () => {
      window.removeEventListener('resize', updateDeviceCapabilities);
    };
  }, []);

  const getOptimalMediaSettings = () => {
    const { shouldLoadVideo, recommendedQuality, connectionType } = networkOptimization;
    const { isLowPowerMode, prefersReducedMotion, screenSize } = deviceCapabilities;

    return {
      // Video settings
      enableVideo: shouldLoadVideo && !isLowPowerMode && !prefersReducedMotion,
      autoPlay: !prefersReducedMotion && connectionType !== 'slow',
      preload: networkOptimization.shouldPreloadMedia ? 'auto' as const : 'metadata' as const,
      
      // Image settings
      quality: recommendedQuality,
      priority: screenSize === 'desktop' && connectionType === 'fast',
      
      // Loading behavior
      lazy: connectionType === 'slow' || isLowPowerMode,
      placeholder: connectionType === 'slow' ? 'blur' : 'empty',
      
      // Responsive behavior
      responsive: true,
      sizes: screenSize === 'mobile' ? '100vw' : 
             screenSize === 'tablet' ? '100vw' : '100vw'
    };
  };

  return {
    ...networkOptimization,
    ...deviceCapabilities,
    getOptimalMediaSettings
  };
};

export default useNetworkOptimization;