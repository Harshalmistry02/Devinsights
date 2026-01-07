/**
 * Dashboard Loading Skeleton
 * 
 * Displays an animated skeleton while dashboard data is being fetched.
 * Accessibility: Uses proper ARIA attributes for screen readers.
 */
export default function DashboardLoading() {
  return (
    <div 
      className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 pt-20 sm:pt-24"
      role="status"
      aria-busy="true"
      aria-label="Loading dashboard content"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar Skeleton */}
          <aside className="lg:col-span-4 xl:col-span-3" aria-hidden="true">
            <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl overflow-hidden backdrop-blur-sm">
              {/* Profile Header Skeleton */}
              <div className="h-24 bg-slate-800/50 animate-pulse" />
              
              <div className="px-6 -mt-12 relative">
                {/* Avatar Skeleton */}
                <div className="w-24 h-24 rounded-full bg-slate-800 animate-pulse border-4 border-slate-900" />
              </div>
              
              <div className="px-6 pt-4 pb-6 space-y-4">
                {/* Name Skeleton */}
                <div className="h-6 w-3/4 bg-slate-800/50 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-slate-800/50 rounded animate-pulse" />
                
                {/* Status badges */}
                <div className="flex gap-2">
                  <div className="h-6 w-24 bg-slate-800/50 rounded-full animate-pulse" />
                </div>
                
                {/* Buttons */}
                <div className="space-y-2 pt-2">
                  <div className="h-10 bg-slate-800/50 rounded-lg animate-pulse" />
                  <div className="h-10 bg-slate-800/50 rounded-lg animate-pulse" />
                </div>
                
                {/* Sync section */}
                <div className="border-t border-slate-700/30 pt-4 space-y-3">
                  <div className="h-4 w-20 bg-slate-800/50 rounded animate-pulse" />
                  <div className="h-12 bg-slate-800/50 rounded-xl animate-pulse" />
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Skeleton */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-6" aria-hidden="true">
            {/* Welcome Header Skeleton */}
            <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-6 backdrop-blur-sm">
              <div className="h-8 w-2/3 bg-slate-800/50 rounded animate-pulse mb-2" />
              <div className="h-4 w-1/2 bg-slate-800/50 rounded animate-pulse" />
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div 
                  key={i} 
                  className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-5 backdrop-blur-sm"
                >
                  <div className="h-6 w-6 bg-slate-800/50 rounded animate-pulse mb-3" />
                  <div className="h-4 w-2/3 bg-slate-800/50 rounded animate-pulse mb-1" />
                  <div className="h-8 w-1/2 bg-slate-800/50 rounded animate-pulse" />
                </div>
              ))}
            </div>

            {/* Insights Row Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i} 
                  className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-slate-800/50 rounded-lg animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-1/2 bg-slate-800/50 rounded animate-pulse" />
                      <div className="h-5 w-2/3 bg-slate-800/50 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Activity Section Skeleton */}
            <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl overflow-hidden backdrop-blur-sm">
              <div className="p-6 border-b border-slate-700/30">
                <div className="h-6 w-1/3 bg-slate-800/50 rounded animate-pulse" />
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div 
                      key={i} 
                      className="text-center p-3 bg-slate-800/30 rounded-lg"
                    >
                      <div className="h-6 w-1/2 mx-auto bg-slate-800/50 rounded animate-pulse mb-1" />
                      <div className="h-3 w-2/3 mx-auto bg-slate-800/50 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Charts Skeleton */}
            <div className="h-64 bg-slate-900/50 border border-slate-700/30 rounded-xl animate-pulse backdrop-blur-sm" />

            {/* Quick Actions Skeleton */}
            <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-6 backdrop-blur-sm">
              <div className="h-6 w-1/4 bg-slate-800/50 rounded animate-pulse mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div 
                    key={i} 
                    className="h-20 bg-slate-800/30 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
      
      {/* Screen reader announcement */}
      <span className="sr-only">Loading dashboard, please wait...</span>
    </div>
  );
}
