'use client';

import React from 'react';
import {
  DynamicCommitTimeline,
  DynamicActivityHeatmap,
  DynamicDayOfWeekChart,
  DynamicHourlyActivity,
  DynamicLanguageBreakdown,
  DynamicRepoStatsChart,
} from '@/components/charts';
import { ChartEmptyState, LanguageEmptyState } from '@/components/ui/empty-states';
import { BarChart3, PieChart, GitBranch } from 'lucide-react';

interface ChartsSectionProps {
  analytics: any;
}

export function ChartsSection({ analytics }: ChartsSectionProps) {
  if (!analytics) return null;

  // Adapt data from analytics
  const dailyCommits = (analytics.dailyCommits as unknown as Record<string, number>) || {};
  const dayOfWeekStats = (analytics.dayOfWeekStats as unknown as any) || {
    Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0, Sunday: 0
  };
  const hourlyStats = (analytics.hourlyStats as unknown as Record<string, number>) || {};
  const topLanguages = (analytics.topLanguages as unknown as any[]) || [];
  const repoStats = (analytics.repoStats as unknown as any[]) || [];

  const hasDailyCommitData = Object.keys(dailyCommits).length > 0;
  const hasLanguageData = topLanguages.length > 0;

  return (
    <section className="space-y-6 mt-6" aria-labelledby="charts-title">
      <div className="flex items-center justify-between">
        <h3 id="charts-title" className="text-xl font-semibold text-slate-200 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" aria-hidden="true" />
          Charts & Visualizations
        </h3>
      </div>

      <div role="region" aria-label="Commit timeline chart">
        {hasDailyCommitData ? (
          <DynamicCommitTimeline data={dailyCommits} />
        ) : (
          <ChartEmptyState chartType="timeline" />
        )}
      </div>

      <div role="region" aria-label="Activity heatmap chart">
        {hasDailyCommitData ? (
          <DynamicActivityHeatmap data={dailyCommits} />
        ) : (
          <ChartEmptyState chartType="heatmap" />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div role="region" aria-label="Commits by day of week chart">
          <DynamicDayOfWeekChart data={dayOfWeekStats} />
        </div>
        <div role="region" aria-label="Commits by hour of day chart">
          <DynamicHourlyActivity data={hourlyStats} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div role="region" aria-label="Language breakdown chart">
          {hasLanguageData ? (
            <DynamicLanguageBreakdown data={topLanguages} />
          ) : (
            <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 sm:p-6 backdrop-blur-sm h-full">
              <h3 className="text-base sm:text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-cyan-400" aria-hidden="true" />
                Language Breakdown
              </h3>
              <LanguageEmptyState />
            </div>
          )}
        </div>
        <div role="region" aria-label="Repository statistics chart">
          {repoStats.length > 0 ? (
            <DynamicRepoStatsChart data={repoStats} limit={6} />
          ) : (
            <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 sm:p-6 backdrop-blur-sm h-full">
              <h3 className="text-base sm:text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-cyan-400" aria-hidden="true" />
                Repository Stats
              </h3>
              <ChartEmptyState chartType="bar" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
