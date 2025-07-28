// API route for content search functionality

import { NextRequest, NextResponse } from 'next/server';
import { contentManager, ContentDataLoader, contentUtils } from '@/lib/content';

// Initialize content on first request
let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    await ContentDataLoader.initialize();
    initialized = true;
  }
}

/**
 * GET /api/content/search - Search content across all types
 */
export async function GET(request: NextRequest) {
  try {
    await ensureInitialized();
    
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20;
    const includeRelated = searchParams.get('includeRelated') === 'true';
    
    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Search query is required' },
        { status: 400 }
      );
    }

    let results;
    
    if (type) {
      // Search specific content type
      results = {
        items: contentManager.search(query, type).slice(0, limit),
        type,
        total: contentManager.search(query, type).length
      };
    } else {
      // Search across all content types
      results = contentUtils.searchAll(query, limit);
    }

    // Add related content if requested
    if (includeRelated && results.items && results.items.length > 0) {
      const firstResult = Array.isArray(results.items) ? results.items[0] : 
                         results.projects?.[0] || results.experiences?.[0] || results.skills?.[0];
      
      if (firstResult) {
        const related = contentUtils.getRelatedContent(firstResult.id, 3);
        (results as any).related = related;
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
      query,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Search failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/content/search - Advanced search with complex filters
 */
export async function POST(request: NextRequest) {
  try {
    await ensureInitialized();
    
    const body = await request.json();
    const {
      query: searchQuery,
      filters = {},
      sort = {},
      pagination = { limit: 20, offset: 0 },
      includeStats = false
    } = body;

    if (!searchQuery) {
      return NextResponse.json(
        { success: false, error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Build comprehensive query
    const contentQuery = {
      search: searchQuery,
      type: filters.type,
      status: filters.status,
      featured: filters.featured,
      tags: filters.tags,
      categories: filters.categories,
      dateRange: filters.dateRange,
      limit: pagination.limit,
      offset: pagination.offset,
      sort: sort.field && sort.direction ? {
        field: sort.field,
        direction: sort.direction
      } : undefined
    };

    const results = contentManager.query(contentQuery);

    // Add search statistics if requested
    let stats;
    if (includeStats) {
      stats = {
        totalResults: results.total,
        resultsByType: {},
        searchTime: Date.now() // This would be calculated properly in a real implementation
      };

      // Calculate results by type
      results.items.forEach((item: any) => {
        stats.resultsByType[item.type] = (stats.resultsByType[item.type] || 0) + 1;
      });
    }

    return NextResponse.json({
      success: true,
      data: results,
      stats,
      query: searchQuery,
      filters,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Advanced search API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Advanced search failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}