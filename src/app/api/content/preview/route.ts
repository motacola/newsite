// API route for content preview functionality

import { NextRequest, NextResponse } from 'next/server';
import { contentManager, ContentDataLoader } from '@/lib/content';
import { ContentValidator } from '@/lib/content/validator';
import { deepClone } from '@/lib/utils';

// Initialize content on first request
let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    await ContentDataLoader.initialize();
    initialized = true;
  }
}

/**
 * POST /api/content/preview - Preview content changes without saving
 */
export async function POST(request: NextRequest) {
  try {
    await ensureInitialized();
    
    const body = await request.json();
    const { id, updates, mode = 'update' } = body;
    
    if (mode === 'create') {
      // Preview new content creation
      if (!updates) {
        return NextResponse.json(
          { success: false, error: 'Content data is required for preview' },
          { status: 400 }
        );
      }

      // Validate the new content
      const validation = ContentValidator.validate(updates, updates.type);
      
      return NextResponse.json({
        success: true,
        data: {
          content: updates,
          validation,
          preview: {
            mode: 'create',
            isValid: validation.isValid,
            warnings: validation.warnings,
            errors: validation.errors
          }
        },
        timestamp: new Date().toISOString()
      });
    }

    if (mode === 'update') {
      // Preview content updates
      if (!id || !updates) {
        return NextResponse.json(
          { success: false, error: 'Content ID and updates are required for preview' },
          { status: 400 }
        );
      }

      const existing = contentManager.get(id);
      if (!existing) {
        return NextResponse.json(
          { success: false, error: 'Content not found' },
          { status: 404 }
        );
      }

      // Create preview version by merging updates
      const previewContent = deepClone(existing);
      Object.assign(previewContent, updates);
      previewContent.updatedAt = new Date().toISOString();

      // Validate the preview content
      const validation = ContentValidator.validate(previewContent, existing.type);

      // Calculate changes
      const changes = calculateChanges(existing, updates);

      return NextResponse.json({
        success: true,
        data: {
          original: existing,
          preview: previewContent,
          changes,
          validation,
          metadata: {
            mode: 'update',
            isValid: validation.isValid,
            hasChanges: changes.length > 0,
            warnings: validation.warnings,
            errors: validation.errors
          }
        },
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid preview mode' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Preview API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Preview failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/content/preview/[id] - Get preview of specific content with potential changes
 */
export async function GET(request: NextRequest) {
  try {
    await ensureInitialized();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const includeRelated = searchParams.get('includeRelated') === 'true';
    const includeHistory = searchParams.get('includeHistory') === 'true';
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Content ID is required' },
        { status: 400 }
      );
    }

    const content = contentManager.get(id);
    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content not found' },
        { status: 404 }
      );
    }

    const previewData: any = {
      content,
      metadata: {
        type: content.type,
        status: content.status,
        featured: content.featured,
        lastUpdated: content.updatedAt,
        version: content.version
      }
    };

    // Include related content if requested
    if (includeRelated) {
      const related = getRelatedContent(content);
      previewData.related = related;
    }

    // Include version history if requested
    if (includeHistory) {
      // This would integrate with the versioning system
      previewData.history = {
        versions: [], // Would be populated from ContentVersionManager
        backups: []   // Would be populated from ContentVersionManager
      };
    }

    return NextResponse.json({
      success: true,
      data: previewData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Preview fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch preview',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Calculate changes between original and updated content
 */
function calculateChanges(original: any, updates: any): Array<{
  field: string;
  type: 'added' | 'modified' | 'removed';
  oldValue?: any;
  newValue?: any;
}> {
  const changes: Array<{
    field: string;
    type: 'added' | 'modified' | 'removed';
    oldValue?: any;
    newValue?: any;
  }> = [];

  // Check for modified and added fields
  Object.keys(updates).forEach(key => {
    if (!(key in original)) {
      changes.push({
        field: key,
        type: 'added',
        newValue: updates[key]
      });
    } else if (JSON.stringify(original[key]) !== JSON.stringify(updates[key])) {
      changes.push({
        field: key,
        type: 'modified',
        oldValue: original[key],
        newValue: updates[key]
      });
    }
  });

  return changes;
}

/**
 * Get related content for preview context
 */
function getRelatedContent(content: any): {
  projects: any[];
  experiences: any[];
  skills: any[];
} {
  // This would use the content manager's related content functionality
  const allContent = contentManager.export().content;
  
  const related = {
    projects: [] as any[],
    experiences: [] as any[],
    skills: [] as any[]
  };

  // Find content with matching tags or categories
  allContent.forEach(item => {
    if (item.id === content.id) return;
    
    const hasMatchingTags = content.tags.some((tag: string) => item.tags.includes(tag));
    const hasMatchingCategories = content.categories.some((cat: string) => item.categories.includes(cat));
    
    if (hasMatchingTags || hasMatchingCategories) {
      if (item.type === 'project') related.projects.push(item);
      else if (item.type === 'experience') related.experiences.push(item);
      else if (item.type === 'skill') related.skills.push(item);
    }
  });

  // Limit results
  related.projects = related.projects.slice(0, 3);
  related.experiences = related.experiences.slice(0, 3);
  related.skills = related.skills.slice(0, 5);

  return related;
}