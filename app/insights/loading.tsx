import { PageShell } from "@/components/ui/page-shell";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import {
  ChartSkeleton,
  InsightCardSkeleton,
  StatCardSkeleton,
} from "@/components/ui/skeletons";
import { SpaceBackground } from "@/components/ui/space-background";

/**
 * Insights loading skeleton — matches the final page geometry.
 */
export default function InsightsLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading coding insights"
    >
      <SpaceBackground variant="app" />

      <PageShell>
        <div className="mb-8 space-y-3 sm:mb-10" aria-hidden="true">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-10 w-72 max-w-full" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>

        <div className="space-y-8 sm:space-y-10" aria-hidden="true">
          <SkeletonCard>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-72 max-w-full" />
              </div>
              <Skeleton className="h-10 w-40 rounded-pill" />
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <InsightCardSkeleton />
              <InsightCardSkeleton />
              <InsightCardSkeleton />
            </div>
          </SkeletonCard>

          <SkeletonCard>
            <div className="flex items-center gap-4">
              <Skeleton className="size-12 rounded-panel" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-3 w-64 max-w-full" />
              </div>
            </div>
          </SkeletonCard>

          <div>
            <div className="mb-4 space-y-2">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-3 w-64 max-w-full" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <SkeletonCard>
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-3 h-3 w-56 max-w-full" />
              <Skeleton className="mt-6 h-24 w-full" />
              <Skeleton className="mt-4 h-1.5 w-full rounded-pill" />
              <Skeleton className="mt-2 h-1.5 w-full rounded-pill" />
            </SkeletonCard>
            <SkeletonCard>
              <Skeleton className="h-4 w-36" />
              <Skeleton className="mt-3 h-3 w-56 max-w-full" />
              <Skeleton className="mt-6 h-24 w-full" />
              <Skeleton className="mt-4 h-1.5 w-full rounded-pill" />
              <Skeleton className="mt-2 h-1.5 w-full rounded-pill" />
            </SkeletonCard>
          </div>

          <SkeletonCard>
            <Skeleton className="h-4 w-44" />
            <Skeleton className="mt-3 h-3 w-72 max-w-full" />
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </SkeletonCard>

          <SkeletonCard>
            <Skeleton className="h-4 w-32" />
            <ChartSkeleton height="h-64" />
          </SkeletonCard>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <SkeletonCard>
              <Skeleton className="h-4 w-36" />
              <ChartSkeleton height="h-56" />
            </SkeletonCard>
            <SkeletonCard>
              <Skeleton className="h-4 w-32" />
              <ChartSkeleton height="h-56" />
            </SkeletonCard>
          </div>
        </div>
      </PageShell>

      <span className="sr-only">Loading coding insights, please wait…</span>
    </div>
  );
}
