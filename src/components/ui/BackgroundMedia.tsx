'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  MediaItem, 
  useMediaOptimization, 
  MediaPerformanceManager,
  detectOptimalMediaFormats,
  createMediaQueries
} from '@/lib/mediaConfig';
import { useAdaptiveMediaLoading } from '@/lib/hooks/useNetworkOptimization';

interface BackgroundMediaProps {
  media: MediaItem[];
  className?: string;
  overlay?: boolean;
  overlayOpacity?: number;
  controls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  priority?: boolean;
  onLoadingStateChange?: (isLoading: boolean) => void;
  onError?: (error: string) => void;
  // Enhanced responsive options
  responsiveBreakpoints?: {
    mobile?: MediaItem[];
    tablet?: MediaItem[];
    desktop?: MediaItem[];
  };
  // Performance options
  enableIntersectionObserver?: boolean;
  lazyLoad?: boolean;
  // Video-specific enhancements
  videoQuality?: 'auto' | 'high' | 'medium' | 'low';
  enablePictureInPicture?: boolean;
  enableFullscreen?: boolean;
}

const BackgroundMedia: React.FC<BackgroundMediaProps> = ({
  media,
  className = '',
  overlay = true,
  overlayOpacity = 0.4,
  controls = false,
  autoPlay = true,
  muted = true,
  loop = true,
  preload: _preload = 'metadata',
  priority = false,
  onLoadingStateChange,
  onError,
  responsiveBreakpoints,
  enableIntersectionObserver = true,
  lazyLoad = false,
  videoQuality: _videoQuality = 'auto',
  enablePictureInPicture = false,
  enableFullscreen = false,
}) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);
  const [showControls, setShowControls] = useState(false);
  const [isInView, setIsInView] = useState(!enableIntersectionObserver);
  const [currentBreakpoint, setCurrentBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const performanceManagerRef = useRef<MediaPerformanceManager | null>(null);

  // Use media optimization
  const { getOptimizedMedia, shouldUseVideo } = useMediaOptimization();
  const adaptiveLoading = useAdaptiveMediaLoading();
  const optimalSettings = adaptiveLoading.getOptimalMediaSettings();

  // Responsive media selection
  const getResponsiveMedia = useCallback(() => {
    if (responsiveBreakpoints) {
      switch (currentBreakpoint) {
        case 'mobile':
          return responsiveBreakpoints.mobile || media;
        case 'tablet':
          return responsiveBreakpoints.tablet || media;
        case 'desktop':
          return responsiveBreakpoints.desktop || media;
        default:
          return media;
      }
    }
    return media;
  }, [responsiveBreakpoints, currentBreakpoint, media]);

  const responsiveMedia = getResponsiveMedia();

  // Initialize performance manager and preload media
  useEffect(() => {
    if (typeof window !== 'undefined') {
      performanceManagerRef.current = MediaPerformanceManager.getInstance();
      
      // Preload critical media for better performance
      const preloadCriticalMedia = async () => {
        if (performanceManagerRef.current && responsiveMedia.length > 0) {
          const criticalMedia = responsiveMedia.filter(item => 
            item.priority || currentMediaIndex === 0
          );
          
          if (criticalMedia.length > 0) {
            try {
              await performanceManagerRef.current.preloadMedia(criticalMedia, 'high');
            } catch (_error) {
              console.warn('Media preloading failed:', _error);
            }
          }
        }
      };

      preloadCriticalMedia();
    }
  }, [responsiveMedia, currentMediaIndex]);

  // Preload next media items for smoother transitions
  useEffect(() => {
    if (typeof window !== 'undefined' && performanceManagerRef.current && media.length > 1) {
      const nextIndex = (currentMediaIndex + 1) % media.length;
      const nextMedia = responsiveMedia[nextIndex];
      
      if (nextMedia && isInView) {
        performanceManagerRef.current.preloadMedia([nextMedia], 'low').catch(() => {
          // Silent fail for non-critical preloading
        });
      }
    }
  }, [currentMediaIndex, media.length, responsiveMedia, isInView]);

  // Performance monitoring and cleanup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const interval = setInterval(() => {
        if (performanceManagerRef.current) {
          // Clear old cache entries every 5 minutes
          performanceManagerRef.current.clearCache(300000);
        }
      }, 300000);

      return () => clearInterval(interval);
    }
  }, []);
  const optimizedMedia = getOptimizedMedia(responsiveMedia);
  const isVideoSupported = shouldUseVideo() && optimalSettings.enableVideo && isInView;

  const currentMedia = optimizedMedia[currentMediaIndex] || responsiveMedia[0];

  // Override props with optimal settings
  const effectiveAutoPlay = autoPlay && optimalSettings.autoPlay && isInView;
  const effectivePreload = lazyLoad && !isInView ? 'none' : optimalSettings.preload;
  const effectivePriority = priority || optimalSettings.priority;

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!enableIntersectionObserver || !containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [enableIntersectionObserver]);

  // Responsive breakpoint detection
  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setCurrentBreakpoint('mobile');
      } else if (width < 1024) {
        setCurrentBreakpoint('tablet');
      } else {
        setCurrentBreakpoint('desktop');
      }
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);

    return () => {
      window.removeEventListener('resize', updateBreakpoint);
    };
  }, []);

  // Handle loading state changes
  useEffect(() => {
    onLoadingStateChange?.(isLoading);
  }, [isLoading, onLoadingStateChange]);

  // Handle media loading
  const handleMediaLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  // Handle media error
  const handleMediaError = useCallback((error: string) => {
    setHasError(true);
    setIsLoading(false);
    onError?.(error);
  }, [onError]);

  // Enhanced video controls
  const togglePictureInPicture = useCallback(async () => {
    if (!videoRef.current || !enablePictureInPicture) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch {
      handleMediaError('Picture-in-picture not supported');
    }
  }, [enablePictureInPicture, handleMediaError]);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current || !enableFullscreen) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await containerRef.current.requestFullscreen();
      }
    } catch {
      handleMediaError('Fullscreen not supported');
    }
  }, [enableFullscreen, handleMediaError]);

  // Video event handlers
  const handleVideoLoad = useCallback(() => {
    handleMediaLoad();
  }, [handleMediaLoad]);

  const handleVideoError = useCallback(() => {
    handleMediaError('Video failed to load');
  }, [handleMediaError]);

  const handleVideoPlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handleVideoPause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  // Control functions
  const togglePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {
          handleMediaError('Video playback failed');
        });
      }
    }
  }, [isPlaying, handleMediaError]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const nextMedia = useCallback(() => {
    if (media.length > 1) {
      setCurrentMediaIndex((prev) => (prev + 1) % media.length);
      setIsLoading(true);
    }
  }, [media.length]);

  const prevMedia = useCallback(() => {
    if (media.length > 1) {
      setCurrentMediaIndex((prev) => (prev - 1 + media.length) % media.length);
      setIsLoading(true);
    }
  }, [media.length]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!showControls) return;
      
      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'm':
        case 'M':
          toggleMute();
          break;
        case 'ArrowRight':
          nextMedia();
          break;
        case 'ArrowLeft':
          prevMedia();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showControls, togglePlayPause, toggleMute, nextMedia, prevMedia]);

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (showControls) {
      timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => clearTimeout(timeout);
  }, [showControls]);

  // Render video element with enhanced source support
  const renderVideo = () => {
    if (!isVideoSupported || currentMedia.type !== 'video') return null;

    const mediaQueries = createMediaQueries();
    const formatSupport = detectOptimalMediaFormats();

    return (
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay={effectiveAutoPlay}
        muted={muted}
        loop={loop}
        playsInline
        preload={effectivePreload}
        poster={currentMedia.poster}
        onLoadedData={handleVideoLoad}
        onError={handleVideoError}
        onPlay={handleVideoPlay}
        onPause={handleVideoPause}
        aria-label={currentMedia.ariaLabel || currentMedia.alt || 'Background video'}
        style={{
          aspectRatio: currentMedia.aspectRatio || 'auto'
        }}
      >
        {/* Use enhanced sources if available */}
        {currentMedia.sources ? (
          currentMedia.sources.map((source, index) => (
            <source
              key={index}
              src={source.src}
              type={source.type}
              media={source.media}
            />
          ))
        ) : (
          <>
            {/* Modern formats first for better compression */}
            {formatSupport.supportsWebM && (
              <source 
                src={currentMedia.src.replace(/\.(mp4|mov)$/i, '.webm')} 
                type="video/webm"
                media={currentBreakpoint === 'mobile' ? mediaQueries.mobile : undefined}
              />
            )}
            {formatSupport.supportsHEVC && (
              <source 
                src={currentMedia.src.replace(/\.(mp4|mov)$/i, '.hevc.mp4')} 
                type='video/mp4; codecs="hvc1"'
                media={mediaQueries.desktop}
              />
            )}
            {/* Fallback MP4 */}
            <source 
              src={currentMedia.src} 
              type="video/mp4" 
            />
          </>
        )}
        
        {/* Fallback message */}
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white/60">
          <p>Your browser does not support video playback.</p>
        </div>
      </video>
    );
  };

  // Render image element with enhanced responsive support
  const renderImage = () => {
    const imageSrc = hasError && currentMedia.fallback ? currentMedia.fallback : 
                   (!isVideoSupported && currentMedia.fallback) ? currentMedia.fallback :
                   currentMedia.type === 'image' ? currentMedia.src : currentMedia.poster;

    if (!imageSrc) return null;

    // Format support and media queries available if needed for future enhancements

    // Determine optimal image quality based on settings and device
    const getImageQuality = () => {
      if (optimalSettings.quality === 'high') return 90;
      if (optimalSettings.quality === 'medium') return 75;
      return 60;
    };

    // Create responsive sizes based on breakpoint
    const getResponsiveSizes = () => {
      if (currentMedia.sizes) return currentMedia.sizes;
      
      switch (currentBreakpoint) {
        case 'mobile':
          return '100vw';
        case 'tablet':
          return '100vw';
        case 'desktop':
          return '100vw';
        default:
          return '100vw';
      }
    };

    return (
      <Image
        src={imageSrc}
        alt={currentMedia.ariaLabel || currentMedia.alt || 'Background image'}
        fill
        className="object-cover"
        priority={effectivePriority}
        quality={getImageQuality()}
        sizes={getResponsiveSizes()}
        onLoad={handleMediaLoad}
        onError={() => handleMediaError('Image failed to load')}
        style={{
          aspectRatio: currentMedia.aspectRatio || 'auto',
          objectFit: 'cover'
        }}
      />
    );
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => controls && setShowControls(true)}
      onMouseLeave={() => controls && setShowControls(false)}
      onClick={() => controls && setShowControls(!showControls)}
    >
      {/* Media Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMediaIndex}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          {/* Video */}
          {renderVideo()}
          
          {/* Image (fallback or primary) */}
          {renderImage()}
        </motion.div>
      </AnimatePresence>

      {/* Overlay */}
      {overlay && (
        <div 
          className="absolute inset-0 bg-black transition-opacity duration-300"
          style={{ opacity: overlayOpacity }}
        />
      )}

      {/* Loading State */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-gray-900"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="w-8 h-8 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
              <span className="text-white/60 text-sm">Loading media...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      <AnimatePresence>
        {hasError && !currentMedia.fallback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-gray-900"
          >
            <div className="text-center text-white/60">
              <p className="text-lg mb-2">Media unavailable</p>
              <p className="text-sm">Please check your connection</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media Controls */}
      <AnimatePresence>
        {controls && showControls && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-black/50 backdrop-blur-sm rounded-lg p-3"
          >
            {/* Playback Controls */}
            <div className="flex items-center space-x-3">
              {currentMedia.type === 'video' && (
                <>
                  <button
                    onClick={togglePlayPause}
                    className="text-white hover:text-accent-cyan transition-colors"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    )}
                  </button>
                  
                  <button
                    onClick={toggleMute}
                    className="text-white hover:text-accent-cyan transition-colors"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                      </svg>
                    )}
                  </button>

                  {/* Picture-in-Picture Control */}
                  {enablePictureInPicture && (
                    <button
                      onClick={togglePictureInPicture}
                      className="text-white hover:text-accent-cyan transition-colors"
                      aria-label="Picture in Picture"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z"/>
                      </svg>
                    </button>
                  )}

                  {/* Fullscreen Control */}
                  {enableFullscreen && (
                    <button
                      onClick={toggleFullscreen}
                      className="text-white hover:text-accent-cyan transition-colors"
                      aria-label="Fullscreen"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                      </svg>
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Media Navigation */}
            {media.length > 1 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={prevMedia}
                  className="text-white hover:text-accent-cyan transition-colors"
                  aria-label="Previous media"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                  </svg>
                </button>
                
                <span className="text-white/60 text-sm">
                  {currentMediaIndex + 1} / {media.length}
                </span>
                
                <button
                  onClick={nextMedia}
                  className="text-white hover:text-accent-cyan transition-colors"
                  aria-label="Next media"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                  </svg>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media Indicators */}
      {media.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {media.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentMediaIndex(index);
                setIsLoading(true);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentMediaIndex 
                  ? 'bg-accent-cyan scale-125' 
                  : 'bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to media ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BackgroundMedia;