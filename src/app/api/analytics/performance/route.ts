import { NextRequest, NextResponse } from 'next/server';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  userAgent?: string;
  url?: string;
}

export async function POST(request: NextRequest) {
  try {
    const metric: PerformanceMetric = await request.json();
    
    // Add request metadata
    const enhancedMetric = {
      ...metric,
      userAgent: request.headers.get('user-agent') || 'unknown',
      url: request.headers.get('referer') || 'unknown',
      ip: request.ip || 'unknown',
    };

    // Log performance metrics (in production, send to analytics service)
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance Metric Received:', enhancedMetric);
    }

    // In production, you would send this to your analytics service
    // Examples:
    // - Google Analytics Measurement Protocol
    // - Custom analytics database
    // - Third-party services like Mixpanel, Amplitude, etc.
    
    if (process.env.NODE_ENV === 'production') {
      // Example: Store in database or send to analytics service
      await storePerformanceMetric(enhancedMetric);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing performance metric:', error);
    return NextResponse.json(
      { error: 'Failed to process performance metric' },
      { status: 500 }
    );
  }
}

async function storePerformanceMetric(metric: any) {
  // Example implementation - replace with your actual storage logic
  try {
    // Store in database
    // await db.performanceMetrics.create({ data: metric });
    
    // Or send to external analytics service
    // await fetch('https://analytics-service.com/api/metrics', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(metric)
    // });
    
    console.log('Performance metric stored:', metric.name, metric.value);
  } catch (error) {
    console.error('Failed to store performance metric:', error);
  }
}

// GET endpoint to retrieve performance metrics (for dashboard/monitoring)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '24h';
    const metricName = searchParams.get('metric');

    // In production, retrieve from your analytics service/database
    const mockMetrics = [
      {
        name: 'LCP',
        value: 2100,
        rating: 'good',
        timestamp: Date.now() - 3600000,
      },
      {
        name: 'FID',
        value: 85,
        rating: 'good',
        timestamp: Date.now() - 1800000,
      },
      {
        name: 'CLS',
        value: 0.08,
        rating: 'good',
        timestamp: Date.now() - 900000,
      },
    ];

    const filteredMetrics = metricName 
      ? mockMetrics.filter(m => m.name === metricName)
      : mockMetrics;

    return NextResponse.json({
      metrics: filteredMetrics,
      timeframe,
      count: filteredMetrics.length,
    });
  } catch (error) {
    console.error('Error retrieving performance metrics:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve performance metrics' },
      { status: 500 }
    );
  }
}