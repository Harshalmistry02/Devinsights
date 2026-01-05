import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserAnalytics, refreshUserAnalytics, hasAnalyticsData } from '@/lib/analytics';

/**
 * GET /api/analytics
 * 
 * Returns cached or fresh analytics for the authenticated user.
 * Uses intelligent caching to avoid recalculating on every request.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check for force refresh query param
    const { searchParams } = new URL(req.url);
    const forceRefresh = searchParams.get('refresh') === 'true';
    
    let analytics;
    
    if (forceRefresh) {
      // Force recalculate
      analytics = await refreshUserAnalytics(session.user.id);
    } else {
      // Use cached or calculate if stale
      analytics = await getUserAnalytics(session.user.id);
    }
    
    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (error: any) {
    console.error('Analytics GET error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch analytics', 
        message: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/analytics
 * 
 * Force recalculate analytics. Useful after a sync operation.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Force recalculate and save
    const analytics = await refreshUserAnalytics(session.user.id);
    
    return NextResponse.json({
      success: true,
      data: analytics,
      message: 'Analytics recalculated successfully',
    });
  } catch (error: any) {
    console.error('Analytics POST error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to refresh analytics', 
        message: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * HEAD /api/analytics
 * 
 * Check if user has analytics data (lightweight check).
 */
export async function HEAD(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return new NextResponse(null, { status: 401 });
    }

    const hasData = await hasAnalyticsData(session.user.id);
    
    return new NextResponse(null, {
      status: hasData ? 200 : 204,
      headers: {
        'X-Has-Data': hasData ? 'true' : 'false',
      }
    });
  } catch (error) {
    console.error('Analytics HEAD error:', error);
    return new NextResponse(null, { status: 500 });
  }
}
