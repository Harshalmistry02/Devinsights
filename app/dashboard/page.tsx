import { requireAuth } from "@/lib/auth-helpers";
import {
  Calendar,
  AlertCircle,
  Loader2,
  AlertTriangle,
  TrendingUp,
  User as UserIcon,
  Settings as SettingsIcon,
  Code,
} from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import {
  NoDataEmptyState,
} from "@/components/ui/empty-states";

// Import sub-components
import { UserProfileCard } from "./components/UserProfileCard";
import { StatsGrid } from "./components/StatsGrid";
import { InsightsRow } from "./components/InsightsRow";
import { ActivityOverview } from "./components/ActivityOverview";
import { QuickActionsPanel } from "@/components/dashboard/QuickActionsPanel";


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
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 pt-20 sm:pt-24">
      {/* Skip to main content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-24 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-cyan-500 focus:text-white focus:rounded-lg focus:outline-none"
      >
        Skip to main content
      </a>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
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
            className="lg:col-span-8 xl:col-span-9 space-y-4 sm:space-y-6"
            role="main"
            aria-label="Dashboard overview"
          >
            {/* Welcome Header */}
            <div className="bg-linear-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-slate-700/30 rounded-xl p-4 sm:p-6 backdrop-blur-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-200 mb-1 sm:mb-2">
                    Welcome back, {user.name?.split(" ")[0] || user.username}!
                    👋
                  </h2>
                  <p className="text-sm sm:text-base text-slate-400">
                    {hasSyncedData
                      ? "Here's an overview of your GitHub activity and insights"
                      : "Sync your GitHub data to see your coding insights"}
                  </p>
                </div>
                <div className="hidden sm:block">
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date().toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SYNC STATUS BANNERS */}
            {isSyncFailed && lastSync?.errorMessage && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 backdrop-blur-sm animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-red-400 mb-1">Sync Failed</h4>
                    <p className="text-sm text-red-300/80">{lastSync.errorMessage}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      {hasSyncedData 
                        ? "Showing last successful sync data. Try syncing again to update."
                        : "Use the Sync button in the sidebar to retry."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isSyncInProgress && (
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-cyan-400 font-medium">Syncing GitHub data...</p>
                      {lastSync?.processedRepos !== undefined && lastSync?.totalRepos !== undefined && lastSync.totalRepos > 0 && (
                        <span className="text-xs text-cyan-400/70">
                          {lastSync.processedRepos}/{lastSync.totalRepos} repos
                        </span>
                      )}
                    </div>
                    <div className="h-1.5 bg-slate-800/80 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-cyan-500 via-blue-500 to-cyan-500 rounded-full animate-pulse"
                        style={{ 
                          width: lastSync?.totalRepos && lastSync.totalRepos > 0
                            ? `${Math.round((lastSync.processedRepos || 0) / lastSync.totalRepos * 100)}%`
                            : '50%' 
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isPartialSync && isSyncCompleted && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 backdrop-blur-sm animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-amber-400">Partial Sync</h4>
                      <span className="px-2 py-0.5 text-xs bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-400">
                        {lastSync.processedRepos}/{lastSync.totalRepos} repos
                      </span>
                    </div>
                    <p className="text-sm text-amber-300/80">
                      Some repositories couldn't be synced. Showing available data.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!hasSyncedData && !isSyncInProgress && (
              <NoDataEmptyState />
            )}

            {/* Step 2: Stats Grid */}
            <StatsGrid analytics={analytics} />

            {/* Step 3: Insights Row */}
            {hasSyncedData && <InsightsRow analytics={analytics} />}

            {/* Activity Overview */}
            <ActivityOverview analytics={analytics} hasSyncedData={hasSyncedData} />

            {/* Quick Actions Panel */}
            <QuickActionsPanel 
              actions={[
                {
                  title: "View Profile",
                  href: "/profile",
                  icon: <UserIcon className="w-5 h-5 text-cyan-400" />,
                  tooltip: "View and edit your profile settings"
                },
                {
                  title: "Settings",
                  href: "/settings",
                  icon: <SettingsIcon className="w-5 h-5 text-blue-400" />,
                  tooltip: "Manage application settings"
                },
                {
                  title: "Insights",
                  href: "/insights",
                  icon: <TrendingUp className="w-5 h-5 text-purple-400" />,
                  tooltip: "View AI-generated insights",
                  disabled: !hasSyncedData
                },
                {
                  title: "Repositories",
                  href: "/repositories",
                  icon: <Code className="w-5 h-5 text-pink-400" />,
                  tooltip: "Browse your synced repositories"
                }
              ]}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
