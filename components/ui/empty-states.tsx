'use client';

import React from 'react';
import {
  Github,
  Activity,
  Code,
  TrendingUp,
  BarChart3,
  PieChart,
  Calendar,
  Zap,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  XCircle
} from 'lucide-react';
import Link from 'next/link';

/**
 * Empty State Components — SpaceX-inspired, minimal achromatic design
 */

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  variant?: 'default' | 'compact';
}

// Generic Empty State Component
export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'default'
}: EmptyStateProps) {
  const isCompact = variant === 'compact';

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: isCompact ? "100px" : "160px",
      }}
      role="status"
      aria-label={`${title}: ${description}`}
    >
      <div style={{ textAlign: "center" }}>
        {icon && (
          <div style={{ marginBottom: isCompact ? "8px" : "12px", opacity: 0.15 }} aria-hidden="true">
            {icon}
          </div>
        )}
        <p className="text-caption-bold" style={{ opacity: 0.45, marginBottom: "4px" }}>{title}</p>
        <p className="text-micro" style={{ opacity: 0.25, maxWidth: "240px" }}>{description}</p>
        {action && (
          <div style={{ marginTop: "16px" }}>
            {action.href ? (
              <Link
                href={action.href}
                className="btn-ghost btn-ghost-sm"
                aria-label={action.label}
              >
                {action.label}
              </Link>
            ) : (
              <button
                onClick={action.onClick}
                className="btn-ghost btn-ghost-sm"
                aria-label={action.label}
              >
                {action.label}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// First-time user empty state - No synced data
export function NoDataEmptyState() {
  return (
    <div
      style={{
        background: "rgba(240,240,250,0.02)",
        border: "1px solid rgba(240,240,250,0.06)",
        borderRadius: "var(--radius-sharp)",
        padding: "40px 24px",
        textAlign: "center",
      }}
      role="region"
      aria-label="No data available"
    >
      <div style={{ maxWidth: "360px", margin: "0 auto" }}>
        <div
          style={{
            width: "52px",
            height: "52px",
            margin: "0 auto 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0.2,
          }}
          aria-hidden="true"
        >
          <Github size={40} />
        </div>
        <h3 className="text-caption-bold" style={{ fontSize: "0.875rem", marginBottom: "8px", opacity: 0.7 }}>
          Sync your GitHub data to see insights
        </h3>
        <p className="text-micro" style={{ opacity: 0.3, marginBottom: "24px", maxWidth: "280px", margin: "0 auto 24px" }}>
          Connect and sync your GitHub repositories to unlock powerful analytics,
          activity tracking, and AI-powered insights about your coding patterns.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "center" }} aria-label="Benefits of syncing">
          <div style={{ display: "flex", alignItems: "center", gap: "6px", opacity: 0.3 }}>
            <Activity size={12} aria-hidden="true" />
            <span className="text-micro">Track your commits</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", opacity: 0.3 }}>
            <Code size={12} aria-hidden="true" />
            <span className="text-micro">Analyze languages</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", opacity: 0.3 }}>
            <TrendingUp size={12} aria-hidden="true" />
            <span className="text-micro">Discover patterns</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Activity Empty State
export function ActivityEmptyState() {
  return (
    <EmptyState
      icon={<Activity size={40} />}
      title="No activity data yet"
      description='Use the "Sync GitHub Data" button to get started'
    />
  );
}

// Chart Empty State
export function ChartEmptyState({ chartType = 'chart' }: { chartType?: string }) {
  const icons: Record<string, React.ReactNode> = {
    timeline: <TrendingUp size={32} />,
    heatmap: <Calendar size={32} />,
    bar: <BarChart3 size={32} />,
    pie: <PieChart size={32} />,
    chart: <BarChart3 size={32} />,
  };

  return (
    <div
      style={{
        height: "200px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(240,240,250,0.02)",
        border: "1px solid rgba(240,240,250,0.05)",
        borderRadius: "var(--radius-sharp)",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ opacity: 0.1, marginBottom: "8px" }}>
          {icons[chartType] || icons.chart}
        </div>
        <p className="text-micro" style={{ opacity: 0.25 }}>No data available</p>
        <p className="text-micro" style={{ opacity: 0.15, marginTop: "3px" }}>Sync your GitHub data to see {chartType}</p>
      </div>
    </div>
  );
}

// Language Empty State
export function LanguageEmptyState() {
  return (
    <EmptyState
      icon={<Code size={32} />}
      title="No language data yet"
      description="Language statistics will appear after syncing repositories"
      variant="compact"
    />
  );
}

// Streak Empty State
export function StreakEmptyState() {
  return (
    <div style={{ textAlign: "center", padding: "8px 0" }}>
      <Zap size={16} style={{ margin: "0 auto 4px", opacity: 0.15 }} />
      <p className="text-caption" style={{ opacity: 0.35 }}>Start today!</p>
      <p className="text-micro" style={{ opacity: 0.2 }}>Make a commit to begin your streak</p>
    </div>
  );
}

// Error Banner Component
interface ErrorBannerProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorBanner({
  title = "Sync Error",
  message,
  onRetry,
  onDismiss
}: ErrorBannerProps) {
  return (
    <div
      style={{
        background: "rgba(252,165,165,0.04)",
        border: "1px solid rgba(252,165,165,0.12)",
        borderRadius: "var(--radius-sharp)",
        padding: "16px 20px",
        marginBottom: "20px",
      }}
      role="alert"
      aria-live="assertive"
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <XCircle size={14} style={{ color: "rgba(252,165,165,0.6)", flexShrink: 0, marginTop: "1px" }} aria-hidden="true" />
        <div style={{ flex: 1 }}>
          <p className="text-caption-bold" style={{ color: "rgba(252,165,165,0.7)", marginBottom: "4px" }}>{title}</p>
          <p className="text-caption" style={{ color: "rgba(252,165,165,0.5)" }}>{message}</p>
          <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
            {onRetry && (
              <button
                onClick={onRetry}
                className="btn-ghost btn-ghost-sm"
                style={{ fontSize: "0.625rem" }}
                aria-label="Retry the failed sync"
              >
                <RefreshCw size={10} />
                Retry Sync
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-micro"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--spectral-white)",
                  opacity: 0.3,
                  transition: "opacity 0.2s ease",
                }}
                aria-label="Dismiss error"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Warning Banner Component (for partial sync)
interface WarningBannerProps {
  syncedRepos: number;
  totalRepos: number;
  onRetry?: () => void;
}

export function PartialSyncWarning({
  syncedRepos,
  totalRepos,
  onRetry
}: WarningBannerProps) {
  return (
    <div
      style={{
        background: "rgba(251,191,36,0.04)",
        border: "1px solid rgba(251,191,36,0.12)",
        borderRadius: "var(--radius-sharp)",
        padding: "16px 20px",
        marginBottom: "20px",
      }}
      role="status"
      aria-label="Partial sync notice"
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <AlertTriangle size={14} style={{ color: "rgba(251,191,36,0.6)", flexShrink: 0, marginTop: "1px" }} aria-hidden="true" />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <p className="text-caption-bold" style={{ color: "rgba(251,191,36,0.7)" }}>Partial Sync</p>
            <span
              className="text-micro"
              style={{
                padding: "2px 6px",
                border: "1px solid rgba(251,191,36,0.2)",
                color: "rgba(251,191,36,0.5)",
                borderRadius: "2px",
              }}
            >
              {syncedRepos}/{totalRepos} repos
            </span>
          </div>
          <p className="text-caption" style={{ color: "rgba(251,191,36,0.4)" }}>
            Some repositories couldn&apos;t be synced. Showing available data.
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="btn-ghost btn-ghost-sm"
              style={{ marginTop: "10px", fontSize: "0.625rem" }}
              aria-label="Retry sync for remaining repositories"
            >
              <RefreshCw size={10} />
              Retry Sync
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Sync In Progress Banner
interface SyncProgressBannerProps {
  progress?: number;
  message?: string;
  processedRepos?: number;
  totalRepos?: number;
}

export function SyncProgressBanner({
  progress = 0,
  message = "Syncing GitHub data...",
  processedRepos,
  totalRepos
}: SyncProgressBannerProps) {
  return (
    <div
      style={{
        background: "rgba(240,240,250,0.03)",
        border: "1px solid rgba(240,240,250,0.08)",
        borderRadius: "var(--radius-sharp)",
        padding: "16px 20px",
        marginBottom: "20px",
      }}
      role="region"
      aria-label="Sync progress"
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <RefreshCw
          size={14}
          style={{ opacity: 0.4, animation: "spin 1s linear infinite", flexShrink: 0 }}
          aria-hidden="true"
        />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <p className="text-caption" style={{ opacity: 0.6 }}>{message}</p>
            {processedRepos !== undefined && totalRepos !== undefined && (
              <span
                className="text-micro"
                style={{ opacity: 0.35 }}
                aria-label={`${processedRepos} of ${totalRepos} repositories processed`}
              >
                {processedRepos}/{totalRepos} repos
              </span>
            )}
          </div>
          <div
            className="progress-bar-track"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Sync progress: ${progress}%`}
          >
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-micro" style={{ marginTop: "4px", opacity: 0.2 }}>{progress}% complete</p>
        </div>
      </div>
    </div>
  );
}

// Info Notice Component
interface InfoNoticeProps {
  icon?: React.ReactNode;
  message: string;
}

export function InfoNotice({ icon, message }: InfoNoticeProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 12px",
        background: "rgba(240,240,250,0.02)",
        border: "1px solid rgba(240,240,250,0.06)",
        borderRadius: "2px",
      }}
    >
      <span style={{ opacity: 0.3 }}>{icon || <AlertCircle size={12} />}</span>
      <span className="text-micro" style={{ opacity: 0.4 }}>{message}</span>
    </div>
  );
}
