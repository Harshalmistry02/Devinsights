import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateInsights } from '@/lib/ai/service';
import { buildAnalyticsSummary } from '@/lib/analytics/insights-data-builder';
import {
  buildEnhancedUserPrompt,
  detectAnomalies,
  calculateTrend,
  EnhancedAnalyticsContext,
} from '@/lib/ai/enhanced-prompts';

/**
 * POST /api/insights/enhanced
 * Generate enhanced insights with historical comparison and anomaly detection
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { period = '30days' } = await request.json();

    // Get current analytics snapshot
    const currentSnapshot = await prisma.analyticsSnapshot.findUnique({
      where: { userId },
    });

    if (!currentSnapshot) {
      return NextResponse.json(
        { error: 'No analytics data. Please sync your GitHub data first.' },
        { status: 404 }
      );
    }

    // Calculate date range for previous period
    const daysBack = period === '30days' ? 30 : period === 'week' ? 7 : 90;
    const previousPeriodEnd = new Date();
    previousPeriodEnd.setDate(previousPeriodEnd.getDate() - daysBack);
    
    const previousPeriodStart = new Date(previousPeriodEnd);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - daysBack);

    // Try to find historical snapshot for comparison
    // Note: You'll need to implement historical snapshot storage
    // For now, we'll create a simplified version
    const previousSnapshot = await prisma.analyticsSnapshot.findFirst({
      where: {
        userId,
        calculatedAt: {
          gte: previousPeriodStart,
          lt: previousPeriodEnd,
        },
      },
      orderBy: { calculatedAt: 'desc' },
    });

    // Build analytics summaries
    const currentSummary = buildAnalyticsSummary(currentSnapshot);
    const previousSummary = previousSnapshot
      ? buildAnalyticsSummary(previousSnapshot)
      : undefined;

    // Detect anomalies
    const anomalies = detectAnomalies(currentSummary, previousSummary);

    // Calculate trend
    const trend = calculateTrend(currentSummary, previousSummary);

    // Build enhanced context
    const enhancedContext: EnhancedAnalyticsContext = {
      current: currentSummary,
      previous: previousSummary,
      trend,
      anomalies,
    };

    // Build enhanced prompt
    const enhancedPrompt = buildEnhancedUserPrompt(enhancedContext);

    // Generate insights using the enhanced prompt
    const insights = await generateInsights(currentSummary, enhancedPrompt);

    // Create data hash for cache key
    const dataHash = require('crypto')
      .createHash('sha256')
      .update(JSON.stringify(currentSummary))
      .digest('hex');

    // Get expiration date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Cache the insights
    await prisma.insightCache.upsert({
      where: { dataHash },
      create: {
        userId,
        snapshotId: currentSnapshot.id,
        dataHash,
        insights: insights as any, // Store as JSON
        model: 'llama-3.3-70b-versatile',
        tokensUsed: null,
        expiresAt,
      },
      update: {
        insights: insights as any,
        model: 'llama-3.3-70b-versatile',
        expiresAt,
      },
    });

    return NextResponse.json({
      insights,
      context: {
        trend,
        anomalies,
        comparison: previousSummary
          ? {
              previousCommits: previousSummary.totalCommits,
              commitChange: currentSummary.totalCommits - previousSummary.totalCommits,
              commitChangePercentage:
                previousSummary.totalCommits > 0
                  ? Math.round(
                      ((currentSummary.totalCommits - previousSummary.totalCommits) /
                        previousSummary.totalCommits) *
                        100
                    )
                  : 0,
              previousStreak: previousSummary.currentStreak,
              streakChange: currentSummary.currentStreak - previousSummary.currentStreak,
              previousConsistency: previousSummary.consistencyScore || 0,
              consistencyChange:
                (currentSummary.consistencyScore || 0) -
                (previousSummary.consistencyScore || 0),
            }
          : null,
      },
      metadata: {
        generatedAt: new Date(),
        period,
        hasComparison: !!previousSummary,
        anomaliesDetected: anomalies.length,
      },
    });
  } catch (error: any) {
    console.error('Enhanced insights error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate enhanced insights',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/insights/enhanced
 * Retrieve cached enhanced insights for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get current snapshot to find matching cache
    const currentSnapshot = await prisma.analyticsSnapshot.findUnique({
      where: { userId },
    });

    if (!currentSnapshot) {
      return NextResponse.json(
        { error: 'No analytics data found' },
        { status: 404 }
      );
    }

    // Find most recent cache for this user's snapshot
    const cachedInsight = await prisma.insightCache.findFirst({
      where: { 
        userId,
        snapshotId: currentSnapshot.id,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!cachedInsight) {
      return NextResponse.json(
        { error: 'No cached insights found. Generate new insights first.' },
        { status: 404 }
      );
    }

    // Parse insights from JSON
    const insights = cachedInsight.insights as { 
      patterns: string[];
      strengths: string[];
      suggestions: string[];
    };

    return NextResponse.json({
      insights,
      metadata: {
        generatedAt: cachedInsight.createdAt,
        model: cachedInsight.model,
        expiresAt: cachedInsight.expiresAt,
      },
    });
  } catch (error: any) {
    console.error('Error fetching cached insights:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch cached insights',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
