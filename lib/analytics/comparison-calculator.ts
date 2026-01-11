/**
 * Comparative Period Analytics
 *
 * Calculates period-over-period changes to show trends
 * Compares current 30 days vs previous 30 days (or 7 vs 7, etc.)
 */

import { DailyCommitStats } from "./types";

export interface PeriodMetrics {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: "up" | "down" | "stable";
  isImprovement: boolean;
}

export interface ComparativePeriodData {
  totalCommits: PeriodMetrics;
  averagePerDay: PeriodMetrics;
  activeDays: PeriodMetrics;
  maxDayCommits: PeriodMetrics;
  streak: PeriodMetrics;
}

/**
 * Get commits for a specific period from daily stats
 */
function getCommitsForPeriod(
  dailyCommits: DailyCommitStats | null | undefined,
  startDaysAgo: number,
  endDaysAgo: number
): { commits: number; days: number; activeDays: number; maxDay: number } {
  if (!dailyCommits) {
    return { commits: 0, days: 0, activeDays: 0, maxDay: 0 };
  }

  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - startDaysAgo);

  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() - endDaysAgo);

  let totalCommits = 0;
  let activeDays = 0;
  let maxDay = 0;
  const dayCount = startDaysAgo - endDaysAgo;

  for (let i = 0; i < dayCount; i++) {
    const date = new Date(endDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];

    const commits = dailyCommits[dateStr] || 0;
    totalCommits += commits;
    maxDay = Math.max(maxDay, commits);

    if (commits > 0) {
      activeDays++;
    }
  }

  return {
    commits: totalCommits,
    days: dayCount,
    activeDays,
    maxDay,
  };
}

/**
 * Calculate the trend direction
 */
function calculateTrend(change: number): "up" | "down" | "stable" {
  if (Math.abs(change) < 0.5) return "stable";
  return change > 0 ? "up" : "down";
}

/**
 * Format change percent for display
 * Returns percentage with appropriate sign
 */
export function formatChangePercent(percent: number): string {
  const sign = percent > 0 ? "+" : "";
  return `${sign}${Math.round(percent)}%`;
}

/**
 * Format change number for display
 */
export function formatChange(change: number, decimals = 1): string {
  const sign = change > 0 ? "+" : "";
  if (Number.isInteger(change) || decimals === 0) {
    return `${sign}${Math.round(change)}`;
  }
  return `${sign}${change.toFixed(decimals)}`;
}

/**
 * Calculate comparative metrics between current and previous period
 *
 * @param dailyCommits - Daily commit stats from analytics snapshot
 * @param periodDays - Number of days per period (default: 30)
 * @param currentStreak - Current streak for streak comparison
 * @param previousStreak - Previous period streak (optional)
 */
export function calculateComparativePeriod(
  dailyCommits: DailyCommitStats | null | undefined,
  periodDays: number = 30,
  currentStreak: number = 0,
  previousStreak: number = 0
): ComparativePeriodData {
  // Current period: last N days
  const currentData = getCommitsForPeriod(dailyCommits, periodDays, 0);

  // Previous period: N-60 days ago to N days ago
  const previousData = getCommitsForPeriod(
    dailyCommits,
    periodDays * 2,
    periodDays
  );

  // Calculate metrics
  const createMetrics = (
    current: number,
    previous: number,
    higherIsBetter: boolean = true
  ): PeriodMetrics => {
    const change = current - previous;
    const changePercent =
      previous > 0 ? (change / previous) * 100 : current > 0 ? 100 : 0;

    const trend = calculateTrend(changePercent);

    // Improvement depends on metric type
    // For positive metrics (commits, streak): up is good
    const isImprovement = higherIsBetter
      ? trend === "up" || (trend === "stable" && current > 0)
      : trend === "down" || (trend === "stable" && current > 0);

    return {
      current,
      previous,
      change,
      changePercent,
      trend,
      isImprovement,
    };
  };

  const currentAvgPerDay =
    currentData.days > 0 ? currentData.commits / currentData.days : 0;

  const previousAvgPerDay =
    previousData.days > 0 ? previousData.commits / previousData.days : 0;

  return {
    totalCommits: createMetrics(currentData.commits, previousData.commits),
    averagePerDay: createMetrics(currentAvgPerDay, previousAvgPerDay),
    activeDays: createMetrics(currentData.activeDays, previousData.activeDays),
    maxDayCommits: createMetrics(currentData.maxDay, previousData.maxDay),
    streak: createMetrics(currentStreak, previousStreak),
  };
}

/**
 * Get trend emoji/icon indicator
 */
export function getTrendIndicator(
  trend: "up" | "down" | "stable",
  isImprovement: boolean = true
): { emoji: string; label: string; color: string } {
  if (trend === "up") {
    return {
      emoji: "↗",
      label: isImprovement ? "Improving" : "Increasing",
      color: isImprovement ? "text-emerald-400" : "text-amber-400",
    };
  }

  if (trend === "down") {
    return {
      emoji: "↘",
      label: isImprovement ? "Declining" : "Decreasing",
      color: isImprovement ? "text-rose-400" : "text-amber-400",
    };
  }

  return {
    emoji: "→",
    label: "Stable",
    color: "text-slate-400",
  };
}

/**
 * Calculate week-over-week comparison (for shorter-term trends)
 */
export function calculateWeekOverWeek(
  dailyCommits: DailyCommitStats | null | undefined
): ComparativePeriodData {
  return calculateComparativePeriod(dailyCommits, 7);
}

/**
 * Calculate quarter-over-quarter comparison (for longer-term trends)
 */
export function calculateQuarterOverQuarter(
  dailyCommits: DailyCommitStats | null | undefined,
  currentStreak: number = 0,
  previousStreak: number = 0
): ComparativePeriodData {
  return calculateComparativePeriod(
    dailyCommits,
    90,
    currentStreak,
    previousStreak
  );
}

/**
 * Get a human-readable period label
 */
export function getPeriodLabel(periodDays: number): string {
  if (periodDays === 7) return "7d";
  if (periodDays === 30) return "30d";
  if (periodDays === 90) return "90d";
  return `${periodDays}d`;
}
