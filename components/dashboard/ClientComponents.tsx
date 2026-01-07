'use client';

import React from 'react';
import Image from 'next/image';
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

/**
 * Charts Section Component
 * 
 * Client-side component that renders all dashboard charts with:
 * - Dynamic imports for code splitting
 * - Lazy loading for better performance
 * - Proper empty state handling
 */

interface DayOfWeekStats {
  Monday: number;
  Tuesday: number;
  Wednesday: number;
  Thursday: number;
  Friday: number;
  Saturday: number;
  Sunday: number;
}

interface RepoStat {
  id: string;
  name: string;
  fullName: string;
  commits: number;
  stars: number;
  forks: number;
  language: string | null;
}

interface LanguageDetail {
  language: string;
  count: number;
  percentage: number;
}

interface ChartsSectionProps {
  dailyCommits: Record<string, number>;
  dayOfWeekStats: DayOfWeekStats;
  hourlyStats: Record<string, number>;
  topLanguages: LanguageDetail[];
  repoStats: RepoStat[];
}

export function ChartsSection({
  dailyCommits,
  dayOfWeekStats,
  hourlyStats,
  topLanguages,
  repoStats,
}: ChartsSectionProps) {
  const hasDailyCommitData = Object.keys(dailyCommits).length > 0;
  const hasLanguageData = topLanguages.length > 0;

  return (
    <section 
      className="space-y-6" 
      aria-labelledby="charts-title"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h3 id="charts-title" className="text-xl font-semibold text-slate-200 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" aria-hidden="true" />
          Charts & Visualizations
        </h3>
        <p className="text-sm text-slate-500">
          Interactive data insights
        </p>
      </div>

      {/* Commit Timeline - Full Width */}
      <div role="region" aria-label="Commit timeline chart">
        {hasDailyCommitData ? (
          <DynamicCommitTimeline data={dailyCommits} />
        ) : (
          <ChartEmptyState chartType="timeline" />
        )}
      </div>

      {/* Activity Heatmap - GitHub Style (Full Width) */}
      <div role="region" aria-label="Activity heatmap chart">
        {hasDailyCommitData ? (
          <DynamicActivityHeatmap data={dailyCommits} />
        ) : (
          <ChartEmptyState chartType="heatmap" />
        )}
      </div>

      {/* Day of Week & Hourly Activity - 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div role="region" aria-label="Commits by day of week chart">
          <DynamicDayOfWeekChart data={dayOfWeekStats} />
        </div>
        <div role="region" aria-label="Commits by hour of day chart">
          <DynamicHourlyActivity data={hourlyStats} />
        </div>
      </div>

      {/* Language Breakdown & Top Repos - 2 Columns */}
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

/**
 * Optimized User Avatar Component
 * 
 * Uses Next.js Image component for automatic optimization
 */
interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg';
  priority?: boolean;
  className?: string;
}

export function UserAvatar({ 
  src, 
  name, 
  size = 'md', 
  priority = false,
  className = ''
}: UserAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };
  
  const sizePx = {
    sm: 32,
    md: 64,
    lg: 96,
  };

  if (src) {
    return (
      <Image
        src={src}
        alt={name || "User avatar"}
        width={sizePx[size]}
        height={sizePx[size]}
        className={`rounded-full ${sizeClasses[size]} ${className}`}
        priority={priority}
      />
    );
  }

  // Fallback avatar with initial
  const initial = (name?.[0] || 'U').toUpperCase();
  
  return (
    <div className={`${sizeClasses[size]} rounded-full bg-linear-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center ${className}`}>
      <span className="text-cyan-400 font-bold" style={{ fontSize: sizePx[size] / 2.5 }}>
        {initial}
      </span>
    </div>
  );
}
