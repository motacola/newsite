'use client';

import { useState, useEffect, useCallback } from 'react';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  src: string;
  alt: string;
  title?: string;
}

interface UseMediaGalleryProps {
  items: MediaItem[];
  initialIndex?: number;
  enableInfiniteLoop?: boolean;
  autoplay?: boolean;
  autoplayInterval?: number;
}

export const useMediaGallery = ({
  items,
  initialIndex = 0,
  enableInfiniteLoop = true,
  autoplay = false,
  autoplayInterval = 5000,
}: UseMediaGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(autoplay);

  // Responsive columns based on screen size
  const [columns, setColumns] = useState(3);
  
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setColumns(1);
      } else if (width < 768) {
        setColumns(2);
      } else if (width < 1024) {
        setColumns(3);
      } else {
        setColumns(4);
      }
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  const goToNext = useCallback(() => {
    const nextIndex = enableInfiniteLoop 
      ? (currentIndex + 1) % items.length 
      : Math.min(currentIndex + 1, items.length - 1);
    
    if (nextIndex !== currentIndex) {
      setCurrentIndex(nextIndex);
    }
  }, [currentIndex, items.length, enableInfiniteLoop]);

  const goToPrevious = useCallback(() => {
    const prevIndex = enableInfiniteLoop 
      ? (currentIndex - 1 + items.length) % items.length 
      : Math.max(currentIndex - 1, 0);
    
    if (prevIndex !== currentIndex) {
      setCurrentIndex(prevIndex);
    }
  }, [currentIndex, items.length, enableInfiniteLoop]);

  const goToIndex = useCallback((index: number) => {
    if (index >= 0 && index < items.length && index !== currentIndex) {
      setCurrentIndex(index);
    }
  }, [currentIndex, items.length]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // Autoplay functionality
  useEffect(() => {
    if (!isPlaying || items.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = enableInfiniteLoop ? (prev + 1) % items.length : Math.min(prev + 1, items.length - 1);
        if (!enableInfiniteLoop && nextIndex === items.length - 1) {
          setIsPlaying(false);
        }
        return nextIndex;
      });
    }, autoplayInterval);

    return () => clearInterval(interval);
  }, [isPlaying, items.length, autoplayInterval, enableInfiniteLoop]);

  return {
    currentIndex,
    setCurrentIndex,
    isPlaying,
    setIsPlaying,
    columns,
    goToNext,
    goToPrevious,
    goToIndex,
    togglePlayPause,
  };
};

export default useMediaGallery;