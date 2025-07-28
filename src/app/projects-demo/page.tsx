'use client';

import { useState } from 'react';
import { ProjectFilters } from '@/components/ui/ProjectFilters';
import { FilterOptions } from '@/lib/hooks/useProjectFilters';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { aiProjects } from '@/content/ai-projects';
import { Project } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { getFilterDescription } from '@/lib/urlFilters';

export default function ProjectsDemo() {
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(aiProjects);
  const [currentFilters, setCurrentFilters] = useState<FilterOptions>({
    search: '',
    category: 'all',
    technology: 'all',
    sortBy: 'date',
    sortOrder: 'desc',
    aiCapability: 'all',
    businessImpact: 'all',
  });

  const handleFilterChange = (projects: Project[], filters: FilterOptions) => {
    setFilteredProjects(projects);
    setCurrentFilters(filters);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            AI Projects Showcase
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Explore Christopher Belgrave's AI and machine learning projects with advanced filtering, 
            search, and sorting capabilities. Share filtered views with colleagues and clients.
          </p>
        </div>

        {/* Enhanced Filters */}
        <div className="mb-8">
          <ProjectFilters
            projects={aiProjects}
            onFilterChange={handleFilterChange}
            className="shadow-lg"
          />
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Projects
              </h2>
              <motion.div
                key={filteredProjects.length}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 
                         px-3 py-1 rounded-full text-sm font-medium"
              >
                {filteredProjects.length} result{filteredProjects.length !== 1 ? 's' : ''}
              </motion.div>
            </div>

            {/* Filter Description */}
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {getFilterDescription(currentFilters)}
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <AnimatePresence mode="wait">
          {filteredProjects.length === 0 ? (
            <motion.div
              key="no-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-16"
            >
              <div className="max-w-md mx-auto">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 20.5a7.962 7.962 0 01-5.657-2.343 7.962 7.962 0 010-11.314A7.962 7.962 0 0112 4.5a7.962 7.962 0 015.657 2.343 7.962 7.962 0 010 11.314z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No projects found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Try adjusting your filters or search terms to find more projects.
                </p>
                <button
                  onClick={() => {
                    // This would trigger the clear filters function
                    window.location.href = window.location.pathname;
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium 
                           rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 
                           focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <ProjectCard
                    project={project}
                    variant={project.featured ? 'featured' : 'default'}
                    showFullDetails={false}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Summary */}
        {filteredProjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Filter Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Total Projects:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{filteredProjects.length}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Featured:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {filteredProjects.filter(p => p.featured).length}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Technologies:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {new Set(filteredProjects.flatMap(p => p.technologies)).size}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">AI Capabilities:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {new Set(filteredProjects.flatMap(p => p.aiCapabilities?.map(c => c.type) || [])).size}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Demo Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            Demo Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
            <div>
              <h4 className="font-medium mb-2">Search & Filter:</h4>
              <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                <li>• Real-time search across all project content</li>
                <li>• Filter by category, technology, and AI capabilities</li>
                <li>• Business impact filtering (ROI, cost savings, etc.)</li>
                <li>• Featured projects toggle</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Advanced Features:</h4>
              <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                <li>• URL-based filtering for shareable links</li>
                <li>• Multiple sorting options with impact scoring</li>
                <li>• Smooth animations and loading states</li>
                <li>• Responsive design for all devices</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}