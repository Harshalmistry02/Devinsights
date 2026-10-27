import { requireAuth } from "@/lib/auth-helpers";
import { Calendar, Loader2 } from "lucide-react";
import prisma from "@/lib/prisma";
import { NoDataEmptyState } from "@/components/ui/empty-states";
import { Badge, Chip } from "@/components/ui/badge";
import { InlineNotice } from "@/components/ui/inline-notice";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { SpaceBackground } from "@/components/ui/space-background";

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

  const githubAccount = await prisma.account.findFirst({
    where: {
      userId: user.id,
      provider: "github",
    },
    select: {
      provider: true,
      updatedAt: true,
    },
  });

  // GitHub status for UserProfileCard
  const githubStatus = {
    isConnected: !!githubAccount,
    lastSync: lastSync?.completedAt?.toISOString() || null,
    provider: githubAccount?.provider || null,
  };

  const firstName = user.name?.split(" ")[0] || user.username || "developer";
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const syncProgress =
    lastSync?.totalRepos && lastSync.totalRepos > 0
      ? Math.round(
          ((lastSync.processedRepos || 0) / lastSync.totalRepos) * 100
        )
      : 50;

  const hasRepoProgress =
    lastSync?.processedRepos !== undefined &&
    lastSync?.totalRepos !== undefined &&
    lastSync.totalRepos > 0;

  return (
    <>
      <SpaceBackground variant="app" />

      <PageShell>
        <main
          id="main-content"
          role="main"
          aria-label="Dashboard overview"
        >
          <PageHeader
            eyebrow="Dashboard"
            title={`Welcome back, ${firstName}`}
            subtitle={
              hasSyncedData
                ? "An overview of your GitHub activity and the patterns behind it."
                : "Sync your GitHub data to see your coding insights."
            }
            actions={
              <Chip icon={<Calendar />} className="text-caption">
                <time dateTime={today.toISOString().slice(0, 10)}>
                  {formattedDate}
                </time>
              </Chip>
            }
            className="mb-8 sm:mb-10"
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
            <UserProfileCard
              session={session}
              githubStatus={githubStatus}
              lastSync={lastSync}
              analytics={analytics}
            />

            <div className="flex min-w-0 flex-col gap-6">
              {isSyncFailed && lastSync?.errorMessage && (
                <InlineNotice
                  variant="error"
                  role="alert"
                  title="Sync failed"
                >
                  <p>{lastSync.errorMessage}</p>
                  <p className="mt-2">
                    {hasSyncedData
                      ? "Showing data from the last successful sync. Try syncing again to update it."
                      : "Use the sync button in your profile panel to retry."}
                  </p>
                </InlineNotice>
              )}

              {isSyncInProgress && (
                <InlineNotice
                  variant="info"
                  role="status"
                  icon={<Loader2 className="animate-spin" />}
                  title={
                    <span className="flex flex-wrap items-center justify-between gap-2">
                      <span>Syncing GitHub data…</span>
                      {hasRepoProgress ? (
                        <Badge variant="neutral" size="sm" mono>
                          {lastSync.processedRepos}/{lastSync.totalRepos} repos
                        </Badge>
                      ) : null}
                    </span>
                  }
                >
                  <div
                    className="progress-bar-track"
                    role="progressbar"
                    aria-label="Sync progress"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={hasRepoProgress ? syncProgress : undefined}
                  >
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${syncProgress}%` }}
                    />
                  </div>
                  <p className="mt-2">
                    {hasRepoProgress
                      ? `${syncProgress}% of repositories processed`
                      : "Preparing repositories…"}
                  </p>
                </InlineNotice>
              )}

              {isPartialSync && isSyncCompleted && (
                <InlineNotice
                  variant="warning"
                  role="status"
                  title={
                    <span className="flex flex-wrap items-center gap-2">
                      Partial sync
                      <Badge variant="warning" size="sm" mono>
                        {lastSync.processedRepos}/{lastSync.totalRepos} repos
                      </Badge>
                    </span>
                  }
                >
                  Some repositories couldn&apos;t be synced. Showing the
                  available data.
                </InlineNotice>
              )}

              {!hasSyncedData && !isSyncInProgress && <NoDataEmptyState />}

              {hasSyncedData && (
                <WeeklySummary
                  analytics={{
                    dailyCommits: analytics?.dailyCommits as
                      | Record<string, number>
                      | undefined,
                    hourlyStats: analytics?.hourlyStats as
                      | Record<string, number>
                      | undefined,
                    currentStreak: analytics?.currentStreak,
                    isActiveToday: analytics?.isActiveToday,
                    repoStats:
                      (analytics?.repoStats as {
                        name: string;
                        commits: number;
                      }[]) || [],
                  }}
                />
              )}

              <StatsGrid analytics={analytics} />

              {hasSyncedData && <InsightsRow analytics={analytics} />}

              {hasSyncedData && (
                <CommitQualityCard
                  metrics={
                    (analytics as Record<string, unknown> | null)
                      ?.commitQualityMetrics as Parameters<
                      typeof CommitQualityCard
                    >[0]["metrics"] | null
                  }
                />
              )}

              <ActivityOverview
                analytics={analytics}
                hasSyncedData={hasSyncedData}
              />
            </div>
          </div>
        </main>
      </PageShell>
    </>
  );
}
