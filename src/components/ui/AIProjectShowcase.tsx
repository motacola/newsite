'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project } from '@/lib/types';
import { EnhancedProjectCard } from './EnhancedProjectCard';
import { ProjectDetailsModal } from './ProjectDetailsModal';
import { Button } from './Button';
import { Container } from './Container';

interface AIProjectShowcaseProps {
  projects: Project[];
  title?: string;
  subtitle?: string;
  showFilters?: boolean;
  maxVisible?: number;
  enableModal?: boolean;
}

type FilterType = 'all' | 'featured' | 'computer-vision' | 'nlp' | 'automation' | 'machine-learning';
type SortType = 'featured' | 'date' | 'impact' | 'accuracy';

export function AIProjectShowcase({
  projects,
  title = "AI Project Showcase",
  subtitle = "Innovative AI solutions that drive measurable business impact",
  showFilters = true,
  maxVisible = 6,
  enableModal = true
}: AIProjectShowcaseProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('featured');
  const [showAll, setShowAll] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects;

    // Apply filters
    switch (activeFilter) {
      case 'featured':
        filtered = projects.filter(p => p.featured);
        break;
      case 'computer-vision':
        filtered = projects.filter(p => 
          p.aiCapabilities?.some(cap => cap.type === 'computer-vision')
        );
        break;
      case 'nlp':
        filtered = projects.filter(p => 
          p.aiCapabilities?.some(cap => cap.type === 'nlp')
        );
        break;
      case 'automation':
        filtered = projects.filter(p => 
          p.aiCapabilities?.some(cap => cap.type === 'automation')
        );
        break;
      case 'machine-learning':
        filtered = projects.filter(p => 
          p.aiCapabilities?.some(cap => cap.type === 'machine-learning')
        );
        break;
      default:
        filtered = projects;
    }

    // Apply sorting
    switch (sortBy) {
      case 'featured':
        return filtered.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
        });
      case 'date':
        return filtered.sort((a, b) => {
          const dateA = new Date(a.dateCompleted || '').getTime();
          const dateB = new Date(b.dateCompleted || '').getTime();
          return dateB - dateA;
        });
      case 'impact':
        return filtered.sort((a, b) => {
          const impactA = a.businessImpact?.roi ? parseInt(a.businessImpact.roi) : 0;
          const impactB = b.businessImpact?.roi ? parseInt(b.businessImpact.roi) : 0;
          return impactB - impactA;
        });
      case 'accuracy':
        return filtered.sort((a, b) => {
          const accuracyA = a.aiCapabilities?.[0]?.accuracy || 0;
          const accuracyB = b.aiCapabilities?.[0]?.accuracy || 0;
          return accuracyB - accuracyA;
        });
      default:
        return filtered;
    }
  }, [projects, activeFilter, sortBy]);

  const displayedProjects = showAll 
    ? filteredAndSortedProjects 
    : filteredAndSortedProjects.slice(0, maxVisible);

  const handleProjectExpand = (project: Project) => {
    if (enableModal) {
      setSelectedProject(project);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  const filters: { id: FilterType; label: string; icon: string }[] = [
    { id: 'all', label: 'All Projects', icon: '🎯' },
    { id: 'featured', label: 'Featured', icon: '⭐' },
    { id: 'computer-vision', label: 'Computer Vision', icon: '👁️' },
    { id: 'nlp', label: 'NLP', icon: '🗣️' },
    { id: 'automation', label: 'Automation', icon: '⚙️' },
    { id: 'machine-learning', label: 'ML', icon: '🤖' }
  ];

  const sortOptions: { id: SortType; label: string }[] = [
    { id: 'featured', label: 'Featured First' },
    { id: 'date', label: 'Most Recent' },
    { id: 'impact', label: 'Highest Impact' },
    { id: 'accuracy', label: 'Best Accuracy' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
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

  // Calculate stats
  const stats = useMemo(() => {
    const totalProjects = projects.length;
    const featuredProjects = projects.filter(p => p.featured).length;
    const avgAccuracy = projects
      .flatMap(p => p.aiCapabilities || [])
      .filter(cap => cap.accuracy)
      .reduce((sum, cap, _, arr) => sum + (cap.accuracy || 0) / arr.length, 0);
    const totalTechnologies = new Set(projects.flatMap(p => p.technologies)).size;

    return {
      totalProjects,
      featuredProjects,
      avgAccuracy: Math.round(avgAccuracy),
      totalTechnologies
    };
  }, [projects]);

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20">
      <Container>
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            {title}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            {subtitle}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.totalProjects}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                AI Projects
              </div>
            </motion.div>
            
            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.avgAccuracy}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Avg Accuracy
              </div>
            </motion.div>
            
            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats.totalTechnologies}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Technologies
              </div>
            </motion.div>
            
            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {stats.featuredProjects}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Featured
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Filters and Sorting */}
        {showFilters && (
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                      ${activeFilter === filter.id
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                      }
                    `}
                  >
                    <span>{filter.icon}</span>
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* Sort Options */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-300">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortType)}
                  className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sortOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
              Showing {displayedProjects.length} of {filteredAndSortedProjects.length} projects
              {activeFilter !== 'all' && (
                <span className="ml-1 text-blue-600 dark:text-blue-400">
                  (filtered by {filters.find(f => f.id === activeFilter)?.label})
                </span>
              )}
            </div>
          </motion.div>
        )}

        {/* Projects Grid */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="popLayout">
            {displayedProjects.map((project, index) => (
              <motion.div
                key={project.id}
                variants={itemVariants}
                layout
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <EnhancedProjectCard
                  project={project}
                  variant={project.featured ? 'featured' : 'default'}
                  onExpand={handleProjectExpand}
                  priority={index < 2}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Show More/Less Button */}
        {filteredAndSortedProjects.length > maxVisible && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-2 mx-auto"
            >
              {showAll ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  Show Less
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  View All {filteredAndSortedProjects.length} Projects
                </>
              )}
            </Button>
          </motion.div>
        )}

        {/* No Results */}
        {filteredAndSortedProjects.length === 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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
              onClick={() => setActiveFilter('all')}
              className="flex items-center gap-2 mx-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Clear Filters
            </Button>
          </motion.div>
        )}

        {/* Project Details Modal */}
        {enableModal && (
          <ProjectDetailsModal
            project={selectedProject}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
          />
        )}
      </Container>
    </section>
  );
}