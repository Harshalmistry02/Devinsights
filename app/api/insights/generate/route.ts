// app/api/insights/generate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import {
  generateInsights,
  createDataHash,
  getMockInsights,
  estimateTokenUsage,
} from '@/lib/ai/service';
import { AIServiceError } from '@/lib/ai/types';
import { buildAnalyticsSummary } from '@/lib/analytics/insights-data-builder';
import { AI_CONFIG } from '@/lib/ai/client';

// Cache duration based on tier (free tier gets longer cache to save tokens)
const CACHE_HOURS = 24; // 24 hours for free tier

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // 2. Get latest analytics snapshot
    const snapshot = await prisma.analyticsSnapshot.findUnique({
      where: {
        userId,
      },
    });

    if (!snapshot) {
      return NextResponse.json(
        {
          error: 'No analytics data found. Please sync your GitHub data first.',
        },
        { status: 404 }
      );
    }

    // 3. Build comprehensive analytics data
    const analyticsData = buildAnalyticsSummary(snapshot);

    // 4. Create data hash for caching
    const dataHash = createDataHash(analyticsData);

    // 5. Check cache (most important optimization!)
    const cached = await prisma.insightCache.findUnique({
      where: { dataHash },
      select: {
        insights: true,
        createdAt: true,
        expiresAt: true,
        tokensUsed: true,
      },
    });

    // Return cached if valid
    if (cached && cached.expiresAt > new Date()) {
      console.log('✅ Cache hit for insights');
      return NextResponse.json({
        insights: cached.insights,
        cached: true,
        cachedAt: cached.createdAt,
        meta: {
          dataQuality: {
            consistencyScore: analyticsData.consistencyScore,
            languageDiversity: analyticsData.languageDiversity,
            streakHealth: analyticsData.streakHealth,
          },
          daysToMilestone: analyticsData.daysToMilestone,
        },
      });
    }

    // 6. Check quota (simple daily limit tracking via usage log)
    // Note: The quota manager requires DB migration, so we use a simpler approach here
    // that can be enhanced after migration
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaysInsightCount = await prisma.insightCache.count({
      where: {
        userId,
        createdAt: {
          gte: today,
        },
      },
    });

    if (todaysInsightCount >= AI_CONFIG.maxRequestsPerDay) {
      console.log('⚠️ Daily quota exceeded for user:', userId);
      return NextResponse.json(
        {
          error: 'Daily AI quota exceeded. Your insights will refresh tomorrow, or use cached insights.',
          code: 'QUOTA_EXCEEDED',
          retryAfter: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        },
        { status: 429 }
      );
    }

    // 7. Generate new insights
    console.log('🤖 Generating new insights with AI...');
    console.log('📊 Analytics data:', {
      totalCommits: analyticsData.totalCommits,
      currentStreak: analyticsData.currentStreak,
      consistencyScore: analyticsData.consistencyScore,
      languageDiversity: analyticsData.languageDiversity,
      streakHealth: analyticsData.streakHealth,
    });

    let insights;
    let tokensUsed: number = AI_CONFIG.estimatedTokensPerRequest; // Default estimate

    try {
      insights = await generateInsights(analyticsData);
      // Estimate actual tokens used
      tokensUsed = estimateTokenUsage(analyticsData, insights);
    } catch (aiError: any) {
      console.error('AI generation failed, using mock:', aiError);
      insights = getMockInsights(analyticsData);
    }

    // 8. Store in cache
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + CACHE_HOURS);

    await prisma.insightCache.create({
      data: {
        userId,
        snapshotId: snapshot.id,
        dataHash,
        insights,
        model: AI_CONFIG.model,
        tokensUsed,
        expiresAt,
      },
    });

    // 9. Return response with enhanced metadata
    return NextResponse.json({
      insights,
      cached: false,
      generatedAt: new Date(),
      meta: {
        dataQuality: {
          consistencyScore: analyticsData.consistencyScore,
          languageDiversity: analyticsData.languageDiversity,
          streakHealth: analyticsData.streakHealth,
        },
        daysToMilestone: analyticsData.daysToMilestone,
        tokensUsed,
        quotaRemaining: AI_CONFIG.maxRequestsPerDay - todaysInsightCount - 1,
      },
    });
  } catch (error: any) {
    console.error('AI Insights Error:', error);

    // Handle specific AI errors gracefully
    if (error instanceof AIServiceError) {
      if (error.code === 'RATE_LIMIT') {
        return NextResponse.json(
          {
            error: 'AI service is temporarily busy. Please try again in a moment.',
            code: 'RATE_LIMIT',
          },
          { status: 429 }
        );
      }

      if (error.code === 'TIMEOUT') {
        return NextResponse.json(
          {
            error: 'Request took too long. Please try again.',
            code: 'TIMEOUT',
          },
          { status: 504 }
        );
      }
    }

    // Generic error response (don't leak implementation details)
    return NextResponse.json(
      {
        error: 'Unable to generate insights. Please try again later.',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve existing insights
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the latest valid insight
    const latestInsight = await prisma.insightCache.findFirst({
      where: {
        userId: session.user.id,
        expiresAt: { gt: new Date() }, // Not expired
      },
      orderBy: { createdAt: 'desc' },
      select: {
        insights: true,
        createdAt: true,
        model: true,
        tokensUsed: true,
      },
    });

    if (!latestInsight) {
      return NextResponse.json(
        { error: 'No insights found. Generate new insights first.' },
        { status: 404 }
      );
    }

    // Also get analytics snapshot for metadata
    const snapshot = await prisma.analyticsSnapshot.findUnique({
      where: { userId: session.user.id },
    });

    let meta = {};
    if (snapshot) {
      const analyticsData = buildAnalyticsSummary(snapshot);
      meta = {
        dataQuality: {
          consistencyScore: analyticsData.consistencyScore,
          languageDiversity: analyticsData.languageDiversity,
          streakHealth: analyticsData.streakHealth,
        },
        daysToMilestone: analyticsData.daysToMilestone,
      };
    }

    return NextResponse.json({
      insights: latestInsight.insights,
      generatedAt: latestInsight.createdAt,
      model: latestInsight.model,
      cached: true,
      meta,
    });
  } catch (error) {
    console.error('Get insights error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve insights' },
      { status: 500 }
    );
  }
}
