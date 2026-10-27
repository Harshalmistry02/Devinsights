"use client";

import { Activity, Code, Flame, RefreshCw, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  calculateComparativePeriod,
} from "@/lib/analytics/comparison-calculator";
import type { DailyCommitStats } from "@/lib/analytics/types";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { StatCard } from "@/components/ui/stat-card";
import { StatCardSkeleton } from "@/components/ui/skeletons";
import type { DashboardAnalytics } from "./types";

interface StatsGridProps {
  analytics: DashboardAnalytics | null;
  previousAnalytics?: DashboardAnalytics | null;
}

/**
 * Enhanced Stats Grid with Comparative Period Analytics
 * SpaceX-inspired: minimal, achromatic, uppercase labels
 */
export function StatsGrid({
  analytics: initialAnalytics,
  previousAnalytics,
}: StatsGridProps) {
  const [analytics, setAnalytics] = useState(initialAnalytics);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const hasSyncedData =
    analytics !== null &&
    ((analytics.totalCommits ?? 0) > 0 || (analytics.totalRepos ?? 0) > 0);

  const dailyCommits = analytics?.dailyCommits as
    | DailyCommitStats
    | null
    | undefined;
  const hasDailyCommitData =
    dailyCommits !== null &&
    dailyCommits !== undefined &&
    Object.keys(dailyCommits).length > 0;

  const comparativePeriod = useMemo(() => {
    return calculateComparativePeriod(
      dailyCommits,
      30,
      analytics?.currentStreak || 0,
      previousAnalytics?.currentStreak || 0
    );
  }, [analytics, dailyCommits, previousAnalytics]);

  const refreshStats = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/analytics?refresh=true");
      if (!response.ok) throw new Error("Failed to refresh stats");
      const data: { data?: DashboardAnalytics } = await response.json();
      setAnalytics(data.data ?? null);
      toast.success("Statistics refreshed successfully");
    } catch (error) {
      console.error("Failed to refresh stats:", error);
      toast.error("Failed to refresh statistics");
    } finally {
      setIsRefreshing(false);
    }
  };

  const commitMetrics = hasDailyCommitData
    ? comparativePeriod.totalCommits
    : null;

  return (
    <section aria-label="Statistics">
      <SectionHeader
        title="Statistics"
        description="Activity across your synced GitHub repositories."
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshStats}
            loading={isRefreshing}
            loadingText="Refreshing"
            leadingIcon={<RefreshCw className="size-3.5" />}
            aria-label="Refresh statistics"
            title="Refresh statistics"
          >
            Refresh
          </Button>
        }
      />

      {isRefreshing ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Repositories"
            value={(analytics?.totalRepos ?? 0).toLocaleString("en-US")}
            icon={<Code className="size-4" />}
            context={
              hasSyncedData
                ? "Synced repositories"
                : "No repositories synced yet"
            }
            footer="From your connected GitHub account"
          />

          <StatCard
            label="Total commits"
            value={(analytics?.totalCommits ?? 0).toLocaleString("en-US")}
            icon={<Activity className="size-4" />}
            context="Across synced repositories"
            delta={
              commitMetrics
                ? {
                    value: Math.round(commitMetrics.changePercent),
                    isImprovement: commitMetrics.isImprovement,
                    suffix: "%",
                    label:
                      "Commits in the last 30 days compared with the previous 30 days",
                    caption: "Last 30 days",
                  }
                : undefined
            }
            footer="All-time total across synced repositories"
          />

          <StatCard
            label="Current streak"
            value={(analytics?.currentStreak ?? 0).toLocaleString("en-US")}
            icon={<Flame className="size-4" />}
            context={
              analytics?.isActiveToday ? (
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="size-1.5 rounded-full bg-success"
                    aria-hidden="true"
                  />
                  Active today
                </span>
              ) : analytics?.currentStreak ? (
                "Consecutive active days"
              ) : (
                "No active streak"
              )
            }
            footer="As of today"
          />

          <StatCard
            label="Stars earned"
            value={(analytics?.totalStars ?? 0).toLocaleString("en-US")}
            icon={<Star className="size-4" />}
            context="Across synced repositories"
            footer="All-time total"
          />
        </div>
      )}
    </section>
  );
}
