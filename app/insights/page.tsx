import { requireAuth } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
import InsightsClient from  "./InsightsClient";

/**
 * Insights Page - Server Component
 * Fetches data on the server and passes to client component
 * This separation prevents hydration errors
 */
export default async function InsightsPage() {
  // Require authentication
  const session = await requireAuth();
  const { user } = session;

  // Fetch analytics snapshot
  const analytics = await prisma.analyticsSnapshot.findUnique({
    where: { userId: user.id },
    select: {
      totalRepos: true,
      totalCommits: true,
      currentStreak: true,
      longestStreak: true,
      totalStars: true,
      totalForks: true,
      totalAdditions: true,
      totalDeletions: true,
      isActiveToday: true,
      lastCommitDate: true,
      mostProductiveDay: true,
      mostProductiveHour: true,
      averageCommitsPerDay: true,
      topLanguages: true,
      calculatedAt: true,
    },
  });

  // Fetch existing cached insights (if any)
  const cachedInsight = await prisma.insightCache.findFirst({
    where: {
      userId: user.id,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
    select: {
      insights: true,
      createdAt: true,
      model: true,
    },
  });

  // Check if user has synced data
  const hasSyncedData = analytics !== null && analytics.totalCommits > 0;

  // Parse top languages from JSON
  const topLanguages =
    (analytics?.topLanguages as Array<{
      language: string;
      count: number;
      percentage: number;
    }>) || [];

  // Serialize dates for client component
  const serializedAnalytics = analytics
    ? {
        ...analytics,
        lastCommitDate: analytics.lastCommitDate?.toISOString() || null,
        calculatedAt: analytics.calculatedAt?.toISOString() || null,
      }
    : null;

  const serializedCachedInsight = cachedInsight
    ? {
        insights: cachedInsight.insights as {
          patterns: string[];
          strengths: string[];
          suggestions: string[];
        },
        createdAt: cachedInsight.createdAt.toISOString(),
        model: cachedInsight.model,
      }
    : null;

  return (
    <InsightsClient
      hasSyncedData={hasSyncedData}
      analytics={serializedAnalytics}
      topLanguages={topLanguages}
      cachedInsight={serializedCachedInsight}
      userName={user.name || user.username || "Developer"}
    />
  );
}
