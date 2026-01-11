'use client';

import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Flame, 
  Trophy, 
  Clock, 
  GitCommit,
  Code,
  Target,
  ExternalLink,
  Sparkles
} from "lucide-react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  buildWeeklySummary,
  getWeekLabel,
  formatWeekChange,
  type WeeklySummaryData,
} from "@/lib/analytics/weekly-summary";

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
 * Weekly Summary Widget
 * 
 * Shows "This Week at a Glance" with:
 * - Progress metrics with week-over-week comparison
 * - Highlights (best day, most active time, streak milestone)
 * - Quick action buttons
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
      <div className={cn(
        "relative overflow-hidden rounded-2xl",
        "bg-linear-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10",
        "border border-cyan-500/20",
        "p-6",
        className
      )}>
        <div className="flex items-center gap-3 text-slate-400">
          <Calendar className="w-5 h-5" />
          <span>Sync your data to see weekly summary</span>
        </div>
      </div>
    );
  }

  const { currentWeek, comparison, highlights, streakInfo } = summaryData;

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl",
      "bg-linear-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10",
      "border border-cyan-500/20",
      "backdrop-blur-sm",
      className
    )}>
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Calendar className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                <span>📊</span>
                {getWeekLabel(currentWeek.weekNumber, currentWeek.year)}
              </h3>
              <p className="text-xs text-slate-500">This Week at a Glance</p>
            </div>
          </div>
          
          {/* Overall Trend Badge */}
          <TrendBadge 
            trend={comparison.trend} 
            percentChange={comparison.commitsPercentChange} 
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progress Section */}
          <div className="lg:col-span-1">
            <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Progress
            </h4>
            <div className="space-y-2">
              <ProgressItem
                icon={<GitCommit className="w-4 h-4" />}
                label="commits"
                value={currentWeek.totalCommits}
                change={comparison.commitsDiff}
                changeLabel="vs last week"
                positive={comparison.commitsDiff >= 0}
              />
              <ProgressItem
                icon={<Flame className="w-4 h-4" />}
                label="day streak"
                value={streakInfo.current}
                badge={streakInfo.isActive ? "🔥" : undefined}
                positive={true}
              />
              <ProgressItem
                icon={<Code className="w-4 h-4" />}
                label="repos touched"
                value={highlights.totalReposTouched}
                positive={true}
              />
              {comparison.weekendChange !== 0 && (
                <div className={cn(
                  "flex items-center gap-2 text-xs py-1.5 px-2 rounded-lg",
                  comparison.weekendChange < 0 
                    ? "bg-amber-500/10 text-amber-400" 
                    : "bg-emerald-500/10 text-emerald-400"
                )}>
                  <span>⚠️</span>
                  <span>
                    Weekend activity {comparison.weekendChange > 0 ? 'up' : 'down'} {Math.abs(comparison.weekendChange)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Highlights Section */}
          <div className="lg:col-span-1">
            <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Highlights
            </h4>
            <div className="space-y-2">
              {highlights.bestDay && (
                <HighlightItem
                  emoji="🏆"
                  label="Best day"
                  value={`${highlights.bestDay.dayName} (${highlights.bestDay.commits} commits)`}
                />
              )}
              {highlights.mostActiveHour && (
                <HighlightItem
                  emoji="💻"
                  label="Most active"
                  value={highlights.mostActiveHour.label}
                />
              )}
              {streakInfo.daysToMilestone && streakInfo.milestoneLabel && (
                <HighlightItem
                  emoji="🎯"
                  label="Streak milestone"
                  value={`${streakInfo.daysToMilestone} day${streakInfo.daysToMilestone !== 1 ? 's' : ''} to ${streakInfo.milestoneLabel} badge`}
                  highlight
                />
              )}
              {highlights.topRepos.length > 0 && (
                <HighlightItem
                  emoji="📦"
                  label="Top repos"
                  value={highlights.topRepos.slice(0, 2).join(', ')}
                />
              )}
            </div>
          </div>

          {/* Mini Activity Chart */}
          <div className="lg:col-span-1">
            <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              This Week
            </h4>
            <WeekMiniChart data={currentWeek.dailyBreakdown} />
            
            {/* Quick Actions */}
            <div className="flex gap-2 mt-4">
              {!streakInfo.isActive && (
                <QuickActionButton
                  label="Commit Today"
                  icon={<GitCommit className="w-3.5 h-3.5" />}
                  variant="primary"
                />
              )}
              <QuickActionButton
                label="Weekly Report"
                icon={<ExternalLink className="w-3.5 h-3.5" />}
                variant="secondary"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Trend Badge Component
 */
function TrendBadge({ 
  trend, 
  percentChange 
}: { 
  trend: 'up' | 'down' | 'stable';
  percentChange: number;
}) {
  const config = {
    up: {
      icon: TrendingUp,
      bg: 'bg-emerald-500/20',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
    },
    down: {
      icon: TrendingDown,
      bg: 'bg-rose-500/20',
      border: 'border-rose-500/30',
      text: 'text-rose-400',
    },
    stable: {
      icon: Minus,
      bg: 'bg-slate-500/20',
      border: 'border-slate-500/30',
      text: 'text-slate-400',
    },
  };

  const { icon: Icon, bg, border, text } = config[trend];

  return (
    <div className={cn(
      "flex items-center gap-1.5 px-3 py-1.5 rounded-full border",
      bg, border
    )}>
      <Icon className={cn("w-4 h-4", text)} />
      <span className={cn("text-sm font-medium", text)}>
        {percentChange > 0 ? '+' : ''}{percentChange}%
      </span>
    </div>
  );
}

/**
 * Progress Item Component
 */
function ProgressItem({
  icon,
  label,
  value,
  change,
  changeLabel,
  badge,
  positive = true,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  change?: number;
  changeLabel?: string;
  badge?: string;
  positive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2 text-slate-300">
        <span className="text-cyan-400">{icon}</span>
        <span className="text-sm">
          <span className="font-semibold text-slate-200">{value}</span>
          {' '}{label}
          {badge && <span className="ml-1">{badge}</span>}
        </span>
      </div>
      {change !== undefined && (
        <span className={cn(
          "text-xs font-medium px-2 py-0.5 rounded",
          change >= 0 
            ? "bg-emerald-500/20 text-emerald-400" 
            : "bg-rose-500/20 text-rose-400"
        )}>
          {formatWeekChange(change)} {changeLabel}
        </span>
      )}
    </div>
  );
}

/**
 * Highlight Item Component
 */
function HighlightItem({
  emoji,
  label,
  value,
  highlight = false,
}: {
  emoji: string;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={cn(
      "flex items-start gap-2 py-1.5 px-2 rounded-lg transition-colors",
      highlight ? "bg-cyan-500/10" : "hover:bg-slate-800/30"
    )}>
      <span className="text-base">{emoji}</span>
      <div className="flex-1 min-w-0">
        <span className="text-xs text-slate-500">{label}: </span>
        <span className={cn(
          "text-sm",
          highlight ? "text-cyan-300 font-medium" : "text-slate-300"
        )}>
          {value}
        </span>
      </div>
    </div>
  );
}

/**
 * Mini Week Chart Component
 */
function WeekMiniChart({ 
  data 
}: { 
  data: { date: string; commits: number; dayName: string }[] 
}) {
  const maxCommits = Math.max(...data.map(d => d.commits), 1);
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="flex items-end justify-between gap-1 h-16">
      {data.map((day, i) => {
        const height = (day.commits / maxCommits) * 100;
        const isToday = day.date === today;
        const isFuture = day.date > today;
        
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div 
              className={cn(
                "w-full rounded-t transition-all duration-300",
                isFuture 
                  ? "bg-slate-700/30" 
                  : day.commits > 0 
                    ? isToday 
                      ? "bg-linear-to-t from-cyan-500 to-cyan-400" 
                      : "bg-linear-to-t from-blue-500 to-cyan-500"
                    : "bg-slate-700/50",
                isToday && "ring-2 ring-cyan-400 ring-offset-1 ring-offset-slate-900"
              )}
              style={{ height: `${Math.max(height, 8)}%` }}
              title={`${day.dayName}: ${day.commits} commits`}
            />
            <span className={cn(
              "text-[10px]",
              isToday ? "text-cyan-400 font-medium" : "text-slate-500"
            )}>
              {day.dayName}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Quick Action Button Component
 */
function QuickActionButton({
  label,
  icon,
  variant = 'secondary',
  onClick,
}: {
  label: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium",
        "transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400",
        variant === 'primary'
          ? "bg-cyan-500 text-white hover:bg-cyan-400 shadow-lg shadow-cyan-500/25"
          : "bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700/50"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

/**
 * Compact Weekly Summary for smaller spaces
 */
export function WeeklySummaryCompact({ analytics, className }: WeeklySummaryProps) {
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
    <div className={cn(
      "flex items-center justify-between p-4 rounded-xl",
      "bg-linear-to-r from-cyan-500/10 to-blue-500/10",
      "border border-cyan-500/20",
      className
    )}>
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-200">{currentWeek.totalCommits}</div>
          <div className="text-xs text-slate-500">commits</div>
        </div>
        <div className="h-8 w-px bg-slate-700" />
        <div className="flex items-center gap-2">
          {streakInfo.current > 0 && (
            <span className="text-lg">🔥</span>
          )}
          <span className="text-sm text-slate-300">
            {streakInfo.current} day streak
          </span>
        </div>
      </div>
      <TrendBadge trend={comparison.trend} percentChange={comparison.commitsPercentChange} />
    </div>
  );
}
