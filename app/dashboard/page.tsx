import { requireAuth } from "@/lib/auth-helpers";
import { 
  Github, 
  Activity, 
  Code, 
  GitBranch, 
  Star, 
  Settings,
  User,
  TrendingUp,
  Calendar,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { SyncButton } from "@/components/SyncButton";

/**
 * Dashboard Page
 * Protected route - requires authentication
 * Redesigned with improved layout and positioning
 */
export default async function DashboardPage() {
  // Require authentication - redirects to /login if not authenticated
  const session = await requireAuth();

  const { user } = session;

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
                    Here's an overview of your GitHub activity and insights
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
                icon={<Activity className="w-6 h-6" />}
                title="Total Activity"
                value="Coming Soon"
                trend="+12%"
                color="cyan"
              />
              <StatCard
                icon={<Code className="w-6 h-6" />}
                title="Repositories"
                value="Coming Soon"
                trend="+5%"
                color="blue"
              />
              <StatCard
                icon={<GitBranch className="w-6 h-6" />}
                title="Contributions"
                value="Coming Soon"
                trend="+23%"
                color="purple"
              />
              <StatCard
                icon={<Star className="w-6 h-6" />}
                title="Stars Earned"
                value="Coming Soon"
                trend="+8%"
                color="yellow"
              />
            </div>

            {/* Activity Overview */}
            <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl overflow-hidden backdrop-blur-sm">
              <div className="p-6 border-b border-slate-700/30">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                    Activity Overview
                  </h3>
                  <button className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                    View All
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-center h-48 text-slate-500">
                  <div className="text-center">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Activity data coming soon</p>
                    <p className="text-xs mt-1 text-slate-600">Connect your repositories to see insights</p>
                  </div>
                </div>
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
                  image: user.image,
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

// Stat Card Component
function StatCard({
  icon,
  title,
  value,
  trend,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  trend?: string;
  color: "cyan" | "blue" | "purple" | "yellow";
}) {
  const colorClasses = {
    cyan: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 text-cyan-400",
    blue: "from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-400",
    purple: "from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-400",
    yellow: "from-yellow-500/20 to-yellow-500/5 border-yellow-500/30 text-yellow-400",
  };

  return (
    <div
      className={`bg-linear-to-br ${colorClasses[color]} border rounded-xl p-5 backdrop-blur-sm hover:scale-105 transition-transform duration-300 group cursor-pointer`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="group-hover:scale-110 transition-transform">{icon}</div>
        {trend && (
          <span className="text-xs text-green-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-slate-400 text-sm mb-1">{title}</h3>
      <p className="text-2xl font-bold text-slate-200">{value}</p>
    </div>
  );
}

// Action Card Component
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
