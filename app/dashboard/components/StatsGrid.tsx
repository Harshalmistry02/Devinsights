'use client';

import { Code, Activity, Flame, Star, RefreshCw } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  calculateComparativePeriod,
  formatChangePercent,
  formatChange,
  getTrendIndicator,
  type PeriodMetrics,
} from "@/lib/analytics/comparison-calculator";

interface StatsGridProps {
  analytics: any;
  previousAnalytics?: any;
}

/**
 * Enhanced Stats Grid with Comparative Period Analytics
 * SpaceX-inspired: minimal, achromatic, uppercase labels
 */
export function StatsGrid({ analytics: initialAnalytics, previousAnalytics }: StatsGridProps) {
  const [analytics, setAnalytics] = useState(initialAnalytics);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const hasSyncedData = analytics !== null && (analytics.totalCommits > 0 || analytics.totalRepos > 0);

  const comparativePeriod = useMemo(() => {
    return calculateComparativePeriod(
      analytics?.dailyCommits,
      30,
      analytics?.currentStreak || 0,
      previousAnalytics?.currentStreak || 0
    );
  }, [analytics, previousAnalytics]);

  const refreshStats = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/analytics?refresh=true');
      if (!response.ok) throw new Error('Failed to refresh stats');
      const data = await response.json();
      setAnalytics(data.data);
      toast.success('Statistics refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh stats:', error);
      toast.error('Failed to refresh statistics');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div>
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <p className="text-micro" style={{ letterSpacing: "1.5px" }}>Statistics</p>
        <button
          onClick={refreshStats}
          disabled={isRefreshing}
          style={{
            background: "none",
            border: "none",
            color: "var(--spectral-white)",
            cursor: isRefreshing ? "wait" : "pointer",
            opacity: isRefreshing ? 0.3 : 0.4,
            transition: "opacity 0.2s ease",
            padding: "4px",
            display: "flex",
            alignItems: "center",
          }}
          title="Refresh statistics"
          aria-label="Refresh statistics"
          onMouseOver={(e) => !isRefreshing && (e.currentTarget.style.opacity = "0.8")}
          onMouseOut={(e) => !isRefreshing && (e.currentTarget.style.opacity = "0.4")}
        >
          <RefreshCw
            size={14}
            style={{ animation: isRefreshing ? "spin 1s linear infinite" : "none" }}
          />
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "1px",
          background: "rgba(240,240,250,0.06)",
          border: "1px solid rgba(240,240,250,0.06)",
          borderRadius: "var(--radius-sharp)",
          overflow: "hidden",
        }}
        className="stats-responsive"
      >
        <style>{`
          @media (min-width: 1024px) {
            .stats-responsive {
              grid-template-columns: repeat(4, 1fr) !important;
            }
          }
        `}</style>

        {isRefreshing ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              icon={<Code size={16} />}
              title="Repositories"
              value={analytics?.totalRepos?.toString() || "0"}
              subtitle={hasSyncedData ? "synced repos" : "sync to see"}
              metrics={null}
            />
            <StatCard
              icon={<Activity size={16} />}
              title="Total Commits"
              value={formatNumber(analytics?.totalCommits || 0)}
              subtitle={hasSyncedData ? "all time" : "sync to see"}
              metrics={comparativePeriod.totalCommits}
              period="30d"
            />
            <StatCard
              icon={<Flame size={16} />}
              title="Current Streak"
              value={analytics?.currentStreak?.toString() || "0"}
              subtitle={
                analytics?.currentStreak
                  ? `${analytics.currentStreak} day${analytics.currentStreak !== 1 ? "s" : ""}`
                  : "days"
              }
              highlight={analytics?.isActiveToday}
              metrics={comparativePeriod.streak}
              period="30d"
            />
            <StatCard
              icon={<Star size={16} />}
              title="Stars Earned"
              value={formatNumber(analytics?.totalStars || 0)}
              subtitle="across repos"
              metrics={null}
            />
          </>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle?: string;
  highlight?: boolean;
  metrics?: PeriodMetrics | null;
  period?: "7d" | "30d" | "90d";
}

function StatCard({
  icon,
  title,
  value,
  subtitle,
  highlight = false,
  metrics,
  period = "30d",
}: StatCardProps) {
  const trendIndicator = metrics ? getTrendIndicator(metrics.trend, metrics.isImprovement) : null;

  return (
    <div
      role="region"
      aria-label={`${title} statistics`}
      style={{
        background: "rgba(0,0,0,0.6)",
        padding: "20px 20px 18px",
        position: "relative",
        transition: "background 0.2s ease",
      }}
      onMouseOver={(e) => (e.currentTarget.style.background = "rgba(240,240,250,0.03)")}
      onMouseOut={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.6)")}
    >
      {/* Active pulse indicator */}
      {highlight && (
        <div
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "rgba(251,191,36,0.7)",
            animation: "pulse 2s ease infinite",
          }}
          aria-label="Active today"
        />
      )}

      {/* Icon + trend badge row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <div style={{ opacity: 0.35 }} aria-hidden="true">
          {icon}
        </div>

        {/* Trend badge */}
        {metrics && metrics.trend !== 'stable' && (
          <span
            style={{
              fontSize: "0.625rem",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              padding: "2px 6px",
              border: `1px solid ${metrics.isImprovement ? "rgba(134,239,172,0.2)" : "rgba(252,165,165,0.2)"}`,
              color: metrics.isImprovement ? "rgba(134,239,172,0.7)" : "rgba(252,165,165,0.7)",
              borderRadius: "2px",
            }}
            aria-label={trendIndicator?.label}
          >
            {formatChangePercent(metrics.changePercent)}
          </span>
        )}
      </div>

      {/* Label */}
      <p className="text-micro" style={{ opacity: 0.35, marginBottom: "6px" }}>{title}</p>

      {/* Value */}
      <p className="stat-value" style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)" }} aria-live="polite">
        {value}
      </p>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-micro" style={{ marginTop: "4px", opacity: 0.25 }}>{subtitle}</p>
      )}

      {/* Comparative section */}
      {metrics && (
        <div
          style={{
            marginTop: "12px",
            paddingTop: "10px",
            borderTop: "1px solid rgba(240,240,250,0.05)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
            <span
              style={{
                fontSize: "0.688rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: metrics.trend === "up"
                  ? "rgba(134,239,172,0.6)"
                  : metrics.trend === "down"
                  ? "rgba(252,165,165,0.6)"
                  : "rgba(240,240,250,0.3)",
              }}
              aria-label={`Change: ${formatChange(metrics.change)} (${formatChangePercent(metrics.changePercent)})`}
            >
              {trendIndicator?.emoji} {formatChange(metrics.change, 0)}
            </span>
            <span className="text-micro" style={{ opacity: 0.25 }}>vs prev {period}</span>
          </div>
          <p className="text-micro" style={{ marginTop: "3px", opacity: 0.2 }}>
            Prev: {metrics.previous > 0 ? formatNumber(Math.round(metrics.previous)) : '—'}
          </p>
        </div>
      )}
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div style={{ background: "rgba(0,0,0,0.6)", padding: "20px 20px 18px" }}>
      <div className="skeleton" style={{ width: "16px", height: "16px", marginBottom: "12px" }} />
      <div className="skeleton" style={{ width: "60px", height: "10px", marginBottom: "6px" }} />
      <div className="skeleton" style={{ width: "80px", height: "28px", marginBottom: "4px" }} />
      <div className="skeleton" style={{ width: "50px", height: "8px" }} />
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}
