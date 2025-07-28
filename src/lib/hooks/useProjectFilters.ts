'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Project } from '@/lib/types';
import { 
  filtersToURLParams, 
  urlParamsToFilters, 
  generateShareableURL, 
  validateFilters 
} from '@/lib/urlFilters';

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

export interface UseProjectFiltersReturn {
  filteredProjects: Project[];
  filters: FilterOptions;
  updateFilters: (newFilters: Partial<FilterOptions>) => void;
  clearFilters: () => void;
  isLoading: boolean;
  shareableUrl: string;
  generateShareableUrl: () => string;
  filterOptions: {
    categories: string[];
    technologies: string[];
    statuses: string[];
    aiCapabilities: string[];
    businessImpactTypes: string[];
  };
}

export function useProjectFilters(
  projects: Project[],
  initialFilters: Partial<FilterOptions> = {},
  enableURLSync: boolean = true
): UseProjectFiltersReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  // Extract unique values for filter options
  const filterOptions = useMemo(() => {
    const categories = ['all', ...new Set(projects.map(p => p.category))];
    const technologies = ['all', ...new Set(projects.flatMap(p => p.technologies))].sort();
    const statuses = ['all', ...new Set(projects.map(p => p.status).filter(Boolean) as string[])];
    const aiCapabilities = ['all', ...new Set(projects.flatMap(p => 
      p.aiCapabilities?.map(c => c.type) || []
    ))];
    const businessImpactTypes = ['all', 'high-roi', 'cost-savings', 'time-reduction', 'user-growth'];
    
    return { categories, technologies, statuses, aiCapabilities, businessImpactTypes };
  }, [projects]);

  // Initialize filters from URL parameters or initial filters
  const getInitialFilters = useCallback((): FilterOptions => {
    if (enableURLSync) {
      const urlFilters = urlParamsToFilters(new URLSearchParams(searchParams.toString()));
      const combinedFilters = { ...initialFilters, ...urlFilters };
      return validateFilters(combinedFilters, filterOptions);
    }
    
    return validateFilters(initialFilters, filterOptions);
  }, [searchParams, initialFilters, filterOptions, enableURLSync]);

  const [filters, setFilters] = useState<FilterOptions>(getInitialFilters);

  // Update URL when filters change with debouncing for search
  const updateURL = useCallback((newFilters: FilterOptions, immediate = false) => {
    if (!enableURLSync) return;

    const params = filtersToURLParams(newFilters);
    const queryString = params.toString();
    const newURL = queryString ? `?${queryString}` : window.location.pathname;
    
    // Enhanced URL handling with better debouncing
    if (immediate || !newFilters.search) {
      // Immediate update for non-search filters
      router.replace(newURL, { scroll: false });
    } else {
      // Debounce search URL updates to prevent excessive history entries
      const timeoutId = setTimeout(() => {
        router.replace(newURL, { scroll: false });
      }, 750); // Slightly longer debounce for better UX
      
      return () => clearTimeout(timeoutId);
    }
  }, [router, enableURLSync]);

  // Filter and sort projects based on current filters
  const filteredProjects = useMemo(() => {
    const filtered = projects.filter(project => {
      // Enhanced search with fuzzy matching and multiple terms
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase().trim();
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
        
        // Support multiple search terms (AND logic) and partial matching
        const searchTerms = searchTerm.split(' ').filter(term => term.length > 0);
        const matches = searchTerms.every(term => {
          // Exact match or partial match for longer terms
          return searchableText.includes(term) || 
                 (term.length > 3 && searchableText.includes(term.substring(0, term.length - 1)));
        });
        
        if (!matches) return false;
      }

      // Category filter
      if (filters.category !== 'all' && project.category !== filters.category) {
        return false;
      }

      // Technology filter with partial matching
      if (filters.technology !== 'all') {
        const hasExactMatch = project.technologies.includes(filters.technology);
        const hasPartialMatch = project.technologies.some(tech => 
          tech.toLowerCase().includes(filters.technology.toLowerCase()) ||
          filters.technology.toLowerCase().includes(tech.toLowerCase())
        );
        if (!hasExactMatch && !hasPartialMatch) return false;
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
        if (!hasCapability) return false;
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

    // Enhanced sorting with multiple criteria
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'date':
          const dateA = new Date(a.dateCompleted || a.dateStarted || '').getTime();
          const dateB = new Date(b.dateCompleted || b.dateStarted || '').getTime();
          comparison = dateB - dateA; // Default to newest first
          break;
        
        case 'impact':
          // Comprehensive impact scoring
          const getImpactScore = (project: Project) => {
            let score = 0;
            
            // ROI scoring (heavily weighted)
            if (project.businessImpact?.roi) {
              const roiValue = parseInt(project.businessImpact.roi.replace(/[^\d]/g, '') || '0');
              score += roiValue * 3;
            }
            
            // Cost savings scoring
            if (project.businessImpact?.costSavings) {
              const costValue = parseInt(project.businessImpact.costSavings.replace(/[^\d]/g, '') || '0');
              score += costValue / 100; // Normalize large numbers
            }
            
            // Metrics scoring with improvement weighting
            project.metrics.forEach(metric => {
              score += 20; // Base score for having metrics
              if (metric.improvement) {
                const improvementValue = parseInt(metric.improvement.replace(/[^\d]/g, '') || '0');
                score += improvementValue * 2;
              }
            });
            
            // AI capabilities scoring with accuracy bonus
            if (project.aiCapabilities) {
              project.aiCapabilities.forEach(cap => {
                score += 30; // Base AI capability score
                if (cap.accuracy) {
                  score += cap.accuracy * 1.5;
                }
              });
            }
            
            // Featured project bonus
            if (project.featured) score += 150;
            
            // Technology sophistication bonus
            const aiTechs = ['TensorFlow', 'PyTorch', 'Machine Learning', 'Computer Vision', 'NLP'];
            const aiTechCount = project.technologies.filter(tech => 
              aiTechs.some(aiTech => tech.includes(aiTech))
            ).length;
            score += aiTechCount * 25;
            
            return score;
          };
          comparison = getImpactScore(b) - getImpactScore(a);
          break;
        
        case 'technology':
          // Sort by technology count and sophistication
          const getTechScore = (project: Project) => {
            let score = project.technologies.length;
            
            // Bonus for AI/ML technologies
            const advancedTechs = ['TensorFlow', 'PyTorch', 'Machine Learning', 'Computer Vision', 'NLP', 'Deep Learning'];
            const advancedCount = project.technologies.filter(tech => 
              advancedTechs.some(advTech => tech.includes(advTech))
            ).length;
            score += advancedCount * 3;
            
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

  // Update filters with URL sync and debouncing
  const updateFilters = useCallback((newFilters: Partial<FilterOptions>) => {
    setIsLoading(true);
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    // Handle URL updates with debouncing for search
    if (newFilters.search !== undefined) {
      // Debounce search URL updates
      const cleanup = updateURL(updatedFilters, false);
      setTimeout(() => setIsLoading(false), 300);
      return cleanup;
    } else {
      // Immediate URL update for non-search filters
      updateURL(updatedFilters, true);
      setTimeout(() => setIsLoading(false), 150);
    }
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

  // Update filters when URL changes (browser back/forward)
  useEffect(() => {
    if (enableURLSync) {
      const newFilters = getInitialFilters();
      setFilters(newFilters);
    }
  }, [getInitialFilters, enableURLSync]);

  // Generate shareable URL
  const generateShareableUrl = useCallback(() => {
    return generateShareableURL(filters);
  }, [filters]);

  const shareableUrl = useMemo(() => {
    return generateShareableURL(filters);
  }, [filters]);

  return {
    filteredProjects,
    filters,
    updateFilters,
    clearFilters,
    isLoading,
    shareableUrl,
    generateShareableUrl,
    filterOptions,
  };
}