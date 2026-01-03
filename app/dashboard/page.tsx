import { requireAuth } from "@/lib/auth-helpers";
import { LogoutButton } from "@/components/LogoutButton";
import { Github, Activity, Code, GitBranch, Star } from "lucide-react";
import Link from "next/link";

/**
 * Dashboard Page
 * Protected route - requires authentication
 */
export default async function DashboardPage() {
  // Require authentication - redirects to /login if not authenticated
  const session = await requireAuth();

  const { user } = session;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
              Dashboard
            </h1>
            <p className="text-slate-400">
              Welcome back, {user.name || user.username}!
            </p>
          </div>
          <LogoutButton />
        </header>

        {/* User Profile Card */}
        <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-6 mb-8 backdrop-blur-sm">
          <div className="flex items-start gap-6">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name || "User"}
                className="w-24 h-24 rounded-full border-2 border-cyan-500/30"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500/30 flex items-center justify-center">
                <Github className="w-12 h-12 text-cyan-400" />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-200 mb-1">
                {user.name || user.username}
              </h2>
              {user.username && (
                <a
                  href={`https://github.com/${user.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 mb-2"
                >
                  <Github className="w-4 h-4" />
                  <span>@{user.username}</span>
                </a>
              )}
              {user.email && (
                <p className="text-slate-400 text-sm">{user.email}</p>
              )}
              <div className="mt-4 flex items-center gap-2">
                <span className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-xs text-green-400 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Authenticated
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Activity className="w-6 h-6" />}
            title="Total Activity"
            value="Coming Soon"
            color="cyan"
          />
          <StatCard
            icon={<Code className="w-6 h-6" />}
            title="Repositories"
            value="Coming Soon"
            color="blue"
          />
          <StatCard
            icon={<GitBranch className="w-6 h-6" />}
            title="Contributions"
            value="Coming Soon"
            color="purple"
          />
          <StatCard
            icon={<Star className="w-6 h-6" />}
            title="Stars Earned"
            value="Coming Soon"
            color="yellow"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-6 backdrop-blur-sm">
          <h3 className="text-xl font-semibold text-slate-200 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ActionCard
              title="View Profile"
              description="See your complete GitHub profile"
              href="/profile"
            />
            <ActionCard
              title="Settings"
              description="Manage your account settings"
              href="/settings"
            />
          </div>
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
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: "cyan" | "blue" | "purple" | "yellow";
}) {
  const colorClasses = {
    cyan: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 text-cyan-400",
    blue: "from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-400",
    purple:
      "from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-400",
    yellow:
      "from-yellow-500/20 to-yellow-500/5 border-yellow-500/30 text-yellow-400",
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-6 backdrop-blur-sm`}
    >
      <div className="mb-3">{icon}</div>
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
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block p-4 bg-slate-800/30 border border-slate-700/30 rounded-lg hover:bg-slate-800/50 hover:border-cyan-500/30 transition-all duration-300 group"
    >
      <h4 className="text-slate-200 font-semibold mb-1 group-hover:text-cyan-400 transition-colors">
        {title}
      </h4>
      <p className="text-slate-400 text-sm">{description}</p>
    </Link>
  );
}
