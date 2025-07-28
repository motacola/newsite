'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VideoShowcaseProps } from '@/lib/types/video';
import VideoPlayer from './VideoPlayer';
import { Search, Grid, List, Play, Eye, TrendingUp } from 'lucide-react';

export const VideoShowcase: React.FC<VideoShowcaseProps> = ({
  videos,
  categories,
  layout = 'grid',
  showFilters = true,
  showSearch = true,
  itemsPerPage = 6,
  onItemClick,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLayout, setCurrentLayout] = useState(layout);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter videos based on category and search
  const filteredVideos = useMemo(() => {
    let filtered = videos;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(video => video.category.id === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(query) ||
        video.description.toLowerCase().includes(query) ||
        video.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [videos, selectedCategory, searchQuery]);

  // Paginate videos
  const paginatedVideos = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredVideos.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredVideos, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9 },
  };

  const categoryVariants = {
    inactive: {
      scale: 1,
      backgroundColor: 'rgba(107, 114, 128, 0.1)',
      color: 'rgb(107, 114, 128)',
    },
    active: {
      scale: 1.05,
      backgroundColor: 'rgb(59, 130, 246)',
      color: 'rgb(255, 255, 255)',
    },
  };

  return (
    <div className="w-full">
      {/* Header with filters and search */}
      {(showFilters || showSearch) && (
        <div className="mb-8 space-y-4">
          {/* Search bar */}
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          )}

          {/* Category filters and layout controls */}
          {showFilters && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Category filters */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <motion.button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setCurrentPage(1);
                    }}
                    variants={categoryVariants}
                    animate={selectedCategory === category.id ? 'active' : 'inactive'}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-full font-medium transition-all duration-200 flex items-center gap-2"
                  >
                    {category.icon && <span>{category.icon}</span>}
                    {category.name}
                    {selectedCategory === category.id && (
                      <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                        {filteredVideos.length}
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Layout controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentLayout('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    currentLayout === 'grid'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  aria-label="Grid layout"
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentLayout('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    currentLayout === 'list'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  aria-label="List layout"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results count */}
      <div className="mb-6 text-gray-600">
        Showing {paginatedVideos.length} of {filteredVideos.length} videos
        {selectedCategory !== 'all' && (
          <span className="ml-2">
            in {categories.find(cat => cat.id === selectedCategory)?.name}
          </span>
        )}
      </div>

      {/* Video grid/list */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${selectedCategory}-${searchQuery}-${currentPage}`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className={
            currentLayout === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-6'
          }
        >
          {paginatedVideos.map((video) => (
            <motion.div
              key={video.id}
              variants={itemVariants}
              layout
              className={
                currentLayout === 'grid'
                  ? 'group cursor-pointer'
                  : 'flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer'
              }
              onClick={() => {
                const index = videos.findIndex(v => v.id === video.id);
                onItemClick?.(video, index);
              }}
            >
              {/* Video player */}
              <div className={currentLayout === 'list' ? 'sm:w-80 flex-shrink-0' : ''}>
                <VideoPlayer
                  videoId={video.videoId}
                  title={video.title}
                  className="w-full"
                />
              </div>

              {/* Video info */}
              <div className={`mt-4 ${currentLayout === 'list' ? 'sm:mt-0 flex-1' : ''}`}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {video.title}
                  </h3>
                  {video.featured && (
                    <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full flex-shrink-0">
                      Featured
                    </span>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                  {video.description}
                </p>

                {/* Category and metrics */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${video.category.color} text-white`}
                    >
                      {video.category.name}
                    </span>
                    <span className="text-gray-500">
                      {new Date(video.publishedAt).getFullYear()}
                    </span>
                  </div>

                  {video.metrics && (
                    <div className="flex items-center gap-3 text-gray-500">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{video.metrics.views?.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>{video.metrics.engagement}%</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {video.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {video.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                    {video.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{video.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Empty state */}
      {filteredVideos.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Play className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No videos found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search or filter criteria
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Clear filters
          </button>
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  currentPage === page
                    ? 'bg-blue-500 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoShowcase;