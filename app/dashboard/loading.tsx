import { PageShell } from "@/components/ui/page-shell";
import { SpaceBackground } from "@/components/ui/space-background";
import {
  ActivityOverviewSkeleton,
  InsightCardSkeleton,
  ProfileCardSkeleton,
  Skeleton,
  StatCardSkeleton,
} from "@/components/ui/skeletons";
import { SkeletonCard } from "@/components/ui/skeleton";

/**
 * Dashboard Loading Skeleton — matches the final card geometry.
 */
export default function DashboardLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading dashboard content"
    >
      <SpaceBackground variant="app" />

      <PageShell>
        <div className="mb-8 space-y-3 sm:mb-10" aria-hidden="true">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-10 w-72 max-w-full" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
          <aside aria-hidden="true">
            <ProfileCardSkeleton />
          </aside>

          <div className="flex min-w-0 flex-col gap-6" aria-hidden="true">
            <SkeletonCard>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-6 w-28 rounded-pill" />
              </div>
              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="space-y-3">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-3/5" />
                  </div>
                ))}
              </div>
            </SkeletonCard>

            <div>
              <div className="mb-4 flex items-end justify-between gap-3">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-3 w-64 max-w-full" />
                </div>
                <Skeleton className="h-8 w-20 rounded-pill" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </div>
            </div>

            <div>
              <div className="mb-4 space-y-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-3 w-64 max-w-full" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <InsightCardSkeleton />
                <InsightCardSkeleton />
                <InsightCardSkeleton />
              </div>
            </div>

            <SkeletonCard>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-44" />
                </div>
                <Skeleton className="size-14 rounded-card" />
              </div>
              <div className="mt-6 space-y-4">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-1.5 w-full rounded-pill" />
                <Skeleton className="h-1.5 w-full rounded-pill" />
                <Skeleton className="h-1.5 w-full rounded-pill" />
                <Skeleton className="h-1.5 w-full rounded-pill" />
              </div>
            </SkeletonCard>

            <ActivityOverviewSkeleton />
          </div>
        </div>
      </PageShell>

      <span className="sr-only">Loading dashboard, please wait…</span>
    </div>
  );
}
