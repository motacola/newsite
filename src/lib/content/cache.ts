// Content caching and optimization system

import { ContentMetadata, ContentQuery, ContentCollection } from './types';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
  lastAccessed: number;
}

interface CacheStats {
  totalEntries: number;
  totalHits: number;
  totalMisses: number;
  hitRate: number;
  memoryUsage: number;
  oldestEntry: number;
  newestEntry: number;
}

export class ContentCache {
  private static instance: ContentCache;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes
  private maxEntries: number = 1000;
  private stats = {
    hits: 0,
    misses: 0
  };

  private constructor() {
    // Start cleanup interval
    setInterval(() => this.cleanup(), 60 * 1000); // Cleanup every minute
  }

  static getInstance(): ContentCache {
    if (!ContentCache.instance) {
      ContentCache.instance = new ContentCache();
    }
    return ContentCache.instance;
  }

  /**
   * Generate cache key from query parameters
   */
  private generateKey(prefix: string, params: any): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as any);
    
    return `${prefix}:${JSON.stringify(sortedParams)}`;
  }

  /**
   * Set cache entry
   */
  set<T>(key: string, data: T, ttl?: number): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxEntries) {
      this.evictOldest();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      hits: 0,
      lastAccessed: Date.now()
    };

    this.cache.set(key, entry);
  }

  /**
   * Get cache entry
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update access stats
    entry.hits++;
    entry.lastAccessed = Date.now();
    this.stats.hits++;

    return entry.data;
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // Check expiration
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Delete cache entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats.hits = 0;
    this.stats.misses = 0;
  }

  /**
   * Cache content query results
   */
  cacheQuery(query: ContentQuery, results: ContentCollection<any>, ttl?: number): void {
    const key = this.generateKey('query', query);
    this.set(key, results, ttl);
  }

  /**
   * Get cached query results
   */
  getCachedQuery(query: ContentQuery): ContentCollection<any> | null {
    const key = this.generateKey('query', query);
    return this.get(key);
  }

  /**
   * Cache individual content item
   */
  cacheContent(content: ContentMetadata, ttl?: number): void {
    const key = `content:${content.id}`;
    this.set(key, content, ttl);
  }

  /**
   * Get cached content item
   */
  getCachedContent(id: string): ContentMetadata | null {
    const key = `content:${id}`;
    return this.get(key);
  }

  /**
   * Cache search results
   */
  cacheSearch(searchTerm: string, type: string | undefined, results: any[], ttl?: number): void {
    const key = this.generateKey('search', { searchTerm, type });
    this.set(key, results, ttl);
  }

  /**
   * Get cached search results
   */
  getCachedSearch(searchTerm: string, type?: string): any[] | null {
    const key = this.generateKey('search', { searchTerm, type });
    return this.get(key);
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidatePattern(pattern: string): number {
    let invalidated = 0;
    const regex = new RegExp(pattern);
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        invalidated++;
      }
    }
    
    return invalidated;
  }

  /**
   * Invalidate cache for specific content type
   */
  invalidateContentType(type: string): number {
    return this.invalidatePattern(`query:.*"type":"${type}"`);
  }

  /**
   * Invalidate cache for specific content item
   */
  invalidateContent(id: string): void {
    // Remove the specific content
    this.delete(`content:${id}`);
    
    // Remove queries that might include this content
    this.invalidatePattern('query:.*');
    this.invalidatePattern('search:.*');
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    const totalRequests = this.stats.hits + this.stats.misses;
    
    return {
      totalEntries: this.cache.size,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
      hitRate: totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0,
      memoryUsage: this.estimateMemoryUsage(),
      oldestEntry: entries.length > 0 ? Math.min(...entries.map(e => e.timestamp)) : 0,
      newestEntry: entries.length > 0 ? Math.max(...entries.map(e => e.timestamp)) : 0
    };
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`Cache cleanup: removed ${cleaned} expired entries`);
    }
  }

  /**
   * Evict oldest entries when cache is full
   */
  private evictOldest(): void {
    const entries = Array.from(this.cache.entries());
    
    // Sort by last accessed time (oldest first)
    entries.sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);
    
    // Remove oldest 10% of entries
    const toRemove = Math.ceil(entries.length * 0.1);
    
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  /**
   * Estimate memory usage (rough calculation)
   */
  private estimateMemoryUsage(): number {
    let size = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      // Rough estimation: key size + JSON string size of data
      size += key.length * 2; // UTF-16 characters
      size += JSON.stringify(entry.data).length * 2;
      size += 64; // Overhead for entry metadata
    }
    
    return size;
  }

  /**
   * Warm up cache with frequently accessed content
   */
  async warmUp(contentGetter: () => Promise<ContentMetadata[]>): Promise<void> {
    try {
      const content = await contentGetter();
      
      // Cache featured content with longer TTL
      const featuredContent = content.filter(c => c.featured);
      featuredContent.forEach(item => {
        this.cacheContent(item, 15 * 60 * 1000); // 15 minutes
      });
      
      console.log(`Cache warmed up with ${featuredContent.length} featured items`);
    } catch (error) {
      console.error('Cache warm-up failed:', error);
    }
  }

  /**
   * Export cache data for debugging
   */
  export(): {
    entries: Array<{
      key: string;
      data: any;
      timestamp: number;
      ttl: number;
      hits: number;
      lastAccessed: number;
    }>;
    stats: CacheStats;
  } {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      ...entry
    }));
    
    return {
      entries,
      stats: this.getStats()
    };
  }
}

// Export singleton instance
export const contentCache = ContentCache.getInstance();

/**
 * Cache middleware for content operations
 */
export class CacheMiddleware {
  /**
   * Wrap content query with caching
   */
  static async withCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Try to get from cache first
    const cached = contentCache.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch data and cache it
    const data = await fetcher();
    contentCache.set(key, data, ttl);
    
    return data;
  }

  /**
   * Cache-aware content query
   */
  static async cachedQuery(
    query: ContentQuery,
    queryFn: (query: ContentQuery) => ContentCollection<any>,
    ttl?: number
  ): Promise<ContentCollection<any>> {
    // Check cache first
    const cached = contentCache.getCachedQuery(query);
    if (cached) {
      return cached;
    }

    // Execute query and cache results
    const results = queryFn(query);
    contentCache.cacheQuery(query, results, ttl);
    
    return results;
  }

  /**
   * Cache-aware search
   */
  static async cachedSearch(
    searchTerm: string,
    type: string | undefined,
    searchFn: (term: string, type?: string) => any[],
    ttl?: number
  ): Promise<any[]> {
    // Check cache first
    const cached = contentCache.getCachedSearch(searchTerm, type);
    if (cached) {
      return cached;
    }

    // Execute search and cache results
    const results = searchFn(searchTerm, type);
    contentCache.cacheSearch(searchTerm, type, results, ttl);
    
    return results;
  }
}