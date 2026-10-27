"use client";

import {
  Calendar,
  Code,
  Flame,
  GitCommit,
  Minus,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useMemo } from "react";
import {
  buildWeeklySummary,
  getWeekLabel,
} from "@/lib/analytics/weekly-summary";
import { Badge, Chip } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DeltaChip } from "@/components/ui/delta-chip";
import { IconTile } from "@/components/ui/icon-tile";
import { cn } from "@/components/ui/cn";

interface WeeklySummaryProps {
  analytics: {
    dailyCommits?: Record<string, number>;
    hourlyStats?: Record<string, number>;
    currentStreak?: number;
    isActiveToday?: boolean;
    repoStats?: { name: string; commits: number }[];
  } | null;
  className?: string;
}

/**
 * Weekly Summary Widget — SpaceX-inspired minimal aesthetic
 */
export function WeeklySummary({ analytics, className }: WeeklySummaryProps) {
  const summaryData = useMemo(() => {
    if (!analytics) return null;
    return buildWeeklySummary(
      analytics.dailyCommits || null,
      analytics.hourlyStats || null,
      analytics.currentStreak || 0,
      analytics.isActiveToday || false,
      analytics.repoStats
    );
  }, [analytics]);

  if (!summaryData) {
    return (
      <Card className={cn("flex flex-wrap items-center gap-3", className)}>
        <Calendar className="size-4 text-text-3" aria-hidden="true" />
        <p className="text-caption">
          Sync your data to see a weekly summary.
        </p>
      </Card>
    );
  }

  const { currentWeek, previousWeek, comparison, highlights, streakInfo } =
    summaryData;

  const highlightItems = [
    ...(highlights.bestDay
      ? [
          {
            label: "Best day",
            value: `${highlights.bestDay.dayName} · ${highlights.bestDay.commits} commits this week`,
          },
        ]
      : []),
    ...(highlights.mostActiveHour
      ? [
          {
            label: "Peak hour",
            value: `${highlights.mostActiveHour.label} · all time`,
          },
        ]
      : []),
    ...(streakInfo.daysToMilestone !== null && streakInfo.milestoneLabel
      ? [
          {
            label: "Streak milestone",
            value: `${streakInfo.daysToMilestone} days to the ${streakInfo.milestoneLabel} badge`,
          },
        ]
      : []),
    ...(highlights.topRepos.length > 0
      ? [
          {
            label: "Top repositories",
            value: `${highlights.topRepos.slice(0, 2).join(", ")} · all time`,
          },
        ]
      : []),
  ];

  return (
    <Card padding="none" className={cn("overflow-hidden", className)}>
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border-subtle p-5 sm:p-6">
        <div className="flex min-w-0 items-start gap-3">
          <IconTile>
            <Calendar className="size-4" />
          </IconTile>
          <div className="min-w-0">
            <h2 className="text-card-title">
              {getWeekLabel(currentWeek.weekNumber, currentWeek.year)}
            </h2>
            <p className="mt-1 text-caption">This week at a glance.</p>
          </div>
        </div>

        <TrendBadge
          trend={comparison.trend}
          percentChange={comparison.commitsPercentChange}
        />
      </div>

      <div className="grid grid-cols-1 divide-y divide-border-subtle lg:grid-cols-3 lg:divide-x lg:divide-y-0">
        <section className="p-5 sm:p-6" aria-label="Weekly progress">
          <h3 className="flex items-center gap-2 text-label">
            <Target className="size-3.5 text-text-3" aria-hidden="true" />
            This week
          </h3>

          <div className="mt-4 space-y-3">
            <ProgressItem
              icon={<GitCommit className="size-3.5" />}
              label="Commits this week"
              value={currentWeek.totalCommits}
              change={comparison.commitsDiff}
              changeLabel="Compared with the previous week"
            />
            <ProgressItem
              icon={<Code className="size-3.5" />}
              label="Active days this week"
              value={currentWeek.activeDays}
            />
            <ProgressItem
              icon={<Flame className="size-3.5" />}
              label="Current streak"
              value={streakInfo.current}
              suffix={streakInfo.current === 1 ? "day" : "days"}
            />
          </div>

          {comparison.weekendChange !== 0 ? (
            <Chip
              variant={comparison.weekendChange < 0 ? "warning" : "success"}
              className="mt-4"
            >
              Weekend activity{" "}
              {comparison.weekendChange < 0 ? "down" : "up"}{" "}
              {Math.abs(comparison.weekendChange)}% vs last week
            </Chip>
          ) : null}

          <p className="mt-4 text-caption">
            Changes compare with the previous week.
          </p>
        </section>

        <section className="p-5 sm:p-6" aria-label="Weekly highlights">
          <h3 className="flex items-center gap-2 text-label">
            <Sparkles className="size-3.5 text-text-3" aria-hidden="true" />
            Highlights
          </h3>

          {highlightItems.length > 0 ? (
            <dl className="mt-3 divide-y divide-border-subtle">
              {highlightItems.map((item) => (
                <div key={item.label} className="py-2.5">
                  <dt className="text-label">{item.label}</dt>
                  <dd className="mt-1 break-words text-sm leading-snug text-text">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-4 text-caption">
              Not enough activity this week.
            </p>
          )}
        </section>

        <section className="p-5 sm:p-6" aria-label="Daily commits this week">
          <h3 className="flex items-center gap-2 text-label">
            <TrendingUp className="size-3.5 text-text-3" aria-hidden="true" />
            Daily commits
          </h3>

          <WeekMiniChart data={currentWeek.dailyBreakdown} />
        </section>
      </div>

      <div className="border-t border-border-subtle px-5 py-3 text-caption sm:px-6">
        <span className="text-text-2">
          {formatShortDate(currentWeek.startDate)} –{" "}
          {formatShortDate(currentWeek.endDate)}
        </span>{" "}
        · compared with {formatShortDate(previousWeek.startDate)} –{" "}
        {formatShortDate(previousWeek.endDate)}
      </div>
    </Card>
  );
}

function TrendBadge({
  trend,
  percentChange,
}: {
  trend: "up" | "down" | "stable";
  percentChange: number;
}) {
  const config = {
    up: { icon: TrendingUp, variant: "success" as const },
    down: { icon: TrendingDown, variant: "danger" as const },
    stable: { icon: Minus, variant: "neutral" as const },
  };

  const { icon: Icon, variant } = config[trend];
  const sign = percentChange > 0 ? "+" : "";

  return (
    <Badge
      variant={variant}
      size="sm"
      uppercase={false}
      mono
      icon={<Icon className="size-3" />}
    >
      {percentChange === 0
        ? "No change vs last week"
        : `${sign}${percentChange}% vs last week`}
    </Badge>
  );
}

function ProgressItem({
  icon,
  label,
  value,
  suffix,
  change,
  changeLabel,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  change?: number;
  changeLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className="text-text-3" aria-hidden="true">
          {icon}
        </span>
        <span className="truncate text-caption">{label}</span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="font-mono text-sm tabular-nums text-text">
          {value.toLocaleString("en-US")}
          {suffix ? ` ${suffix}` : ""}
        </span>
        {change !== undefined ? (
          <DeltaChip
            value={change}
            label={changeLabel ?? "Compared with the previous week"}
          />
        ) : null}
      </div>
    </div>
  );
}

function WeekMiniChart({
  data,
}: {
  data: { date: string; commits: number; dayName: string }[];
}) {
  const maxCommits = Math.max(...data.map((day) => day.commits), 1);
  const today = new Date().toISOString().split("T")[0];
  const summary = data
    .map((day) => `${day.dayName}: ${day.commits}`)
    .join(", ");

  return (
    <div
      className="mt-4 flex h-24 items-end gap-1.5"
      role="img"
      aria-label={`Daily commits this week. ${summary}.`}
    >
      {data.map((day) => {
        const height = (day.commits / maxCommits) * 100;
        const isToday = day.date === today;
        const isFuture = day.date > today;

        return (
          <div
            key={day.date}
            className="flex h-full min-w-0 flex-1 flex-col justify-end gap-1.5"
          >
            <div className="flex flex-1 items-end">
              <div
                className={cn(
                  "w-full rounded-t-[2px] transition-[height] duration-300",
                  isFuture
                    ? "bg-white/10"
                    : day.commits > 0
                      ? isToday
                        ? "bg-accent"
                        : "bg-text-3"
                      : "bg-white/10"
                )}
                style={{ height: `${Math.max(height, 6)}%` }}
                title={`${day.dayName}: ${day.commits} commits`}
                aria-hidden="true"
              />
            </div>
            <span
              className={cn(
                "text-center text-[11px] leading-none",
                isToday ? "text-text" : "text-text-3"
              )}
            >
              {day.dayName.charAt(0)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

/**
 * Compact Weekly Summary
 */
export function WeeklySummaryCompact({
  analytics,
  className,
}: WeeklySummaryProps) {
  const summaryData = useMemo(() => {
    if (!analytics) return null;
    return buildWeeklySummary(
      analytics.dailyCommits || null,
      analytics.hourlyStats || null,
      analytics.currentStreak || 0,
      analytics.isActiveToday || false,
      analytics.repoStats
    );
  }, [analytics]);

  if (!summaryData) return null;

  const { currentWeek, comparison, streakInfo } = summaryData;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 border-y border-border-subtle py-4",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <div>
          <p className="text-section-head text-2xl">
            {currentWeek.totalCommits.toLocaleString("en-US")}
          </p>
          <p className="text-caption">commits this week</p>
        </div>
        <div className="h-8 w-px bg-border-subtle" aria-hidden="true" />
        <p className="text-caption">{streakInfo.current} day streak</p>
      </div>
      <TrendBadge
        trend={comparison.trend}
        percentChange={comparison.commitsPercentChange}
      />
    </div>
  );
}
