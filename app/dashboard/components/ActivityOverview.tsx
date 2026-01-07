import { TrendingUp } from "lucide-react";
import Link from "next/link";
import { ActivityEmptyState } from "@/components/ui/empty-states";

interface ActivityOverviewProps {
  analytics: any;
  hasSyncedData: boolean;
}

export function ActivityOverview({ analytics, hasSyncedData }: ActivityOverviewProps) {
  return (
    <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl overflow-hidden backdrop-blur-sm mt-6">
      <div className="p-4 sm:p-6 border-b border-slate-700/30">
        <div className="flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-semibold text-slate-200 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
            Activity Overview
          </h3>
          {hasSyncedData && (
            <Link
              href="/insights"
              className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 rounded px-1"
              aria-label="View detailed activity insights"
            >
              View Details →
            </Link>
          )}
        </div>
      </div>
      <div className="p-4 sm:p-6">
        {hasSyncedData ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            <MiniStat
              label="Lines Added"
              value={formatNumber(analytics?.totalAdditions || 0)}
              color="green"
            />
            <MiniStat
              label="Lines Deleted"
              value={formatNumber(analytics?.totalDeletions || 0)}
              color="red"
            />
            <MiniStat
              label="Total Forks"
              value={formatNumber(analytics?.totalForks || 0)}
              color="blue"
            />
            <MiniStat
              label="Avg/Day"
              value={analytics?.averageCommitsPerDay?.toFixed(1) || "0"}
              color="purple"
            />
          </div>
        ) : (
          <ActivityEmptyState />
        )}
      </div>
    </div>
  );
}

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
    green: "text-green-400 bg-green-500/10",
    red: "text-red-400 bg-red-500/10",
    blue: "text-blue-400 bg-blue-500/10",
    purple: "text-purple-400 bg-purple-500/10",
  };

  return (
    <div className="p-3 sm:p-4 rounded-xl bg-slate-800/20 border border-slate-700/20">
      <p className="text-[10px] sm:text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">
        {label}
      </p>
      <p className={`text-base sm:text-lg font-bold ${colorClasses[color]}`}>
        {value}
      </p>
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
