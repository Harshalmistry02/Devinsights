'use client';

import { useState, useRef, useEffect } from 'react';
import { Loader2, RefreshCw, CheckCircle, XCircle, Github, AlertCircle } from 'lucide-react';

interface SyncResponse {
  success: boolean;
  message: string;
  data?: {
    syncJobId: string;
    totalRepos: number;
    totalCommits: number;
    processedCommits: number;
    duplicateCommits: number;
    syncErrors: number;
    syncDurationMs: number;
    syncDurationMin: number;
    timestamp: string;
    metrics: {
      totalRequests: number;
      rateLimitResets: number;
      errorsEncountered: number;
    };
  };
  error?: string;
}

interface SyncStatus {
  status: 'idle' | 'syncing' | 'success' | 'error' | 'warning';
  message: string;
  progress: number;
  details?: {
    totalRepos?: number;
    totalCommits?: number;
    syncDurationMin?: number;
  };
}

/**
 * Enhanced Sync Button with real-time progress tracking
 * 
 * WCAG 2.1 AA Accessibility Features:
 * - ARIA live regions for screen reader announcements
 * - Proper focus indicators (ring-2 ring-cyan-400)
 * - Keyboard accessible (Tab navigation)
 * - Status announcements for sync progress
 * - Clear disabled state communication
 */
export function SyncButtonComplete() {
  const [status, setStatus] = useState<SyncStatus>({
    status: 'idle',
    message: 'Ready to sync GitHub data',
    progress: 0,
  });
  
  // Reference for screen reader announcements
  const announcementRef = useRef<HTMLDivElement>(null);

  const handleSync = async (forceFullSync: boolean = false) => {
    setStatus({
      status: 'syncing',
      message: forceFullSync 
        ? 'Initializing full GitHub data re-sync...'
        : 'Initializing GitHub data sync...',
      progress: 5,
    });

    // Simulate progress while waiting for the actual sync
    const progressMessages = [
      { progress: 10, message: 'Connecting to GitHub...' },
      { progress: 20, message: 'Fetching repositories...' },
      { progress: 35, message: 'Analyzing commit history...' },
      { progress: 50, message: 'Processing commits...' },
      { progress: 65, message: 'Enriching data with statistics...' },
      { progress: 80, message: 'Saving to database...' },
      { progress: 90, message: 'Calculating analytics...' },
    ];

    let progressIndex = 0;
    const progressInterval = setInterval(() => {
      if (progressIndex < progressMessages.length) {
        const { progress, message } = progressMessages[progressIndex];
        setStatus((prev) => ({
          ...prev,
          progress,
          message,
        }));
        progressIndex++;
      }
    }, 3000);

    try {
      console.log(forceFullSync 
        ? '🚀 Starting FULL GitHub sync (force)...'
        : '🚀 Starting complete GitHub sync...'
      );

      const response = await fetch('/api/sync/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceFullSync }),
      });

      clearInterval(progressInterval);

      const data: SyncResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.message || 'Sync failed');
      }

      // Success
      const syncData = data.data!;

      console.log('✅ Sync completed!', syncData);

      setStatus({
        status: syncData.syncErrors > 0 ? 'warning' : 'success',
        message: syncData.syncErrors > 0
          ? `Sync completed with ${syncData.syncErrors} errors. Most data synced successfully.`
          : `Successfully synced ${syncData.totalCommits.toLocaleString()} commits from ${syncData.totalRepos} repositories`,
        progress: 100,
        details: {
          totalRepos: syncData.totalRepos,
          totalCommits: syncData.totalCommits,
          syncDurationMin: syncData.syncDurationMin,
        },
      });

      // Log detailed stats
      if (syncData.duplicateCommits > 0) {
        console.log(`ℹ️ ${syncData.duplicateCommits} duplicate commits skipped`);
      }

      // Reload page to show updated insights
      setTimeout(() => window.location.reload(), 2500);
    } catch (err: unknown) {
      clearInterval(progressInterval);
      console.error('❌ Sync error:', err);

      let errorMessage = 'Sync failed. Please try again.';
      const errorStr = err instanceof Error ? err.message : String(err);

      if (errorStr.includes('Rate limit') || errorStr.includes('429')) {
        errorMessage = 'GitHub rate limit exceeded. Please wait a few minutes and try again.';
      } else if (errorStr.includes('401') || errorStr.includes('Unauthorized')) {
        errorMessage = 'GitHub authentication failed. Please reconnect your account.';
      } else if (errorStr.includes('not linked')) {
        errorMessage = 'GitHub account not linked. Please connect your GitHub account first.';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setStatus({
        status: 'error',
        message: errorMessage,
        progress: 0,
      });
    }
  };

  return (
    <div className="space-y-4" role="region" aria-label="GitHub Data Sync">
      {/* Screen reader live region for status announcements */}
      <div
        ref={announcementRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {status.status === 'syncing' && 'Syncing in progress. ' + status.message}
        {status.status === 'success' && 'Sync completed successfully. ' + status.message}
        {status.status === 'error' && 'Sync failed. ' + status.message}
        {status.status === 'warning' && 'Sync completed with warnings. ' + status.message}
      </div>

      {/* Main Sync Button */}
      <button
        onClick={() => handleSync(false)}
        disabled={status.status === 'syncing'}
        aria-label={
          status.status === 'syncing' 
            ? 'Syncing GitHub data, please wait' 
            : 'Sync GitHub repositories and commits'
        }
        aria-describedby="sync-status"
        className={`
          w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl
          font-medium text-sm transition-all duration-300
          focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900
          ${
            status.status === 'syncing'
              ? 'bg-slate-800/50 border border-slate-700/30 text-slate-400 cursor-not-allowed'
              : 'bg-linear-to-r from-cyan-500/20 via-blue-500/20 to-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:from-cyan-500/30 hover:via-blue-500/30 hover:to-cyan-500/30 hover:border-cyan-500/50 hover:text-cyan-300 hover:scale-[1.02] active:scale-[0.98]'
          }
          backdrop-blur-sm group
        `}
      >
        {status.status === 'syncing' ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            <span>Syncing GitHub Data...</span>
          </>
        ) : (
          <>
            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" aria-hidden="true" />
            <span>Sync GitHub Data</span>
            <Github className="w-4 h-4 opacity-50" aria-hidden="true" />
          </>
        )}
      </button>

      {/* Force Full Sync Button - for when normal sync shows 0 commits */}
      {status.status !== 'syncing' && (
        <button
          onClick={() => handleSync(true)}
          aria-label="Force full re-sync of all GitHub data"
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg
            text-xs text-slate-500 hover:text-slate-400 
            bg-slate-800/30 border border-slate-700/20 
            hover:bg-slate-800/50 hover:border-slate-600/30 
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900"
          title="Use this if sync shows 0 commits but you have repos with commits"
        >
          <RefreshCw className="w-3 h-3" aria-hidden="true" />
          <span>Force Full Re-sync</span>
        </button>
      )}

      {/* Status Display */}
      {status.status !== 'idle' && (
        <div
          id="sync-status"
          role="status"
          aria-live="polite"
          className={`
            rounded-xl p-4 backdrop-blur-sm space-y-3 animate-in fade-in slide-in-from-top-2 duration-300
            ${
              status.status === 'success'
                ? 'bg-green-500/10 border border-green-500/30'
                : status.status === 'error'
                  ? 'bg-red-500/10 border border-red-500/30'
                  : status.status === 'warning'
                    ? 'bg-amber-500/10 border border-amber-500/30'
                    : 'bg-slate-900/50 border border-slate-700/30'
            }
          `}
        >
          {/* Progress Bar */}
          <div className="relative h-2 bg-slate-800/80 rounded-full overflow-hidden">
            <div
              className={`
                absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out
                ${
                  status.status === 'success'
                    ? 'bg-linear-to-r from-green-500 to-emerald-400'
                    : status.status === 'error'
                      ? 'bg-linear-to-r from-red-500 to-rose-400'
                      : status.status === 'warning'
                        ? 'bg-linear-to-r from-amber-500 to-orange-400'
                        : 'bg-linear-to-r from-cyan-500 via-blue-500 to-cyan-500'
                }
              `}
              style={{ width: `${status.progress}%` }}
            />
            {status.status === 'syncing' && (
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            )}
          </div>

          {/* Status Message */}
          <div className="flex items-start gap-2">
            {status.status === 'success' && (
              <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
            )}
            {status.status === 'error' && (
              <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            )}
            {status.status === 'warning' && (
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            )}
            {status.status === 'syncing' && (
              <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0 mt-0.5" />
            )}

            <div className="flex-1">
              <p
                className={`
                  text-sm
                  ${
                    status.status === 'success'
                      ? 'text-green-400'
                      : status.status === 'error'
                        ? 'text-red-400'
                        : status.status === 'warning'
                          ? 'text-amber-400'
                          : 'text-slate-400'
                  }
                `}
              >
                {status.message}
              </p>

              {/* Detailed Stats */}
              {status.details && (status.status === 'success' || status.status === 'warning') && (
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-slate-800/30 rounded p-2">
                    <div className="text-slate-500">Repos</div>
                    <div className="font-semibold text-slate-200">
                      {status.details.totalRepos}
                    </div>
                  </div>
                  <div className="bg-slate-800/30 rounded p-2">
                    <div className="text-slate-500">Commits</div>
                    <div className="font-semibold text-slate-200">
                      {status.details.totalCommits?.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-slate-800/30 rounded p-2">
                    <div className="text-slate-500">Duration</div>
                    <div className="font-semibold text-slate-200">
                      {status.details.syncDurationMin?.toFixed(1)}m
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Progress Percentage */}
          {status.status === 'syncing' && (
            <p className="text-xs text-slate-500 text-right">
              {status.progress}% complete
            </p>
          )}
        </div>
      )}
    </div>
  );
}
