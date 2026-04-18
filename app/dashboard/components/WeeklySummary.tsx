'use client';

import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Flame,
  Clock,
  GitCommit,
  Code,
  Target,
  ExternalLink,
  Sparkles
} from "lucide-react";
import { useMemo } from "react";
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
      <div
        style={{
          background: "rgba(240,240,250,0.02)",
          border: "1px solid rgba(240,240,250,0.06)",
          borderRadius: "var(--radius-sharp)",
          padding: "20px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          opacity: 0.5,
        }}
      >
        <Calendar size={14} />
        <span className="text-caption">Sync your data to see weekly summary</span>
      </div>
    );
  }

  const { currentWeek, comparison, highlights, streakInfo } = summaryData;

  return (
    <div
      className="brutalist-glass"
      style={{
        padding: "0",
        borderRadius: "2px",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid rgba(240,240,250,0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Calendar size={14} style={{ opacity: 0.35 }} aria-hidden="true" />
          <div>
            <p className="text-caption-bold" style={{ fontSize: "0.75rem" }}>
              {getWeekLabel(currentWeek.weekNumber, currentWeek.year)}
            </p>
            <p className="text-micro uppercase tracking-widest" style={{ opacity: 0.3, marginTop: "2px" }}>THIS WEEK AT A GLANCE</p>
          </div>
        </div>

        {/* Overall trend */}
        <TrendBadge trend={comparison.trend} percentChange={comparison.commitsPercentChange} />
      </div>

      {/* Content Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "24px",
          background: "transparent",
        }}
        className="weekly-grid"
      >
        <style>{`
          @media (min-width: 960px) {
            .weekly-grid {
              grid-template-columns: repeat(3, 1fr) !important;
            }
          }
        `}</style>

        {/* Progress Section */}
        <div style={{ background: "transparent", padding: "0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", opacity: 0.4 }}>
            <Target size={12} />
            <p className="text-micro uppercase tracking-widest">PROGRESS</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <ProgressItem
              icon={<GitCommit size={12} />}
              label="COMMITS"
              value={currentWeek.totalCommits}
              change={comparison.commitsDiff}
              changeLabel="VS LAST WEEK"
              positive={comparison.commitsDiff >= 0}
            />
            <ProgressItem
              icon={<Flame size={12} />}
              label="DAY STREAK"
              value={streakInfo.current}
              positive={true}
            />
            <ProgressItem
              icon={<Code size={12} />}
              label="REPOS TOUCHED"
              value={highlights.totalReposTouched}
              positive={true}
            />
            {comparison.weekendChange !== 0 && (
              <p
                className="text-micro"
                style={{
                  padding: "6px 10px",
                  border: `1px solid ${comparison.weekendChange < 0 ? "rgba(251,191,36,0.2)" : "rgba(134,239,172,0.2)"}`,
                  color: comparison.weekendChange < 0 ? "rgba(251,191,36,0.6)" : "rgba(134,239,172,0.6)",
                  borderRadius: "2px",
                }}
              >
                Weekend activity {comparison.weekendChange > 0 ? 'up' : 'down'} {Math.abs(comparison.weekendChange)}%
              </p>
            )}
          </div>
        </div>

        {/* Highlights Section */}
        <div style={{ background: "transparent", padding: "0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", opacity: 0.4 }}>
            <Sparkles size={12} />
            <p className="text-micro uppercase tracking-widest">HIGHLIGHTS</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {highlights.bestDay && (
              <HighlightItem
                label="BEST DAY"
                value={`${highlights.bestDay.dayName} (${highlights.bestDay.commits} COMMITS)`}
              />
            )}
            {highlights.mostActiveHour && (
              <HighlightItem
                label="MOST ACTIVE"
                value={highlights.mostActiveHour.label}
              />
            )}
            {streakInfo.daysToMilestone && streakInfo.milestoneLabel && (
              <HighlightItem
                label="STREAK MILESTONE"
                value={`${streakInfo.daysToMilestone} DAY${streakInfo.daysToMilestone !== 1 ? 'S' : ''} TO ${streakInfo.milestoneLabel} BADGE`}
                highlight
              />
            )}
            {highlights.topRepos.length > 0 && (
              <HighlightItem
                label="TOP REPOS"
                value={highlights.topRepos.slice(0, 2).join(', ').toUpperCase()}
              />
            )}
          </div>
        </div>

        {/* Mini Chart Section */}
        <div style={{ background: "transparent", padding: "0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", opacity: 0.4 }}>
            <TrendingUp size={12} />
            <p className="text-micro uppercase tracking-widest">THIS WEEK</p>
          </div>
          <WeekMiniChart data={currentWeek.dailyBreakdown} />

          {/* Quick Actions */}
          <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
            {!streakInfo.isActive && (
              <button className="btn-ghost btn-ghost-sm" style={{ fontSize: "0.625rem", padding: "8px 16px" }}>
                <GitCommit size={11} />
                COMMIT TODAY
              </button>
            )}
            <button className="btn-ghost btn-ghost-sm" style={{ fontSize: "0.625rem", padding: "8px 16px" }}>
              <ExternalLink size={11} />
              WEEKLY REPORT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrendBadge({
  trend,
  percentChange
}: {
  trend: 'up' | 'down' | 'stable';
  percentChange: number;
}) {
  const config = {
    up: { icon: TrendingUp, color: "rgba(134,239,172,0.6)", border: "rgba(134,239,172,0.2)" },
    down: { icon: TrendingDown, color: "rgba(252,165,165,0.6)", border: "rgba(252,165,165,0.2)" },
    stable: { icon: Minus, color: "rgba(240,240,250,0.3)", border: "rgba(240,240,250,0.08)" },
  };
  const { icon: Icon, color, border } = config[trend];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 10px",
        border: `1px solid ${border}`,
        borderRadius: "2px",
      }}
    >
      <Icon size={12} style={{ color }} />
      <span className="text-micro" style={{ color }}>
        {percentChange > 0 ? '+' : ''}{percentChange}%
      </span>
    </div>
  );
}

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
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ opacity: 0.3 }}>{icon}</span>
        <span className="text-caption uppercase tracking-widest">
          <span className="text-caption-bold" style={{ fontSize: "0.75rem" }}>{value}</span>
          {' '}{label}
        </span>
      </div>
      {change !== undefined && (
        <span
          className="text-micro uppercase tracking-widest"
          style={{
            padding: "2px 6px",
            border: `1px solid ${change >= 0 ? "rgba(134,239,172,0.15)" : "rgba(252,165,165,0.15)"}`,
            color: change >= 0 ? "rgba(134,239,172,0.6)" : "rgba(252,165,165,0.6)",
            borderRadius: "2px",
          }}
        >
          {formatWeekChange(change).toUpperCase()} {changeLabel?.toUpperCase()}
        </span>
      )}
    </div>
  );
}

function HighlightItem({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "8px",
        padding: "6px 8px",
        borderRadius: "2px",
        background: highlight ? "rgba(240,240,250,0.03)" : "transparent",
        border: highlight ? "1px solid rgba(240,240,250,0.06)" : "none",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <span className="text-micro uppercase tracking-widest" style={{ opacity: 0.3 }}>{label}: </span>
        <span
          className="text-caption uppercase tracking-widest"
          style={{ opacity: highlight ? 0.8 : 0.55 }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

function WeekMiniChart({
  data
}: {
  data: { date: string; commits: number; dayName: string }[]
}) {
  const maxCommits = Math.max(...data.map(d => d.commits), 1);
  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "4px", height: "56px" }}>
      {data.map((day, i) => {
        const height = (day.commits / maxCommits) * 100;
        const isToday = day.date === today;
        const isFuture = day.date > today;

        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <div
              style={{
                width: "100%",
                borderRadius: "1px",
                height: `${Math.max(height, 6)}%`,
                background: isFuture
                  ? "rgba(240,240,250,0.05)"
                  : day.commits > 0
                    ? isToday
                      ? "var(--spectral-white)"
                      : "rgba(240,240,250,0.35)"
                    : "rgba(240,240,250,0.08)",
                outline: isToday ? "1px solid rgba(240,240,250,0.4)" : "none",
                outlineOffset: "1px",
                transition: "height 0.3s ease",
              }}
              title={`${day.dayName}: ${day.commits} commits`}
            />
            <span
              className="text-micro"
              style={{ fontSize: "0.5rem", opacity: isToday ? 0.7 : 0.25 }}
            >
              {day.dayName.charAt(0)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Compact Weekly Summary
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
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 0",
        background: "transparent",
        border: "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <div>
          <p className="stat-value" style={{ fontSize: "1.5rem" }}>{currentWeek.totalCommits}</p>
          <p className="text-micro" style={{ opacity: 0.3 }}>commits</p>
        </div>
        <div style={{ width: "1px", height: "32px", background: "rgba(240,240,250,0.08)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="text-caption uppercase tracking-widest">{streakInfo.current} DAY STREAK</span>
        </div>
      </div>
      <TrendBadge trend={comparison.trend} percentChange={comparison.commitsPercentChange} />
    </div>
  );
}
