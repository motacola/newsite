// API route for individual content item operations

import { NextRequest, NextResponse } from 'next/server';
import { contentManager, ContentDataLoader } from '@/lib/content';

// Initialize content on first request
let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    await ContentDataLoader.initialize();
    initialized = true;
  }
}

/**
 * GET /api/content/[id] - Get specific content item
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureInitialized();
    
    const { id } = params;
    const content = contentManager.get(id);
    
    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: content,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Content fetch error:', error);
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
 * PUT /api/content/[id] - Update specific content item
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureInitialized();
    
    const { id } = params;
    const body = await request.json();
    const { updates, author = 'api', options = {} } = body;
    
    if (!updates) {
      return NextResponse.json(
        { success: false, error: 'Updates are required' },
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
        { status: result.errors?.some(e => e.includes('not found')) ? 404 : 400 }
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
 * DELETE /api/content/[id] - Delete specific content item
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureInitialized();
    
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const author = searchParams.get('author') || 'api';

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
        { status: result.errors?.some(e => e.includes('not found')) ? 404 : 400 }
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