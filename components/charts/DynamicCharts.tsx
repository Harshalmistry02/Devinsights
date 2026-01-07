'use client';

import dynamic from 'next/dynamic';
import { ChartSkeleton } from '@/components/ui/skeletons';

/**
 * Dynamically imported chart components with code splitting
 * Charts are loaded on-demand to improve initial page load performance
 */

// Commit Timeline - Full width chart
export const DynamicCommitTimeline = dynamic(
  () => import('@/components/charts/CommitTimeline').then(mod => ({ default: mod.CommitTimeline })),
  {
    loading: () => <ChartSkeleton height="h-48" />,
    ssr: false,
  }
);

// Activity Heatmap - GitHub style contribution graph
export const DynamicActivityHeatmap = dynamic(
  () => import('@/components/charts/ActivityHeatmap').then(mod => ({ default: mod.ActivityHeatmap })),
  {
    loading: () => <ChartSkeleton height="h-32" />,
    ssr: false,
  }
);

// Day of Week Chart - Bar chart
export const DynamicDayOfWeekChart = dynamic(
  () => import('@/components/charts/DayOfWeekChart').then(mod => ({ default: mod.DayOfWeekChart })),
  {
    loading: () => <ChartSkeleton height="h-64" />,
    ssr: false,
  }
);

// Hourly Activity Chart
export const DynamicHourlyActivity = dynamic(
  () => import('@/components/charts/HourlyActivity').then(mod => ({ default: mod.HourlyActivity })),
  {
    loading: () => <ChartSkeleton height="h-64" />,
    ssr: false,
  }
);

// Language Breakdown - Pie/Donut chart
export const DynamicLanguageBreakdown = dynamic(
  () => import('@/components/charts/LanguageBreakdown').then(mod => ({ default: mod.LanguageBreakdown })),
  {
    loading: () => <ChartSkeleton height="h-64" />,
    ssr: false,
  }
);

// Repository Stats Chart
export const DynamicRepoStatsChart = dynamic(
  () => import('@/components/charts/RepoStatsChart').then(mod => ({ default: mod.RepoStatsChart })),
  {
    loading: () => <ChartSkeleton height="h-64" />,
    ssr: false,
  }
);
