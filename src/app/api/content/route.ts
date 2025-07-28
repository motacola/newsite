// API route for content management operations

import { NextRequest, NextResponse } from 'next/server';
import { contentManager, ContentDataLoader } from '@/lib/content';
import { ContentQuery } from '@/lib/content/types';

// Initialize content on first request
let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    await ContentDataLoader.initialize();
    initialized = true;
  }
}

/**
 * GET /api/content - Query content with filters
 */
export async function GET(request: NextRequest) {
  try {
    await ensureInitialized();
    
    const { searchParams } = new URL(request.url);
    
    // Build query from search parameters
    const query: ContentQuery = {
      type: searchParams.get('type') || undefined,
      status: searchParams.get('status') as any || undefined,
      featured: searchParams.get('featured') === 'true' ? true : 
                searchParams.get('featured') === 'false' ? false : undefined,
      search: searchParams.get('search') || undefined,
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || undefined,
      categories: searchParams.get('categories')?.split(',').filter(Boolean) || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
      sort: searchParams.get('sortField') && searchParams.get('sortDirection') ? {
        field: searchParams.get('sortField')!,
        direction: searchParams.get('sortDirection') as 'asc' | 'desc'
      } : undefined
    };

    // Handle date range filter
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    if (startDate && endDate) {
      query.dateRange = { start: startDate, end: endDate };
    }

    const results = contentManager.query(query);
    
    return NextResponse.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Content API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch content',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/content - Create new content
 */
export async function POST(request: NextRequest) {
  try {
    await ensureInitialized();
    
    const body = await request.json();
    const { content, author = 'api' } = body;
    
    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content data is required' },
        { status: 400 }
      );
    }

    const result = await contentManager.create(content, author);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create content',
          errors: result.errors
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Content creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create content',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/content - Update existing content
 */
export async function PUT(request: NextRequest) {
  try {
    await ensureInitialized();
    
    const body = await request.json();
    const { id, updates, author = 'api', options = {} } = body;
    
    if (!id || !updates) {
      return NextResponse.json(
        { success: false, error: 'Content ID and updates are required' },
        { status: 400 }
      );
    }

    const result = await contentManager.update(id, updates, author, options);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update content',
          errors: result.errors
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Content update error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update content',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/content - Delete content
 */
export async function DELETE(request: NextRequest) {
  try {
    await ensureInitialized();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const author = searchParams.get('author') || 'api';
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Content ID is required' },
        { status: 400 }
      );
    }

    const result = await contentManager.delete(id, author);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Content deleted successfully',
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to delete content',
          errors: result.errors
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Content deletion error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete content',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}