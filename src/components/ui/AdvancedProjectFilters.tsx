'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
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

interface AdvancedProjectFiltersProps {
  projects: Project[];
  onFilterChange: (filteredProjects: Project[], filters: FilterOptions) => void;
  initialFilters?: Partial<FilterOptions>;
  className?: string;
  showShareButton?: boolean;
}

export function AdvancedProjectFilters({ 
  projects, 
  onFilterChange, 
  initialFilters = {},
  className = '',
  showShareButton = true
}: AdvancedProjectFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize filters from URL parameters or initial filters
  const getInitialFilters = useCallback((): FilterOptions => {
    return {
      search: searchParams.get('search') || initialFilters.search || '',
      category: searchParams.get('category') || initialFilters.category || 'all',
      technology: searchParams.get('technology') || initialFilters.technology || 'all',
      sortBy: (searchParams.get('sortBy') as FilterOptions['sortBy']) || initialFilters.sortBy || 'date',
      sortOrder: (searchParams.get('sortOrder') as FilterOptions['sortOrder']) || initialFilters.sortOrder || 'desc',
      status: searchParams.get('status') || initialFilters.status || undefined,
      featured: searchParams.get('featured') === 'true' ? true : initialFilters.featured || undefined,
      aiCapability: searchParams.get('aiCapability') || initialFilters.aiCapability || 'all',
      businessImpact: searchParams.get('businessImpact') || initialFilters.businessImpact || 'all',
    };
  }, [searchParams, initialFilters]);

  const [filters, setFilters] = useState<FilterOptions>(getInitialFilters);

  // Extract unique values for filter options
  const filterOptions = useMemo(() => {
    const categories = ['all', ...new Set(projects.map(p => p.category))];
    const technologies = ['all', ...new Set(projects.flatMap(p => p.technologies))].sort();
    const statuses = ['all', ...new Set(projects.map(p => p.status).filter(Boolean))];
    const aiCapabilities = ['all', ...new Set(projects.flatMap(p => 
      p.aiCapabilities?.map(c => c.type) || []
    ))];
    const businessImpactTypes = ['all', 'high-roi', 'cost-savings', 'time-reduction', 'user-growth'];
    
    return { categories, technologies, statuses, aiCapabilities, businessImpactTypes };
  }, [projects]);

  // Update URL when filters change
  const updateURL = useCallback((newFilters: FilterOptions, immediate = false) => {
    const params = new URLSearchParams();
    
    // Only add non-default values to URL
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.category !== 'all') params.set('category', newFilters.category);
    if (newFilters.technology !== 'all') params.set('technology', newFilters.technology);
    if (newFilters.sortBy !== 'date') params.set('sortBy', newFilters.sortBy);
    if (newFilters.sortOrder !== 'desc') params.set('sortOrder', newFilters.sortOrder);
    if (newFilters.status) params.set('status', newFilters.status);
    if (newFilters.featured === true) params.set('featured', 'true');
    if (newFilters.aiCapability && newFilters.aiCapability !== 'all') params.set('aiCapability', newFilters.aiCapability);
    if (newFilters.businessImpact && newFilters.businessImpact !== 'all') params.set('businessImpact', newFilters.businessImpact);

    const queryString = params.toString();
    const newURL = queryString ? `?${queryString}` : window.location.pathname;
    
    // Generate shareable URL
    const fullShareUrl = `${window.location.origin}${newURL}`;
    setShareUrl(fullShareUrl);
    
    // Debounce URL updates for search to avoid too many history entries
    if (immediate || !newFilters.search) {
      router.replace(newURL, { scroll: false });
    } else {
      // Debounce search URL updates
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(() => {
        router.replace(newURL, { scroll: false });
      }, 500);
    }
  }, [router]);

  // Filter and sort projects based on current filters
  const filteredProjects = useMemo(() => {
    const filtered = projects.filter(project => {
      // Search filter - enhanced with fuzzy matching
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText = [
          project.title,
          project.description,
          project.shortDescription,
          project.client,
          ...project.technologies,
          ...(project.tags || []),
          ...(project.aiCapabilities?.map(cap => cap.description) || []),
          ...(project.challenges || []),
          ...(project.outcomes || [])
        ].join(' ').toLowerCase();
        
        // Support partial word matching and multiple terms
        const searchTerms = searchTerm.split(' ').filter(term => term.length > 0);
        const matches = searchTerms.every(term => searchableText.includes(term));
        
        if (!matches) {
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

      // AI Capability filter
      if (filters.aiCapability && filters.aiCapability !== 'all') {
        const hasCapability = project.aiCapabilities?.some(cap => cap.type === filters.aiCapability);
        if (!hasCapability) {
          return false;
        }
      }

      // Business Impact filter
      if (filters.businessImpact && filters.businessImpact !== 'all') {
        const impact = project.businessImpact;
        if (!impact) return false;
        
        switch (filters.businessImpact) {
          case 'high-roi':
            const roi = parseInt(impact.roi?.replace(/[^\d]/g, '') || '0');
            if (roi < 200) return false;
            break;
          case 'cost-savings':
            if (!impact.costSavings) return false;
            break;
          case 'time-reduction':
            if (!impact.timeReduction) return false;
            break;
          case 'user-growth':
            if (!impact.userGrowth) return false;
            break;
        }
      }

      return true;
    });

    // Sort projects with enhanced sorting logic
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'date':
          const dateA = new Date(a.dateCompleted || a.dateStarted || '').getTime();
          const dateB = new Date(b.dateCompleted || b.dateStarted || '').getTime();
          comparison = dateB - dateA; // Default to newest first
          break;
        
        case 'impact':
          // Enhanced impact scoring algorithm
          const getImpactScore = (project: Project) => {
            let score = 0;
            
            // ROI score (weighted heavily)
            if (project.businessImpact?.roi) {
              score += parseInt(project.businessImpact.roi.replace(/[^\d]/g, '')) || 0;
            }
            
            // Metrics count and improvement values
            if (project.metrics.length > 0) {
              score += project.metrics.length * 10;
              
              project.metrics.forEach(metric => {
                if (metric.improvement) {
                  const improvementValue = parseInt(metric.improvement.replace(/[^\d]/g, '')) || 0;
                  score += improvementValue;
                }
              });
            }
            
            // AI capabilities bonus
            if (project.aiCapabilities) {
              score += project.aiCapabilities.length * 20;
              
              project.aiCapabilities.forEach(cap => {
                if (cap.accuracy) {
                  score += cap.accuracy;
                }
              });
            }
            
            // Featured project bonus
            if (project.featured) {
              score += 50;
            }
            
            return score;
          };
          comparison = getImpactScore(b) - getImpactScore(a);
          break;
        
        case 'technology':
          // Sort by technology count and AI sophistication
          const getTechScore = (project: Project) => {
            let score = project.technologies.length;
            
            // Bonus for AI/ML technologies
            const aiTechs = ['TensorFlow', 'PyTorch', 'Machine Learning', 'Computer Vision', 'NLP'];
            const aiTechCount = project.technologies.filter(tech => 
              aiTechs.some(aiTech => tech.includes(aiTech))
            ).length;
            score += aiTechCount * 2;
            
            return score;
          };
          comparison = getTechScore(b) - getTechScore(a);
          break;
        
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [projects, filters]);

  // Update filters and URL
  const handleFilterChange = useCallback((key: keyof FilterOptions, value: string | boolean | undefined) => {
    // Handle search with debouncing
    if (key === 'search') {
      setIsSearching(true);
      
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      searchTimeoutRef.current = setTimeout(() => {
        setIsSearching(false);
      }, 300);
    }
    
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    updateURL(newFilters, key !== 'search');
  }, [filters, updateURL]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    const defaultFilters: FilterOptions = {
      search: '',
      category: 'all',
      technology: 'all',
      sortBy: 'date',
      sortOrder: 'desc',
      status: undefined,
      featured: undefined,
      aiCapability: 'all',
      businessImpact: 'all',
    };
    
    setFilters(defaultFilters);
    updateURL(defaultFilters, true);
  }, [updateURL]);

  // Update parent component when filters change
  useEffect(() => {
    onFilterChange(filteredProjects, filters);
  }, [filteredProjects, filters, onFilterChange]);

  // Update filters when URL changes (browser back/forward)
  useEffect(() => {
    const newFilters = getInitialFilters();
    setFilters(newFilters);
  }, [getInitialFilters]);

  // Share functionality
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Christopher Belgrave - Filtered Projects',
          text: 'Check out these filtered AI projects',
          url: shareUrl,
        });
      } catch {
        // Fallback to copy to clipboard
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShowShareModal(true);
      setTimeout(() => setShowShareModal(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const hasActiveFilters = filters.search || 
    filters.category !== 'all' || 
    filters.technology !== 'all' || 
    filters.aiCapability !== 'all' ||
    filters.businessImpact !== 'all' ||
    filters.featured !== undefined;

  return (
    <motion.div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}
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
            <motion.span 
              key={filteredProjects.length}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full"
            >
              {filteredProjects.length} of {projects.length} projects
            </motion.span>
          </div>
          
          <div className="flex items-center gap-2">
            {showShareButton && hasActiveFilters && (
              <button
                onClick={handleShare}
                className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 dark:text-blue-400 
                         hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Share
              </button>
            )}
            
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
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
            placeholder="Search projects, technologies, AI capabilities, or keywords..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
          />
          <svg
            className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
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
                className="absolute right-3 top-3.5"
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
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          )}
        </div>
        
        {/* Search Results Summary */}
        <AnimatePresence>
          {filters.search && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-3 text-sm text-gray-600 dark:text-gray-400"
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
        </AnimatePresence>
        
        {/* Quick Filter Suggestions */}
        <AnimatePresence>
          {filters.search && filteredProjects.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-3 flex flex-wrap gap-2"
            >
              <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">Try:</span>
              {['AI', 'Machine Learning', 'Computer Vision', 'TensorFlow', 'React', 'Automation'].map((suggestion) => (
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
        </AnimatePresence>
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
            <div className="p-4 space-y-6">
              {/* Filter Row 1 - Basic Filters */}
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
                        {status === 'all' ? 'All Statuses' : status ? status.charAt(0).toUpperCase() + status.slice(1) : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Filter Row 2 - AI-Specific Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* AI Capability Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    AI Capability
                  </label>
                  <select
                    value={filters.aiCapability}
                    onChange={(e) => handleFilterChange('aiCapability', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {filterOptions.aiCapabilities.map(capability => (
                      <option key={capability} value={capability}>
                        {capability === 'all' ? 'All AI Capabilities' : 
                         capability.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Business Impact Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Business Impact
                  </label>
                  <select
                    value={filters.businessImpact}
                    onChange={(e) => handleFilterChange('businessImpact', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {filterOptions.businessImpactTypes.map(impact => (
                      <option key={impact} value={impact}>
                        {impact === 'all' ? 'All Impact Types' : 
                         impact.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Filter Row 3 - Sorting and Options */}
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
                    <option value="technology">Technology Sophistication</option>
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
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 pb-4"
          >
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <motion.span 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                >
                  Search: "{filters.search}"
                  <button
                    onClick={() => handleFilterChange('search', '')}
                    className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                  >
                    ×
                  </button>
                </motion.span>
              )}
              
              {filters.category !== 'all' && (
                <motion.span 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm rounded-full"
                >
                  Category: {filters.category.toUpperCase()}
                  <button
                    onClick={() => handleFilterChange('category', 'all')}
                    className="ml-1 text-green-600 dark:text-green-300 hover:text-green-800 dark:hover:text-green-100"
                  >
                    ×
                  </button>
                </motion.span>
              )}
              
              {filters.technology !== 'all' && (
                <motion.span 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-sm rounded-full"
                >
                  Tech: {filters.technology}
                  <button
                    onClick={() => handleFilterChange('technology', 'all')}
                    className="ml-1 text-purple-600 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-100"
                  >
                    ×
                  </button>
                </motion.span>
              )}

              {filters.aiCapability !== 'all' && (
                <motion.span 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200 text-sm rounded-full"
                >
                  AI: {filters.aiCapability ? filters.aiCapability.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : ''}
                  <button
                    onClick={() => handleFilterChange('aiCapability', 'all')}
                    className="ml-1 text-cyan-600 dark:text-cyan-300 hover:text-cyan-800 dark:hover:text-cyan-100"
                  >
                    ×
                  </button>
                </motion.span>
              )}

              {filters.businessImpact !== 'all' && (
                <motion.span 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-sm rounded-full"
                >
                  Impact: {filters.businessImpact ? filters.businessImpact.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : ''}
                  <button
                    onClick={() => handleFilterChange('businessImpact', 'all')}
                    className="ml-1 text-yellow-600 dark:text-yellow-300 hover:text-yellow-800 dark:hover:text-yellow-100"
                  >
                    ×
                  </button>
                </motion.span>
              )}
              
              {filters.featured === true && (
                <motion.span 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-sm rounded-full"
                >
                  Featured Only
                  <button
                    onClick={() => handleFilterChange('featured', undefined)}
                    className="ml-1 text-orange-600 dark:text-orange-300 hover:text-orange-800 dark:hover:text-orange-100"
                  >
                    ×
                  </button>
                </motion.span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share URL Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-4 right-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 
                     px-4 py-2 rounded-lg shadow-lg z-50"
          >
            URL copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Utility functions for URL handling and sharing
export const generateShareableURL = (filters: FilterOptions, baseURL?: string): string => {
  const params = new URLSearchParams();
  
  if (filters.search) params.set('search', filters.search);
  if (filters.category !== 'all') params.set('category', filters.category);
  if (filters.technology !== 'all') params.set('technology', filters.technology);
  if (filters.sortBy !== 'date') params.set('sortBy', filters.sortBy);
  if (filters.sortOrder !== 'desc') params.set('sortOrder', filters.sortOrder);
  if (filters.status) params.set('status', filters.status);
  if (filters.featured === true) params.set('featured', 'true');
  if (filters.aiCapability && filters.aiCapability !== 'all') params.set('aiCapability', filters.aiCapability);
  if (filters.businessImpact && filters.businessImpact !== 'all') params.set('businessImpact', filters.businessImpact);

  const queryString = params.toString();
  const base = baseURL || (typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '');
  
  return queryString ? `${base}?${queryString}` : base;
};

export const parseFiltersFromURL = (searchParams: URLSearchParams): Partial<FilterOptions> => {
  return {
    search: searchParams.get('search') || undefined,
    category: searchParams.get('category') || undefined,
    technology: searchParams.get('technology') || undefined,
    sortBy: (searchParams.get('sortBy') as FilterOptions['sortBy']) || undefined,
    sortOrder: (searchParams.get('sortOrder') as FilterOptions['sortOrder']) || undefined,
    status: searchParams.get('status') || undefined,
    featured: searchParams.get('featured') === 'true' ? true : undefined,
    aiCapability: searchParams.get('aiCapability') || undefined,
    businessImpact: searchParams.get('businessImpact') || undefined,
  };
};