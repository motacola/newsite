'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Project } from '@/lib/types';
import { Button } from './Button';
import { TechnologyStack } from './TechnologyStack';
import { MetricsDisplay } from './MetricsDisplay';
import { ProjectGallery } from './ProjectGallery';
import { InteractiveDemo } from './InteractiveDemo';
import { AICapabilities } from './AICapabilities';

interface ProjectCardProps {
  project: Project;
  variant?: 'default' | 'featured' | 'compact';
  onExpand?: (project: Project) => void;
  showFullDetails?: boolean;
}

export function ProjectCard({ 
  project, 
  variant = 'default',
  onExpand,
  showFullDetails = false
}: ProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(showFullDetails);
  const [isHovered, setIsHovered] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'gallery' | 'ai' | 'demo'>('overview');

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
    onExpand?.(project);
  };

  const cardVariants = {
    default: {
      scale: 1,
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' as const }
    },
    hovered: {
      scale: variant === 'compact' ? 1.02 : 1.01,
      y: variant === 'compact' ? -4 : -2,
      transition: { duration: 0.3, ease: 'easeOut' as const }
    }
  };

  const expandVariants = {
    collapsed: {
      height: 'auto',
      transition: { duration: 0.4, ease: 'easeInOut' as const }
    },
    expanded: {
      height: 'auto',
      transition: { duration: 0.4, ease: 'easeInOut' as const }
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border border-green-200';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border border-yellow-200';
      case 'planned':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border border-gray-200';
      default:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border border-orange-200';
    }
  };

  return (
    <motion.div
      className={`
        relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden
        border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-500
        ${variant === 'featured' ? 'ring-2 ring-orange-500 ring-opacity-50 shadow-creative' : ''}
        ${variant === 'compact' ? 'max-w-sm' : 'w-full max-w-4xl'}
        ${isExpanded ? 'shadow-creative' : ''}
        transition-all duration-300 hover:shadow-creative hover:-translate-y-1
      `}
      variants={cardVariants}
      initial="default"
      animate={isHovered ? 'hovered' : 'default'}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      layout
    >
      {/* Hero Image */}
      <div className={`relative ${variant === 'compact' ? 'h-40' : 'h-48'} overflow-hidden`}>
        <Image
          src={project.media.hero}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-700 hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-orange-900/20 to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-purple-500 text-white text-sm font-medium rounded-full shadow-lg">
            Creative Tech
          </span>
          {project.status && (
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(project.status)}`}>
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </span>
          )}
        </div>

        {/* Featured Badge */}
        {project.featured && (
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-medium rounded-full shadow-lg animate-creative-pulse">
              ⭐ Featured
            </span>
          </div>
        )}

        {/* Quick Stats Overlay */}
        {!isExpanded && project.metrics.length > 0 && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex gap-3 text-white">
              {project.metrics.slice(0, 2).map((metric, index) => (
                <div key={index} className="text-center">
                  <div className="text-lg font-bold drop-shadow-lg text-orange-300">
                    {metric.value}
                  </div>
                  <div className="text-xs opacity-90">
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <motion.div
        className="p-6"
        variants={expandVariants}
        animate={isExpanded ? 'expanded' : 'collapsed'}
        layout
      >
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {project.title}
            </h3>
            {project.dateCompleted && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(project.dateCompleted).getFullYear()}
              </span>
            )}
          </div>
          
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              {project.client} • {project.timeline}
            </span>
          </p>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
            {isExpanded ? project.description : project.shortDescription}
          </p>

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {project.tags.slice(0, isExpanded ? project.tags.length : 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Compact Metrics Preview */}
        {!isExpanded && project.metrics.length > 0 && (
          <div className="mb-4">
            <MetricsDisplay metrics={project.metrics} variant="compact" />
          </div>
        )}

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="space-y-6"
            >
              {/* Tab Navigation */}
              <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                {[
                  { id: 'overview', label: 'Overview', icon: '📋' },
                  { id: 'metrics', label: 'Metrics', icon: '📊' },
                  { id: 'gallery', label: 'Gallery', icon: '🖼️' },
                  ...(project.aiCapabilities || project.businessImpact || project.technicalDetails ? [{ id: 'ai', label: 'AI Details', icon: '🤖' }] : []),
                  ...(project.interactive ? [{ id: 'demo', label: 'Demo', icon: '🚀' }] : [])
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
                      flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors
                      ${activeTab === tab.id
                        ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                      }
                    `}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeTab === 'overview' && (
                    <div className="space-y-4">
                      <TechnologyStack 
                        technologies={project.technologies} 
                        variant="detailed"
                        showCategories={true}
                        interactive={true}
                      />
                      
                      {project.challenges && project.challenges.length > 0 && (
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                            Key Challenges
                          </h5>
                          <ul className="space-y-1">
                            {project.challenges.map((challenge, index) => (
                              <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                                <span className="text-red-500 mt-1">•</span>
                                {challenge}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {project.outcomes && project.outcomes.length > 0 && (
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                            Key Outcomes
                          </h5>
                          <ul className="space-y-1">
                            {project.outcomes.map((outcome, index) => (
                              <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                                <span className="text-green-500 mt-1">•</span>
                                {outcome}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'metrics' && (
                    <MetricsDisplay 
                      metrics={project.metrics} 
                      variant="detailed" 
                      animated={true}
                      showComparison={true}
                    />
                  )}

                  {activeTab === 'gallery' && (
                    <ProjectGallery 
                      media={project.media} 
                      title={project.title}
                    />
                  )}

                  {activeTab === 'ai' && (
                    <AICapabilities 
                      aiCapabilities={project.aiCapabilities}
                      businessImpact={project.businessImpact}
                      technicalDetails={project.technicalDetails}
                      variant="detailed"
                    />
                  )}

                  {activeTab === 'demo' && project.interactive && (
                    <InteractiveDemo 
                      interactive={project.interactive}
                      title={project.title}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Testimonial */}
              {project.testimonial && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <blockquote className="text-sm italic text-gray-700 dark:text-gray-300 mb-3">
                    "{project.testimonial.quote}"
                  </blockquote>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    — {project.testimonial.author}, {project.testimonial.role} at {project.testimonial.company}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExpand}
            className="flex items-center gap-2"
          >
            {isExpanded ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                Show Less
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Learn More
              </>
            )}
          </Button>
          
          <div className="flex gap-2">
            {project.media.video && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(project.media.video, '_blank')}
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15" />
                </svg>
                Watch Demo
              </Button>
            )}
            
            {project.interactive && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.open(project.interactive?.url, '_blank')}
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Try Live Demo
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}