'use client';

import { Code, Activity, Flame, Star, RefreshCw } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  calculateComparativePeriod,
  formatChangePercent,
  formatChange,
  getTrendIndicator,
  type PeriodMetrics,
} from "@/lib/analytics/comparison-calculator";

interface StatsGridProps {
  analytics: any;
  previousAnalytics?: any; // Optional: previous period snapshot
}

/**
 * Enhanced Stats Grid with Comparative Period Analytics
 * Shows current metrics with trends compared to previous period
 */
export function StatsGrid({ analytics: initialAnalytics, previousAnalytics }: StatsGridProps) {
  const [analytics, setAnalytics] = useState(initialAnalytics);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const hasSyncedData = analytics !== null && (analytics.totalCommits > 0 || analytics.totalRepos > 0);

  // Calculate comparative metrics
  const comparativePeriod = useMemo(() => {
    return calculateComparativePeriod(
      analytics?.dailyCommits,
      30,
      analytics?.currentStreak || 0,
      previousAnalytics?.currentStreak || 0
    );
  }, [analytics, previousAnalytics]);

  const refreshStats = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/analytics?refresh=true');
      if (!response.ok) {
        throw new Error('Failed to refresh stats');
      }
      const data = await response.json();
      setAnalytics(data.data);
      toast.success('Statistics refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh stats:', error);
      toast.error('Failed to refresh statistics');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-200">Statistics</h3>
        <button
          onClick={refreshStats}
          disabled={isRefreshing}
          className={cn(
            "p-2 rounded-lg transition-colors",
            "hover:bg-slate-800/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400",
            isRefreshing && "cursor-wait"
          )}
          title="Refresh statistics"
          aria-label="Refresh statistics"
        >
          <RefreshCw className={cn("w-4 h-4 text-slate-400", isRefreshing && "animate-spin")} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {isRefreshing ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            {/* Repositories Card */}
            <StatCard
              icon={<Code className="w-6 h-6" />}
              title="Repositories"
              value={analytics?.totalRepos?.toString() || "0"}
              subtitle={hasSyncedData ? "synced repos" : "sync to see"}
              color="blue"
              metrics={null} // No comparative data for repos
            />

            {/* Total Commits Card with Trend */}
            <StatCard
              icon={<Activity className="w-6 h-6" />}
              title="Total Commits"
              value={formatNumber(analytics?.totalCommits || 0)}
              subtitle={hasSyncedData ? "all time" : "sync to see"}
              color="cyan"
              metrics={comparativePeriod.totalCommits}
              period="30d"
            />

            {/* Current Streak Card with Trend */}
            <StatCard
              icon={<Flame className="w-6 h-6" />}
              title="Current Streak"
              value={analytics?.currentStreak?.toString() || "0"}
              subtitle={
                analytics?.currentStreak
                  ? `${analytics.currentStreak} day${analytics.currentStreak !== 1 ? "s" : ""}`
                  : "days"
              }
              color="orange"
              highlight={analytics?.isActiveToday}
              metrics={comparativePeriod.streak}
              period="30d"
            />

            {/* Stars Card */}
            <StatCard
              icon={<Star className="w-6 h-6" />}
              title="Stars Earned"
              value={formatNumber(analytics?.totalStars || 0)}
              subtitle="across repos"
              color="yellow"
              metrics={null}
            />
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Enhanced Stat Card Component with Trend Indicator
 */
interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle?: string;
  color: "cyan" | "blue" | "purple" | "yellow" | "orange";
  highlight?: boolean;
  metrics?: PeriodMetrics | null;
  period?: "7d" | "30d" | "90d";
}

function StatCard({
  icon,
  title,
  value,
  subtitle,
  color,
  highlight = false,
  metrics,
  period = "30d",
}: StatCardProps) {
  const colorClasses = {
    cyan: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 text-cyan-400",
    blue: "from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-400",
    purple: "from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-400",
    yellow: "from-yellow-500/20 to-yellow-500/5 border-yellow-500/30 text-yellow-400",
    orange: "from-orange-500/20 to-orange-500/5 border-orange-500/30 text-orange-400",
  };

  const trendIndicator = metrics ? getTrendIndicator(metrics.trend, metrics.isImprovement) : null;

  return (
    <div
      role="region"
      aria-label={`${title} statistics`}
      className={`bg-linear-to-br ${colorClasses[color]} border rounded-xl p-3 sm:p-5 backdrop-blur-sm hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden min-h-[120px] focus-within:ring-2 focus-within:ring-cyan-400 focus-within:ring-offset-2 focus-within:ring-offset-slate-900`}
    >
      {/* Subtle glow effect for cards with trends */}
      {metrics && metrics.trend !== 'stable' && (
        <div 
          className={cn(
            "absolute inset-0 opacity-10 blur-2xl transition-opacity duration-500",
            metrics.isImprovement ? "bg-emerald-500" : "bg-rose-500"
          )}
          aria-hidden="true"
        />
      )}

      {/* Active indicator */}
      {highlight && (
        <div className="absolute top-2 right-2" aria-label="Active indicator">
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
          </span>
        </div>
      )}

      {/* Icon and Title */}
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <div className="group-hover:scale-110 transition-transform [&>svg]:w-5 [&>svg]:h-5 sm:[&>svg]:w-6 sm:[&>svg]:h-6" aria-hidden="true">
          {icon}
        </div>
        
        {/* Trend badge in top right */}
        {metrics && metrics.trend !== 'stable' && (
          <div 
            className={cn(
              "flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium backdrop-blur-sm",
              metrics.isImprovement 
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
            )}
            aria-label={trendIndicator?.label}
          >
            <span className="text-xs">{trendIndicator?.emoji}</span>
            <span className="hidden sm:inline">{formatChangePercent(metrics.changePercent)}</span>
          </div>
        )}
      </div>

      <h3 className="text-slate-400 text-xs sm:text-sm mb-0.5 sm:mb-1">{title}</h3>

      {/* Main Value */}
      <p className="text-xl sm:text-2xl font-bold text-slate-200 mb-1" aria-live="polite">
        {value}
      </p>

      {/* Subtitle */}
      {subtitle && <p className="text-[10px] sm:text-xs text-slate-500">{subtitle}</p>}

      {/* Comparative Trend Section */}
      {metrics && (
        <div className="pt-2 border-t border-slate-700/30 mt-2">
          <div className="flex items-center justify-between gap-2">
            {/* Change Value with Trend Arrow */}
            <div className="flex items-center gap-1.5">
              <span 
                className={cn(
                  "text-sm font-bold transition-colors",
                  trendIndicator?.color
                )}
                aria-hidden="true"
              >
                {trendIndicator?.emoji}
              </span>
              <div className="flex flex-col">
                <span
                  className={cn(
                    "text-xs font-semibold tabular-nums",
                    metrics.trend === "up"
                      ? "text-emerald-400"
                      : metrics.trend === "down"
                        ? "text-rose-400"
                        : "text-slate-400"
                  )}
                  aria-label={`Change: ${formatChange(metrics.change)} (${formatChangePercent(metrics.changePercent)})`}
                >
                  {formatChange(metrics.change, 0)}
                </span>
              </div>
            </div>

            {/* Period comparison label */}
            <span className="text-[10px] text-slate-500 text-right">
              vs prev {period}
            </span>
          </div>

          {/* Previous value context */}
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[10px] text-slate-500">
              Prev: {metrics.previous > 0 ? formatNumber(Math.round(metrics.previous)) : '—'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-3 sm:p-5 backdrop-blur-sm min-h-[120px] animate-pulse">
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <div className="w-6 h-6 bg-slate-700/50 rounded" />
      </div>
      <div className="h-4 w-24 bg-slate-700/50 rounded mb-2" />
      <div className="h-8 w-16 bg-slate-700/50 rounded mb-2" />
      <div className="h-3 w-20 bg-slate-700/50 rounded" />
      <div className="pt-2 border-t border-slate-700/30 mt-3">
        <div className="h-3 w-full bg-slate-700/50 rounded" />
      </div>
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
