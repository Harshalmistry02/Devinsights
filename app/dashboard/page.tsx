import { requireAuth } from "@/lib/auth-helpers";
import { 
  Github, 
  Activity, 
  Code, 
  Star, 
  Settings,
  User,
  TrendingUp,
  Calendar,
  ExternalLink,
  Flame,
  Zap,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { SyncButton } from "@/components/SyncButton";
import prisma from "@/lib/prisma";

/**
 * Dashboard Page
 * Protected route - requires authentication
 * Now displays real analytics data from synced GitHub repositories
 */
export default async function DashboardPage() {
  // Require authentication - redirects to /login if not authenticated
  const session = await requireAuth();
  const { user } = session;

  // Fetch analytics snapshot (if exists)
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
    }
  });

  // Fetch recent sync job status
  const lastSync = await prisma.syncJob.findFirst({
    where: { userId: user.id },
    orderBy: { startedAt: 'desc' },
    select: {
      status: true,
      completedAt: true,
      totalRepos: true,
      totalCommits: true,
    }
  });

  // Parse top languages from JSON
  const topLanguages = (analytics?.topLanguages as Array<{ language: string; count: number; percentage: number }>) || [];

  // Check if user has synced data
  const hasSyncedData = analytics !== null && analytics.totalCommits > 0;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 pt-20 sm:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - User Profile */}
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl overflow-hidden backdrop-blur-sm sticky top-24">
              {/* Profile Header with Gradient */}
              <div className="h-24 bg-linear-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 relative">
                <div className="absolute inset-0 bg-linear-to-b from-transparent to-slate-900/50" />
              </div>
              
              {/* Avatar - Overlapping the gradient */}
              <div className="px-6 -mt-12 relative">
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt={user.name || "User avatar"}
                    className="w-24 h-24 rounded-full border-4 border-slate-900 shadow-xl ring-2 ring-cyan-500/30"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-linear-to-br from-cyan-500/30 to-blue-500/30 border-4 border-slate-900 flex items-center justify-center shadow-xl ring-2 ring-cyan-500/30">
                    <Github className="w-12 h-12 text-cyan-400" />
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="px-6 pt-4 pb-6">
                <h2 className="text-xl font-bold text-slate-200 mb-1">
                  {user.name || user.username || "Anonymous User"}
                </h2>
                {user.username && (
                  <a
                    href={`https://github.com/${user.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 transition-colors inline-flex items-center gap-1.5 text-sm mb-3 group"
                  >
                    <Github className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    <span>@{user.username}</span>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                )}
                {user.email && (
                  <p className="text-slate-400 text-sm mb-4 truncate" title={user.email}>
                    {user.email}
                  </p>
                )}
                
                {/* Status Badge */}
                <div className="flex items-center gap-2 mb-6">
                  <span className="px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full text-xs text-green-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    Authenticated
                  </span>
                  {analytics?.isActiveToday && (
                    <span className="px-3 py-1.5 bg-orange-500/10 border border-orange-500/30 rounded-full text-xs text-orange-400 flex items-center gap-1.5">
                      <Flame className="w-3 h-3" />
                      Active Today
                    </span>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="space-y-2">
                  <Link
                    href="/profile"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300 text-cyan-400 hover:text-cyan-300 text-sm font-medium group"
                  >
                    <User className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    View Full Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800/50 border border-slate-700/30 rounded-lg hover:bg-slate-800/80 hover:border-slate-600/50 transition-all duration-300 text-slate-300 hover:text-slate-200 text-sm font-medium group"
                  >
                    <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                    Settings
                  </Link>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-700/30 my-4" />

                {/* Data Sync Section */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Data Sync
                  </h4>
                  <SyncButton />
                  {lastSync?.completedAt && (
                    <p className="text-xs text-slate-500 text-center">
                      Last synced: {new Date(lastSync.completedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-6">
            {/* Welcome Header */}
            <div className="bg-linear-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-slate-700/30 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-200 mb-2">
                    Welcome back, {user.name?.split(' ')[0] || user.username}! 👋
                  </h2>
                  <p className="text-slate-400">
                    {hasSyncedData 
                      ? "Here's an overview of your GitHub activity and insights"
                      : "Sync your GitHub data to see your coding insights"
                    }
                  </p>
                </div>
                <div className="hidden sm:block">
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date().toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard
                icon={<Code className="w-6 h-6" />}
                title="Repositories"
                value={analytics?.totalRepos?.toString() || "0"}
                subtitle={hasSyncedData ? "synced repos" : "sync to see"}
                color="blue"
              />
              <StatCard
                icon={<Activity className="w-6 h-6" />}
                title="Total Commits"
                value={formatNumber(analytics?.totalCommits || 0)}
                subtitle={hasSyncedData ? "all time" : "sync to see"}
                color="cyan"
              />
              <StatCard
                icon={<Flame className="w-6 h-6" />}
                title="Current Streak"
                value={analytics?.currentStreak?.toString() || "0"}
                subtitle={analytics?.currentStreak ? `${analytics.currentStreak} day${analytics.currentStreak !== 1 ? 's' : ''}` : "days"}
                color="orange"
                highlight={analytics?.isActiveToday}
              />
              <StatCard
                icon={<Star className="w-6 h-6" />}
                title="Stars Earned"
                value={formatNumber(analytics?.totalStars || 0)}
                subtitle="across repos"
                color="yellow"
              />
            </div>

            {/* Coding Insights Row */}
            {hasSyncedData && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InsightCard
                  icon={<TrendingUp className="w-5 h-5" />}
                  title="Best Day"
                  value={analytics?.mostProductiveDay || "N/A"}
                  description="Most productive day"
                  color="purple"
                />
                <InsightCard
                  icon={<Clock className="w-5 h-5" />}
                  title="Peak Hour"
                  value={formatHour(analytics?.mostProductiveHour)}
                  description="Most active time"
                  color="blue"
                />
                <InsightCard
                  icon={<Zap className="w-5 h-5" />}
                  title="Longest Streak"
                  value={`${analytics?.longestStreak || 0} days`}
                  description="Personal record"
                  color="orange"
                />
              </div>
            )}

            {/* Language Distribution */}
            {hasSyncedData && topLanguages.length > 0 && (
              <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                  <Code className="w-5 h-5 text-cyan-400" />
                  Top Languages
                </h3>
                <div className="space-y-3">
                  {topLanguages.slice(0, 5).map((lang, index) => (
                    <LanguageBar
                      key={lang.language}
                      language={lang.language}
                      percentage={lang.percentage}
                      count={lang.count}
                      rank={index + 1}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Activity Overview / Empty State */}
            <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl overflow-hidden backdrop-blur-sm">
              <div className="p-6 border-b border-slate-700/30">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                    Activity Overview
                  </h3>
                  {hasSyncedData && (
                    <Link 
                      href="/insights"
                      className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      View Details →
                    </Link>
                  )}
                </div>
              </div>
              <div className="p-6">
                {hasSyncedData ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MiniStat label="Lines Added" value={formatNumber(analytics?.totalAdditions || 0)} color="green" />
                    <MiniStat label="Lines Deleted" value={formatNumber(analytics?.totalDeletions || 0)} color="red" />
                    <MiniStat label="Total Forks" value={formatNumber(analytics?.totalForks || 0)} color="blue" />
                    <MiniStat label="Avg/Day" value={analytics?.averageCommitsPerDay?.toFixed(1) || "0"} color="purple" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48 text-slate-500">
                    <div className="text-center">
                      <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No activity data yet</p>
                      <p className="text-xs mt-1 text-slate-600">Use the "Sync GitHub Data" button to get started</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-slate-200 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ActionCard
                  title="View Profile"
                  description="See your complete GitHub profile and account details"
                  href="/profile"
                  icon={<User className="w-5 h-5" />}
                />
                <ActionCard
                  title="Settings"
                  description="Manage your account settings and preferences"
                  href="/settings"
                  icon={<Settings className="w-5 h-5" />}
                />
                <ActionCard
                  title="Insights"
                  description="Explore detailed analytics and insights"
                  href="/insights"
                  icon={<TrendingUp className="w-5 h-5" />}
                />
                <ActionCard
                  title="Repositories"
                  description="Browse and manage your repositories"
                  href="/repositories"
                  icon={<Code className="w-5 h-5" />}
                />
              </div>
            </div>
          </main>
        </div>

        {/* Debug Info (development only) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 bg-slate-900/50 border border-yellow-500/30 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center gap-2">
              <span>🔍</span> Debug Info
            </h3>
            <pre className="text-xs text-slate-400 overflow-auto bg-slate-950/50 p-4 rounded-lg border border-slate-700/30">
              {JSON.stringify(
                {
                  userId: user.id,
                  name: user.name,
                  email: user.email,
                  username: user.username,
                  hasSyncedData,
                  analytics: analytics ? {
                    totalRepos: analytics.totalRepos,
                    totalCommits: analytics.totalCommits,
                    currentStreak: analytics.currentStreak,
                    calculatedAt: analytics.calculatedAt,
                  } : null,
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
// Helper Functions
// ===========================================

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

function formatHour(hour: number | null | undefined): string {
  if (hour === null || hour === undefined) return 'N/A';
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:00 ${period}`;
}

// ===========================================
// Component: StatCard
// ===========================================

function StatCard({
  icon,
  title,
  value,
  subtitle,
  color,
  highlight = false,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle?: string;
  color: "cyan" | "blue" | "purple" | "yellow" | "orange";
  highlight?: boolean;
}) {
  const colorClasses = {
    cyan: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 text-cyan-400",
    blue: "from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-400",
    purple: "from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-400",
    yellow: "from-yellow-500/20 to-yellow-500/5 border-yellow-500/30 text-yellow-400",
    orange: "from-orange-500/20 to-orange-500/5 border-orange-500/30 text-orange-400",
  };

  return (
    <div
      className={`bg-linear-to-br ${colorClasses[color]} border rounded-xl p-5 backdrop-blur-sm hover:scale-105 transition-transform duration-300 group cursor-pointer relative overflow-hidden`}
    >
      {highlight && (
        <div className="absolute top-2 right-2">
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
          </span>
        </div>
      )}
      <div className="flex items-start justify-between mb-3">
        <div className="group-hover:scale-110 transition-transform">{icon}</div>
      </div>
      <h3 className="text-slate-400 text-sm mb-1">{title}</h3>
      <p className="text-2xl font-bold text-slate-200">{value}</p>
      {subtitle && (
        <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
}

// ===========================================
// Component: InsightCard
// ===========================================

function InsightCard({
  icon,
  title,
  value,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
  color: "cyan" | "blue" | "purple" | "orange";
}) {
  const colorClasses = {
    cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    orange: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  };

  return (
    <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg border ${colorClasses[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-slate-500">{title}</p>
          <p className="text-lg font-semibold text-slate-200">{value}</p>
          <p className="text-xs text-slate-400">{description}</p>
        </div>
      </div>
    </div>
  );
}

// ===========================================
// Component: LanguageBar
// ===========================================

function LanguageBar({
  language,
  percentage,
  count,
  rank,
}: {
  language: string;
  percentage: number;
  count: number;
  rank: number;
}) {
  const colors = [
    'from-cyan-500 to-cyan-400',
    'from-blue-500 to-blue-400',
    'from-purple-500 to-purple-400',
    'from-pink-500 to-pink-400',
    'from-orange-500 to-orange-400',
  ];

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-300 font-medium">{language}</span>
        <span className="text-slate-500">{percentage}% ({count} commits)</span>
      </div>
      <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
        <div
          className={`h-full bg-linear-to-r ${colors[rank - 1] || colors[0]} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ===========================================
// Component: MiniStat
// ===========================================

function MiniStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "green" | "red" | "blue" | "purple";
}) {
  const colorClasses = {
    green: "text-green-400",
    red: "text-red-400",
    blue: "text-blue-400",
    purple: "text-purple-400",
  };

  return (
    <div className="text-center p-3 bg-slate-800/30 rounded-lg">
      <p className={`text-xl font-bold ${colorClasses[color]}`}>{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

// ===========================================
// Component: ActionCard
// ===========================================

function ActionCard({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block p-5 bg-slate-800/30 border border-slate-700/30 rounded-xl hover:bg-slate-800/50 hover:border-cyan-500/30 transition-all duration-300 group"
    >
      <div className="flex items-start gap-4">
        <div className="p-2.5 bg-slate-900/50 rounded-lg border border-slate-700/30 text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/30 transition-all duration-300">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-slate-200 font-semibold mb-1 group-hover:text-cyan-400 transition-colors">
            {title}
          </h4>
          <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </Link>
  );
}
