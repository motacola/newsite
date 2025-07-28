'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ProjectGalleryProps } from '@/lib/types';

export function ProjectGallery({ 
  media, 
  title, 
  onMediaClick 
}: ProjectGalleryProps) {
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'image' | 'video'>('image');

  const handleMediaClick = (mediaUrl: string, type: 'image' | 'video') => {
    setSelectedMedia(mediaUrl);
    setSelectedType(type);
    onMediaClick?.(mediaUrl, type);
  };

  const closeModal = () => {
    setSelectedMedia(null);
  };

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-900 dark:text-white">
        Project Gallery
      </h4>
      
      {/* Main Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {/* Hero Image */}
        <motion.div
          className="col-span-2 md:col-span-2 relative h-48 rounded-lg overflow-hidden cursor-pointer group"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          onClick={() => handleMediaClick(media.hero, 'image')}
        >
          <Image
            src={media.hero}
            alt={`${title} hero image`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded">
              Hero
            </span>
          </div>
        </motion.div>

        {/* Video Thumbnail (if available) */}
        {media.video && (
          <motion.div
            className="relative h-48 rounded-lg overflow-hidden cursor-pointer group"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            onClick={() => handleMediaClick(media.video!, 'video')}
          >
            <Image
              src={media.thumbnail || media.hero}
              alt={`${title} video thumbnail`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center group-hover:bg-white transition-colors duration-300">
                <svg className="w-6 h-6 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
            </div>
            <div className="absolute top-2 left-2">
              <span className="px-2 py-1 bg-red-600 text-white text-xs font-medium rounded">
                Video
              </span>
            </div>
          </motion.div>
        )}

        {/* Gallery Images */}
        {media.gallery.slice(0, media.video ? 2 : 3).map((image, index) => (
          <motion.div
            key={index}
            className="relative h-24 md:h-32 rounded-lg overflow-hidden cursor-pointer group"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            onClick={() => handleMediaClick(image, 'image')}
          >
            <Image
              src={image}
              alt={`${title} gallery image ${index + 1}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
          </motion.div>
        ))}

        {/* More Images Indicator */}
        {media.gallery.length > (media.video ? 2 : 3) && (
          <div className="relative h-24 md:h-32 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-600 dark:text-gray-300">
                +{media.gallery.length - (media.video ? 2 : 3)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                more
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center p-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {selectedType === 'video' ? (
                <video
                  src={selectedMedia}
                  controls
                  autoPlay
                  className="max-w-full max-h-full rounded-lg"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="relative max-w-full max-h-full">
                  <Image
                    src={selectedMedia}
                    alt="Gallery image"
                    width={1200}
                    height={800}
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                </div>
              )}
              
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}