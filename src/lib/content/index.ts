// Content management system exports

// Core types
export type {
  ContentVersion,
  ContentMetadata,
  ContentValidationRule,
  ContentSchema,
  ContentQuery,
  ContentError,
  ContentValidationResult,
  ManagedProject,
  ManagedExperience,
  ManagedSkill,
  ProjectMetric,
  AICapability,
  BusinessImpact,
  TechnicalDetails,
  Award,
  Collaborator,
  Reference,
  ContentCollection,
  ContentUpdateOptions,
  ContentBackup
} from './types';

import type { ContentQuery } from './types';
import { contentManager } from './manager';

// Validation system
export { ContentValidator } from './validator';
export { contentSchemas, SchemaRegistry } from './schemas';

// Versioning system
export { ContentVersionManager, ContentUpdateTracker } from './versioning';

// Main content manager
export { ContentManager, contentManager } from './manager';

// Data loader
export { ContentDataLoader } from './dataLoader';

// Utility functions for content management
export const contentUtils = {
  /**
   * Get all projects with enhanced filtering
   */
  getProjects: (filters?: {
    featured?: boolean;
    category?: string;
    status?: string;
    limit?: number;
  }) => {
    const query: ContentQuery = {
      type: 'project',
      featured: filters?.featured,
      categories: filters?.category ? [filters.category] : undefined,
      status: filters?.status as any,
      limit: filters?.limit || 50
    };
    return contentManager.query(query);
  },

  /**
   * Get all experiences with enhanced filtering
   */
  getExperiences: (filters?: {
    featured?: boolean;
    company?: string;
    employmentType?: string;
    limit?: number;
  }) => {
    const query: ContentQuery = {
      type: 'experience',
      featured: filters?.featured,
      limit: filters?.limit || 50
    };
    
    const results = contentManager.query(query);
    
    // Additional filtering for experience-specific fields
    if (filters?.company || filters?.employmentType) {
      results.items = results.items.filter((exp: any) => {
        if (filters.company && exp.company !== filters.company) return false;
        if (filters.employmentType && exp.employmentType !== filters.employmentType) return false;
        return true;
      });
    }
    
    return results;
  },

  /**
   * Get all skills with enhanced filtering
   */
  getSkills: (filters?: {
    featured?: boolean;
    category?: string;
    proficiency?: string;
    trending?: boolean;
    limit?: number;
  }) => {
    const query: ContentQuery = {
      type: 'skill',
      featured: filters?.featured,
      limit: filters?.limit || 50
    };
    
    const results = contentManager.query(query);
    
    // Additional filtering for skill-specific fields
    if (filters?.category || filters?.proficiency || filters?.trending !== undefined) {
      results.items = results.items.filter((skill: any) => {
        if (filters.category && skill.category !== filters.category) return false;
        if (filters.proficiency && skill.proficiency !== filters.proficiency) return false;
        if (filters.trending !== undefined && skill.trending !== filters.trending) return false;
        return true;
      });
    }
    
    return results;
  },

  /**
   * Search across all content types
   */
  searchAll: (searchTerm: string, limit: number = 20) => {
    const projects = contentManager.search(searchTerm, 'project').slice(0, Math.ceil(limit / 3));
    const experiences = contentManager.search(searchTerm, 'experience').slice(0, Math.ceil(limit / 3));
    const skills = contentManager.search(searchTerm, 'skill').slice(0, Math.ceil(limit / 3));
    
    return {
      projects,
      experiences,
      skills,
      total: projects.length + experiences.length + skills.length
    };
  },

  /**
   * Get featured content across all types
   */
  getFeaturedContent: () => {
    const projects = contentManager.getFeatured('project');
    const experiences = contentManager.getFeatured('experience');
    const skills = contentManager.getFeatured('skill');
    
    return {
      projects,
      experiences,
      skills,
      total: projects.length + experiences.length + skills.length
    };
  },

  /**
   * Get content statistics
   */
  getContentStats: () => {
    const baseStats = contentManager.getStats();
    
    // Enhanced stats with content-specific metrics
    const projects = contentManager.getByType('project');
    const experiences = contentManager.getByType('experience');
    const skills = contentManager.getByType('skill');
    
    return {
      ...baseStats,
      projects: {
        total: projects.length,
        featured: projects.filter((p: any) => p.featured).length,
        byCategory: projects.reduce((acc: any, p: any) => {
          acc[p.category] = (acc[p.category] || 0) + 1;
          return acc;
        }, {}),
        completed: projects.filter((p: any) => p.projectStatus === 'completed').length
      },
      experiences: {
        total: experiences.length,
        featured: experiences.filter((e: any) => e.featured).length,
        byType: experiences.reduce((acc: any, e: any) => {
          acc[e.employmentType] = (acc[e.employmentType] || 0) + 1;
          return acc;
        }, {}),
        totalYears: experiences.reduce((total: number, exp: any) => {
          const start = new Date(exp.duration.start);
          const end = exp.duration.end === 'Present' ? new Date() : new Date(exp.duration.end);
          const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
          return total + years;
        }, 0)
      },
      skills: {
        total: skills.length,
        featured: skills.filter((s: any) => s.featured).length,
        byCategory: skills.reduce((acc: any, s: any) => {
          acc[s.category] = (acc[s.category] || 0) + 1;
          return acc;
        }, {}),
        byProficiency: skills.reduce((acc: any, s: any) => {
          acc[s.proficiency] = (acc[s.proficiency] || 0) + 1;
          return acc;
        }, {}),
        trending: skills.filter((s: any) => s.trending).length
      }
    };
  },

  /**
   * Get related content for a specific item
   */
  getRelatedContent: (contentId: string, limit: number = 5) => {
    const content = contentManager.get(contentId);
    if (!content) return { projects: [], experiences: [], skills: [] };
    
    // Find related content based on tags and categories
    const relatedProjects = contentManager.getByType('project')
      .filter((p: any) => 
        p.id !== contentId && 
        (p.tags.some((tag: string) => content.tags.includes(tag)) ||
         p.categories.some((cat: string) => content.categories.includes(cat)))
      )
      .slice(0, limit);
    
    const relatedExperiences = contentManager.getByType('experience')
      .filter((e: any) => 
        e.id !== contentId && 
        (e.tags.some((tag: string) => content.tags.includes(tag)) ||
         e.categories.some((cat: string) => content.categories.includes(cat)))
      )
      .slice(0, limit);
    
    const relatedSkills = contentManager.getByType('skill')
      .filter((s: any) => 
        s.id !== contentId && 
        (s.tags.some((tag: string) => content.tags.includes(tag)) ||
         s.categories.some((cat: string) => content.categories.includes(cat)))
      )
      .slice(0, limit);
    
    return {
      projects: relatedProjects,
      experiences: relatedExperiences,
      skills: relatedSkills
    };
  }
};

// Export convenience functions
export const {
  getProjects,
  getExperiences,
  getSkills,
  searchAll,
  getFeaturedContent,
  getContentStats,
  getRelatedContent
} = contentUtils;