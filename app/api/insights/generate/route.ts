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

/**
 * POST /api/insights/generate
 * 
 * Generates AI-powered insights from user's analytics data
 * Uses intelligent caching to reduce API costs
 */
export async function POST(request: NextRequest) {
  console.log("🔵 API Route: /api/insights/generate - POST request received");
  
  try {
    // Step 1: Authentication
    console.log("🔐 Step 1: Checking authentication...");
    const session = await auth();

    if (!session?.user?.id) {
      console.warn("❌ Authentication failed: No session found");
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in to generate insights' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    console.log("✅ User authenticated:", userId);

    // Step 2: Get latest analytics snapshot
    console.log("📊 Step 2: Fetching analytics snapshot...");
    const snapshot = await prisma.analyticsSnapshot.findUnique({
      where: { userId },
    });

    if (!snapshot) {
      console.warn("❌ No analytics snapshot found for user:", userId);
      return NextResponse.json(
        {
          error: 'No analytics data found',
          message: 'Please sync your GitHub data first to generate insights.',
        },
        { status: 404 }
      );
    }

    console.log("✅ Analytics snapshot found:", {
      totalCommits: snapshot.totalCommits,
      calculatedAt: snapshot.calculatedAt,
    });

    // Step 3: Prepare data for AI
    console.log("🔧 Step 3: Preparing data for AI...");
    
    // Calculate average commit size
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
      previousPeriodCommits: undefined, // Could add historical comparison
    };

    console.log("📦 Analytics data prepared:", {
      totalCommits: analyticsData.totalCommits,
      topLanguagesCount: Object.keys(analyticsData.topLanguages).length,
    });

    // Step 4: Create data hash for caching
    const dataHash = createDataHash(analyticsData);
    console.log("🔑 Data hash created:", dataHash);

    // Step 5: Check cache
    console.log("💾 Step 5: Checking cache...");
    const cached = await prisma.insightCache.findUnique({
      where: { dataHash },
      select: {
        insights: true,
        createdAt: true,
        expiresAt: true,
        model: true,
      },
    });

    // Return cached if valid
    if (cached && cached.expiresAt > new Date()) {
      console.log("✅ Cache hit! Returning cached insights");
      console.log("📅 Cached at:", cached.createdAt);
      console.log("⏰ Expires at:", cached.expiresAt);
      
      return NextResponse.json({
        insights: cached.insights,
        cached: true,
        cachedAt: cached.createdAt.toISOString(),
        model: cached.model,
      });
    }

    if (cached) {
      console.log("⚠️ Cache found but expired, generating fresh insights");
    } else {
      console.log("⚠️ No cache found, generating fresh insights");
    }

    // Step 6: Generate new insights with AI
    console.log("🤖 Step 6: Generating insights with AI...");
    console.log("🔧 Using model: llama-3.3-70b-versatile");

    let insights;
    let model = 'llama-3.3-70b-versatile';

    try {
      console.log("📡 Calling GROQ API...");
      insights = await generateInsights(analyticsData);
      console.log("✅ AI insights generated successfully");
      console.log("📊 Insights structure:", {
        patternsCount: insights.patterns.length,
        strengthsCount: insights.strengths.length,
        suggestionsCount: insights.suggestions.length,
      });
    } catch (aiError: any) {
      console.error("❌ AI generation failed:", aiError);
      
      // Use mock insights as fallback
      console.log("🔄 Falling back to mock insights");
      insights = getMockInsights();
      model = 'mock-fallback';
    }

    // Step 7: Store in cache
    console.log("💾 Step 7: Storing insights in cache...");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24-hour TTL

    try {
      await prisma.insightCache.create({
        data: {
          userId,
          snapshotId: snapshot.id,
          dataHash,
          insights,
          model,
          expiresAt,
        },
      });
      console.log("✅ Insights cached successfully");
      console.log("⏰ Cache expires at:", expiresAt.toISOString());
    } catch (cacheError) {
      console.error("⚠️ Failed to cache insights (non-critical):", cacheError);
      // Continue even if caching fails
    }

    // Step 8: Return response
    console.log("✅ Step 8: Returning fresh insights to client");
    return NextResponse.json({
      insights,
      cached: false,
      generatedAt: new Date().toISOString(),
      model,
    });

  } catch (error: any) {
    console.error("❌ Unhandled error in insights generation:", error);
    console.error("Stack trace:", error.stack);

    // Handle specific AI errors gracefully
    if (error instanceof AIServiceError) {
      console.error("🤖 AI Service Error:", error.code);
      
      if (error.code === 'RATE_LIMIT') {
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            message: 'AI service is temporarily busy. Please try again in a moment.',
            code: 'RATE_LIMIT',
          },
          { status: 429 }
        );
      }

      if (error.code === 'TIMEOUT') {
        return NextResponse.json(
          {
            error: 'Request timeout',
            message: 'Request took too long. Please try again.',
            code: 'TIMEOUT',
          },
          { status: 504 }
        );
      }

      if (error.code === 'INVALID_RESPONSE') {
        return NextResponse.json(
          {
            error: 'Invalid AI response',
            message: 'AI returned invalid data. Please try again.',
            code: 'INVALID_RESPONSE',
          },
          { status: 500 }
        );
      }
    }

    // Generic error response (don't leak implementation details)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Unable to generate insights. Please try again later.',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/insights/generate
 * 
 * Retrieves existing cached insights without regenerating
 */
export async function GET(request: NextRequest) {
  console.log("🔵 API Route: /api/insights/generate - GET request received");
  
  try {
    const session = await auth();

    if (!session?.user?.id) {
      console.warn("❌ Authentication failed");
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log("🔍 Fetching latest cached insight for user:", session.user.id);

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
      console.log("⚠️ No cached insights found");
      return NextResponse.json(
        { error: 'No insights found', message: 'Generate insights first' },
        { status: 404 }
      );
    }

    console.log("✅ Cached insight found and returned");
    return NextResponse.json({
      insights: latestInsight.insights,
      generatedAt: latestInsight.createdAt.toISOString(),
      model: latestInsight.model,
      cached: true,
    });

  } catch (error: any) {
    console.error("❌ Error retrieving cached insights:", error);
    return NextResponse.json(
      { error: 'Failed to retrieve insights' },
      { status: 500 }
    );
  }
}