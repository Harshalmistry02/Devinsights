import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

/**
 * Profile skeleton — mirrors the final identity, account, connection and
 * session cards so the page does not shift when the client content mounts.
 */
export function ProfileSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading profile">
      <div className="mb-8 space-y-3 sm:mb-10" aria-hidden="true">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-10 w-52 max-w-full" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      <div className="space-y-5" aria-hidden="true">
        <SkeletonCard>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Skeleton className="size-20 shrink-0 rounded-card sm:size-24" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-56 max-w-full" />
              <Skeleton className="h-3 w-40" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-28 rounded-pill" />
                <Skeleton className="h-6 w-24 rounded-pill" />
              </div>
            </div>
          </div>
        </SkeletonCard>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <SkeletonCard>
            <div className="flex items-center gap-3">
              <Skeleton className="size-9 rounded-card" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-48 max-w-full" />
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-4"
                >
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-36" />
                </div>
              ))}
            </div>
            <Skeleton className="mt-6 h-3 w-56 max-w-full" />
          </SkeletonCard>

          <SkeletonCard>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-card" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-48 max-w-full" />
                </div>
              </div>
              <Skeleton className="h-5 w-24 rounded-pill" />
            </div>
            <div className="mt-6 space-y-4">
              {[0, 1].map((index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-4"
                >
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ))}
              <Skeleton className="h-16 w-full rounded-card" />
            </div>
            <Skeleton className="mt-6 h-3 w-56 max-w-full" />
          </SkeletonCard>
        </div>

        <SkeletonCard>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Skeleton className="size-9 rounded-card" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-72 max-w-full" />
              </div>
            </div>
            <Skeleton className="h-9 w-28 rounded-pill" />
          </div>
        </SkeletonCard>
      </div>

      <span className="sr-only">Loading profile, please wait…</span>
    </div>
  );
}
