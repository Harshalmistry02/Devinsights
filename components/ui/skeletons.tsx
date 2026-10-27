'use client';

import { cn } from "./cn";
import { Card } from './card';
import { Skeleton, SkeletonCard } from './skeleton';

const CHART_SKELETON_HEIGHTS = [24, 36, 48, 32, 58, 42, 54, 30, 62, 40, 68, 46];

/**
 * Loading states that mirror the final card geometry.
 */

export function ProfileCardSkeleton() {
  return (
    <Card className="flex flex-col items-center text-center">
      <Skeleton className="size-[88px] rounded-full" />
      <Skeleton className="mt-5 h-5 w-32" />
      <Skeleton className="mt-2 h-3 w-24" />
      <Skeleton className="mt-2 h-3 w-40" />
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-6 w-20 rounded-pill" />
        <Skeleton className="h-6 w-24 rounded-pill" />
      </div>
      <div className="mt-6 grid w-full grid-cols-2 gap-2">
        <Skeleton className="h-10 rounded-pill" />
        <Skeleton className="h-10 rounded-pill" />
      </div>
      <div className="mt-6 w-full rounded-card border border-border-subtle p-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-2 h-3 w-36" />
        <Skeleton className="mt-4 h-11 w-full rounded-pill" />
      </div>
    </Card>
  );
}

export function StatCardSkeleton() {
  return (
    <SkeletonCard className="flex min-h-[168px] flex-col">
      <div className="flex items-start justify-between">
        <Skeleton className="size-9 rounded-card" />
        <Skeleton className="h-5 w-14 rounded-pill" />
      </div>
      <Skeleton className="mt-4 h-3 w-20" />
      <Skeleton className="mt-2 h-9 w-24" />
      <Skeleton className="mt-auto h-3 w-28" />
    </SkeletonCard>
  );
}

export function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <StatCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 'h-64' }: { height?: string }) {
  return (
    <div className={cn('relative w-full overflow-hidden', height)}>
      <div className="absolute inset-0 flex items-end justify-around gap-2 px-2 pb-4">
        {CHART_SKELETON_HEIGHTS.map((barHeight, index) => (
          <Skeleton
            key={index}
            className="w-full rounded-t-[3px]"
            style={{ height: `${barHeight}%` }}
          />
        ))}
      </div>
      <div className="absolute inset-0 animate-shimmer bg-linear-to-r from-transparent via-white/[0.03] to-transparent" />
    </div>
  );
}

export function InsightCardSkeleton() {
  return (
    <SkeletonCard>
      <div className="flex items-center gap-3">
        <Skeleton className="size-9 rounded-card" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </SkeletonCard>
  );
}

export function LanguageBarSkeleton() {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-10" />
      </div>
      <Skeleton className="h-1.5 w-full rounded-pill" />
    </div>
  );
}

export function ActivityOverviewSkeleton() {
  return (
    <Card padding="none">
      <div className="flex items-center justify-between border-b border-border-subtle p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-card" />
          <Skeleton className="h-4 w-36" />
        </div>
        <Skeleton className="h-5 w-20 rounded-pill" />
      </div>
      <div className="grid grid-cols-2 gap-4 p-5 sm:p-6 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="relative z-10 min-h-screen pt-[calc(var(--nav-height)+32px)]">
      <div className="mx-auto w-full max-w-[var(--container)] px-[clamp(20px,5vw,64px)] pb-24">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-8">
          <aside aria-hidden="true">
            <ProfileCardSkeleton />
          </aside>

          <main className="space-y-8" aria-hidden="true">
            <div className="space-y-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-4 w-80" />
            </div>

            <StatsGridSkeleton />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <StatCardSkeleton key={index} />
              ))}
            </div>

            <SkeletonCard>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <LanguageBarSkeleton key={index} />
                ))}
              </div>
            </SkeletonCard>

            <ActivityOverviewSkeleton />
          </main>
        </div>
      </div>
    </div>
  );
}

export { Skeleton };
