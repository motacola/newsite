/**
 * URL-based filtering utilities for shareable project filters
 */

import { FilterOptions } from '@/lib/hooks/useProjectFilters';

export interface URLFilterParams {
  search?: string;
  category?: string;
  technology?: string;
  sortBy?: 'date' | 'impact' | 'technology' | 'title';
  sortOrder?: 'asc' | 'desc';
  status?: string;
  featured?: boolean;
  aiCapability?: string;
  businessImpact?: string;
}

/**
 * Convert filter options to URL search parameters
 */
export function filtersToURLParams(filters: FilterOptions): URLSearchParams {
  const params = new URLSearchParams();
  
  // Only add non-default values to keep URLs clean
  if (filters.search && filters.search.trim()) {
    params.set('search', filters.search.trim());
  }
  
  if (filters.category && filters.category !== 'all') {
    params.set('category', filters.category);
  }
  
  if (filters.technology && filters.technology !== 'all') {
    params.set('technology', filters.technology);
  }
  
  if (filters.sortBy && filters.sortBy !== 'date') {
    params.set('sortBy', filters.sortBy);
  }
  
  if (filters.sortOrder && filters.sortOrder !== 'desc') {
    params.set('sortOrder', filters.sortOrder);
  }
  
  if (filters.status) {
    params.set('status', filters.status);
  }
  
  if (filters.featured === true) {
    params.set('featured', 'true');
  }
  
  if (filters.aiCapability && filters.aiCapability !== 'all') {
    params.set('aiCapability', filters.aiCapability);
  }
  
  if (filters.businessImpact && filters.businessImpact !== 'all') {
    params.set('businessImpact', filters.businessImpact);
  }
  
  return params;
}

/**
 * Parse URL search parameters to filter options
 */
export function urlParamsToFilters(searchParams: URLSearchParams): Partial<FilterOptions> {
  const filters: Partial<FilterOptions> = {};
  
  const search = searchParams.get('search');
  if (search) filters.search = search;
  
  const category = searchParams.get('category');
  if (category) filters.category = category;
  
  const technology = searchParams.get('technology');
  if (technology) filters.technology = technology;
  
  const sortBy = searchParams.get('sortBy') as FilterOptions['sortBy'];
  if (sortBy && ['date', 'impact', 'technology', 'title'].includes(sortBy)) {
    filters.sortBy = sortBy;
  }
  
  const sortOrder = searchParams.get('sortOrder') as FilterOptions['sortOrder'];
  if (sortOrder && ['asc', 'desc'].includes(sortOrder)) {
    filters.sortOrder = sortOrder;
  }
  
  const status = searchParams.get('status');
  if (status) filters.status = status;
  
  const featured = searchParams.get('featured');
  if (featured === 'true') filters.featured = true;
  
  const aiCapability = searchParams.get('aiCapability');
  if (aiCapability) filters.aiCapability = aiCapability;
  
  const businessImpact = searchParams.get('businessImpact');
  if (businessImpact) filters.businessImpact = businessImpact;
  
  return filters;
}

/**
 * Generate a shareable URL with current filters
 */
export function generateShareableURL(
  filters: FilterOptions, 
  baseURL?: string
): string {
  const params = filtersToURLParams(filters);
  const queryString = params.toString();
  
  const base = baseURL || (typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}` 
    : '');
  
  return queryString ? `${base}?${queryString}` : base;
}

/**
 * Create a human-readable description of active filters
 */
export function getFilterDescription(filters: FilterOptions): string {
  const descriptions: string[] = [];
  
  if (filters.search) {
    descriptions.push(`searching for "${filters.search}"`);
  }
  
  if (filters.category && filters.category !== 'all') {
    descriptions.push(`in ${filters.category.toUpperCase()} category`);
  }
  
  if (filters.technology && filters.technology !== 'all') {
    descriptions.push(`using ${filters.technology}`);
  }
  
  if (filters.aiCapability && filters.aiCapability !== 'all') {
    const capability = filters.aiCapability.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    descriptions.push(`with ${capability} capabilities`);
  }
  
  if (filters.businessImpact && filters.businessImpact !== 'all') {
    const impact = filters.businessImpact.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    descriptions.push(`showing ${impact}`);
  }
  
  if (filters.featured === true) {
    descriptions.push('featured projects only');
  }
  
  if (filters.status) {
    descriptions.push(`with ${filters.status} status`);
  }
  
  const sortDescription = `sorted by ${filters.sortBy} (${
    filters.sortOrder === 'desc' ? 'newest first' : 'oldest first'
  })`;
  descriptions.push(sortDescription);
  
  if (descriptions.length === 1) {
    return descriptions[0];
  } else if (descriptions.length === 2) {
    return descriptions.join(' and ');
  } else {
    const last = descriptions.pop();
    return descriptions.join(', ') + ', and ' + last;
  }
}

/**
 * Validate filter values against available options
 */
export function validateFilters(
  filters: Partial<FilterOptions>,
  availableOptions: {
    categories: string[];
    technologies: string[];
    statuses: string[];
    aiCapabilities: string[];
    businessImpactTypes: string[];
  }
): FilterOptions {
  const defaultFilters: FilterOptions = {
    search: '',
    category: 'all',
    technology: 'all',
    sortBy: 'date',
    sortOrder: 'desc',
    aiCapability: 'all',
    businessImpact: 'all',
  };
  
  return {
    search: filters.search || defaultFilters.search,
    category: availableOptions.categories.includes(filters.category || '') 
      ? filters.category! 
      : defaultFilters.category,
    technology: availableOptions.technologies.includes(filters.technology || '') 
      ? filters.technology! 
      : defaultFilters.technology,
    sortBy: filters.sortBy || defaultFilters.sortBy,
    sortOrder: filters.sortOrder || defaultFilters.sortOrder,
    status: availableOptions.statuses.includes(filters.status || '') 
      ? filters.status 
      : undefined,
    featured: filters.featured,
    aiCapability: availableOptions.aiCapabilities.includes(filters.aiCapability || '') 
      ? filters.aiCapability! 
      : defaultFilters.aiCapability,
    businessImpact: availableOptions.businessImpactTypes.includes(filters.businessImpact || '') 
      ? filters.businessImpact! 
      : defaultFilters.businessImpact,
  };
}

/**
 * Create filter presets for common use cases
 */
export const filterPresets = {
  featured: {
    search: '',
    category: 'all',
    technology: 'all',
    sortBy: 'impact' as const,
    sortOrder: 'desc' as const,
    featured: true,
    aiCapability: 'all',
    businessImpact: 'all',
  },
  
  aiProjects: {
    search: '',
    category: 'ai',
    technology: 'all',
    sortBy: 'date' as const,
    sortOrder: 'desc' as const,
    aiCapability: 'all',
    businessImpact: 'all',
  },
  
  highImpact: {
    search: '',
    category: 'all',
    technology: 'all',
    sortBy: 'impact' as const,
    sortOrder: 'desc' as const,
    aiCapability: 'all',
    businessImpact: 'high-roi',
  },
  
  machineLearning: {
    search: '',
    category: 'all',
    technology: 'all',
    sortBy: 'date' as const,
    sortOrder: 'desc' as const,
    aiCapability: 'machine-learning',
    businessImpact: 'all',
  },
  
  computerVision: {
    search: '',
    category: 'all',
    technology: 'all',
    sortBy: 'impact' as const,
    sortOrder: 'desc' as const,
    aiCapability: 'computer-vision',
    businessImpact: 'all',
  },
} as const;

/**
 * Get preset filter configurations
 */
export function getFilterPreset(presetName: keyof typeof filterPresets): FilterOptions {
  return { ...filterPresets[presetName] };
}

/**
 * Check if current filters match a preset
 */
export function matchesPreset(filters: FilterOptions, presetName: keyof typeof filterPresets): boolean {
  const preset = filterPresets[presetName];
  
  return Object.keys(preset).every(key => {
    const filterKey = key as keyof FilterOptions;
    // Handle the case where a property might not exist in the preset
    if (!(filterKey in preset)) return true;
    return filters[filterKey] === preset[filterKey as keyof typeof preset];
  });
}