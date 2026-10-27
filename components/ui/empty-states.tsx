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
} from 'lucide-react';
import { Card } from './card';
import { Badge } from './badge';
import { Button, ButtonLink } from './button';
import { EmptyState as BaseEmptyState } from './empty-state';
import { InlineNotice } from './inline-notice';

/**
 * Shared empty and notice states. Legacy export names are preserved so
 * existing pages keep working while they migrate to the primitives.
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

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'default',
}: EmptyStateProps) {
  return (
    <BaseEmptyState
      icon={icon}
      title={title}
      description={description}
      variant={variant}
      action={
        action
          ? action.href
            ? (
                <ButtonLink
                  href={action.href}
                  variant="secondary"
                  size="sm"
                >
                  {action.label}
                </ButtonLink>
              )
            : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              )
          : undefined
      }
    />
  );
}

// First-time user empty state — no synced data
export function NoDataEmptyState() {
  return (
    <Card className="text-center" role="region" aria-label="No data available">
      <BaseEmptyState
        icon={<Github className="size-6" />}
        title="Sync your GitHub data to see insights"
        description="Connect and sync your repositories to unlock analytics, activity tracking and AI-powered insights about your coding patterns."
      />
      <div
        className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-border-subtle pt-4"
        aria-label="Benefits of syncing"
      >
        <span className="inline-flex items-center gap-2 text-caption">
          <Activity className="size-3.5 text-accent" aria-hidden="true" />
          Track commits
        </span>
        <span className="inline-flex items-center gap-2 text-caption">
          <Code className="size-3.5 text-accent" aria-hidden="true" />
          Analyze languages
        </span>
        <span className="inline-flex items-center gap-2 text-caption">
          <TrendingUp className="size-3.5 text-accent" aria-hidden="true" />
          Discover patterns
        </span>
      </div>
      <p className="mt-4 text-caption">
        Use &quot;Sync GitHub data&quot; in the profile panel to get started.
      </p>
    </Card>
  );
}

export function ActivityEmptyState() {
  return (
    <BaseEmptyState
      icon={<Activity className="size-6" />}
      title="No activity yet"
      description="Use the Sync GitHub data button to pull in your commit activity."
      variant="compact"
    />
  );
}

export function ChartEmptyState({ chartType = 'chart' }: { chartType?: string }) {
  const icons: Record<string, React.ReactNode> = {
    timeline: <TrendingUp className="size-6" />,
    heatmap: <Calendar className="size-6" />,
    bar: <BarChart3 className="size-6" />,
    pie: <PieChart className="size-6" />,
    chart: <BarChart3 className="size-6" />,
  };

  return (
    <BaseEmptyState
      icon={icons[chartType] ?? icons.chart}
      title="No chart data yet"
      description={`Sync your GitHub data to see ${chartType === 'chart' ? 'this chart' : `the ${chartType}`}.`}
      variant="compact"
      className="min-h-[200px]"
    />
  );
}

export function LanguageEmptyState() {
  return (
    <BaseEmptyState
      icon={<Code className="size-6" />}
      title="No language data yet"
      description="Language statistics appear after repositories are synced."
      variant="compact"
    />
  );
}

export function StreakEmptyState() {
  return (
    <BaseEmptyState
      icon={<Zap className="size-6" />}
      title="Start your streak today"
      description="Make a commit to begin your streak."
      variant="compact"
    />
  );
}

interface ErrorBannerProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorBanner({
  title = 'Sync error',
  message,
  onRetry,
  onDismiss,
}: ErrorBannerProps) {
  return (
    <InlineNotice
      variant="error"
      title={title}
      action={
        onRetry || onDismiss ? (
          <div className="flex flex-wrap gap-2">
            {onRetry ? (
              <Button variant="secondary" size="sm" onClick={onRetry}>
                Retry sync
              </Button>
            ) : null}
            {onDismiss ? (
              <Button variant="ghost" size="sm" onClick={onDismiss}>
                Dismiss
              </Button>
            ) : null}
          </div>
        ) : undefined
      }
    >
      {message}
    </InlineNotice>
  );
}

interface WarningBannerProps {
  syncedRepos: number;
  totalRepos: number;
  onRetry?: () => void;
}

export function PartialSyncWarning({
  syncedRepos,
  totalRepos,
  onRetry,
}: WarningBannerProps) {
  return (
    <InlineNotice
      variant="warning"
      title={
        <span className="inline-flex flex-wrap items-center gap-2">
          Partial sync
          <Badge variant="warning" size="sm">
            {syncedRepos}/{totalRepos} repos
          </Badge>
        </span>
      }
      action={
        onRetry ? (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Retry sync
          </Button>
        ) : undefined
      }
    >
      Some repositories couldn&apos;t be synced. Showing the available data.
    </InlineNotice>
  );
}

interface SyncProgressBannerProps {
  progress?: number;
  message?: string;
  processedRepos?: number;
  totalRepos?: number;
}

export function SyncProgressBanner({
  progress = 0,
  message = 'Syncing GitHub data…',
  processedRepos,
  totalRepos,
}: SyncProgressBannerProps) {
  return (
    <InlineNotice
      variant="info"
      title={
        <span className="flex flex-wrap items-center justify-between gap-2">
          <span>{message}</span>
          {processedRepos !== undefined && totalRepos !== undefined ? (
            <span className="font-mono text-[11px] font-normal tabular-nums text-text-3">
              {processedRepos}/{totalRepos} repos
            </span>
          ) : null}
        </span>
      }
    >
      <div
        className="progress-bar-track mt-1"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Sync progress: ${progress}%`}
      >
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-1.5 text-caption">{progress}% complete</p>
    </InlineNotice>
  );
}

interface InfoNoticeProps {
  icon?: React.ReactNode;
  message: string;
}

export function InfoNotice({ icon, message }: InfoNoticeProps) {
  return (
    <InlineNotice variant="info" icon={icon}>
      {message}
    </InlineNotice>
  );
}
