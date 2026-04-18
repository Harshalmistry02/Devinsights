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
        <p className="text-caption-bold uppercase tracking-widest text-[#f0f0fa]" style={{ opacity: 0.45, marginBottom: "4px" }}>{title}</p>
        <p className="text-micro uppercase tracking-widest" style={{ opacity: 0.25, maxWidth: "240px" }}>{description}</p>
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
        <h3 className="text-caption-bold text-sm uppercase tracking-widest text-[#f0f0fa]" style={{ marginBottom: "12px", opacity: 0.7 }}>
          SYNC YOUR GITHUB DATA TO SEE INSIGHTS
        </h3>
        <p className="text-micro uppercase tracking-widest" style={{ opacity: 0.3, marginBottom: "24px", maxWidth: "280px", margin: "0 auto 24px" }}>
          CONNECT AND SYNC YOUR GITHUB REPOSITORIES TO UNLOCK POWERFUL ANALYTICS,
          ACTIVITY TRACKING, AND AI-POWERED INSIGHTS ABOUT YOUR CODING PATTERNS.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "center" }} aria-label="Benefits of syncing">
          <div style={{ display: "flex", alignItems: "center", gap: "6px", opacity: 0.3 }}>
            <Activity size={12} aria-hidden="true" />
            <span className="text-micro uppercase tracking-widest">TRACK YOUR COMMITS</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", opacity: 0.3 }}>
            <Code size={12} aria-hidden="true" />
            <span className="text-micro uppercase tracking-widest">ANALYZE LANGUAGES</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", opacity: 0.3 }}>
            <TrendingUp size={12} aria-hidden="true" />
            <span className="text-micro uppercase tracking-widest">DISCOVER PATTERNS</span>
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
      title="NO ACTIVITY DATA YET"
      description='USE THE "SYNC GITHUB DATA" BUTTON TO GET STARTED'
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
        <p className="text-micro uppercase tracking-widest" style={{ opacity: 0.25 }}>NO DATA AVAILABLE</p>
        <p className="text-micro uppercase tracking-widest" style={{ opacity: 0.15, marginTop: "3px" }}>SYNC YOUR GITHUB DATA TO SEE {chartType.toUpperCase()}</p>
      </div>
    </div>
  );
}

// Language Empty State
export function LanguageEmptyState() {
  return (
    <EmptyState
      icon={<Code size={32} />}
      title="NO LANGUAGE DATA YET"
      description="LANGUAGE STATISTICS WILL APPEAR AFTER SYNCING REPOSITORIES"
      variant="compact"
    />
  );
}

// Streak Empty State
export function StreakEmptyState() {
  return (
    <div style={{ textAlign: "center", padding: "8px 0" }}>
      <Zap size={16} style={{ margin: "0 auto 4px", opacity: 0.15 }} />
      <p className="text-caption uppercase tracking-widest" style={{ opacity: 0.35 }}>START TODAY!</p>
      <p className="text-micro uppercase tracking-widest" style={{ opacity: 0.2 }}>MAKE A COMMIT TO BEGIN YOUR STREAK</p>
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
          <p className="text-caption-bold uppercase tracking-widest" style={{ color: "rgba(252,165,165,0.7)", marginBottom: "4px" }}>{title.toUpperCase()}</p>
          <p className="text-caption uppercase tracking-widest text-xs" style={{ color: "rgba(252,165,165,0.5)" }}>{message.toUpperCase()}</p>
          <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
            {onRetry && (
              <button
                onClick={onRetry}
                className="btn-ghost btn-ghost-sm"
                style={{ fontSize: "0.625rem" }}
                aria-label="Retry the failed sync"
              >
                <RefreshCw size={10} />
                RETRY SYNC
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-micro uppercase tracking-widest"
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
                DISMISS
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
            <p className="text-caption-bold uppercase tracking-widest" style={{ color: "rgba(251,191,36,0.7)" }}>PARTIAL SYNC</p>
            <span
              className="text-micro uppercase tracking-widest"
              style={{
                padding: "2px 6px",
                border: "1px solid rgba(251,191,36,0.2)",
                color: "rgba(251,191,36,0.5)",
                borderRadius: "2px",
              }}
            >
              {syncedRepos}/{totalRepos} REPOS
            </span>
          </div>
          <p className="text-caption uppercase tracking-widest text-xs" style={{ color: "rgba(251,191,36,0.4)" }}>
            SOME REPOSITORIES COULDN&apos;T BE SYNCED. SHOWING AVAILABLE DATA.
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="btn-ghost btn-ghost-sm"
              style={{ marginTop: "10px", fontSize: "0.625rem" }}
              aria-label="Retry sync for remaining repositories"
            >
              <RefreshCw size={10} />
              RETRY SYNC
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
            <p className="text-caption uppercase tracking-widest" style={{ opacity: 0.6 }}>{message.toUpperCase()}</p>
            {processedRepos !== undefined && totalRepos !== undefined && (
              <span
                className="text-micro uppercase tracking-widest"
                style={{ opacity: 0.35 }}
                aria-label={`${processedRepos} of ${totalRepos} repositories processed`}
              >
                {processedRepos}/{totalRepos} REPOS
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
          <p className="text-micro uppercase tracking-widest" style={{ marginTop: "4px", opacity: 0.2 }}>{progress}% COMPLETE</p>
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
      <span className="text-micro uppercase tracking-widest" style={{ opacity: 0.4 }}>{message.toUpperCase()}</span>
    </div>
  );
}
