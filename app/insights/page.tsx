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
import { AIInsightsHero } from "./AIInsightsHero";
import { InsightsChartsSection } from "./InsightsChartsSection";
import { DataQualityIndicator } from "@/components/DataQualityIndicator";

import { CodeImpactCard } from "./components/CodeImpactCard";
import { RepoDeepDive } from "./components/RepoDeepDive";
import { PersonaBadgeCompact } from "./components/PersonaBadge";

import { detectPersona, type PersonaContext } from "@/lib/analytics/persona-detector";
import type { CodeImpactMetrics } from "@/lib/analytics/code-impact-analyzer";
import type { CommitQualityMetrics } from "@/lib/analytics/commit-quality-analyzer";

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

  // Get outlier counts for DataQualityIndicator
  const outlierCount = await prisma.commit.count({
    where: {
      repository: { userId: user.id },
      metadata: {
        path: ['isOutlier'],
        equals: true,
      },
    },
  }).catch(() => 0); // Handle case where metadata field doesn't exist yet



  // Parse code impact metrics
  const codeImpactMetrics = (analytics as any)?.codeImpactMetrics as CodeImpactMetrics | null;
  const commitQualityMetrics = (analytics as any)?.commitQualityMetrics as CommitQualityMetrics | null;

  // Detect developer persona
  const personaContext: PersonaContext = {
    hourlyStats: hourlyStats,
    dayOfWeekStats: dayOfWeekStats as any,
    topLanguages: topLanguages,
    currentStreak: analytics?.currentStreak,
    totalCommits: analytics?.totalCommits,
    totalRepos: analytics?.totalRepos,
    avgCommitSize: analytics && analytics.totalCommits > 0 
      ? Math.round((analytics.totalAdditions + analytics.totalDeletions) / analytics.totalCommits)
      : undefined,
  };
  const persona = analytics ? detectPersona(personaContext) : null;

  return (
    <div className="app-canvas">
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "40px clamp(16px, 4vw, 48px)",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <Link
            href="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
              marginBottom: "20px",
              opacity: 0.4,
              transition: "opacity 0.2s ease",
            }}
            className="text-micro"
          >
            <ArrowLeft size={11} />
            Dashboard
          </Link>

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <p className="text-micro" style={{ marginBottom: "8px", opacity: 0.4 }}>Analytics</p>
              <h1 className="text-section-head" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <TrendingUp size={20} style={{ opacity: 0.5 }} />
                Coding Insights
              </h1>
              <p className="text-body" style={{ opacity: 0.35, marginTop: "6px", fontSize: "0.875rem" }}>
                Deep dive into your development patterns and productivity
              </p>
            </div>

            {/* Last Updated & Stale Data Warning */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
              {analytics?.calculatedAt && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", opacity: 0.3 }}>
                  <Clock size={11} />
                  <span className="text-micro">
                    Updated: {new Date(analytics.calculatedAt).toLocaleDateString('en-US', {
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
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <AlertTriangle size={11} style={{ color: "rgba(251,191,36,0.6)" }} />
                  <span className="text-micro" style={{ color: "rgba(251,191,36,0.5)" }}>
                    Data may be outdated. Sync from dashboard.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {hasData ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            {/* ============================================
                AI-Powered Insights Hero (TOP - Most Important)
                ============================================ */}
            <AIInsightsHero 
              analytics={{
                totalCommits: analytics.totalCommits,
                currentStreak: analytics.currentStreak,
                longestStreak: analytics.longestStreak,
                isActiveToday: analytics.isActiveToday,
                lastCommitDate: analytics.lastCommitDate,
              }}
            />

            {/* AI Stats Banner with Developer Persona */}
            <AIStatsBanner analytics={analytics} userId={user.id} persona={persona} />

            {/* Data Quality Indicator - shows if there are outliers */}
            {outlierCount > 0 && (
              <DataQualityIndicator
                outlierCount={outlierCount}
                unknownExtensionPercent={0}
                totalCommits={analytics.totalCommits}
              />
            )}

            {/* Repository Deep Dive - Full Width */}
            {repoStats && repoStats.length > 0 && (
              <RepoDeepDive repoStats={repoStats} />
            )}

            {/* Code Quality & Impact Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Code Impact Card */}
              <CodeImpactCard metrics={codeImpactMetrics} />
              
              {/* Code Quality Summary Card */}
              <div
                style={{
                  background: "rgba(240,240,250,0.02)",
                  border: "1px solid rgba(240,240,250,0.06)",
                  borderRadius: "var(--radius-sharp)",
                  padding: "20px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <BarChart3 size={14} style={{ opacity: 0.3 }} />
                  <div>
                    <p className="text-caption-bold" style={{ fontSize: "0.75rem" }}>Code Quality Summary</p>
                    <p className="text-micro" style={{ opacity: 0.3, marginTop: "2px" }}>Commit message analysis</p>
                  </div>
                </div>

                {commitQualityMetrics ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="text-micro" style={{ opacity: 0.4 }}>Quality Grade</span>
                      <span className="stat-value" style={{ fontSize: "1.5rem" }}>
                        {commitQualityMetrics.qualityGrade}
                      </span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "rgba(240,240,250,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                      <div style={{ background: "#000", padding: "12px 14px" }}>
                        <p className="text-micro" style={{ opacity: 0.3, marginBottom: "4px" }}>Conventional</p>
                        <p className="stat-value" style={{ fontSize: "1rem" }}>{commitQualityMetrics.conventionalCommitScore}%</p>
                      </div>
                      <div style={{ background: "#000", padding: "12px 14px" }}>
                        <p className="text-micro" style={{ opacity: 0.3, marginBottom: "4px" }}>Ticket Refs</p>
                        <p className="stat-value" style={{ fontSize: "1rem" }}>{commitQualityMetrics.hasTicketReferences}%</p>
                      </div>
                    </div>
                    {commitQualityMetrics.insights.length > 0 && (
                      <p className="text-micro" style={{ opacity: 0.3 }}>
                        {commitQualityMetrics.insights[0]}
                      </p>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "24px 0" }}>
                    <BarChart3 size={24} style={{ opacity: 0.1, margin: "0 auto 8px" }} />
                    <p className="text-micro" style={{ opacity: 0.25 }}>No quality data available</p>
                  </div>
                )}
              </div>
            </div>

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


      </div>
    </div>
  );
}

// ===========================================
// AI Stats Banner Component
// ===========================================

async function AIStatsBanner({ analytics, userId, persona }: { 
  analytics: any; 
  userId: string;
  persona: ReturnType<typeof detectPersona> | null;
}) {
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
      icon: <GitCommit className="w-5 h-5 text-[#f0f0fa]" />,
      color: 'cyan',
      sublabel: `across ${activeDaysCount} active days`,
      gradient: 'from-cyan-500/20 to-cyan-500/5',
      borderColor: 'border-cyan-500/30',
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Developer Persona Badge */}
      {persona && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            background: "rgba(240,240,250,0.02)",
            border: "1px solid rgba(240,240,250,0.06)",
            borderRadius: "var(--radius-sharp)",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ fontSize: "1.25rem" }}>{persona.primary.emoji}</div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span className="text-caption-bold" style={{ fontSize: "0.813rem" }}>
                  {persona.primary.name}
                </span>
                <span
                  className="text-micro"
                  style={{
                    padding: "2px 6px",
                    border: "1px solid rgba(240,240,250,0.1)",
                    borderRadius: "2px",
                    opacity: 0.5,
                  }}
                >
                  {persona.primary.rarity}
                </span>
              </div>
              <p className="text-micro" style={{ opacity: 0.3 }}>
                {persona.primary.description}
              </p>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="stat-value" style={{ fontSize: "1.25rem" }}>
              {persona.confidence}%
            </div>
            <div className="text-micro" style={{ opacity: 0.3 }}>match</div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "1px",
          background: "rgba(240,240,250,0.06)",
          border: "1px solid rgba(240,240,250,0.06)",
          borderRadius: "var(--radius-sharp)",
          overflow: "hidden",
        }}
        className="insights-stats-grid"
      >
        <style>{`.insights-stats-grid { grid-template-columns: repeat(2,1fr) !important; } @media(min-width:1024px){ .insights-stats-grid { grid-template-columns: repeat(4,1fr) !important; } }`}</style>
        {stats.map((stat, index) => (
          <div
            key={index}
            style={{
              background: "rgba(0,0,0,0.6)",
              padding: "20px",
              transition: "background 0.2s ease",
            }}
            
            
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", opacity: 0.3 }}>
              {stat.icon}
              <p className="text-micro">{stat.label}</p>
            </div>
            <p className="stat-value" style={{ fontSize: "1.5rem" }}>{stat.value}</p>
            {stat.sublabel && (
              <p className="text-micro" style={{ marginTop: "4px", opacity: 0.25 }}>{stat.sublabel}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ===========================================
// Empty State Component
// ===========================================

function EmptyState() {
  return (
    <div
      style={{
        background: "rgba(240,240,250,0.02)",
        border: "1px solid rgba(240,240,250,0.06)",
        borderRadius: "var(--radius-sharp)",
        padding: "64px 24px",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: "360px", margin: "0 auto" }}>
        <BarChart3 size={40} style={{ opacity: 0.1, margin: "0 auto 20px" }} />
        <h2 className="text-section-head" style={{ fontSize: "1.25rem", marginBottom: "12px" }}>
          No Insights Available Yet
        </h2>
        <p className="text-body" style={{ opacity: 0.35, marginBottom: "28px", fontSize: "0.875rem" }}>
          Sync your GitHub data to unlock comprehensive analytics and visualizations.
        </p>
        <Link href="/dashboard" className="btn-ghost btn-ghost-sm" style={{ display: "inline-flex" }}>
          <RefreshCw size={13} />
          Go to Dashboard to Sync
        </Link>
      </div>
    </div>
  );
}
