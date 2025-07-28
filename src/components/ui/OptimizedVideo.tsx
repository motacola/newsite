'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { detectOptimalMediaFormats, useMediaOptimization } from '@/lib/mediaConfig';
import { Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react';

interface VideoSource {
  src: string;
  type: string;
  media?: string;
}

interface OptimizedVideoProps {
  src: string;
  poster?: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  // Enhanced optimization props
  webmSrc?: string;
  hevcSrc?: string;
  sources?: VideoSource[];
  fallbackImage?: string;
  lazyLoad?: boolean;
  threshold?: number;
  rootMargin?: string;
  onLoad?: () => void;
  onError?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
}

export const OptimizedVideo: React.FC<OptimizedVideoProps> = ({
  src,
  poster,
  alt = 'Video content',
  width,
  height,
  className = '',
  autoplay = false,
  loop = false,
  muted = true,
  controls = false,
  preload = 'metadata',
  webmSrc,
  hevcSrc,
  sources,
  fallbackImage,
  lazyLoad = true,
  threshold = 0.1,
  rootMargin = '100px',
  onLoad,
  onError,
  onPlay,
  onPause,
}) => {
  const [isInView, setIsInView] = useState(!lazyLoad);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [optimalSources, setOptimalSources] = useState<VideoSource[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { shouldUseVideo } = useMediaOptimization();

  // Generate optimal video sources based on browser support
  useEffect(() => {
    const formats = detectOptimalMediaFormats();
    const generatedSources: VideoSource[] = [];

    // Use provided sources first
    if (sources) {
      generatedSources.push(...sources);
    } else {
      // Generate sources based on available formats
      if (hevcSrc && formats.supportsHEVC) {
        generatedSources.push({
          src: hevcSrc,
          type: 'video/mp4; codecs="hvc1"',
        });
      }
      
      if (webmSrc && formats.supportsWebM) {
        generatedSources.push({
          src: webmSrc,
          type: 'video/webm',
        });
      }
      
      // Always include original as fallback
      generatedSources.push({
        src,
        type: 'video/mp4',
      });
    }

    setOptimalSources(generatedSources);
  }, [src, webmSrc, hevcSrc, sources]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazyLoad || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [lazyLoad, isInView, threshold, rootMargin]);

  const handleLoadStart = () => {
    setIsLoading(true);
  };

  const handleLoadedData = () => {
    setIsLoaded(true);
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    onPlay?.();
  }, [onPlay]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    onPause?.();
  }, [onPause]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Don't render video if device shouldn't use video
  if (!shouldUseVideo()) {
    return (
      <div
        ref={containerRef}
        className={`relative bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        {fallbackImage ? (
          <img
            src={fallbackImage}
            alt={alt}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-gray-500 text-center">
            <Play className="w-12 h-12 mx-auto mb-2" />
            <p>Video not available</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative group ${className}`}
      style={{ width, height }}
    >
      {isInView ? (
        <>
          {!hasError ? (
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay={autoplay}
              loop={loop}
              muted={isMuted}
              controls={controls}
              preload={preload}
              poster={poster}
              onLoadStart={handleLoadStart}
              onLoadedData={handleLoadedData}
              onError={handleError}
              onPlay={handlePlay}
              onPause={handlePause}
              aria-label={alt}
            >
              {optimalSources.map((source, index) => (
                <source
                  key={index}
                  src={source.src}
                  type={source.type}
                  media={source.media}
                />
              ))}
              {/* Fallback text */}
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="flex items-center justify-center bg-gray-200 text-gray-500 w-full h-full">
              {fallbackImage ? (
                <img
                  src={fallbackImage}
                  alt={alt}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <Play className="w-12 h-12 mx-auto mb-2" />
                  <p>Video unavailable</p>
                </div>
              )}
            </div>
          )}

          {/* Custom controls overlay */}
          {!controls && isLoaded && !hasError && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="flex items-center gap-4 bg-black/50 rounded-lg p-3">
                <button
                  onClick={togglePlay}
                  className="text-white hover:text-gray-300 transition-colors"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6" fill="currentColor" />
                  )}
                </button>
                
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-gray-300 transition-colors"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? (
                    <VolumeX className="w-6 h-6" />
                  ) : (
                    <Volume2 className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
        </>
      ) : (
        // Placeholder while not in view
        <div className="bg-gray-200 animate-pulse w-full h-full flex items-center justify-center">
          {poster ? (
            <img
              src={poster}
              alt={alt}
              className="w-full h-full object-cover opacity-50"
            />
          ) : (
            <Play className="w-12 h-12 text-gray-400" />
          )}
        </div>
      )}
    </div>
  );
};

export default OptimizedVideo;