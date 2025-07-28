'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { detectOptimalMediaFormats } from '@/lib/mediaConfig';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  fill?: boolean;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
  // Enhanced optimization props
  webpSrc?: string;
  avifSrc?: string;
  fallbackSrc?: string;
  lazyLoad?: boolean;
  threshold?: number;
  rootMargin?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  fill = false,
  style,
  onLoad,
  onError,
  webpSrc,
  avifSrc,
  fallbackSrc,
  lazyLoad = true,
  threshold = 0.1,
  rootMargin = '50px',
}) => {
  const [isInView, setIsInView] = useState(!lazyLoad || priority);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [optimalSrc, setOptimalSrc] = useState(src);
  const imgRef = useRef<HTMLDivElement>(null);

  // Detect optimal format on mount
  useEffect(() => {
    const formats = detectOptimalMediaFormats();
    
    if (avifSrc && formats.supportsAVIF) {
      setOptimalSrc(avifSrc);
    } else if (webpSrc && formats.supportsWebP) {
      setOptimalSrc(webpSrc);
    } else {
      setOptimalSrc(src);
    }
  }, [src, webpSrc, avifSrc]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazyLoad || priority || isInView) return;

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

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazyLoad, priority, isInView, threshold, rootMargin]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    if (fallbackSrc && optimalSrc !== fallbackSrc) {
      setOptimalSrc(fallbackSrc);
      setHasError(false);
    } else {
      onError?.();
    }
  };

  // Generate blur placeholder if not provided
  const generateBlurDataURL = (width: number, height: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, width, height);
    }
    return canvas.toDataURL();
  };

  const blurPlaceholder = blurDataURL || (width && height ? generateBlurDataURL(width, height) : undefined);

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={style}
    >
      {isInView ? (
        <>
          {!hasError ? (
            <Image
              src={optimalSrc}
              alt={alt}
              width={width}
              height={height}
              fill={fill}
              priority={priority}
              quality={quality}
              placeholder={placeholder}
              blurDataURL={blurPlaceholder}
              sizes={sizes}
              className={`transition-opacity duration-300 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleLoad}
              onError={handleError}
            />
          ) : (
            <div className="flex items-center justify-center bg-gray-200 text-gray-500 w-full h-full">
              <span className="text-sm">Image unavailable</span>
            </div>
          )}
          
          {/* Loading skeleton */}
          {!isLoaded && !hasError && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
        </>
      ) : (
        // Placeholder while not in view
        <div className="bg-gray-200 animate-pulse w-full h-full" />
      )}
    </div>
  );
};

export default OptimizedImage;