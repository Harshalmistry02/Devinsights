'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

/**
 * Dashboard Error Boundary
 * 
 * Displays a user-friendly error message when something goes wrong.
 * Accessibility: Uses proper ARIA attributes, focus management, and semantic HTML.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for debugging
    console.error('Dashboard Error:', error);
  }, [error]);

  return (
    <div 
      className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 pt-20 sm:pt-24 flex items-center justify-center"
      role="alert"
      aria-live="assertive"
    >
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="bg-slate-900/50 border border-red-500/30 rounded-xl p-8 backdrop-blur-sm">
          {/* Error Icon */}
          <div 
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/30"
            aria-hidden="true"
          >
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>

          {/* Error Title */}
          <h1 className="text-xl font-semibold text-slate-200 mb-2">
            Something went wrong
          </h1>
          
          {/* Error Description */}
          <p className="text-sm text-slate-400 mb-6">
            We encountered an error loading your dashboard. This might be a temporary issue.
          </p>

          {/* Error Details (development only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-3 bg-slate-800/50 rounded-lg border border-slate-700/30 text-left">
              <p className="text-xs text-red-400 font-mono break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-slate-500 mt-1">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900"
              aria-label="Try loading the dashboard again"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              Try Again
            </button>
            
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-300 bg-slate-800/50 border border-slate-700/30 rounded-lg hover:bg-slate-800/80 hover:border-slate-600/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900"
              aria-label="Return to home page"
            >
              <Home className="w-4 h-4" aria-hidden="true" />
              Go Home
            </Link>
          </div>

          {/* Help Text */}
          <p className="text-xs text-slate-500 mt-6">
            If this problem persists, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
}
