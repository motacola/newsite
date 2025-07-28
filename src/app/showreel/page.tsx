'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { VideoShowcase, VideoModal, Container, Heading, Body } from '@/components/ui';
import { videoShowreel, videoCategories } from '@/content/video-data';
import { VideoItem } from '@/lib/types/video';

export default function ShowreelPage() {
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleVideoClick = (video: VideoItem, _index: number) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVideo(null);
  };

  const handleNextVideo = () => {
    if (!selectedVideo) return;
    const currentIndex = videoShowreel.findIndex(v => v.id === selectedVideo.id);
    const nextIndex = (currentIndex + 1) % videoShowreel.length;
    setSelectedVideo(videoShowreel[nextIndex]);
  };

  const handlePreviousVideo = () => {
    if (!selectedVideo) return;
    const currentIndex = videoShowreel.findIndex(v => v.id === selectedVideo.id);
    const previousIndex = (currentIndex - 1 + videoShowreel.length) % videoShowreel.length;
    setSelectedVideo(videoShowreel[previousIndex]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white py-20">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Heading className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Video Showreel
            </Heading>
            <Body className="text-xl text-blue-100 mb-8 leading-relaxed">
              Explore a curated collection of advertising campaigns, trailers, and behind-the-scenes content 
              showcasing innovative video production and creative storytelling.
            </Body>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-blue-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Interactive Video Player</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Advanced Filtering</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Performance Analytics</span>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Video Showcase */}
      <section className="py-16">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <VideoShowcase
              videos={videoShowreel}
              categories={videoCategories}
              layout="grid"
              showFilters={true}
              showSearch={true}
              itemsPerPage={6}
              onItemClick={handleVideoClick}
            />
          </motion.div>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center"
          >
            <Heading className="text-3xl font-bold text-gray-900 mb-12">
              Showreel Performance
            </Heading>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                {
                  label: 'Total Views',
                  value: videoShowreel.reduce((sum, video) => sum + (video.metrics?.views || 0), 0).toLocaleString(),
                  icon: '👁️',
                  color: 'text-blue-600',
                },
                {
                  label: 'Average Engagement',
                  value: `${(videoShowreel.reduce((sum, video) => sum + (video.metrics?.engagement || 0), 0) / videoShowreel.length).toFixed(1)}%`,
                  icon: '📈',
                  color: 'text-green-600',
                },
                {
                  label: 'Featured Projects',
                  value: videoShowreel.filter(video => video.featured).length.toString(),
                  icon: '⭐',
                  color: 'text-yellow-600',
                },
                {
                  label: 'Categories',
                  value: videoCategories.filter(cat => cat.id !== 'all').length.toString(),
                  icon: '🎬',
                  color: 'text-purple-600',
                },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl mb-2">{stat.icon}</div>
                  <div className={`text-3xl font-bold ${stat.color} mb-2`}>
                    {stat.value}
                  </div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Categories Overview */}
      <section className="py-16 bg-gray-50">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Heading className="text-3xl font-bold text-gray-900 mb-12 text-center">
              Content Categories
            </Heading>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {videoCategories.filter(cat => cat.id !== 'all').map((category, index) => {
                const categoryVideos = videoShowreel.filter(video => video.category.id === category.id);
                const totalViews = categoryVideos.reduce((sum, video) => sum + (video.metrics?.views || 0), 0);
                const avgEngagement = categoryVideos.reduce((sum, video) => sum + (video.metrics?.engagement || 0), 0) / categoryVideos.length;

                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                    className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">
                          {category.name}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {categoryVideos.length} video{categoryVideos.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Views</span>
                        <span className="font-medium">{totalViews.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Avg. Engagement</span>
                        <span className="font-medium">{avgEngagement.toFixed(1)}%</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Video Modal */}
      <VideoModal
        video={selectedVideo}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onNext={handleNextVideo}
        onPrevious={handlePreviousVideo}
      />
    </div>
  );
}