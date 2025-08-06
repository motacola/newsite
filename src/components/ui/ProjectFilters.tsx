'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project } from '@/lib/types';

export interface FilterOptions {
  search: string;
  category: string;
  technology: string;
  sortBy: 'date' | 'impact' | 'technology' | 'title';
  sortOrder: 'asc' | 'desc';
  status?: string;
  featured?: boolean;
  aiCapability?: string;
  businessImpact?: string;
}

interface ProjectFiltersProps {
  projects: Project[];
  onFilterChange: (filters: Partial<FilterOptions>) => void;
  initialFilters?: Partial<FilterOptions>;
  className?: string;
}

export function ProjectFilters({ 
  projects, 
  onFilterChange, 
  initialFilters = {},
  className = '' 
}: ProjectFiltersProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    category: 'all',
    technology: 'all',
    sortBy: 'date',
    sortOrder: 'desc',
    ...initialFilters
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Extract unique values for filter options
  const filterOptions = useMemo(() => {
    const categories = ['all', ...new Set(projects.map(p => p.category))];
    const technologies = ['all', ...new Set(projects.flatMap(p => p.technologies))].sort();
    const statuses = ['all', ...new Set(projects.map(p => p.status).filter(Boolean))];
    
    return { categories, technologies, statuses };
  }, [projects]);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    const filtered = projects.filter(project => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText = [
          project.title,
          project.description,
          project.shortDescription,
          project.client,
          ...project.technologies,
          ...(project.tags || [])
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      // Category filter
      if (filters.category !== 'all' && project.category !== filters.category) {
        return false;
      }

      // Technology filter
      if (filters.technology !== 'all' && !project.technologies.includes(filters.technology)) {
        return false;
      }

      // Status filter
      if (filters.status && filters.status !== 'all' && project.status !== filters.status) {
        return false;
      }

      // Featured filter
      if (filters.featured !== undefined && project.featured !== filters.featured) {
        return false;
      }

      return true;
    });

    // Sort projects
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'date':
          const dateA = new Date(a.dateCompleted || a.dateStarted || '').getTime();
          const dateB = new Date(b.dateCompleted || b.dateStarted || '').getTime();
          comparison = dateB - dateA; // Default to newest first
          break;
        
        case 'impact':
          // Sort by business impact metrics (ROI, cost savings, etc.)
          const getImpactScore = (project: Project) => {
            let score = 0;
            if (project.businessImpact?.roi) {
              score += parseInt(project.businessImpact.roi.replace(/[^\d]/g, '')) || 0;
            }
            if (project.metrics.length > 0) {
              score += project.metrics.length * 10;
            }
            return score;
          };
          comparison = getImpactScore(b) - getImpactScore(a);
          break;
        
        case 'technology':
          comparison = b.technologies.length - a.technologies.length;
          break;
        
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [projects, filters]);

  // Update parent component when filters change
  useEffect(() => {
    onFilterChange(filteredProjects, filters);
  }, [filteredProjects, filters, onFilterChange]);

  const handleFilterChange = (key: keyof FilterOptions, value: string | boolean | undefined) => {
    // Handle search with debouncing
    if (key === 'search') {
      setIsSearching(true);
      
      // Clear existing timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      // Set new timeout for search
      searchTimeoutRef.current = setTimeout(() => {
        setIsSearching(false);
      }, 300);
    }
    
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      technology: 'all',
      sortBy: 'date',
      sortOrder: 'desc'
    });
  };

  const hasActiveFilters = filters.search || 
    filters.category !== 'all' || 
    filters.technology !== 'all' || 
    filters.featured !== undefined;

  return (
    <motion.div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Filter Projects
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredProjects.length} of {projects.length} projects
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <svg 
                className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar - Always Visible */}
      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search projects, technologies, or keywords..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
          />
          <svg
            className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          
          {/* Search Loading Indicator */}
          <AnimatePresence>
            {isSearching && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-3 top-2.5"
              >
                <svg className="animate-spin w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Clear Search Button */}
          {filters.search && !isSearching && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => handleFilterChange('search', '')}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          )}
        </div>
        
        {/* Search Results Summary */}
        {filters.search && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-gray-600 dark:text-gray-400"
          >
            {filteredProjects.length === 0 ? (
              <span className="text-red-600 dark:text-red-400">
                No results found for "{filters.search}"
              </span>
            ) : (
              <span>
                Found {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} matching "{filters.search}"
              </span>
            )}
          </motion.div>
        )}
        
        {/* Quick Filter Suggestions */}
        {filters.search && filteredProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex flex-wrap gap-2"
          >
            <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">Try:</span>
            {['AI', 'Machine Learning', 'Computer Vision', 'TensorFlow', 'React'].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleFilterChange('search', suggestion)}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 
                         rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="border-t border-gray-200 dark:border-gray-700"
          >
            <div className="p-4 space-y-4">
              {/* Filter Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {filterOptions.categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Technology Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Technology
                  </label>
                  <select
                    value={filters.technology}
                    onChange={(e) => handleFilterChange('technology', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {filterOptions.technologies.map(tech => (
                      <option key={tech} value={tech}>
                        {tech === 'all' ? 'All Technologies' : tech}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status || 'all'}
                    onChange={(e) => handleFilterChange('status', e.target.value === 'all' ? undefined : e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {filterOptions.statuses.map(status => (
                      <option key={status} value={status}>
                        {status === 'all' ? 'All Statuses' : status ? status.charAt(0).toUpperCase() + status.slice(1) : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Filter Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="date">Date</option>
                    <option value="impact">Business Impact</option>
                    <option value="technology">Technology Count</option>
                    <option value="title">Title</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Order
                  </label>
                  <select
                    value={filters.sortOrder}
                    onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>

                {/* Featured Toggle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Featured Only
                  </label>
                  <div className="flex items-center h-10">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.featured === true}
                        onChange={(e) => handleFilterChange('featured', e.target.checked ? true : undefined)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                        Show featured projects only
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-4 pb-4"
        >
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full">
                Search: "{filters.search}"
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                >
                  ×
                </button>
              </span>
            )}
            
            {filters.category !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm rounded-full">
                Category: {filters.category.toUpperCase()}
                <button
                  onClick={() => handleFilterChange('category', 'all')}
                  className="ml-1 text-green-600 dark:text-green-300 hover:text-green-800 dark:hover:text-green-100"
                >
                  ×
                </button>
              </span>
            )}
            
            {filters.technology !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-sm rounded-full">
                Tech: {filters.technology}
                <button
                  onClick={() => handleFilterChange('technology', 'all')}
                  className="ml-1 text-purple-600 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-100"
                >
                  ×
                </button>
              </span>
            )}
            
            {filters.featured === true && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-sm rounded-full">
                Featured Only
                <button
                  onClick={() => handleFilterChange('featured', undefined)}
                  className="ml-1 text-orange-600 dark:text-orange-300 hover:text-orange-800 dark:hover:text-orange-100"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}