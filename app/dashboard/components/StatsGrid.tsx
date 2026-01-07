import { Code, Activity, Flame, Star } from "lucide-react";

interface StatsGridProps {
  analytics: any;
}

export function StatsGrid({ analytics }: StatsGridProps) {
  const hasSyncedData = analytics !== null && (analytics.totalCommits > 0 || analytics.totalRepos > 0);

  return (
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
        subtitle={
          analytics?.currentStreak
            ? `${analytics.currentStreak} day${
                analytics.currentStreak !== 1 ? "s" : ""
              }`
            : "days"
        }
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
  );
}

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
      role="region"
      aria-label={`${title} statistics`}
      className={`bg-linear-to-br ${colorClasses[color]} border rounded-xl p-3 sm:p-5 backdrop-blur-sm hover:scale-105 transition-transform duration-300 group relative overflow-hidden min-h-[88px] focus-within:ring-2 focus-within:ring-cyan-400 focus-within:ring-offset-2 focus-within:ring-offset-slate-900`}
    >
      {highlight && (
        <div className="absolute top-2 right-2" aria-label="Active indicator">
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
          </span>
        </div>
      )}
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <div className="group-hover:scale-110 transition-transform [&>svg]:w-5 [&>svg]:h-5 sm:[&>svg]:w-6 sm:[&>svg]:h-6" aria-hidden="true">
          {icon}
        </div>
      </div>
      <h3 className="text-slate-400 text-xs sm:text-sm mb-0.5 sm:mb-1">{title}</h3>
      <p className="text-xl sm:text-2xl font-bold text-slate-200" aria-live="polite">
        {value}
      </p>
      {subtitle && <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">{subtitle}</p>}
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}
