"use client";

import {
  Activity,
  BarChart3,
  CalendarDays,
  Clock3,
  GitBranch,
  PieChart,
} from "lucide-react";
import {
  DynamicActivityHeatmap,
  DynamicCommitTimeline,
  DynamicDayOfWeekChart,
  DynamicHourlyActivity,
  DynamicLanguageBreakdown,
  DynamicRepoStatsChart,
} from "@/components/charts";
import { Card } from "@/components/ui/card";
import { ChartCard } from "@/components/ui/chart-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";

// Type definitions that match the chart component interfaces
type DailyCommits = Record<string, number>;

type DayOfWeekStatsInput = Record<string, number>;

interface DayOfWeekStatsFull {
  Monday: number;
  Tuesday: number;
  Wednesday: number;
  Thursday: number;
  Friday: number;
  Saturday: number;
  Sunday: number;
  [key: string]: number;
}

type HourlyStats = Record<string, number>;

interface RepoStat {
  id: string;
  name: string;
  fullName: string;
  commits: number;
  stars: number;
  forks: number;
  language: string | null;
}

interface TopLanguage {
  language: string;
  count: number;
  percentage: number;
}

interface InsightsChartsSectionProps {
  dailyCommits: DailyCommits | null;
  dayOfWeekStats: DayOfWeekStatsInput | null;
  hourlyStats: HourlyStats | null;
  repoStats: RepoStat[] | null;
  topLanguages: TopLanguage[] | null;
}

export function InsightsChartsSection({
  dailyCommits,
  dayOfWeekStats,
  hourlyStats,
  repoStats,
  topLanguages,
}: InsightsChartsSectionProps) {
  const hasDailyCommits =
    dailyCommits !== null && Object.keys(dailyCommits).length > 0;
  const hasDayOfWeek =
    dayOfWeekStats !== null && Object.keys(dayOfWeekStats).length > 0;
  const hasHourly = hourlyStats !== null && Object.keys(hourlyStats).length > 0;
  const hasLanguages = topLanguages !== null && topLanguages.length > 0;
  const hasRepos = repoStats !== null && repoStats.length > 0;

  const hasChartData =
    hasDailyCommits || hasDayOfWeek || hasHourly || hasLanguages || hasRepos;

  return (
    <section aria-label="Visual analytics" className="space-y-5">
      <SectionHeader
        title="Visual analytics"
        description="Patterns across your synced commit history, from daily cadence to language mix."
      />

      {!hasChartData ? (
        <Card>
          <EmptyState
            icon={<BarChart3 className="size-5" />}
            title="No chart data yet"
            description="Sync your GitHub repositories to populate the activity charts."
          />
        </Card>
      ) : (
        <>
          {hasDailyCommits ? (
            <ChartCard
              title="Commit timeline"
              description="Daily commits over the last 30 days."
              scope="30 days"
              icon={<Activity className="size-4" />}
            >
              <DynamicCommitTimeline data={dailyCommits} />
            </ChartCard>
          ) : null}

          {hasDailyCommits ? (
            <ChartCard
              title="Activity heatmap"
              description="Daily commit density for the last year."
              scope="365 days"
              icon={<CalendarDays className="size-4" />}
            >
              <DynamicActivityHeatmap data={dailyCommits} />
            </ChartCard>
          ) : null}

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {hasLanguages && topLanguages ? (
              <ChartCard
                title="Language distribution"
                description="Share of language-classified commits by primary language."
                scope="All time"
                icon={<PieChart className="size-4" />}
              >
                <DynamicLanguageBreakdown data={topLanguages} />
              </ChartCard>
            ) : null}

            {hasDayOfWeek && dayOfWeekStats ? (
              <ChartCard
                title="Weekly patterns"
                description="Commit volume by day of the week."
                scope="All time"
                icon={<CalendarDays className="size-4" />}
              >
                <DynamicDayOfWeekChart
                  data={normalizeDayOfWeekStats(dayOfWeekStats)}
                />
              </ChartCard>
            ) : null}

            {hasHourly && hourlyStats ? (
              <ChartCard
                title="Daily rhythm"
                description="Commit volume by hour of day."
                scope="All time"
                icon={<Clock3 className="size-4" />}
              >
                <DynamicHourlyActivity data={hourlyStats} />
              </ChartCard>
            ) : null}

            {hasRepos && repoStats ? (
              <ChartCard
                title="Top repositories"
                description="Most active repositories by stored commits."
                scope="All time"
                icon={<GitBranch className="size-4" />}
              >
                <DynamicRepoStatsChart data={repoStats} />
              </ChartCard>
            ) : null}
          </div>
        </>
      )}
    </section>
  );
}

/**
 * Normalize DayOfWeekStats to ensure all days are present.
 */
function normalizeDayOfWeekStats(
  input: DayOfWeekStatsInput
): DayOfWeekStatsFull {
  return {
    Monday: input.Monday ?? input.monday ?? 0,
    Tuesday: input.Tuesday ?? input.tuesday ?? 0,
    Wednesday: input.Wednesday ?? input.wednesday ?? 0,
    Thursday: input.Thursday ?? input.thursday ?? 0,
    Friday: input.Friday ?? input.friday ?? 0,
    Saturday: input.Saturday ?? input.saturday ?? 0,
    Sunday: input.Sunday ?? input.sunday ?? 0,
  };
}
