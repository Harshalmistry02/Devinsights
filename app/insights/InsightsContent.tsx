'use client';

/**
 * Insights Content Component
 * 
 * Client component that renders all the charts and visualizations.
 * Separated from the page to allow server-side data fetching.
 */

import {
  CommitTimeline,
  LanguageBreakdown,
  DayOfWeekChart,
  HourlyActivity,
  ActivityHeatmap,
  RepoStatsChart,
} from '@/components/charts';
import { 
  Flame, 
  Trophy, 
  Calendar, 
  Zap, 
  GitCommit,
  Code,
  TrendingUp,
  Clock,
} from 'lucide-react';

interface AnalyticsData {
  totalRepos: number;
  totalCommits: number;
  totalAdditions: number;
  totalDeletions: number;
  totalStars: number;
  totalForks: number;
  currentStreak: number;
  longestStreak: number;
  lastCommitDate: Date | null;
  isActiveToday: boolean;
  averageCommitsPerDay: number;
  mostProductiveDay: string | null;
  mostProductiveHour: number | null;
  languageStats: Record<string, number> | null;
  dailyCommits: Record<string, number> | null;
  dayOfWeekStats: Record<string, number> | null;
  hourlyStats: Record<string, number> | null;
  repoStats: any[] | null;
  topLanguages: Array<{ language: string; count: number; percentage: number }> | null;
  calculatedAt: Date;
  dataRangeStart: Date | null;
  dataRangeEnd: Date | null;
}

interface InsightsContentProps {
  analytics: AnalyticsData;
}

export function InsightsContent({ analytics }: InsightsContentProps) {
  // Parse JSON data safely
  const dailyCommits = (analytics.dailyCommits as Record<string, number>) || {};
  const dayOfWeekStats = (analytics.dayOfWeekStats as any) || {
    Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0, Sunday: 0
  };
  const hourlyStats = (analytics.hourlyStats as Record<string, number>) || {};
  const topLanguages = (analytics.topLanguages as Array<{ language: string; count: number; percentage: number }>) || [];
  const repoStats = (analytics.repoStats as any[]) || [];

  return (
    <div className="space-y-6">
      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickStatCard
          icon={<Flame className="w-5 h-5" />}
          label="Current Streak"
          value={`${analytics.currentStreak} days`}
          color="orange"
          highlight={analytics.isActiveToday}
        />
        <QuickStatCard
          icon={<Trophy className="w-5 h-5" />}
          label="Longest Streak"
          value={`${analytics.longestStreak} days`}
          color="yellow"
        />
        <QuickStatCard
          icon={<GitCommit className="w-5 h-5" />}
          label="Total Commits"
          value={formatNumber(analytics.totalCommits)}
          color="cyan"
        />
        <QuickStatCard
          icon={<Code className="w-5 h-5" />}
          label="Repositories"
          value={analytics.totalRepos.toString()}
          color="purple"
        />
      </div>

      {/* Productivity Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InsightCard
          icon={<Calendar className="w-5 h-5" />}
          title="Most Productive Day"
          value={analytics.mostProductiveDay || 'N/A'}
          description="You code most on this day"
          color="blue"
        />
        <InsightCard
          icon={<Clock className="w-5 h-5" />}
          title="Peak Coding Hour"
          value={formatHour(analytics.mostProductiveHour)}
          description="Your most active time"
          color="purple"
        />
        <InsightCard
          icon={<Zap className="w-5 h-5" />}
          title="Average per Day"
          value={`${analytics.averageCommitsPerDay.toFixed(1)} commits`}
          description="On active days"
          color="cyan"
        />
      </div>

      {/* Activity Heatmap - Full Width */}
      <ActivityHeatmap data={dailyCommits} />

      {/* Commit Timeline */}
      <CommitTimeline data={dailyCommits} />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Language Breakdown */}
        <LanguageBreakdown data={topLanguages} />

        {/* Day of Week */}
        <DayOfWeekChart data={dayOfWeekStats} />
      </div>

      {/* Hourly Activity - Full Width */}
      <HourlyActivity data={hourlyStats} />

      {/* Repository Stats */}
      <RepoStatsChart data={repoStats} />

      {/* Code Changes Summary */}
      <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-6 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          Code Changes Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-400">+{formatNumber(analytics.totalAdditions)}</p>
            <p className="text-sm text-slate-500">Lines Added</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-400">-{formatNumber(analytics.totalDeletions)}</p>
            <p className="text-sm text-slate-500">Lines Deleted</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-400">{formatNumber(analytics.totalStars)}</p>
            <p className="text-sm text-slate-500">Stars Earned</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-400">{formatNumber(analytics.totalForks)}</p>
            <p className="text-sm text-slate-500">Total Forks</p>
          </div>
        </div>

        {/* Net Change */}
        <div className="mt-6 pt-6 border-t border-slate-700/30">
          <div className="flex items-center justify-center gap-4">
            <span className="text-slate-400">Net Change:</span>
            <span className={`text-2xl font-bold ${
              analytics.totalAdditions - analytics.totalDeletions >= 0 
                ? 'text-green-400' 
                : 'text-red-400'
            }`}>
              {analytics.totalAdditions - analytics.totalDeletions >= 0 ? '+' : ''}
              {formatNumber(analytics.totalAdditions - analytics.totalDeletions)} lines
            </span>
          </div>
        </div>
      </div>

      {/* Data Range Info */}
      {analytics.dataRangeStart && analytics.dataRangeEnd && (
        <div className="text-center text-sm text-slate-500">
          <p>
            Showing data from{' '}
            <span className="text-slate-400">
              {new Date(analytics.dataRangeStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            {' '}to{' '}
            <span className="text-slate-400">
              {new Date(analytics.dataRangeEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

// ===========================================
// Helper Components
// ===========================================

function QuickStatCard({
  icon,
  label,
  value,
  color,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'orange' | 'yellow' | 'cyan' | 'purple';
  highlight?: boolean;
}) {
  const colorClasses = {
    orange: 'from-orange-500/20 to-orange-500/5 border-orange-500/30 text-orange-400',
    yellow: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30 text-yellow-400',
    cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 text-cyan-400',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-400',
  };

  return (
    <div className={`bg-linear-to-br ${colorClasses[color]} border rounded-xl p-4 backdrop-blur-sm relative overflow-hidden`}>
      {highlight && (
        <div className="absolute top-2 right-2">
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
          </span>
        </div>
      )}
      <div className="flex items-center gap-3">
        <div className="opacity-80">{icon}</div>
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="text-lg font-bold text-slate-200">{value}</p>
        </div>
      </div>
    </div>
  );
}

function InsightCard({
  icon,
  title,
  value,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
  color: 'blue' | 'purple' | 'cyan';
}) {
  const colorClasses = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  };

  return (
    <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-lg border ${colorClasses[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-slate-500">{title}</p>
          <p className="text-xl font-semibold text-slate-200">{value}</p>
          <p className="text-xs text-slate-400">{description}</p>
        </div>
      </div>
    </div>
  );
}

// ===========================================
// Helper Functions
// ===========================================

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
}

function formatHour(hour: number | null | undefined): string {
  if (hour === null || hour === undefined) return 'N/A';
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:00 ${period}`;
}
