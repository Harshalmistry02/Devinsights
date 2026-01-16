  'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Clock,
  GitBranch,
  ChevronDown,
} from 'lucide-react';
import {
  DynamicCommitTimeline,
  DynamicActivityHeatmap,
  DynamicDayOfWeekChart,
  DynamicHourlyActivity,
  DynamicLanguageBreakdown,
  DynamicRepoStatsChart,
} from '@/components/charts';

// Type definitions that match the chart component interfaces
type DailyCommits = Record<string, number>;

// DayOfWeekStats - flexible input type
type DayOfWeekStatsInput = Record<string, number>;

// Full DayOfWeekStats with all required days
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

// RepoStat must match the chart's expected interface
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

// Time period options
type TimePeriod = '7d' | '30d' | '90d' | 'all';

export function InsightsChartsSection({
  dailyCommits,
  dayOfWeekStats,
  hourlyStats,
  repoStats,
  topLanguages,
}: InsightsChartsSectionProps) {
  const [timePeriod] = useState<TimePeriod>('all');

  // Filter daily commits based on time period
  const filteredDailyCommits = filterByPeriod(dailyCommits, timePeriod);

  // Check if we have any data to display
  const hasChartData = dailyCommits || dayOfWeekStats || hourlyStats || topLanguages;

  if (!hasChartData) {
    return (
      <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-8 text-center">
        <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-400 mb-2">No chart data available</h3>
        <p className="text-slate-500 text-sm">Sync your GitHub data to see visualizations</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Section Header with Time Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            Visual Analytics
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Explore your coding patterns through interactive charts
          </p>
        </div>
        
        {/* Time period selector removed per user request */}
      </div>

      {/* Commit Timeline - Full Width */}
      {filteredDailyCommits && Object.keys(filteredDailyCommits).length > 0 && (
        <ChartCard
          title="Commit Timeline"
          subtitle={`Activity over ${timePeriod === 'all' ? 'all time' : `the last ${timePeriod.slice(0, -1)} days`}`}
          icon={<Activity className="w-5 h-5 text-cyan-400" />}
        >
          <DynamicCommitTimeline data={filteredDailyCommits} />
        </ChartCard>
      )}

      {/* Activity Heatmap - Full Width */}
      {dailyCommits && Object.keys(dailyCommits).length > 0 && (
        <ChartCard
          title="Activity Heatmap"
          subtitle="GitHub-style contribution graph"
          icon={<Calendar className="w-5 h-5 text-emerald-400" />}
        >
          <DynamicActivityHeatmap data={dailyCommits} />
        </ChartCard>
      )}

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Language Breakdown */}
        {topLanguages && topLanguages.length > 0 && (
          <ChartCard
            title="Language Distribution"
            subtitle="Your programming language usage"
            icon={<PieChart className="w-5 h-5 text-purple-400" />}
          >
            <DynamicLanguageBreakdown data={topLanguages} />
          </ChartCard>
        )}

        {/* Day of Week Chart */}
        {dayOfWeekStats && Object.keys(dayOfWeekStats).length > 0 && (
          <ChartCard
            title="Weekly Patterns"
            subtitle="Commits by day of week"
            icon={<Calendar className="w-5 h-5 text-blue-400" />}
          >
            <DynamicDayOfWeekChart data={normalizeDayOfWeekStats(dayOfWeekStats)} />
          </ChartCard>
        )}

        {/* Hourly Activity */}
        {hourlyStats && Object.keys(hourlyStats).length > 0 && (
          <ChartCard
            title="Daily Rhythm"
            subtitle="Your most productive hours"
            icon={<Clock className="w-5 h-5 text-amber-400" />}
          >
            <DynamicHourlyActivity data={hourlyStats} />
          </ChartCard>
        )}

        {/* Repository Stats */}
        {repoStats && repoStats.length > 0 && (
          <ChartCard
            title="Top Repositories"
            subtitle="Your most active repos"
            icon={<GitBranch className="w-5 h-5 text-teal-400" />}
          >
            <DynamicRepoStatsChart data={repoStats.slice(0, 10)} />
          </ChartCard>
        )}
      </div>
    </div>
  );
}

// ===========================================
// Helper Components
// ===========================================



function ChartCard({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700/30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800/50 rounded-lg">{icon}</div>
          <div>
            <h3 className="font-medium text-slate-200">{title}</h3>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>
      </div>
      
      {/* Chart Content */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

// ===========================================
// Helper Functions
// ===========================================

/**
 * Normalize DayOfWeekStats to ensure all days are present
 */
function normalizeDayOfWeekStats(input: DayOfWeekStatsInput): DayOfWeekStatsFull {
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

function filterByPeriod(
  dailyCommits: DailyCommits | null,
  period: TimePeriod
): DailyCommits | null {
  if (!dailyCommits || period === 'all') return dailyCommits;

  const days = parseInt(period.slice(0, -1));
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  cutoff.setHours(0, 0, 0, 0);

  const filtered: DailyCommits = {};
  
  for (const [date, count] of Object.entries(dailyCommits)) {
    const dateObj = new Date(date);
    if (dateObj >= cutoff) {
      filtered[date] = count;
    }
  }

  return filtered;
}
