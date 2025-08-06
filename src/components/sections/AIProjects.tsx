'use client';

import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';
import { Project } from '@/lib/types';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { ProjectDemonstrations } from '@/components/ui/ProjectDemonstrations';
import { ProjectFilters, FilterOptions } from '@/components/ui/ProjectFilters';
import { useProjectFilters } from '@/lib/hooks/useProjectFilters';
import { generateShareableURL } from '@/lib/urlFilters';

interface AIProjectsProps {
  projects: Project[];
  title?: string;
  subtitle?: string;
  showAll?: boolean;
  enableFiltering?: boolean;
}

export function AIProjects({ 
  projects, 
  title = "Featured Work",
  subtitle = "Cutting-edge digital experiences that push creative boundaries",
  showAll = false,
  enableFiltering = true
}: AIProjectsProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAllProjects, setShowAllProjects] = useState(showAll);
  
  // Use the filtering hook
  const { 
    filteredProjects, 
    filters, 
    updateFilters, 
    clearFilters, 
    isLoading 
  } = useProjectFilters(projects);

  // Determine which projects to display
  const activeProjects = filteredProjects;
  const displayedProjects = showAllProjects 
    ? activeProjects 
    : activeProjects.slice(0, 3);

  const handleProjectExpand = (project: Project) => {
    setSelectedProject(project);
  };

  // Share functionality
  const handleShare = useCallback(() => {
    if (enableFiltering) {
      const shareURL = generateShareableURL(filters);
      navigator.clipboard.writeText(shareURL).then(() => {
        // Could add a toast notification here
        console.log('Filter URL copied to clipboard');
      });
    }
  }, [enableFiltering, filters]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 25
      }
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-orange-50/30 to-purple-50/30 dark:bg-gray-900">
      <Container>
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 creative-text-gradient">
            {title}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </motion.div>

        {/* Project Filters */}
        {enableFiltering && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <ProjectFilters
              projects={projects}
              onFilterChange={updateFilters}
              initialFilters={filters}
              className="mb-6"
            />
          </motion.div>
        )}

        {/* Controls */}
        <motion.div
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Showing {displayedProjects.length} of {activeProjects.length} projects
              {enableFiltering && activeProjects.length !== projects.length && (
                <span className="text-blue-600 dark:text-blue-400 ml-1">
                  (filtered from {projects.length})
                </span>
              )}
            </span>
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Filtering...
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Share Button */}
            {enableFiltering && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Share Filters
              </Button>
            )}
            
            {/* View Mode Toggle */}
            <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`
                  px-3 py-1 text-sm rounded transition-colors
                  ${viewMode === 'grid' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span className="ml-1 hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`
                  px-3 py-1 text-sm rounded transition-colors
                  ${viewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <span className="ml-1 hidden sm:inline">List</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Projects Grid/List */}
        <motion.div
          className={`
            ${viewMode === 'grid' 
              ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8' 
              : 'space-y-8'
            }
          `}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {displayedProjects.map((project) => (
            <motion.div
              key={project.id}
              variants={itemVariants}
              className={viewMode === 'list' ? 'max-w-none' : ''}
            >
              <ProjectCard
                project={project}
                variant={project.featured ? 'featured' : 'default'}
                onExpand={handleProjectExpand}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Show More/Less Button */}
        {activeProjects.length > 3 && (
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowAllProjects(!showAllProjects)}
            >
              {showAllProjects 
                ? `Show Less Projects` 
                : `View All ${activeProjects.length} Projects`
              }
            </Button>
          </motion.div>
        )}

        {/* No Results Message */}
        {enableFiltering && activeProjects.length === 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No projects found
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Try adjusting your filters to see more results
            </p>
            <Button
              variant="outline"
              onClick={clearFilters}
              className="flex items-center gap-2 mx-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Clear All Filters
            </Button>
          </motion.div>
        )}

        {/* Interactive Project Demonstrations */}
        {selectedProject && (
          <motion.div
            className="mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ProjectDemonstrations 
              project={selectedProject}
              className="mb-8"
            />
            
            {/* Close Button */}
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => setSelectedProject(null)}
                className="flex items-center gap-2 mx-auto"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Close Demonstrations
              </Button>
            </div>
          </motion.div>
        )}

        {/* Featured Project Showcase */}
        {!selectedProject && projects.filter(p => p.featured).length > 0 && (
          <motion.div
            className="mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Featured Project Spotlight
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Click on any project above to explore interactive demonstrations
              </p>
            </div>
            
            <ProjectDemonstrations 
              project={projects.filter(p => p.featured)[0]}
              className="mb-8"
            />
          </motion.div>
        )}

        {/* Stats Summary */}
        <motion.div
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {projects.length}
            </div>
            <div className="text-gray-600 dark:text-gray-300">
              AI Projects Completed
            </div>
          </div>
          
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {projects.reduce((acc, p) => acc + p.technologies.length, 0)}
            </div>
            <div className="text-gray-600 dark:text-gray-300">
              Technologies Utilized
            </div>
          </div>
          
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {projects.filter(p => p.featured).length}
            </div>
            <div className="text-gray-600 dark:text-gray-300">
              Featured Projects
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}