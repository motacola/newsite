export interface MediaItem {
  type: 'video' | 'image';
  src: string;
  fallback?: string;
  alt?: string;
  poster?: string;
  breakpoint?: 'mobile' | 'tablet' | 'desktop' | 'all';
  quality?: 'low' | 'medium' | 'high';
  preload?: 'none' | 'metadata' | 'auto';
  // Enhanced video support
  sources?: {
    src: string;
    type: string;
    media?: string; // Media query for responsive sources
  }[];
  // Performance optimization
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  // Responsive image support
  srcSet?: string;
  sizes?: string;
  // Video-specific enhancements
  duration?: number;
  aspectRatio?: string;
  // Accessibility
  ariaLabel?: string;
  // Caching hints
  cacheControl?: string;
}

export interface MediaConfiguration {
  hero: MediaItem[];
  projects: MediaItem[];
  about: MediaItem[];
}

// Default media configuration for the portfolio
export const defaultMediaConfig: MediaConfiguration = {
  hero: [
    // High-quality image for desktop
    {
      type: 'image',
      src: '/chris_profile.jpeg',
      alt: 'Christopher Belgrave - AI Expert and Project Manager',
      fallback: '/chris_profile.jpeg',
      breakpoint: 'desktop',
      quality: 'high',
      preload: 'auto'
    },
    // Optimized version for mobile
    {
      type: 'image',
      src: '/chris_profile.jpeg',
      alt: 'Christopher Belgrave - AI Expert and Project Manager',
      fallback: '/chris_profile.jpeg',
      breakpoint: 'mobile',
      quality: 'medium',
      preload: 'metadata'
    }
  ],
  projects: [],
  about: []
};

// Enhanced responsive media configuration helper with multiple video formats
export const createResponsiveVideoConfig = (
  videoSrc: string,
  posterSrc: string,
  fallbackSrc: string,
  alt: string,
  options?: {
    webmSrc?: string;
    avifSrc?: string;
    duration?: number;
    aspectRatio?: string;
  }
): {
  desktop: MediaItem[];
  tablet: MediaItem[];
  mobile: MediaItem[];
} => {
  const baseFileName = videoSrc.split('.').slice(0, -1).join('.');
  
  return {
    desktop: [
      {
        type: 'video',
        src: videoSrc,
        sources: [
          // Modern formats first for better compression
          ...(options?.avifSrc ? [{ src: options.avifSrc, type: 'video/av01' }] : []),
          ...(options?.webmSrc ? [{ src: options.webmSrc, type: 'video/webm' }] : [
            { src: `${baseFileName}.webm`, type: 'video/webm' }
          ]),
          { src: videoSrc, type: 'video/mp4' },
        ],
        poster: posterSrc,
        fallback: fallbackSrc,
        alt,
        ariaLabel: alt,
        quality: 'high',
        preload: 'metadata',
        priority: true,
        loading: 'eager',
        duration: options?.duration,
        aspectRatio: options?.aspectRatio || '16/9',
        cacheControl: 'public, max-age=31536000'
      }
    ],
    tablet: [
      {
        type: 'video',
        src: videoSrc,
        sources: [
          ...(options?.webmSrc ? [{ 
            src: options.webmSrc, 
            type: 'video/webm',
            media: '(max-width: 1024px)'
          }] : [{ 
            src: `${baseFileName}.webm`, 
            type: 'video/webm',
            media: '(max-width: 1024px)'
          }]),
          { 
            src: videoSrc, 
            type: 'video/mp4',
            media: '(max-width: 1024px)'
          },
        ],
        poster: posterSrc,
        fallback: fallbackSrc,
        alt,
        ariaLabel: alt,
        quality: 'medium',
        preload: 'metadata',
        loading: 'lazy',
        duration: options?.duration,
        aspectRatio: options?.aspectRatio || '16/9',
        cacheControl: 'public, max-age=31536000'
      }
    ],
    mobile: [
      {
        type: 'image',
        src: fallbackSrc,
        srcSet: `${fallbackSrc} 1x, ${posterSrc} 2x`,
        sizes: '100vw',
        alt,
        ariaLabel: alt,
        quality: 'medium',
        preload: 'metadata',
        loading: 'eager',
        priority: true,
        aspectRatio: options?.aspectRatio || '16/9',
        cacheControl: 'public, max-age=31536000'
      }
    ]
  };
};

// Media optimization utilities
export class MediaOptimizer {
  private static instance: MediaOptimizer;
  private deviceCapabilities: {
    isLowPowerMode: boolean;
    isSlowConnection: boolean;
    prefersReducedMotion: boolean;
    screenSize: 'mobile' | 'tablet' | 'desktop';
  } | null = null;

  static getInstance(): MediaOptimizer {
    if (!MediaOptimizer.instance) {
      MediaOptimizer.instance = new MediaOptimizer();
    }
    return MediaOptimizer.instance;
  }

  private constructor() {
    if (typeof window !== 'undefined') {
      this.detectDeviceCapabilities();
    }
  }

  private detectDeviceCapabilities() {
    // Detect screen size
    const screenSize = window.innerWidth < 768 ? 'mobile' : 
                      window.innerWidth < 1024 ? 'tablet' : 'desktop';

    // Detect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Detect low power mode (approximation)
    const isLowPowerMode = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;

    // Detect slow connection
    const connection = (navigator as any).connection;
    const isSlowConnection = connection && 
      (connection.effectiveType === 'slow-2g' || 
       connection.effectiveType === '2g' || 
       connection.downlink < 1.5);

    this.deviceCapabilities = {
      isLowPowerMode: Boolean(isLowPowerMode),
      isSlowConnection: Boolean(isSlowConnection),
      prefersReducedMotion,
      screenSize
    };
  }

  getOptimizedMedia(mediaItems: MediaItem[]): MediaItem[] {
    if (!this.deviceCapabilities) {
      return mediaItems;
    }

    const { screenSize, isSlowConnection, isLowPowerMode, prefersReducedMotion } = this.deviceCapabilities;

    return mediaItems
      .filter(item => {
        // Filter by breakpoint
        if (item.breakpoint && item.breakpoint !== 'all' && item.breakpoint !== screenSize) {
          return false;
        }
        
        // Filter videos for low-power devices or slow connections
        if (item.type === 'video' && (isLowPowerMode || isSlowConnection || prefersReducedMotion)) {
          return false;
        }

        return true;
      })
      .map(item => ({
        ...item,
        // Adjust preload based on connection
        preload: isSlowConnection ? 'none' : item.preload || 'metadata',
        // Use fallback for slow connections
        src: (isSlowConnection && item.fallback) ? item.fallback : item.src
      }));
  }

  shouldUseVideo(): boolean {
    if (!this.deviceCapabilities) return true;
    
    const { isLowPowerMode, isSlowConnection, prefersReducedMotion } = this.deviceCapabilities;
    return !(isLowPowerMode || isSlowConnection || prefersReducedMotion);
  }

  getRecommendedQuality(): 'low' | 'medium' | 'high' {
    if (!this.deviceCapabilities) return 'medium';
    
    const { screenSize, isSlowConnection } = this.deviceCapabilities;
    
    if (isSlowConnection) return 'low';
    if (screenSize === 'mobile') return 'medium';
    return 'high';
  }
}

// Hook for using media optimization in React components
export const useMediaOptimization = () => {
  const optimizer = MediaOptimizer.getInstance();
  
  return {
    getOptimizedMedia: (media: MediaItem[]) => optimizer.getOptimizedMedia(media),
    shouldUseVideo: () => optimizer.shouldUseVideo(),
    getRecommendedQuality: () => optimizer.getRecommendedQuality()
  };
};

// Utility function to create responsive media sources with modern formats
export const createResponsiveMediaSources = (baseSrc: string, alt: string, options?: {
  webpSupport?: boolean;
  avifSupport?: boolean;
  aspectRatio?: string;
}): MediaItem[] => {
  const baseFileName = baseSrc.split('.').slice(0, -1).join('.');
  const extension = baseSrc.split('.').pop();

  const createSrcSet = (size: string) => {
    const sources = [];
    
    // Add modern formats if supported
    if (options?.avifSupport) {
      sources.push(`${baseFileName}-${size}.avif`);
    }
    if (options?.webpSupport) {
      sources.push(`${baseFileName}-${size}.webp`);
    }
    sources.push(`${baseFileName}-${size}.${extension}`);
    
    return sources.join(', ');
  };

  return [
    // Desktop high-quality with modern formats
    {
      type: 'image',
      src: `${baseFileName}-desktop.${extension}`,
      srcSet: createSrcSet('desktop'),
      sizes: '(min-width: 1024px) 100vw, 100vw',
      fallback: baseSrc,
      alt,
      ariaLabel: alt,
      breakpoint: 'desktop',
      quality: 'high',
      preload: 'auto',
      priority: true,
      loading: 'eager',
      aspectRatio: options?.aspectRatio || 'auto',
      cacheControl: 'public, max-age=31536000'
    },
    // Tablet medium-quality
    {
      type: 'image',
      src: `${baseFileName}-tablet.${extension}`,
      srcSet: createSrcSet('tablet'),
      sizes: '(min-width: 768px) and (max-width: 1023px) 100vw, 100vw',
      fallback: baseSrc,
      alt,
      ariaLabel: alt,
      breakpoint: 'tablet',
      quality: 'medium',
      preload: 'metadata',
      loading: 'lazy',
      aspectRatio: options?.aspectRatio || 'auto',
      cacheControl: 'public, max-age=31536000'
    },
    // Mobile optimized
    {
      type: 'image',
      src: `${baseFileName}-mobile.${extension}`,
      srcSet: createSrcSet('mobile'),
      sizes: '(max-width: 767px) 100vw, 100vw',
      fallback: baseSrc,
      alt,
      ariaLabel: alt,
      breakpoint: 'mobile',
      quality: 'medium',
      preload: 'metadata',
      loading: 'eager',
      priority: true,
      aspectRatio: options?.aspectRatio || 'auto',
      cacheControl: 'public, max-age=31536000'
    }
  ];
};

// Advanced media performance utilities
export class MediaPerformanceManager {
  private static instance: MediaPerformanceManager;
  private mediaCache = new Map<string, HTMLImageElement | HTMLVideoElement>();
  private loadingPromises = new Map<string, Promise<void>>();
  private performanceMetrics = new Map<string, {
    loadTime: number;
    fileSize?: number;
    format: string;
    timestamp: number;
  }>();

  static getInstance(): MediaPerformanceManager {
    if (!MediaPerformanceManager.instance) {
      MediaPerformanceManager.instance = new MediaPerformanceManager();
    }
    return MediaPerformanceManager.instance;
  }

  // Preload critical media with priority
  async preloadMedia(mediaItems: MediaItem[], priority: 'high' | 'low' = 'low'): Promise<void> {
    const preloadPromises = mediaItems
      .filter(item => item.priority || priority === 'high')
      .map(item => this.preloadSingleMedia(item));

    await Promise.allSettled(preloadPromises);
  }

  private async preloadSingleMedia(item: MediaItem): Promise<void> {
    const cacheKey = `${item.type}-${item.src}`;
    
    if (this.mediaCache.has(cacheKey)) {
      return Promise.resolve();
    }

    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)!;
    }

    const startTime = performance.now();
    
    const loadPromise = new Promise<void>((resolve, reject) => {
      if (item.type === 'video') {
        const video = document.createElement('video');
        video.preload = item.preload || 'metadata';
        video.muted = true;
        
        const handleLoad = () => {
          const loadTime = performance.now() - startTime;
          this.recordPerformanceMetric(cacheKey, loadTime, 'video');
          this.mediaCache.set(cacheKey, video);
          resolve();
        };

        const handleError = () => {
          reject(new Error(`Failed to preload video: ${item.src}`));
        };

        video.addEventListener('loadeddata', handleLoad, { once: true });
        video.addEventListener('error', handleError, { once: true });
        
        // Add multiple sources if available
        if (item.sources) {
          item.sources.forEach(source => {
            const sourceElement = document.createElement('source');
            sourceElement.src = source.src;
            sourceElement.type = source.type;
            if (source.media) sourceElement.media = source.media;
            video.appendChild(sourceElement);
          });
        } else {
          video.src = item.src;
        }
      } else {
        const img = new Image();
        
        const handleLoad = () => {
          const loadTime = performance.now() - startTime;
          this.recordPerformanceMetric(cacheKey, loadTime, 'image');
          this.mediaCache.set(cacheKey, img);
          resolve();
        };

        const handleError = () => {
          reject(new Error(`Failed to preload image: ${item.src}`));
        };

        img.addEventListener('load', handleLoad, { once: true });
        img.addEventListener('error', handleError, { once: true });
        
        if (item.srcSet) {
          img.srcset = item.srcSet;
          img.sizes = item.sizes || '100vw';
        }
        img.src = item.src;
      }
    });

    this.loadingPromises.set(cacheKey, loadPromise);
    
    try {
      await loadPromise;
    } finally {
      this.loadingPromises.delete(cacheKey);
    }
  }

  private recordPerformanceMetric(key: string, loadTime: number, format: string): void {
    this.performanceMetrics.set(key, {
      loadTime,
      format,
      timestamp: Date.now()
    });
  }

  // Get performance insights
  getPerformanceInsights(): {
    averageLoadTime: number;
    slowestMedia: string | null;
    fastestMedia: string | null;
    totalMediaCached: number;
  } {
    const metrics = Array.from(this.performanceMetrics.values());
    
    if (metrics.length === 0) {
      return {
        averageLoadTime: 0,
        slowestMedia: null,
        fastestMedia: null,
        totalMediaCached: 0
      };
    }

    const loadTimes = metrics.map(m => m.loadTime);
    const averageLoadTime = loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length;
    
    const sortedEntries = Array.from(this.performanceMetrics.entries())
      .sort(([, a], [, b]) => a.loadTime - b.loadTime);

    return {
      averageLoadTime,
      slowestMedia: sortedEntries[sortedEntries.length - 1]?.[0] || null,
      fastestMedia: sortedEntries[0]?.[0] || null,
      totalMediaCached: this.mediaCache.size
    };
  }

  // Clear old cache entries
  clearCache(olderThanMs: number = 300000): void { // 5 minutes default
    const now = Date.now();
    
    for (const [key, metric] of this.performanceMetrics.entries()) {
      if (now - metric.timestamp > olderThanMs) {
        this.mediaCache.delete(key);
        this.performanceMetrics.delete(key);
      }
    }
  }
}

// Enhanced media format detection
export const detectOptimalMediaFormats = (): {
  supportsWebP: boolean;
  supportsAVIF: boolean;
  supportsWebM: boolean;
  supportsHEVC: boolean;
} => {
  if (typeof window === 'undefined') {
    return {
      supportsWebP: false,
      supportsAVIF: false,
      supportsWebM: false,
      supportsHEVC: false
    };
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;

  return {
    supportsWebP: canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0,
    supportsAVIF: canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0,
    supportsWebM: document.createElement('video').canPlayType('video/webm') !== '',
    supportsHEVC: document.createElement('video').canPlayType('video/mp4; codecs="hvc1"') !== ''
  };
};

// Responsive media query utilities
export const createMediaQueries = () => {
  return {
    mobile: '(max-width: 767px)',
    tablet: '(min-width: 768px) and (max-width: 1023px)',
    desktop: '(min-width: 1024px)',
    retina: '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)',
    reducedMotion: '(prefers-reduced-motion: reduce)',
    darkMode: '(prefers-color-scheme: dark)',
    lowBandwidth: '(max-width: 767px) and (prefers-reduced-data: reduce)'
  };
};

export default MediaOptimizer;