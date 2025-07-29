// Main content management system

import { 
  ContentMetadata, 
  ContentQuery, 
  ContentCollection, 
  ContentUpdateOptions,
  ContentValidationResult,
  ManagedProject,
  ManagedExperience,
  ManagedSkill
} from './types';
import { ContentValidator } from './validator';
import { ContentVersionManager, ContentUpdateTracker } from './versioning';
import { generateId, generateSlug } from '../utils';

export class ContentManager {
  private static instance: ContentManager;
  private content: Map<string, ContentMetadata> = new Map();
  private contentByType: Map<string, Set<string>> = new Map();
  private contentByStatus: Map<string, Set<string>> = new Map();
  private contentByTags: Map<string, Set<string>> = new Map();

  private constructor() {}

  static getInstance(): ContentManager {
    if (!ContentManager.instance) {
      ContentManager.instance = new ContentManager();
    }
    return ContentManager.instance;
  }

  /**
   * Create new content item
   */
  async create<T extends ContentMetadata>(
    data: Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'version'> & { id?: string },
    author: string = 'system'
  ): Promise<{ success: boolean; data?: T; errors?: string[] }> {
    try {
      // Generate ID and slug if not provided
      const id = data.id || generateId();
      const slug = (data as any).slug || generateSlug((data as any).title);
      
      // Create full content object
      const now = new Date().toISOString();
      const version = ContentVersionManager.createVersion(id, author, ['Initial creation'], data);
      
      const content: T = {
        ...data,
        id,
        slug,
        createdAt: now,
        updatedAt: now,
        version
      } as T;

      // Validate content
      const validation = ContentValidator.validate(content, data.type);
      if (!validation.isValid) {
        return {
          success: false,
          errors: ContentValidator.formatErrors(validation.errors)
        };
      }

      // Store content
      this.content.set(id, content);
      this.updateIndices(content);

      // Create initial backup
      ContentVersionManager.createBackup(id, data.type, content, version, 'auto');

      return { success: true, data: content };
    } catch (error) {
      return {
        success: false,
        errors: [`Failed to create content: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Update existing content item
   */
  async update<T extends ContentMetadata>(
    id: string,
    updates: Partial<T>,
    author: string = 'system',
    options: ContentUpdateOptions = {}
  ): Promise<{ success: boolean; data?: T; errors?: string[] }> {
    try {
      const existing = this.content.get(id) as T;
      if (!existing) {
        return {
          success: false,
          errors: [`Content with ID ${id} not found`]
        };
      }

      // Create backup before update if requested
      if (options.createBackup !== false) {
        ContentVersionManager.createBackup(
          id, 
          existing.type, 
          existing, 
          existing.version, 
          'pre-update'
        );
      }

      // Merge updates
      const updated: T = {
        ...existing,
        ...updates,
        id, // Ensure ID doesn't change
        updatedAt: new Date().toISOString()
      };

      // Validate if requested
      if (options.validateBeforeUpdate !== false) {
        const validation = ContentValidator.validate(updated, existing.type);
        if (!validation.isValid) {
          return {
            success: false,
            errors: ContentValidator.formatErrors(validation.errors)
          };
        }
      }

      // Track field changes
      Object.keys(updates).forEach(field => {
        if (existing[field as keyof T] !== updates[field as keyof T]) {
          ContentUpdateTracker.trackUpdate(
            id,
            field,
            existing[field as keyof T],
            updates[field as keyof T],
            author
          );
        }
      });

      // Create new version if content changed
      if (options.updateVersion !== false && ContentVersionManager.hasContentChanged(id, updated)) {
        const changes = Object.keys(updates).map(field => `Modified ${field}`);
        updated.version = ContentVersionManager.createVersion(id, author, changes, updated);
      }

      // Update content
      this.content.set(id, updated);
      this.updateIndices(updated);

      return { success: true, data: updated };
    } catch (error) {
      return {
        success: false,
        errors: [`Failed to update content: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Delete content item
   */
  async delete(id: string, author: string = 'system'): Promise<{ success: boolean; errors?: string[] }> {
    try {
      const content = this.content.get(id);
      if (!content) {
        return {
          success: false,
          errors: [`Content with ID ${id} not found`]
        };
      }

      // Create final backup
      ContentVersionManager.createBackup(id, content.type, content, content.version, 'manual');

      // Remove from indices
      this.removeFromIndices(content);

      // Remove content
      this.content.delete(id);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        errors: [`Failed to delete content: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Get content by ID
   */
  get<T extends ContentMetadata>(id: string): T | null {
    return (this.content.get(id) as T) || null;
  }

  /**
   * Query content with filters
   */
  query<T extends ContentMetadata>(query: ContentQuery): ContentCollection<T> {
    let results = Array.from(this.content.values()) as T[];

    // Filter by type
    if (query.type) {
      results = results.filter(item => item.type === query.type);
    }

    // Filter by status
    if (query.status) {
      results = results.filter(item => item.status === query.status);
    }

    // Filter by featured
    if (query.featured !== undefined) {
      results = results.filter(item => item.featured === query.featured);
    }

    // Filter by tags
    if (query.tags && query.tags.length > 0) {
      results = results.filter(item => 
        query.tags!.some(tag => item.tags.includes(tag))
      );
    }

    // Filter by categories
    if (query.categories && query.categories.length > 0) {
      results = results.filter(item => 
        query.categories!.some(category => item.categories.includes(category))
      );
    }

    // Search filter
    if (query.search) {
      const searchTerm = query.search.toLowerCase();
      results = results.filter(item => 
        item.title.toLowerCase().includes(searchTerm) ||
        (item as any).description?.toLowerCase().includes(searchTerm) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Date range filter
    if (query.dateRange) {
      const startDate = new Date(query.dateRange.start);
      const endDate = new Date(query.dateRange.end);
      
      results = results.filter(item => {
        const itemDate = new Date(item.createdAt);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }

    // Sort results
    if (query.sort) {
      results.sort((a, b) => {
        const aValue = (a as any)[query.sort!.field];
        const bValue = (b as any)[query.sort!.field];
        
        let comparison = 0;
        if (aValue < bValue) comparison = -1;
        if (aValue > bValue) comparison = 1;
        
        return query.sort!.direction === 'desc' ? -comparison : comparison;
      });
    } else {
      // Default sort by updatedAt desc
      results.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    }

    // Pagination
    const offset = query.offset || 0;
    const limit = query.limit || 50;
    const total = results.length;
    const paginatedResults = results.slice(offset, offset + limit);

    return {
      items: paginatedResults,
      total,
      page: Math.floor(offset / limit) + 1,
      limit,
      hasMore: offset + limit < total,
      filters: {
        type: query.type,
        status: query.status,
        featured: query.featured,
        tags: query.tags,
        categories: query.categories,
        search: query.search
      },
      sort: query.sort
    };
  }

  /**
   * Get all content of a specific type
   */
  getByType<T extends ContentMetadata>(type: string): T[] {
    const typeIds = this.contentByType.get(type) || new Set();
    return Array.from(typeIds)
      .map(id => this.content.get(id) as T)
      .filter(Boolean);
  }

  /**
   * Get featured content
   */
  getFeatured<T extends ContentMetadata>(type?: string): T[] {
    let results = Array.from(this.content.values()) as T[];
    
    if (type) {
      results = results.filter(item => item.type === type);
    }
    
    return results.filter(item => item.featured);
  }

  /**
   * Search content
   */
  search<T extends ContentMetadata>(searchTerm: string, type?: string): T[] {
    const query: ContentQuery = {
      search: searchTerm,
      type,
      limit: 100
    };
    
    return this.query<T>(query).items;
  }

  /**
   * Get content statistics
   */
  getStats(): {
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    featured: number;
    recentlyUpdated: number;
  } {
    const all = Array.from(this.content.values());
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};

    all.forEach(item => {
      byType[item.type] = (byType[item.type] || 0) + 1;
      byStatus[item.status] = (byStatus[item.status] || 0) + 1;
    });

    return {
      total: all.length,
      byType,
      byStatus,
      featured: all.filter(item => item.featured).length,
      recentlyUpdated: all.filter(item => 
        new Date(item.updatedAt) > oneWeekAgo
      ).length
    };
  }

  /**
   * Bulk import content
   */
  async bulkImport<T extends ContentMetadata>(
    items: Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'version'>[],
    author: string = 'system'
  ): Promise<{
    success: boolean;
    imported: number;
    failed: number;
    errors: string[];
  }> {
    let imported = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const item of items) {
      const result = await this.create(item, author);
      if (result.success) {
        imported++;
      } else {
        failed++;
        errors.push(...(result.errors || []));
      }
    }

    return {
      success: failed === 0,
      imported,
      failed,
      errors
    };
  }

  /**
   * Export content
   */
  export(type?: string): {
    content: ContentMetadata[];
    exportedAt: string;
    total: number;
  } {
    let content = Array.from(this.content.values());
    
    if (type) {
      content = content.filter(item => item.type === type);
    }

    return {
      content,
      exportedAt: new Date().toISOString(),
      total: content.length
    };
  }

  /**
   * Update content indices
   */
  private updateIndices(content: ContentMetadata): void {
    // Update type index
    const typeSet = this.contentByType.get(content.type) || new Set();
    typeSet.add(content.id);
    this.contentByType.set(content.type, typeSet);

    // Update status index
    const statusSet = this.contentByStatus.get(content.status) || new Set();
    statusSet.add(content.id);
    this.contentByStatus.set(content.status, statusSet);

    // Update tag indices
    content.tags.forEach(tag => {
      const tagSet = this.contentByTags.get(tag) || new Set();
      tagSet.add(content.id);
      this.contentByTags.set(tag, tagSet);
    });
  }

  /**
   * Remove content from indices
   */
  private removeFromIndices(content: ContentMetadata): void {
    // Remove from type index
    const typeSet = this.contentByType.get(content.type);
    if (typeSet) {
      typeSet.delete(content.id);
      if (typeSet.size === 0) {
        this.contentByType.delete(content.type);
      }
    }

    // Remove from status index
    const statusSet = this.contentByStatus.get(content.status);
    if (statusSet) {
      statusSet.delete(content.id);
      if (statusSet.size === 0) {
        this.contentByStatus.delete(content.status);
      }
    }

    // Remove from tag indices
    content.tags.forEach(tag => {
      const tagSet = this.contentByTags.get(tag);
      if (tagSet) {
        tagSet.delete(content.id);
        if (tagSet.size === 0) {
          this.contentByTags.delete(tag);
        }
      }
    });
  }

  /**
   * Clear all content (for testing)
   */
  clear(): void {
    this.content.clear();
    this.contentByType.clear();
    this.contentByStatus.clear();
    this.contentByTags.clear();
  }
}

// Export singleton instance
export const contentManager = ContentManager.getInstance();