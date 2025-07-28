'use client';

import React, { useState } from 'react';
import MediaGallery, { MediaItem } from './MediaGallery';

const sampleMediaItems: MediaItem[] = [
  {
    id: '1',
    type: 'image',
    src: '/images/project1.jpg',
    thumbnail: '/images/project1-thumb.jpg',
    alt: 'AI-powered recommendation system interface',
    title: 'AI Recommendation System',
    description: 'Machine learning-powered product recommendation interface with real-time personalization.',
    width: 1920,
    height: 1080,
  },
  {
    id: '2',
    type: 'video',
    src: '/videos/demo-reel.mp4',
    poster: '/images/demo-reel-poster.jpg',
    alt: 'Portfolio demo reel showcasing various projects',
    title: 'Portfolio Demo Reel',
    description: 'A comprehensive showcase of recent projects and capabilities.',
    videoSources: [
      { src: '/videos/demo-reel.webm', type: 'video/webm' },
      { src: '/videos/demo-reel.mp4', type: 'video/mp4' },
    ],
  },
  {
    id: '3',
    type: 'image',
    src: '/images/project2.jpg',
    thumbnail: '/images/project2-thumb.jpg',
    alt: 'Interactive data visualization dashboard',
    title: 'Data Visualization Dashboard',
    description: 'Interactive dashboard with real-time analytics and customizable charts.',
    width: 1920,
    height: 1200,
  },
  {
    id: '4',
    type: 'image',
    src: '/images/project3.jpg',
    thumbnail: '/images/project3-thumb.jpg',
    alt: 'Mobile app interface design',
    title: 'Mobile App Design',
    description: 'Clean, modern mobile application interface with intuitive navigation.',
    width: 750,
    height: 1334,
  },
  {
    id: '5',
    type: 'video',
    src: '/videos/process-demo.mp4',
    poster: '/images/process-demo-poster.jpg',
    alt: 'Design process demonstration',
    title: 'Design Process Demo',
    description: 'Behind-the-scenes look at the design and development process.',
  },
];

export const MediaGalleryExample: React.FC = () => {
  const [layout, setLayout] = useState<'grid' | 'masonry' | 'carousel'>('grid');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleItemClick = (item: MediaItem, index: number) => {
    setSelectedIndex(index);
    setLayout('carousel');
  };

  const handleClose = () => {
    setSelectedIndex(null);
    setLayout('grid');
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Interactive Media Gallery
        </h2>
        <p className="text-gray-600 mb-6">
          Explore projects with swipeable carousels, zoom functionality, and keyboard navigation
        </p>
        
        {/* Layout Controls */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setLayout('grid')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              layout === 'grid'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Grid Layout
          </button>
          <button
            onClick={() => setLayout('masonry')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              layout === 'masonry'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Masonry Layout
          </button>
          <button
            onClick={() => setLayout('carousel')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              layout === 'carousel'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Carousel Layout
          </button>
        </div>
      </div>

      {/* Media Gallery */}
      <MediaGallery
        items={sampleMediaItems}
        layout={layout}
        initialIndex={selectedIndex || 0}
        columns={layout === 'grid' ? 3 : 4}
        gap={16}
        showThumbnails={layout === 'carousel'}
        showControls={true}
        showInfo={layout === 'carousel'}
        enableZoom={true}
        enableSwipe={true}
        enableKeyboard={true}
        autoplay={false}
        autoplayInterval={4000}
        enableInfiniteLoop={true}
        showProgress={layout === 'carousel'}
        className="max-w-6xl mx-auto"
        onItemClick={handleItemClick}
        onClose={layout === 'carousel' ? handleClose : undefined}
        onIndexChange={(index) => setSelectedIndex(index)}
      />

      {/* Usage Instructions */}
      <div className="max-w-4xl mx-auto bg-gray-50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Interactive Features
        </h3>
        <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Keyboard Navigation</h4>
            <ul className="space-y-1">
              <li><kbd className="px-2 py-1 bg-gray-200 rounded">←/→</kbd> Navigate items</li>
              <li><kbd className="px-2 py-1 bg-gray-200 rounded">↑/↓</kbd> Grid navigation</li>
              <li><kbd className="px-2 py-1 bg-gray-200 rounded">Space</kbd> Play/pause or fullscreen</li>
              <li><kbd className="px-2 py-1 bg-gray-200 rounded">F</kbd> Toggle fullscreen</li>
              <li><kbd className="px-2 py-1 bg-gray-200 rounded">+/-</kbd> Zoom in/out</li>
              <li><kbd className="px-2 py-1 bg-gray-200 rounded">0</kbd> Reset zoom</li>
              <li><kbd className="px-2 py-1 bg-gray-200 rounded">R</kbd> Rotate image</li>
              <li><kbd className="px-2 py-1 bg-gray-200 rounded">Esc</kbd> Close/exit</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Mouse & Touch</h4>
            <ul className="space-y-1">
              <li>• Click/tap items to view in carousel mode</li>
              <li>• Swipe left/right to navigate</li>
              <li>• Mouse wheel to zoom images</li>
              <li>• Double-click to zoom</li>
              <li>• Drag to pan zoomed images</li>
              <li>• Hover for control overlays</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaGalleryExample;