'use client';

import { useState } from 'react';
import { useSyncStream } from '@/lib/hooks/useSyncStream';
import { RefreshCw, Loader2, CheckCircle, AlertCircle, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

export function SyncButtonWithProgress() {
  const { progress, isStreaming, error, startSync, stopSync } = useSyncStream();
  const [showDetails, setShowDetails] = useState(false);

  const handleSync = () => {
    startSync(false);
    toast.loading('Starting sync...', { id: 'sync-toast' });
  };

  const handleStopSync = () => {
    stopSync();
    toast.error('Sync cancelled', { id: 'sync-toast' });
  };

  // Show error state
  if (error && !isStreaming) {
    return (
      <div className="space-y-3">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-medium text-sm">Sync Failed</p>
            <p className="text-red-300/80 text-xs mt-1">{error}</p>
          </div>
        </div>
        <button
          onClick={handleSync}
          className="w-full px-4 py-2.5 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/30 transition-colors text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4 inline mr-2" />
          Retry Sync
        </button>
      </div>
    );
  }

  // Show progress state
  if (isStreaming && progress) {
    // Success toast when complete
    if (progress.phase === 'complete') {
      toast.success('Sync completed successfully!', { id: 'sync-toast' });
    }

    return (
      <div className="space-y-4">
        {/* Main Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
              <p className="text-sm font-medium text-slate-200">{progress.message}</p>
            </div>
            <span className="text-xs text-slate-500">{progress.percentage}%</span>
          </div>

          <div className="relative h-2 bg-slate-800/80 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>

        {/* Current Repository */}
        {progress.currentRepo && (
          <div className="text-xs text-slate-400">
            Processing: <span className="text-cyan-400 font-mono">{progress.currentRepo}</span>
          </div>
        )}

        {/* Phase Indicators */}
        <div className="grid grid-cols-5 gap-2 text-xs">
          {['repos', 'commits', 'stats', 'analytics', 'complete'].map((phase) => {
            const phaseOrder: Record<string, number> = { 
              init: 0, repos: 1, commits: 2, stats: 3, analytics: 4, complete: 5 
            };
            const currentPhaseOrder = phaseOrder[progress.phase] || 0;
            const isActive = phaseOrder[phase] <= currentPhaseOrder;

            return (
              <div
                key={phase}
                className={`p-2 rounded-lg text-center font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-slate-800/30 text-slate-600 border border-slate-700/20'
                }`}
              >
                {phase.charAt(0).toUpperCase()}
              </div>
            );
          })}
        </div>

        {/* Detailed Stats */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full text-xs text-slate-400 hover:text-slate-300 py-1 transition-colors flex items-center justify-center gap-1"
        >
          {showDetails ? (
            <>
              <ChevronUp className="w-3 h-3" />
              Hide details
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3" />
              Show details
            </>
          )}
        </button>

        {showDetails && (
          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-800/30 rounded-lg p-3 border border-slate-700/20">
            <div>
              <p className="text-slate-500">Repos</p>
              <p className="text-slate-200 font-semibold">
                {progress.stats.reposProcessed}/{progress.stats.totalRepos || '?'}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Commits</p>
              <p className="text-slate-200 font-semibold">
                {progress.stats.commitsProcessed.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-slate-500">API Requests</p>
              <p className="text-slate-200 font-semibold">{progress.stats.apiRequests}</p>
            </div>
            <div>
              <p className="text-slate-500">Errors</p>
              <p className={`font-semibold ${progress.stats.errors > 0 ? 'text-red-400' : 'text-slate-200'}`}>
                {progress.stats.errors}
              </p>
            </div>
          </div>
        )}

        {/* ETA */}
        {progress.estimatedTimeRemaining && progress.estimatedTimeRemaining > 0 && (
          <p className="text-xs text-slate-500 text-center">
            ⏱️ ETA: {Math.floor(progress.estimatedTimeRemaining / 60)}m{' '}
            {progress.estimatedTimeRemaining % 60}s remaining
          </p>
        )}

        {/* Cancel button */}
        <button
          onClick={handleStopSync}
          className="w-full px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors text-xs font-medium"
        >
          Cancel Sync
        </button>
      </div>
    );
  }

  // Default state - ready to sync
  return (
    <button
      onClick={handleSync}
      disabled={isStreaming}
      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cyan-500/20 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/30 text-cyan-400 hover:text-cyan-300 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Zap className="w-4 h-4" />
      Sync GitHub Data
    </button>
  );
}
