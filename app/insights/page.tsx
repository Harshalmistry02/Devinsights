import { requireAuth } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { 
  TrendingUp, 
  ArrowLeft, 
  Clock,
  BarChart3,
  RefreshCw,
  Calendar,
  Code,
  GitCommit,
  Flame,
  AlertTriangle,
  Trophy,
  Brain,
} from "lucide-react";
import { AIInsightsSection } from "./AIInsightsSection";
import { InsightsChartsSection } from "./InsightsChartsSection";

// Type definitions for JSON fields
type DailyCommits = Record<string, number>;
type DayOfWeekStats = Record<string, number>;
type HourlyStats = Record<string, number>;
type RepoStat = { id: string; name: string; fullName: string; commits: number; stars: number; forks: number; language: string | null };
type TopLanguage = { language: string; count: number; percentage: number };

/**
 * Insights Page
 * 
 * Comprehensive analytics dashboard with AI-powered insights and visualizations
 */
export default async function InsightsPage() {
  const session = await requireAuth();
  const { user } = session;

  // Fetch analytics snapshot with all detailed data
  const analytics = await prisma.analyticsSnapshot.findUnique({
    where: { userId: user.id },
  });

  // Check if user has data
  const hasData = analytics !== null;

  // Parse JSON fields for chart components
  const dailyCommits = analytics?.dailyCommits as DailyCommits | null;
  const dayOfWeekStats = analytics?.dayOfWeekStats as DayOfWeekStats | null;
  const hourlyStats = analytics?.hourlyStats as HourlyStats | null;
  const repoStats = analytics?.repoStats as RepoStat[] | null;
  const topLanguages = analytics?.topLanguages as TopLanguage[] | null;

  // Check data staleness
  const lastSyncDate = analytics?.calculatedAt;
  const isDataStale = lastSyncDate 
    ? (Date.now() - new Date(lastSyncDate).getTime()) > (24 * 60 * 60 * 1000) // More than 24 hours old
    : false;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 pt-20 sm:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/dashboard"
              className="p-2 bg-slate-800/50 border border-slate-700/30 rounded-lg hover:bg-slate-800 hover:border-slate-600 transition-all text-slate-400 hover:text-slate-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-200 flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-cyan-400" />
                Coding Insights
              </h1>
              <p className="text-slate-400 mt-1">
                Deep dive into your development patterns and productivity
              </p>
            </div>
          </div>

          {/* Last Updated & Stale Data Warning */}
          <div className="flex flex-wrap items-center gap-4">
            {analytics?.calculatedAt && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Clock className="w-4 h-4" />
                <span>
                  Last updated: {new Date(analytics.calculatedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            )}
            {isDataStale && (
              <div className="flex items-center gap-2 text-sm text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Data may be outdated. Consider syncing from dashboard.</span>
              </div>
            )}
          </div>
        </div>

        {hasData ? (
          <div className="space-y-8">
            {/* AI Stats Banner */}
            <AIStatsBanner analytics={analytics} userId={user.id} />

            {/* AI-Powered Insights Section */}
            <AIInsightsSection 
              analytics={{
                totalCommits: analytics.totalCommits,
                currentStreak: analytics.currentStreak,
                longestStreak: analytics.longestStreak,
                isActiveToday: analytics.isActiveToday,
                lastCommitDate: analytics.lastCommitDate,
              }}
            />

            {/* Charts Section */}
            <InsightsChartsSection
              dailyCommits={dailyCommits}
              dayOfWeekStats={dayOfWeekStats}
              hourlyStats={hourlyStats}
              repoStats={repoStats}
              topLanguages={topLanguages}
            />
          </div>
        ) : (
          <EmptyState />
        )}

        {/* Debug Info (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 bg-slate-900/50 border border-yellow-500/30 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center gap-2">
              <span>🔍</span> Debug Info
            </h3>
            <pre className="text-xs text-slate-400 overflow-auto bg-slate-950/50 p-4 rounded-lg border border-slate-700/30">
              {JSON.stringify(
                {
                  userId: user.id,
                  hasAnalytics: analytics !== null,
                  totalCommits: analytics?.totalCommits ?? 0,
                  hasData,
                  hasDailyCommits: !!dailyCommits,
                  hasDayOfWeekStats: !!dayOfWeekStats,
                  hasHourlyStats: !!hourlyStats,
                  hasRepoStats: !!repoStats,
                  hasTopLanguages: !!topLanguages,
                },
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

// ===========================================
// AI Stats Banner Component
// ===========================================

async function AIStatsBanner({ analytics, userId }: { analytics: any; userId: string }) {
  // Get count of AI insights generated
  const insightCount = await prisma.insightCache.count({
    where: { userId }
  });

  // Calculate active days percentage
  const totalDays = analytics.totalRepos > 0 ? 
    Math.ceil((Date.now() - new Date(analytics.calculatedAt).getTime()) / (1000 * 60 * 60 * 24)) || 1 : 1;
  const activeDaysCount = Object.keys((analytics.dailyCommits as Record<string, number>) || {}).length;
  const productivityPercentage = Math.round((activeDaysCount / Math.max(totalDays, 1)) * 100);

  // Calculate average daily commits
  const avgDailyCommits = analytics.totalCommits > 0 && activeDaysCount > 0 
    ? (analytics.totalCommits / activeDaysCount).toFixed(1)
    : '0';

  const stats = [
    {
      label: 'AI Insights Generated',
      value: insightCount.toLocaleString(),
      icon: <Brain className="w-5 h-5 text-purple-400" />,
      color: 'purple',
      sublabel: insightCount > 0 ? '✨ Powered by AI' : 'Generate your first',
      gradient: 'from-purple-500/20 to-purple-500/5',
      borderColor: 'border-purple-500/30',
    },
    {
      label: 'Longest Streak',
      value: `${analytics.longestStreak}d`,
      icon: <Trophy className="w-5 h-5 text-amber-400" />,
      color: 'amber',
      sublabel: analytics.longestStreak > 0 ? '🏆 Personal best' : 'Start today!',
      gradient: 'from-amber-500/20 to-amber-500/5',
      borderColor: 'border-amber-500/30',
    },
    {
      label: 'Productivity Rate',
      value: `${productivityPercentage}%`,
      icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
      color: 'emerald',
      sublabel: productivityPercentage > 70 ? '🔥 Excellent!' : 
                productivityPercentage > 40 ? '📈 Good pace' : '💪 Keep going',
      gradient: 'from-emerald-500/20 to-emerald-500/5',
      borderColor: 'border-emerald-500/30',
    },
    {
      label: 'Avg Daily Commits',
      value: avgDailyCommits,
      icon: <GitCommit className="w-5 h-5 text-cyan-400" />,
      color: 'cyan',
      sublabel: `across ${activeDaysCount} active days`,
      gradient: 'from-cyan-500/20 to-cyan-500/5',
      borderColor: 'border-cyan-500/30',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`bg-linear-to-br ${stat.gradient} border ${stat.borderColor} rounded-xl p-4 backdrop-blur-sm hover:scale-105 transition-all duration-300 group`}
        >
          <div className="flex items-center gap-2 mb-2">
            {stat.icon}
            <span className="text-xs text-slate-400">{stat.label}</span>
          </div>
          <div className="text-2xl font-bold text-slate-200 group-hover:scale-110 transition-transform">
            {stat.value}
          </div>
          {stat.sublabel && (
            <div className="text-xs text-slate-500 mt-1">{stat.sublabel}</div>
          )}
        </div>
      ))}
    </div>
  );
}

// ===========================================
// Empty State Component
// ===========================================

function EmptyState() {
  return (
    <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-12 backdrop-blur-sm text-center">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <BarChart3 className="w-8 h-8 text-cyan-400" />
        </div>
        <h2 className="text-xl font-semibold text-slate-200 mb-3">
          No Insights Available Yet
        </h2>
        <p className="text-slate-400 mb-6">
          Sync your GitHub data to unlock comprehensive analytics and visualizations of your coding patterns.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/30 hover:border-cyan-500/50 transition-all font-medium"
        >
          <RefreshCw className="w-5 h-5" />
          Go to Dashboard to Sync
        </Link>
      </div>
    </div>
  );
}
