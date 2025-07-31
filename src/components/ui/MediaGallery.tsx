'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo, useMotionValue } from 'framer-motion';
import OptimizedImage from './OptimizedImage';
import OptimizedVideo from './OptimizedVideo';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Download, Share2, Maximize2, RotateCcw, Move, Play, Pause } from 'lucide-react';

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  src: string;
  thumbnail?: string;
  alt: string;
  title?: string;
  description?: string;
  width?: number;
  height?: number;
  // Video-specific props
  videoSources?: { src: string; type: string }[];
  poster?: string;
  // Image-specific props
  webpSrc?: string;
  avifSrc?: string;
}

interface MediaGalleryProps {
  items: MediaItem[];
  initialIndex?: number;
  layout?: 'grid' | 'masonry' | 'carousel';
  columns?: number;
  gap?: number;
  showThumbnails?: boolean;
  showControls?: boolean;
  showInfo?: boolean;
  enableZoom?: boolean;
  enableSwipe?: boolean;
  enableKeyboard?: boolean;
  autoplay?: boolean;
  autoplayInterval?: number;
  enableInfiniteLoop?: boolean;
  showProgress?: boolean;
  className?: string;
  onItemClick?: (item: MediaItem, index: number) => void;
  onClose?: () => void;
  onIndexChange?: (index: number) => void;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  items,
  initialIndex = 0,
  layout = 'grid',
  columns = 3,
  gap = 16,
  showThumbnails = true,
  showControls = true,
  showInfo = true,
  enableZoom = true,
  enableSwipe = true,
  enableKeyboard = true,
  autoplay = false,
  autoplayInterval = 5000,
  enableInfiniteLoop = true,
  showProgress = true,
  className = '',
  onItemClick,
  onClose,
  onIndexChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(Math.min(initialIndex, items?.length ? items.length - 1 : 0));
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [rotation, setRotation] = useState(0);

  const imageRef = useRef<HTMLDivElement>(null);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);
  const currentItem = items.length > 0 ? items[currentIndex] : null;

  // Motion values for smooth animations
  useMotionValue(0);

  // Navigation functions
  const goToNext = useCallback(() => {
    const nextIndex = enableInfiniteLoop 
      ? (currentIndex + 1) % items.length 
      : Math.min(currentIndex + 1, items.length - 1);
    
    if (nextIndex !== currentIndex) {
      setCurrentIndex(nextIndex);
      setZoomLevel(1);
      setPanOffset({ x: 0, y: 0 });
      setRotation(0);
      onIndexChange?.(nextIndex);
    }
  }, [currentIndex, items.length, enableInfiniteLoop, onIndexChange]);

  const goToPrevious = useCallback(() => {
    const prevIndex = enableInfiniteLoop 
      ? (currentIndex - 1 + items.length) % items.length 
      : Math.max(currentIndex - 1, 0);
    
    if (prevIndex !== currentIndex) {
      setCurrentIndex(prevIndex);
      setZoomLevel(1);
      setPanOffset({ x: 0, y: 0 });
      setRotation(0);
      onIndexChange?.(prevIndex);
    }
  }, [currentIndex, items.length, enableInfiniteLoop, onIndexChange]);

  const goToIndex = useCallback((index: number) => {
    if (index >= 0 && index < items.length && index !== currentIndex) {
      setCurrentIndex(index);
      setZoomLevel(1);
      setPanOffset({ x: 0, y: 0 });
      setRotation(0);
      onIndexChange?.(index);
    }
  }, [currentIndex, items.length, onIndexChange]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // Zoom functions
  const zoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev * 1.5, 5));
  }, []);

  const zoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(prev / 1.5, 0.5));
  }, []);

  const resetZoom = useCallback(() => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setRotation(0);
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
    resetZoom();
  }, [isFullscreen, resetZoom]);

  // Rotation functions
  const rotateLeft = useCallback(() => {
    setRotation((prev) => prev - 90);
  }, []);

  const rotateRight = useCallback(() => {
    setRotation((prev) => prev + 90);
  }, []);

  // Autoplay functionality
  useEffect(() => {
    if (isPlaying && items.length > 1) {
      autoplayRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          const nextIndex = enableInfiniteLoop ? (prev + 1) % items.length : Math.min(prev + 1, items.length - 1);
          if (!enableInfiniteLoop && nextIndex === items.length - 1) {
            setIsPlaying(false);
          }
          return nextIndex;
        });
      }, autoplayInterval);
    } else {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
    }

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [isPlaying, items.length, autoplayInterval, enableInfiniteLoop]);

  // Keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enableKeyboard) return;

    switch (event.key) {
      case 'ArrowLeft':
      case 'h':
        event.preventDefault();
        goToPrevious();
        break;
      case 'ArrowRight':
      case 'l':
        event.preventDefault();
        goToNext();
        break;
      case 'ArrowUp':
      case 'k':
        event.preventDefault();
        if (layout === 'grid') {
          const newIndex = Math.max(0, currentIndex - columns);
          goToIndex(newIndex);
        }
        break;
      case 'ArrowDown':
      case 'j':
        event.preventDefault();
        if (layout === 'grid') {
          const newIndex = Math.min(items.length - 1, currentIndex + columns);
          goToIndex(newIndex);
        }
        break;
      case 'Escape':
        event.preventDefault();
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose?.();
        }
        break;
      case ' ':
        event.preventDefault();
        if (layout === 'carousel') {
          togglePlayPause();
        } else {
          toggleFullscreen();
        }
        break;
      case 'f':
        event.preventDefault();
        toggleFullscreen();
        break;
      case '+':
      case '=':
        event.preventDefault();
        zoomIn();
        break;
      case '-':
        event.preventDefault();
        zoomOut();
        break;
      case '0':
        event.preventDefault();
        resetZoom();
        break;
      case 'r':
        event.preventDefault();
        rotateRight();
        break;
      case 'R':
        event.preventDefault();
        rotateLeft();
        break;
      case 'Home':
        event.preventDefault();
        goToIndex(0);
        break;
      case 'End':
        event.preventDefault();
        goToIndex(items.length - 1);
        break;
    }
  }, [enableKeyboard, isFullscreen, onClose, layout, currentIndex, columns, items.length, goToPrevious, goToNext, goToIndex, togglePlayPause, toggleFullscreen, zoomIn, zoomOut, resetZoom, rotateRight, rotateLeft]);

  useEffect(() => {
    if (enableKeyboard) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, enableKeyboard]);

  // Touch gesture support
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!enableSwipe) return;
    
    const touch = e.targetTouches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    });
    setTouchEnd(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!enableSwipe || !touchStart) return;
    
    const touch = e.targetTouches[0];
    setTouchEnd({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    });
  };

  const handleTouchEnd = () => {
    if (!enableSwipe || !touchStart || !touchEnd) return;

    const deltaX = touchStart.x - touchEnd.x;
    const deltaY = touchStart.y - touchEnd.y;
    const deltaTime = touchEnd.time - touchStart.time;
    const velocity = Math.abs(deltaX) / deltaTime;

    // Minimum swipe distance and velocity
    const minSwipeDistance = 50;
    const minSwipeVelocity = 0.3;

    // Check if it's a horizontal swipe (not vertical scroll)
    if (Math.abs(deltaX) > Math.abs(deltaY) && 
        Math.abs(deltaX) > minSwipeDistance && 
        velocity > minSwipeVelocity) {
      
      if (deltaX > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // Enhanced zoom with mouse wheel
  const handleWheel = useCallback((event: WheelEvent) => {
    if (!enableZoom || currentItem?.type !== 'image') return;
    
    event.preventDefault();
    const delta = event.deltaY > 0 ? -1 : 1;
    const zoomFactor = 1.1;
    
    setZoomLevel((prev) => {
      const newZoom = delta > 0 ? prev * zoomFactor : prev / zoomFactor;
      return Math.max(0.5, Math.min(5, newZoom));
    });
  }, [enableZoom, currentItem?.type]);

  // Double-click to zoom
  const handleDoubleClick = useCallback(() => {
    if (!enableZoom || currentItem?.type !== 'image') return;
    
    if (zoomLevel === 1) {
      setZoomLevel(2);
    } else {
      resetZoom();
    }
  }, [enableZoom, currentItem?.type, zoomLevel, resetZoom]);

  // Add wheel event listener
  useEffect(() => {
    const element = imageRef.current;
    if (element && enableZoom) {
      element.addEventListener('wheel', handleWheel, { passive: false });
      element.addEventListener('dblclick', handleDoubleClick);
      
      return () => {
        element.removeEventListener('wheel', handleWheel);
        element.removeEventListener('dblclick', handleDoubleClick);
      };
    }
  }, [handleWheel, handleDoubleClick, enableZoom]);

  // Swipe handling
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!enableSwipe) return;

    const threshold = 100;
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    if (Math.abs(velocity) > 500 || Math.abs(offset) > threshold) {
      if (offset > 0 || velocity > 0) {
        goToPrevious();
      } else {
        goToNext();
      }
    }
  };

  const handleDragStart = () => {
    // Drag started - could be used for visual feedback
  };

  // Pan handling for zoomed images
  const handlePan = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (zoomLevel > 1) {
      setPanOffset({
        x: panOffset.x + info.delta.x,
        y: panOffset.y + info.delta.y,
      });
    }
  };

  // Share functionality
  const handleShare = async () => {
    if (!currentItem) return;

    const shareData = {
      title: currentItem.title || 'Media from portfolio',
      text: currentItem.description || '',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Download functionality
  const handleDownload = () => {
    if (!currentItem) return;

    const link = document.createElement('a');
    link.href = currentItem.src;
    link.download = currentItem.title || `media-${currentIndex + 1}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Grid layout component
  const GridLayout = () => (
    <div
      className={`grid ${className}`}
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(${Math.floor(300 / columns)}px, 1fr))`,
        gap: `${gap}px`,
      }}
    >
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          className="relative cursor-pointer group overflow-hidden rounded-lg"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setCurrentIndex(index);
            onItemClick?.(item, index);
          }}
        >
          {item.type === 'image' ? (
            <OptimizedImage
              src={item.thumbnail || item.src}
              alt={item.alt}
              className="w-full h-48 object-cover"
              webpSrc={item.webpSrc}
              avifSrc={item.avifSrc}
            />
          ) : (
            <OptimizedVideo
              src={item.src}
              poster={item.poster || item.thumbnail}
              alt={item.alt}
              className="w-full h-48"
              muted
              loop
              preload="metadata"
            />
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
          
          {/* Info overlay */}
          {item.title && (
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
              <h3 className="text-white font-medium text-sm truncate">
                {item.title}
              </h3>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );

  // Carousel layout component
  const CarouselLayout = () => (
    <div className="relative">
      {/* Main display */}
      <div 
        className="relative overflow-hidden rounded-lg bg-black"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.3 }}
            className="relative"
            drag={enableSwipe ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onPan={zoomLevel > 1 ? handlePan : undefined}
            style={{
              scale: zoomLevel,
              x: panOffset.x,
              y: panOffset.y,
              rotate: rotation,
            }}
            ref={imageRef}
          >
            {currentItem?.type === 'image' ? (
              <OptimizedImage
                src={currentItem.src}
                alt={currentItem.alt}
                className="w-full max-h-[70vh] object-contain"
                webpSrc={currentItem.webpSrc}
                avifSrc={currentItem.avifSrc}
                priority
              />
            ) : (
              <OptimizedVideo
                src={currentItem?.src || ''}
                poster={currentItem?.poster}
                alt={currentItem?.alt || ''}
                className="w-full max-h-[70vh]"
                controls
                autoplay={autoplay}
                sources={currentItem?.videoSources}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
        {showControls && items.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              aria-label="Previous item"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              aria-label="Next item"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Top controls */}
        {showControls && (
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {enableZoom && currentItem?.type === 'image' && (
              <>
                <button
                  onClick={zoomIn}
                  className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
                <button
                  onClick={zoomOut}
                  className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                  aria-label="Zoom out"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <button
                  onClick={rotateRight}
                  className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                  aria-label="Rotate right"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                <button
                  onClick={resetZoom}
                  className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                  aria-label="Reset view"
                >
                  <Move className="w-5 h-5" />
                </button>
              </>
            )}
            {layout === 'carousel' && items.length > 1 && (
              <button
                onClick={togglePlayPause}
                className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
            )}
            <button
              onClick={handleShare}
              className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              aria-label="Share"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              aria-label="Download"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              aria-label="Fullscreen"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Progress indicator */}
        {showProgress && items.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-2 bg-black/50 rounded-full px-3 py-2">
              <span className="text-white text-sm font-medium">
                {currentIndex + 1} / {items.length}
              </span>
              {layout === 'carousel' && isPlaying && (
                <div className="w-16 h-1 bg-white/30 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: autoplayInterval / 1000, ease: 'linear' }}
                    key={currentIndex}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {showThumbnails && items.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4 overflow-x-auto pb-2">
          {items.map((item, index) => (
            <button
              key={item.id}
              onClick={() => goToIndex(index)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                index === currentIndex
                  ? 'border-blue-500 ring-2 ring-blue-500/20'
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              {item.type === 'image' ? (
                <OptimizedImage
                  src={item.thumbnail || item.src}
                  alt={item.alt}
                  className="w-full h-full object-cover"
                />
              ) : (
                <OptimizedVideo
                  src={item.src}
                  poster={item.poster || item.thumbnail}
                  alt={item.alt}
                  className="w-full h-full"
                  muted
                  preload="metadata"
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Info panel */}
      {showInfo && currentItem && (currentItem.title || currentItem.description) && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          {currentItem.title && (
            <h3 className="font-semibold text-lg text-gray-900 mb-2">
              {currentItem.title}
            </h3>
          )}
          {currentItem.description && (
            <p className="text-gray-600">{currentItem.description}</p>
          )}
          <div className="mt-2 text-sm text-gray-500">
            {currentIndex + 1} of {items.length}
          </div>
        </div>
      )}
    </div>
  );

  // Handle empty items array
  if (!items || items.length === 0) {
    return (
      <div className={`flex items-center justify-center p-8 text-gray-500 ${className}`}>
        <p>No media items to display</p>
      </div>
    );
  }

  // Render based on layout
  if (layout === 'grid') {
    return <GridLayout />;
  }

  if (layout === 'carousel') {
    return <CarouselLayout />;
  }

  // Default to grid layout
  return <GridLayout />;
};

export default MediaGallery;