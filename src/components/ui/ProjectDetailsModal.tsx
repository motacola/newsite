'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { Project } from '@/lib/types';
import { ProjectGallery } from './ProjectGallery';
import { MetricsDisplay } from './MetricsDisplay';
import { TechnologyStack } from './TechnologyStack';
import { AICapabilities } from './AICapabilities';
import { InteractiveDemo } from './InteractiveDemo';
import { Button } from './Button';

interface ProjectDetailsModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectDetailsModal({ project, isOpen, onClose }: ProjectDetailsModalProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!project) return null;

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1] as const
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-6xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {project.title}
                    </h2>
                    {project.featured && (
                      <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-medium rounded-full">
                        ⭐ Featured
                      </span>
                    )}
                  </div>
                  <p className="text-blue-600 dark:text-blue-400 font-medium">
                    {project.client} • {project.timeline}
                  </p>
                </div>
                
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="Close modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <motion.div
              className="overflow-y-auto max-h-[calc(90vh-120px)] p-6"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="space-y-8">
                {/* Description */}
                <motion.div variants={itemVariants}>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                    {project.description}
                  </p>
                  
                  {/* Tags */}
                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {project.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>

                {/* Gallery */}
                <motion.div variants={itemVariants}>
                  <ProjectGallery media={project.media} title={project.title} />
                </motion.div>

                {/* Interactive Demo */}
                {project.interactive && (
                  <motion.div variants={itemVariants}>
                    <InteractiveDemo interactive={project.interactive} title={project.title} />
                  </motion.div>
                )}

                {/* Metrics */}
                {project.metrics && project.metrics.length > 0 && (
                  <motion.div variants={itemVariants}>
                    <MetricsDisplay 
                      metrics={project.metrics} 
                      variant="detailed" 
                      animated={true}
                      showComparison={true}
                    />
                  </motion.div>
                )}

                {/* AI Capabilities */}
                {(project.aiCapabilities || project.businessImpact || project.technicalDetails) && (
                  <motion.div variants={itemVariants}>
                    <AICapabilities 
                      aiCapabilities={project.aiCapabilities}
                      businessImpact={project.businessImpact}
                      technicalDetails={project.technicalDetails}
                      variant="detailed"
                    />
                  </motion.div>
                )}

                {/* Technology Stack */}
                <motion.div variants={itemVariants}>
                  <TechnologyStack 
                    technologies={project.technologies} 
                    variant="detailed"
                    showCategories={true}
                    interactive={true}
                  />
                </motion.div>

                {/* Challenges & Outcomes */}
                {(project.challenges || project.outcomes) && (
                  <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6">
                    {project.challenges && project.challenges.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <span className="text-red-500">🎯</span>
                          Key Challenges
                        </h4>
                        <ul className="space-y-2">
                          {project.challenges.map((challenge, index) => (
                            <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-3">
                              <span className="text-red-500 mt-1 flex-shrink-0">•</span>
                              {challenge}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {project.outcomes && project.outcomes.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <span className="text-green-500">✅</span>
                          Key Outcomes
                        </h4>
                        <ul className="space-y-2">
                          {project.outcomes.map((outcome, index) => (
                            <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-3">
                              <span className="text-green-500 mt-1 flex-shrink-0">•</span>
                              {outcome}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Testimonial */}
                {project.testimonial && (
                  <motion.div variants={itemVariants}>
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-4">
                        {project.testimonial.avatar && (
                          <img
                            src={project.testimonial.avatar}
                            alt={project.testimonial.author}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <blockquote className="text-gray-700 dark:text-gray-300 mb-3 italic">
                            "{project.testimonial.quote}"
                          </blockquote>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <div className="font-medium">{project.testimonial.author}</div>
                            <div>{project.testimonial.role} at {project.testimonial.company}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <motion.div variants={itemVariants} className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  {project.media.video && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(project.media.video, '_blank')}
                      className="flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15" />
                      </svg>
                      Watch Demo
                    </Button>
                  )}
                  
                  {project.interactive?.url && (
                    <Button
                      variant="primary"
                      onClick={() => window.open(project.interactive?.url, '_blank')}
                      className="flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Try Live Demo
                    </Button>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}