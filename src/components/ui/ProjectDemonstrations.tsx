'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project } from '@/lib/types';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { InteractiveCharts } from './InteractiveCharts';
import { MetricsDisplay } from './MetricsDisplay';
import { InteractiveDemo } from './InteractiveDemo';
import { Button } from './Button';

interface ProjectDemonstrationsProps {
  project: Project;
  className?: string;
}

type DemoTab = 'overview' | 'metrics' | 'charts' | 'comparison' | 'interactive';

export function ProjectDemonstrations({ 
  project, 
  className = '' 
}: ProjectDemonstrationsProps) {
  const [activeTab, setActiveTab] = useState<DemoTab>('overview');
  const [isExpanded, setIsExpanded] = useState(false);

  const tabs = [
    { id: 'overview' as DemoTab, label: 'Overview', icon: '📊' },
    { id: 'metrics' as DemoTab, label: 'Metrics', icon: '📈' },
    { id: 'charts' as DemoTab, label: 'Charts', icon: '📉' },
    { id: 'comparison' as DemoTab, label: 'Comparison', icon: '⚖️' },
    { id: 'interactive' as DemoTab, label: 'Demo', icon: '🚀' }
  ];

  const handleTabChange = (tab: DemoTab) => {
    setActiveTab(tab);
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  // Generate before/after images for demonstration
  const beforeAfterData = {
    beforeImage: project.media.gallery[0] || project.media.hero,
    afterImage: project.media.gallery[1] || project.media.hero,
    title: `${project.title} - Performance Impact`,
    description: 'See the dramatic improvements achieved through AI implementation'
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Interactive Project Demonstrations
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Explore the impact and capabilities of {project.title}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap justify-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
              ${activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50'
              }
            `}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Expand/Collapse Button */}
      <div className="text-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          <span>{isExpanded ? 'Collapse' : 'Expand'} Demonstrations</span>
          <motion.svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
        </Button>
      </div>

      {/* Content Area */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                          Project Overview
                        </h4>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Quick Metrics */}
                        <div>
                          <MetricsDisplay 
                            metrics={project.metrics.slice(0, 4)} 
                            variant="compact"
                            animated={true}
                          />
                        </div>
                        
                        {/* Key Features */}
                        <div className="space-y-4">
                          <h5 className="font-medium text-gray-900 dark:text-white">
                            Key Capabilities
                          </h5>
                          <div className="space-y-2">
                            {project.aiCapabilities?.map((capability, index) => (
                              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <div>
                                  <div className="font-medium text-sm text-gray-900 dark:text-white">
                                    {capability.type.replace('-', ' ').toUpperCase()}
                                  </div>
                                  <div className="text-xs text-gray-600 dark:text-gray-300">
                                    {capability.description}
                                  </div>
                                  {capability.accuracy && (
                                    <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                                      {capability.accuracy}% accuracy
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'metrics' && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          Performance Metrics
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          Detailed breakdown of project impact and improvements
                        </p>
                      </div>
                      
                      <MetricsDisplay 
                        metrics={project.metrics} 
                        variant="detailed"
                        animated={true}
                        showComparison={true}
                      />
                    </div>
                  )}

                  {activeTab === 'charts' && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          Performance Analytics
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          Visual representation of improvements and impact
                        </p>
                      </div>
                      
                      <div className="space-y-8">
                        {/* Bar Chart */}
                        <InteractiveCharts
                          metrics={project.metrics}
                          title="Performance Improvements"
                          variant="bar"
                          animated={true}
                          showLegend={true}
                        />
                        
                        {/* Comparison Chart */}
                        <InteractiveCharts
                          metrics={project.metrics.slice(0, 4)}
                          title="Before vs After Comparison"
                          variant="comparison"
                          animated={true}
                          showLegend={false}
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === 'comparison' && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          Before & After Comparison
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          Interactive slider to see the transformation
                        </p>
                      </div>
                      
                      <BeforeAfterSlider
                        beforeImage={beforeAfterData.beforeImage}
                        afterImage={beforeAfterData.afterImage}
                        title={beforeAfterData.title}
                        description={beforeAfterData.description}
                        beforeLabel="Before AI Implementation"
                        afterLabel="After AI Implementation"
                      />
                      
                      {/* Additional comparison metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        {project.metrics.slice(0, 3).map((metric, index) => (
                          <div key={index} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                              {metric.value}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                              {metric.label}
                            </div>
                            {metric.improvement && (
                              <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                                {metric.improvement} improvement
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'interactive' && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          Interactive Demo
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          Experience the project capabilities firsthand
                        </p>
                      </div>
                      
                      {project.interactive ? (
                        <InteractiveDemo
                          interactive={project.interactive}
                          title={project.title}
                          onLaunch={() => {
                            console.log(`Launching demo for ${project.title}`);
                          }}
                        />
                      ) : (
                        <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="text-4xl mb-4">🚧</div>
                          <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                            Demo Coming Soon
                          </h5>
                          <p className="text-gray-600 dark:text-gray-300">
                            Interactive demo is currently in development for this project.
                          </p>
                        </div>
                      )}
                      
                      {/* Project Features */}
                      {project.interactive?.features && (
                        <div className="mt-6">
                          <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                            Demo Features
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {project.interactive.features.map((feature, index) => (
                              <div key={index} className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                  {feature}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Action Buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        <Button
          variant="primary"
          size="sm"
          onClick={() => handleTabChange('interactive')}
          className="flex items-center gap-2"
        >
          <span>🚀</span>
          <span>Try Demo</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleTabChange('metrics')}
          className="flex items-center gap-2"
        >
          <span>📊</span>
          <span>View Metrics</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleTabChange('comparison')}
          className="flex items-center gap-2"
        >
          <span>⚖️</span>
          <span>See Comparison</span>
        </Button>
      </div>
    </div>
  );
}