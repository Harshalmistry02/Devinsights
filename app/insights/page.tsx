import { requireAuth } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { 
  TrendingUp, 
  ArrowLeft, 
  Clock,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { InsightsContent } from "./InsightsContent";

/**
 * Insights Page
 * 
 * Comprehensive analytics dashboard with visualizations
 */
export default async function InsightsPage() {
  const session = await requireAuth();
  const { user } = session;

  // Fetch analytics snapshot
  const analytics = await prisma.analyticsSnapshot.findUnique({
    where: { userId: user.id },
  });

  // Check if user has data
  const hasData = analytics !== null && analytics.totalCommits > 0;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 pt-20 sm:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/dashboard"
              className="p-2 bg-slate-800/50 border border-slate-700/30 rounded-lg hover:bg-slate-800 hover:border-slate-600 transition-all text-slate-400 hover:text-slate-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-200 flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-cyan-400" />
                Coding Insights
              </h1>
              <p className="text-slate-400 mt-1">
                Deep dive into your development patterns and productivity
              </p>
            </div>
          </div>

          {/* Last Updated */}
          {analytics?.calculatedAt && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Clock className="w-4 h-4" />
              <span>
                Last updated: {new Date(analytics.calculatedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          )}
        </div>

        {hasData ? (
          <InsightsContent analytics={analytics} />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

// ===========================================
// Empty State Component
// ===========================================

function EmptyState() {
  return (
    <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-12 backdrop-blur-sm text-center">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <BarChart3 className="w-8 h-8 text-cyan-400" />
        </div>
        <h2 className="text-xl font-semibold text-slate-200 mb-3">
          No Insights Available Yet
        </h2>
        <p className="text-slate-400 mb-6">
          Sync your GitHub data to unlock comprehensive analytics and visualizations of your coding patterns.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/30 hover:border-cyan-500/50 transition-all font-medium"
        >
          <RefreshCw className="w-5 h-5" />
          Go to Dashboard to Sync
        </Link>
      </div>
    </div>
  );
}
