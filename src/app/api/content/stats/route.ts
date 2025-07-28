// API route for content statistics and analytics

import { NextRequest, NextResponse } from 'next/server';
import { ContentDataLoader, contentUtils } from '@/lib/content';

// Initialize content on first request
let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    await ContentDataLoader.initialize();
    initialized = true;
  }
}

/**
 * GET /api/content/stats - Get comprehensive content statistics
 */
export async function GET(request: NextRequest) {
  try {
    await ensureInitialized();
    
    const { searchParams } = new URL(request.url);
    const includeDetailed = searchParams.get('detailed') === 'true';
    const type = searchParams.get('type');
    
    // Get basic stats
    const stats = contentUtils.getContentStats();
    
    // Add system status
    const systemStatus = ContentDataLoader.getStatus();
    
    let detailedStats = {};
    
    if (includeDetailed) {
      // Add more detailed analytics
      detailedStats = {
        contentHealth: {
          validationStatus: 'healthy', // This would be calculated from validation results
          lastUpdated: new Date().toISOString(),
          updateFrequency: 'daily' // This would be calculated from actual update patterns
        },
        popularContent: {
          // This would be based on actual usage metrics
          mostViewed: [],
          mostShared: [],
          trending: []
        },
        contentGrowth: {
          // This would be calculated from historical data
          thisMonth: 0,
          lastMonth: 0,
          growthRate: 0
        }
      };
    }

    // Filter stats by type if requested
    if (type) {
      const typeStats = {
        [type]: stats[type as keyof typeof stats] || {}
      };
      
      return NextResponse.json({
        success: true,
        data: {
          ...typeStats,
          system: systemStatus,
          ...(includeDetailed && { detailed: detailedStats })
        },
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        system: systemStatus,
        ...(includeDetailed && { detailed: detailedStats })
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}