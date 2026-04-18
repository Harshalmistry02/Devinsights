"use client";

/**
 * Profile Skeleton Loader
 * Displays while profile data is being fetched
 * Provides visual feedback and maintains layout stability
 */
export function ProfileSkeleton() {
  return (
    <div className="min-h-screen p-4 sm:p-6 animate-pulse">
      <div className="max-w-4xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 w-32 mb-3" />
            <div className="h-8 w-48" />
          </div>
          <div className="h-10 w-24" />
        </div>

        {/* Profile Card Skeleton */}
        <div className="border border-[rgba(240,240,250,0.15)] overflow-hidden backdrop-blur-sm">
          {/* Header Section Skeleton */}
          <div className="bg-linear-to-r from-cyan-500/10 to-blue-500/10 border-b border-[rgba(240,240,250,0.15)] p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar Skeleton */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 -full border-4 border-[rgba(240,240,250,0.15)]" />
              
              {/* User Info Skeleton */}
              <div className="flex-1 text-center sm:text-left space-y-3">
                <div className="h-8 w-48 mx-auto sm:mx-0" />
                <div className="h-6 w-36 mx-auto sm:mx-0" />
              </div>
            </div>
          </div>

          {/* Details Section Skeleton */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Account Information */}
            <div>
              <div className="h-6 w-48 mb-4" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-4 border border-[rgba(240,240,250,0.15)]"
                  >
                    <div className="w-10 h-10" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-24" />
                      <div className="h-5 w-full max-w-xs" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* GitHub Connection Status */}
            <div className="border-t border-[rgba(240,240,250,0.15)] pt-6">
              <div className="h-6 w-56 mb-4" />
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 border border-[rgba(240,240,250,0.15)]">
                  <div className="w-10 h-10" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32" />
                    <div className="h-5 w-48" />
                  </div>
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div className="border-t border-[rgba(240,240,250,0.15)] pt-6">
              <div className="h-6 w-32 mb-4" />
              <div className="flex flex-wrap gap-3">
                <div className="h-10 w-48" />
                <div className="h-10 w-36" />
              </div>
            </div>
          </div>
        </div>

        {/* Actions Skeleton */}
        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="h-12 w-full sm:w-48" />
          <div className="h-12 w-full sm:w-40" />
        </div>
      </div>
    </div>
  );
}
