// app/api/insights/generate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import {
  generateInsights,
  createDataHash,
  getMockInsights,
} from '@/lib/ai/service';
import { AIServiceError } from '@/lib/ai/types';

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

    // 3. Create data hash for caching
    // Calculate avgCommitSize from additions+deletions / commits
    const avgCommitSize = snapshot.totalCommits > 0
      ? Math.round((snapshot.totalAdditions + snapshot.totalDeletions) / snapshot.totalCommits)
      : 0;

    const analyticsData = {
      totalCommits: snapshot.totalCommits,
      currentStreak: snapshot.currentStreak,
      longestStreak: snapshot.longestStreak,
      topLanguages: (snapshot.topLanguages as Array<{ language: string; count: number }> || [])
        .reduce((acc, lang) => ({ ...acc, [lang.language]: lang.count }), {} as Record<string, number>),
      avgCommitSize,
      mostActiveDay: snapshot.mostProductiveDay || 'N/A',
      period: 'last_30_days',
    };

    const dataHash = createDataHash(analyticsData);

    // 4. Check cache (most important optimization!)
    const cached = await prisma.insightCache.findUnique({
      where: { dataHash },
      select: {
        insights: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    // Return cached if valid
    if (cached && cached.expiresAt > new Date()) {
      console.log('✅ Cache hit for insights');
      return NextResponse.json({
        insights: cached.insights,
        cached: true,
        cachedAt: cached.createdAt,
      });
    }

    // 5. Generate new insights
    console.log('🤖 Generating new insights with AI...');

    let insights;

    // Use mock in development or if AI_CONFIG.useMock is true
    try {
      insights = await generateInsights(analyticsData);
    } catch (aiError: any) {
      console.error('AI generation failed, using mock:', aiError);
      insights = getMockInsights();
    }

    // 6. Store in cache with upsert to avoid duplicate dataHash errors
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24-hour TTL

    await prisma.insightCache.upsert({
      where: {
        dataHash,
      },
      create: {
        userId,
        snapshotId: snapshot.id,
        dataHash,
        insights,
        model: 'llama-3.3-70b',
        expiresAt,
      },
      update: {
        insights,
        model: 'llama-3.3-70b',
        expiresAt,
      },
    });

    // 7. Return response
    return NextResponse.json({
      insights,
      cached: false,
      generatedAt: new Date(),
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

// Optional: GET endpoint to retrieve existing insights
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
      },
    });

    if (!latestInsight) {
      return NextResponse.json(
        { error: 'No insights found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      insights: latestInsight.insights,
      generatedAt: latestInsight.createdAt,
      model: latestInsight.model,
    });
  } catch (error) {
    console.error('Get insights error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve insights' },
      { status: 500 }
    );
  }
}
