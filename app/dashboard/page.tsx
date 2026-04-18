import { requireAuth } from "@/lib/auth-helpers";
import {
  Calendar,
  AlertCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import prisma from "@/lib/prisma";
import {
  NoDataEmptyState,
} from "@/components/ui/empty-states";

// Import sub-components
import { UserProfileCard } from "./components/UserProfileCard";
import { StatsGrid } from "./components/StatsGrid";
import { InsightsRow } from "./components/InsightsRow";
import { ActivityOverview } from "./components/ActivityOverview";
import { WeeklySummary } from "./components/WeeklySummary";
import { CommitQualityCard } from "./components/CommitQualityCard";


/**
 * Dashboard Page
 * Refactored to use sub-components according to development workflow.
 * Displays real analytics data from synced GitHub repositories.
 */
export default async function DashboardPage() {
  // Require authentication - redirects to /login if not authenticated
  const session = await requireAuth();
  const { user } = session;

  // Fetch complete analytics snapshot
  const analytics = await prisma.analyticsSnapshot.findUnique({
    where: { userId: user.id },
  });

  // Fetch recent sync job status
  const lastSync = await prisma.syncJob.findFirst({
    where: { userId: user.id },
    orderBy: { startedAt: "desc" },
  });

  // Data Validation & State Detection
  const hasSyncedData =
    analytics !== null &&
    (analytics.totalCommits > 0 || analytics.totalRepos > 0);

  const isSyncInProgress = lastSync?.status === "IN_PROGRESS";
  const isSyncFailed = lastSync?.status === "FAILED";
  const isSyncCompleted = lastSync?.status === "COMPLETED";

  const isPartialSync =
    lastSync?.processedRepos !== undefined &&
    lastSync?.totalRepos !== undefined &&
    lastSync.processedRepos > 0 &&
    lastSync.processedRepos < lastSync.totalRepos;

  // GitHub status for UserProfileCard
  const githubStatus = {
    isConnected: true,
    lastSync: lastSync?.completedAt?.toISOString() || null,
    provider: "github"
  };

  return (
    <div className="app-canvas">
      {/* Skip to main content link for keyboard users */}
      <a
        href="#main-content"
        className="skip-link"
      >
        Skip to main content
      </a>

      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "40px clamp(16px, 4vw, 48px)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "32px",
          }}
          className="dashboard-grid"
        >
          {/* Responsive grid via style tag */}
          <style>{`
            @media (min-width: 1024px) {
              .dashboard-grid {
                grid-template-columns: 280px 1fr !important;
              }
            }
          `}</style>

          {/* Step 1: User Profile Card */}
          <UserProfileCard
            session={session}
            githubStatus={githubStatus}
            lastSync={lastSync}
            analytics={analytics}
          />

          {/* Main Content Area */}
          <main
            id="main-content"
            style={{ display: "flex", flexDirection: "column", gap: "24px" }}
            role="main"
            aria-label="Dashboard overview"
          >
            {/* Welcome Header */}
            <div style={{ paddingBottom: "16px", borderBottom: "1px solid rgba(240,240,250,0.06)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <p className="text-micro" style={{ marginBottom: "8px" }}>Dashboard</p>
                  <h2
                    className="text-section-head"
                    style={{ fontSize: "clamp(1.25rem, 3vw, 1.75rem)" }}
                  >
                    Welcome back, {user.name?.split(" ")[0] || user.username}
                  </h2>
                  <p className="text-body" style={{ opacity: 0.45, marginTop: "6px", fontSize: "0.875rem" }}>
                    {hasSyncedData
                      ? "Overview of your GitHub activity and insights"
                      : "Sync your GitHub data to see your coding insights"}
                  </p>
                </div>
                <div className="hidden sm:flex items-center" style={{ gap: "8px", opacity: 0.35 }}>
                  <Calendar size={14} />
                  <span className="text-caption">
                    {new Date().toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* SYNC STATUS BANNERS */}
            {isSyncFailed && lastSync?.errorMessage && (
              <div
                role="alert"
                aria-live="assertive"
                style={{
                  padding: "16px 20px",
                  background: "rgba(252,165,165,0.05)",
                  border: "1px solid rgba(252,165,165,0.15)",
                  borderRadius: "var(--radius-sharp)",
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                }}
              >
                <AlertCircle size={16} style={{ color: "rgba(252,165,165,0.7)", flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <p className="text-caption-bold" style={{ color: "rgba(252,165,165,0.8)", marginBottom: "4px" }}>Sync Failed</p>
                  <p className="text-caption" style={{ color: "rgba(252,165,165,0.6)" }}>{lastSync.errorMessage}</p>
                  <p className="text-micro" style={{ marginTop: "8px" }}>
                    {hasSyncedData
                      ? "Showing last successful sync data. Try syncing again to update."
                      : "Use the Sync button in the sidebar to retry."}
                  </p>
                </div>
              </div>
            )}

            {isSyncInProgress && (
              <div
                role="status"
                aria-live="polite"
                style={{
                  padding: "16px 20px",
                  background: "rgba(240,240,250,0.03)",
                  border: "1px solid rgba(240,240,250,0.08)",
                  borderRadius: "var(--radius-sharp)",
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                }}
              >
                <Loader2 size={16} style={{ color: "var(--spectral-white)", opacity: 0.5, animation: "spin 1s linear infinite", flexShrink: 0 }} />
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <p className="text-caption-bold" style={{ opacity: 0.7 }}>Syncing GitHub data...</p>
                    {lastSync?.processedRepos !== undefined && lastSync?.totalRepos !== undefined && lastSync.totalRepos > 0 && (
                      <span className="text-micro">{lastSync.processedRepos}/{lastSync.totalRepos} repos</span>
                    )}
                  </div>
                  <div className="progress-bar-track">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: lastSync?.totalRepos && lastSync.totalRepos > 0
                          ? `${Math.round((lastSync.processedRepos || 0) / lastSync.totalRepos * 100)}%`
                          : '50%'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {isPartialSync && isSyncCompleted && (
              <div
                role="status"
                style={{
                  padding: "16px 20px",
                  background: "rgba(251,191,36,0.04)",
                  border: "1px solid rgba(251,191,36,0.12)",
                  borderRadius: "var(--radius-sharp)",
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                }}
              >
                <AlertTriangle size={16} style={{ color: "rgba(251,191,36,0.6)", flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <p className="text-caption-bold" style={{ color: "rgba(251,191,36,0.7)" }}>Partial Sync</p>
                    <span className="text-micro" style={{ color: "rgba(251,191,36,0.5)" }}>
                      {lastSync.processedRepos}/{lastSync.totalRepos} repos
                    </span>
                  </div>
                  <p className="text-caption" style={{ color: "rgba(251,191,36,0.5)" }}>
                    Some repositories couldn&apos;t be synced. Showing available data.
                  </p>
                </div>
              </div>
            )}

            {!hasSyncedData && !isSyncInProgress && (
              <NoDataEmptyState />
            )}

            {/* Weekly Summary Widget - At-a-glance view */}
            {hasSyncedData && (
              <WeeklySummary
                analytics={{
                  dailyCommits: analytics?.dailyCommits as Record<string, number> | undefined,
                  hourlyStats: analytics?.hourlyStats as Record<string, number> | undefined,
                  currentStreak: analytics?.currentStreak,
                  isActiveToday: analytics?.isActiveToday,
                  repoStats: (analytics?.repoStats as { name: string; commits: number }[]) || [],
                }}
              />
            )}

            {/* Stats Grid with Comparative Analytics */}
            <StatsGrid analytics={analytics} />

            {/* Insights Row */}
            {hasSyncedData && <InsightsRow analytics={analytics} />}

            {/* Commit Quality Analysis Card */}
            {hasSyncedData && (
              <CommitQualityCard
                metrics={
                  (analytics as Record<string, unknown> | null)?.commitQualityMetrics as
                  Parameters<typeof CommitQualityCard>[0]['metrics'] | null
                }
              />
            )}

            {/* Activity Overview */}
            <ActivityOverview analytics={analytics} hasSyncedData={hasSyncedData} />

          </main>
        </div>
      </div>
    </div>
  );
}
