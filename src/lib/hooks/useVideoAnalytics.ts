'use client';

import { useCallback, useRef } from 'react';
import { VideoAnalytics } from '@/lib/types/video';

interface VideoAnalyticsConfig {
  enabled?: boolean;
  endpoint?: string;
  batchSize?: number;
  flushInterval?: number;
}

export const useVideoAnalytics = (config: VideoAnalyticsConfig = {}) => {
  const {
    enabled = true,
    endpoint = '/api/analytics/video',
    batchSize = 10,
    flushInterval = 30000, // 30 seconds
  } = config;

  const analyticsQueue = useRef<VideoAnalytics[]>([]);
  const flushTimer = useRef<NodeJS.Timeout | null>(null);

  // Flush analytics to server
  const flushAnalytics = useCallback(async () => {
    if (!enabled || analyticsQueue.current.length === 0) return;

    const events = [...analyticsQueue.current];
    analyticsQueue.current = [];

    try {
      // In a real implementation, you would send to your analytics service
      console.log('Flushing video analytics:', events);
      
      // Example API call (commented out since we don't have a backend)
      // await fetch(endpoint, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ events }),
      // });
    } catch (error) {
      console.error('Failed to send video analytics:', error);
      // Re-queue events on failure
      analyticsQueue.current.unshift(...events);
    }
  }, [enabled, endpoint]);

  // Track video event
  const trackEvent = useCallback((event: Omit<VideoAnalytics, 'timestamp'>) => {
    if (!enabled) return;

    const analyticsEvent: VideoAnalytics = {
      ...event,
      timestamp: Date.now(),
    };

    analyticsQueue.current.push(analyticsEvent);

    // Auto-flush if batch size reached
    if (analyticsQueue.current.length >= batchSize) {
      flushAnalytics();
    } else {
      // Set up timer for periodic flush
      if (flushTimer.current) {
        clearTimeout(flushTimer.current);
      }
      flushTimer.current = setTimeout(flushAnalytics, flushInterval);
    }
  }, [enabled, batchSize, flushAnalytics, flushInterval]);

  // Track specific video events
  const trackPlay = useCallback((videoId: string, currentTime?: number) => {
    trackEvent({ videoId, event: 'play', currentTime });
  }, [trackEvent]);

  const trackPause = useCallback((videoId: string, currentTime?: number) => {
    trackEvent({ videoId, event: 'pause', currentTime });
  }, [trackEvent]);

  const trackEnded = useCallback((videoId: string, duration?: number) => {
    trackEvent({ videoId, event: 'ended', duration });
  }, [trackEvent]);

  const trackSeek = useCallback((videoId: string, currentTime: number) => {
    trackEvent({ videoId, event: 'seek', currentTime });
  }, [trackEvent]);

  const trackFullscreen = useCallback((videoId: string) => {
    trackEvent({ videoId, event: 'fullscreen' });
  }, [trackEvent]);

  // Manual flush
  const flush = useCallback(() => {
    if (flushTimer.current) {
      clearTimeout(flushTimer.current);
      flushTimer.current = null;
    }
    flushAnalytics();
  }, [flushAnalytics]);

  return {
    trackEvent,
    trackPlay,
    trackPause,
    trackEnded,
    trackSeek,
    trackFullscreen,
    flush,
  };
};