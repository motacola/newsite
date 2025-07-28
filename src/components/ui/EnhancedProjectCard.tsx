'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Image from 'next/image';
import { Project } from '@/lib/types';
import { Button } from './Button';
import { TechnologyStack } from './TechnologyStack';
import { MetricsDisplay } from './MetricsDisplay';
import { ProjectGallery } from './ProjectGallery';
import { InteractiveDemo } from './InteractiveDemo';
import { AICapabilities } from './AICapabilities';

interface EnhancedProjectCardProps {
  project: Project;
  variant?: 'default' | 'featured' | 'compact' | 'showcase';
  onExpand?: (project: Project) => void;
  showFullDetails?: boolean;
  enableAnimations?: boolean;
  priority?: boolean;
}

export function EnhancedProjectCard({ 
  project, 
  variant = 'default',
  onExpand,
  showFullDetails = false,
  enableAnimations = true,
  priority = false
}: EnhancedProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(showFullDetails);
  const [isHovered, setIsHovered] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'gallery' | 'ai' | 'demo'>('overview');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-100px" });

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
    onExpand?.(project);
    
    // Scroll to card when expanding
    if (!isExpanded && cardRef.current) {
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }, 100);
    }
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94] as const
      }
    },
    hovered: {
      y: variant === 'compact' ? -8 : -4,
      scale: variant === 'compact' ? 1.03 : 1.01,
      transition: {
        duration: 0.3,
        ease: 'easeOut' as const
      }
    },
    default: {
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut' as const
      }
    }
  };

  const expandVariants = {
    collapsed: {
      height: 'auto',
      opacity: 1,
      transition: { 
        duration: 0.5, 
        ease: [0.25, 0.46, 0.45, 0.94] as const
      }
    },
    expanded: {
      height: 'auto',
      opacity: 1,
      transition: { 
        duration: 0.5, 
        ease: [0.25, 0.46, 0.45, 0.94] as const
      }
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800';
      case 'planned':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800';
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'featured':
        return 'ring-2 ring-blue-500 ring-opacity-50 shadow-2xl bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-900/20';
      case 'compact':
        return 'max-w-sm shadow-md hover:shadow-lg';
      case 'showcase':
        return 'max-w-6xl shadow-2xl bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20';
      default:
        return 'w-full max-w-4xl shadow-lg hover:shadow-xl';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📋', count: null },
    { id: 'metrics', label: 'Metrics', icon: '📊', count: project.metrics?.length || 0 },
    { id: 'gallery', label: 'Gallery', icon: '🖼️', count: project.media?.gallery?.length || 0 },
    ...(project.aiCapabilities || project.businessImpact || project.technicalDetails ? 
      [{ id: 'ai', label: 'AI Details', icon: '🤖', count: project.aiCapabilities?.length || 0 }] : []
    ),
    ...(project.interactive ? 
      [{ id: 'demo', label: 'Demo', icon: '🚀', count: null }] : []
    )
  ];

  return (
    <motion.div
      ref={cardRef}
      className={`
        relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden
        border border-gray-200 dark:border-gray-700
        ${getVariantStyles()}
        ${isExpanded ? 'shadow-2xl ring-1 ring-black/5 dark:ring-white/10' : ''}
        transition-all duration-300
      `}
      variants={enableAnimations ? cardVariants : {}}
      initial={enableAnimations ? "hidden" : false}
      animate={enableAnimations ? (isInView ? (isHovered ? 'hovered' : 'visible') : 'hidden') : false}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      layout
    >
      {/* Hero Image with Enhanced Overlay */}
      <div className={`relative ${variant === 'compact' ? 'h-40' : variant === 'showcase' ? 'h-64' : 'h-48'} overflow-hidden`}>
        <Image
          src={project.media.hero}
          alt={project.title}
          fill
          className={`object-cover transition-all duration-700 ${imageLoaded ? 'scale-100' : 'scale-110'} ${isHovered ? 'scale-110' : 'scale-100'}`}
          onLoad={() => setImageLoaded(true)}
          priority={priority}
        />
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
        
        {/* Enhanced Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <motion.span 
            className="px-3 py-1.5 bg-blue-600/90 backdrop-blur-sm text-white text-sm font-medium rounded-full shadow-lg"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            AI Project
          </motion.span>
          
          {project.status && (
            <motion.span 
              className={`px-3 py-1.5 text-sm font-medium rounded-full backdrop-blur-sm shadow-lg border ${getStatusColor(project.status)}`}
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </motion.span>
          )}
        </div>

        {/* Featured Badge with Animation */}
        {project.featured && (
          <motion.div
            className="absolute top-4 right-4"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
          >
            <span className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-medium rounded-full shadow-lg backdrop-blur-sm flex items-center gap-1">
              <span className="animate-pulse">⭐</span>
              Featured
            </span>
          </motion.div>
        )}

        {/* Interactive Quick Stats */}
        {!isExpanded && project.metrics && project.metrics.length > 0 && (
          <motion.div 
            className="absolute bottom-4 left-4 right-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex gap-4 text-white">
              {project.metrics.slice(0, variant === 'compact' ? 1 : 2).map((metric, index) => (
                <motion.div
                  key={index}
                  className="text-center cursor-pointer group"
                  whileHover={{ scale: 1.1 }}
                  onHoverStart={() => setShowTooltip(metric.description || metric.label)}
                  onHoverEnd={() => setShowTooltip(null)}
                >
                  <div className="text-lg font-bold drop-shadow-lg group-hover:text-blue-300 transition-colors">
                    {metric.value}
                  </div>
                  <div className="text-xs opacity-90 group-hover:opacity-100 transition-opacity">
                    {metric.label}
                  </div>
                  {metric.improvement && (
                    <div className="text-xs text-green-300 font-medium">
                      {metric.improvement}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tooltip */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              className="absolute bottom-16 left-4 right-4 bg-black/80 backdrop-blur-sm text-white text-sm p-2 rounded-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              {showTooltip}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Enhanced Content */}
      <motion.div
        className="p-6"
        variants={expandVariants}
        animate={isExpanded ? 'expanded' : 'collapsed'}
        layout
      >
        {/* Header with Enhanced Typography */}
        <div className="mb-4">
          <div className="flex items-start justify-between mb-3">
            <motion.h3 
              className="text-xl font-bold text-gray-900 dark:text-white leading-tight"
              layoutId={`title-${project.id}`}
            >
              {project.title}
            </motion.h3>
            
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              {project.dateCompleted && (
                <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {new Date(project.dateCompleted).getFullYear()}
                </span>
              )}
              {project.timeline && (
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                  {project.timeline}
                </span>
              )}
            </div>
          </div>
          
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
            {project.client}
          </p>
          
          <motion.p 
            className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed"
            layoutId={`description-${project.id}`}
          >
            {isExpanded ? project.description : project.shortDescription}
          </motion.p>

          {/* Enhanced Tags */}
          {project.tags && project.tags.length > 0 && (
            <motion.div 
              className="flex flex-wrap gap-2 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {project.tags.slice(0, isExpanded ? project.tags.length : 4).map((tag, index) => (
                <motion.span
                  key={index}
                  className="px-2 py-1 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full border border-gray-200 dark:border-gray-600 hover:shadow-sm transition-shadow cursor-default"
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                >
                  {tag}
                </motion.span>
              ))}
              {!isExpanded && project.tags.length > 4 && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs rounded-full">
                  +{project.tags.length - 4}
                </span>
              )}
            </motion.div>
          )}
        </div>

        {/* Compact Metrics Preview */}
        {!isExpanded && project.metrics && project.metrics.length > 0 && (
          <motion.div 
            className="mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <MetricsDisplay metrics={project.metrics} variant="compact" />
          </motion.div>
        )}

        {/* Expanded Content with Enhanced Tabs */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="space-y-6"
            >
              {/* Enhanced Tab Navigation */}
              <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-x-auto">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'overview' | 'metrics' | 'gallery' | 'ai' | 'demo')}
                    className={`
                      flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap
                      ${activeTab === tab.id
                        ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-blue-200 dark:ring-blue-800'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50'
                      }
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-base">{tab.icon}</span>
                    <span>{tab.label}</span>
                    {tab.count !== null && tab.count > 0 && (
                      <span className={`
                        px-1.5 py-0.5 text-xs rounded-full
                        ${activeTab === tab.id 
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' 
                          : 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
                        }
                      `}>
                        {tab.count}
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Enhanced Tab Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="min-h-[200px]"
                >
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <TechnologyStack 
                        technologies={project.technologies} 
                        variant="detailed"
                        showCategories={true}
                        interactive={true}
                      />
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        {project.challenges && project.challenges.length > 0 && (
                          <div className="space-y-3">
                            <h5 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                              Key Challenges
                            </h5>
                            <ul className="space-y-2">
                              {project.challenges.map((challenge, index) => (
                                <motion.li 
                                  key={index} 
                                  className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800"
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                >
                                  <span className="text-red-500 mt-0.5 text-xs">●</span>
                                  {challenge}
                                </motion.li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {project.outcomes && project.outcomes.length > 0 && (
                          <div className="space-y-3">
                            <h5 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              Key Outcomes
                            </h5>
                            <ul className="space-y-2">
                              {project.outcomes.map((outcome, index) => (
                                <motion.li 
                                  key={index} 
                                  className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800"
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                >
                                  <span className="text-green-500 mt-0.5 text-xs">●</span>
                                  {outcome}
                                </motion.li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
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

              {/* Enhanced Testimonial */}
              {project.testimonial && (
                <motion.div 
                  className="p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl text-blue-500 dark:text-blue-400">"</div>
                    <div className="flex-1">
                      <blockquote className="text-sm italic text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                        {project.testimonial.quote}
                      </blockquote>
                      <div className="flex items-center gap-3">
                        {project.testimonial.avatar && (
                          <Image
                            src={project.testimonial.avatar}
                            alt={project.testimonial.author}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        )}
                        <div className="text-sm">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {project.testimonial.author}
                          </div>
                          <div className="text-gray-600 dark:text-gray-400">
                            {project.testimonial.role} at {project.testimonial.company}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Actions */}
        <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExpand}
            className="flex items-center gap-2 hover:shadow-md transition-shadow"
          >
            <motion.svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </motion.svg>
            {isExpanded ? 'Show Less' : 'Learn More'}
          </Button>
          
          <div className="flex gap-2">
            {project.media.video && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(project.media.video, '_blank')}
                className="flex items-center gap-2 hover:shadow-md transition-shadow"
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
                className="flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow"
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