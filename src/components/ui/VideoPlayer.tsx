'use client';

import React, { useState, useRef } from 'react';
import { VideoPlayerProps } from '@/lib/types/video';
import { useVideoAnalytics } from '@/lib/hooks/useVideoAnalytics';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react';

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoId,
  title,
  controls = true,
  muted = false,
  loop = false,
  onPlay,
  onPause,
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [showControls, setShowControls] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Analytics tracking
  const { trackPlay, trackPause, trackFullscreen } = useVideoAnalytics();

  // YouTube thumbnail URL
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  const fallbackThumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  const handlePlay = () => {
    setIsPlaying(true);
    setIsLoaded(true);
    trackPlay(videoId);
    onPlay?.();
  };

  const handlePause = () => {
    setIsPlaying(false);
    trackPause(videoId);
    onPause?.();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
      trackFullscreen(videoId);
    }
  };

  const loadVideo = () => {
    if (!isLoaded) {
      setIsLoaded(true);
      handlePlay();
    }
  };

  // YouTube embed URL with parameters
  const embedUrl = `https://www.youtube.com/embed/${videoId}?${new URLSearchParams({
    autoplay: isLoaded && isPlaying ? '1' : '0',
    mute: isMuted ? '1' : '0',
    loop: loop ? '1' : '0',
    controls: controls ? '1' : '0',
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
  }).toString()}`;

  return (
    <div
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden group ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Aspect ratio container */}
      <div className="relative w-full pb-[56.25%]"> {/* 16:9 aspect ratio */}
        {!isLoaded ? (
          <>
            {/* Thumbnail */}
            <img
              src={thumbnailUrl}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = fallbackThumbnailUrl;
              }}
            />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
            
            {/* Play button */}
            <button
              onClick={loadVideo}
              className="absolute inset-0 flex items-center justify-center group/play hover:scale-105 transition-transform duration-200"
              aria-label={`Play ${title}`}
            >
              <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-2xl group-hover/play:bg-red-700 transition-colors duration-200">
                <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
              </div>
            </button>
            
            {/* Video title overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-white font-semibold text-lg leading-tight line-clamp-2">
                {title}
              </h3>
            </div>
          </>
        ) : (
          <>
            {/* YouTube iframe */}
            <iframe
              ref={iframeRef}
              src={embedUrl}
              title={title}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => setError(null)}
              onError={() => setError('Failed to load video')}
            />
            
            {/* Custom controls overlay */}
            {controls && (
              <div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
                  showControls ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={isPlaying ? handlePause : handlePlay}
                      className="p-2 hover:bg-white/20 rounded-full transition-colors"
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" fill="currentColor" />
                      )}
                    </button>
                    
                    <button
                      onClick={toggleMute}
                      className="p-2 hover:bg-white/20 rounded-full transition-colors"
                      aria-label={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? (
                        <VolumeX className="w-5 h-5" />
                      ) : (
                        <Volume2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleFullscreen}
                      className="p-2 hover:bg-white/20 rounded-full transition-colors"
                      aria-label="Fullscreen"
                    >
                      <Maximize className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center text-white">
              <RotateCcw className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">Video unavailable</p>
              <p className="text-gray-400">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setIsLoaded(false);
                }}
                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;