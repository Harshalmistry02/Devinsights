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
 * Empty State Components for Dashboard
 * 
 * Provides meaningful feedback when data is not available,
 * guiding users on what actions to take next.
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
      className={`flex items-center justify-center ${isCompact ? 'h-32' : 'h-48'} text-slate-500`}
      role="status"
      aria-label={`${title}: ${description}`}
    >
      <div className="text-center">
        {icon && (
          <div className={`mx-auto ${isCompact ? 'mb-2' : 'mb-3'} opacity-50`} aria-hidden="true">
            {icon}
          </div>
        )}
        <p className={`${isCompact ? 'text-xs' : 'text-sm'} font-medium text-slate-400`}>{title}</p>
        <p className={`${isCompact ? 'text-xs' : 'text-xs'} mt-1 text-slate-600`}>
          {description}
        </p>
        {action && (
          <div className="mt-3">
            {action.href ? (
              <Link
                href={action.href}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/20 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                aria-label={action.label}
              >
                {action.label}
              </Link>
            ) : (
              <button
                onClick={action.onClick}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/20 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900"
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
      className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-8 backdrop-blur-sm"
      role="region"
      aria-label="No data available"
    >
      <div className="text-center max-w-md mx-auto">
        <div 
          className="w-16 h-16 mx-auto mb-4 rounded-full bg-linear-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30"
          aria-hidden="true"
        >
          <Github className="w-8 h-8 text-cyan-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-200 mb-2">
          Sync your GitHub data to see insights
        </h3>
        <p className="text-sm text-slate-400 mb-6">
          Connect and sync your GitHub repositories to unlock powerful analytics, 
          activity tracking, and AI-powered insights about your coding patterns.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center" aria-label="Benefits of syncing">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Activity className="w-4 h-4" aria-hidden="true" />
            <span>Track your commits</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Code className="w-4 h-4" aria-hidden="true" />
            <span>Analyze languages</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <TrendingUp className="w-4 h-4" aria-hidden="true" />
            <span>Discover patterns</span>
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
      icon={<Activity className="w-12 h-12" />}
      title="No activity data yet"
      description='Use the "Sync GitHub Data" button to get started'
    />
  );
}

// Chart Empty State
export function ChartEmptyState({ chartType = 'chart' }: { chartType?: string }) {
  const icons: Record<string, React.ReactNode> = {
    timeline: <TrendingUp className="w-10 h-10" />,
    heatmap: <Calendar className="w-10 h-10" />,
    bar: <BarChart3 className="w-10 h-10" />,
    pie: <PieChart className="w-10 h-10" />,
    chart: <BarChart3 className="w-10 h-10" />,
  };

  return (
    <div className="h-64 flex items-center justify-center bg-slate-800/30 rounded-lg border border-slate-700/20">
      <div className="text-center text-slate-500">
        <div className="mx-auto mb-2 opacity-40">
          {icons[chartType] || icons.chart}
        </div>
        <p className="text-sm">No data available</p>
        <p className="text-xs text-slate-600 mt-1">Sync your GitHub data to see {chartType}</p>
      </div>
    </div>
  );
}

// Language Empty State
export function LanguageEmptyState() {
  return (
    <EmptyState
      icon={<Code className="w-10 h-10" />}
      title="No language data yet"
      description="Language statistics will appear after syncing repositories"
      variant="compact"
    />
  );
}

// Streak Empty State
export function StreakEmptyState() {
  return (
    <div className="text-center py-2">
      <Zap className="w-5 h-5 mx-auto mb-1 text-slate-500 opacity-50" />
      <p className="text-sm text-slate-400">Start today!</p>
      <p className="text-xs text-slate-600">Make a commit to begin your streak</p>
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
      className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 backdrop-blur-sm mb-6 animate-in slide-in-from-top-2 duration-300"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-red-400 mb-1">{title}</h4>
          <p className="text-sm text-red-300/80">{message}</p>
          <div className="flex gap-2 mt-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                aria-label="Retry the failed sync"
              >
                <RefreshCw className="w-3 h-3" aria-hidden="true" />
                Retry Sync
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                aria-label="Dismiss this error banner"
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
      className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 backdrop-blur-sm mb-6 animate-in slide-in-from-top-2 duration-300"
      role="status"
      aria-label="Partial sync notice"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-medium text-amber-400">Partial Sync</h4>
            <span className="px-2 py-0.5 text-xs bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-400">
              {syncedRepos}/{totalRepos} repos
            </span>
          </div>
          <p className="text-sm text-amber-300/80">
            Some repositories couldn't be synced. Showing available data.
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900"
              aria-label="Retry sync for remaining repositories"
            >
              <RefreshCw className="w-3 h-3" aria-hidden="true" />
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
      className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 backdrop-blur-sm mb-6 animate-in fade-in duration-300"
      role="region"
      aria-label="Sync progress"
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-cyan-400 font-medium">{message}</p>
            {processedRepos !== undefined && totalRepos !== undefined && (
              <span className="text-xs text-cyan-400/70" aria-label={`${processedRepos} of ${totalRepos} repositories processed`}>
                {processedRepos}/{totalRepos} repos
              </span>
            )}
          </div>
          <div 
            className="h-1.5 bg-slate-800/80 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Sync progress: ${progress}%`}
          >
            <div
              className="h-full bg-linear-to-r from-cyan-500 via-blue-500 to-cyan-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1.5" aria-hidden="true">{progress}% complete</p>
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
    <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/30 border border-slate-700/20 rounded-lg text-slate-500 text-xs">
      {icon || <AlertCircle className="w-4 h-4" />}
      <span>{message}</span>
    </div>
  );
}
