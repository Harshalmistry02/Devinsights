'use client';

import { useState } from 'react';
import { Loader2, RefreshCw, CheckCircle, XCircle, Github, Clock, GitCommit, FolderGit2 } from 'lucide-react';

interface SyncResult {
  totalRepos: number;
  totalCommits: number;
  processedCommits: number;
  duplicateCommits: number;
  syncDurationMin: number;
  syncErrors: number;
}

/**
 * SyncButton Component
 * Triggers GitHub data synchronization with visual progress feedback
 * Uses the advanced /api/sync/complete endpoint for full commit history
 * Matches the project's glassmorphism design system
 */
export function SyncButton() {
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setStatus('syncing');
    setProgress(0);
    setMessage('Connecting to GitHub...');
    setSyncResult(null);

    try {
      // Simulate progress stages while waiting for response
      const progressMessages = [
        'Fetching repositories...',
        'Analyzing commit history...',
        'Processing commits...',
        'Enriching data...',
        'Calculating analytics...',
      ];
      let messageIndex = 0;

      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = Math.min(prev + 5, 90);
          // Update message at certain thresholds
          if (newProgress >= (messageIndex + 1) * 18 && messageIndex < progressMessages.length) {
            setMessage(progressMessages[messageIndex]);
            messageIndex++;
          }
          return newProgress;
        });
      }, 800);

      // Use the new complete sync endpoint for full commit history
      const response = await fetch('/api/sync/complete', {
        method: 'POST',
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Sync failed');
      }

      const data = await response.json();

      setProgress(100);
      setStatus('success');
      
      // Store detailed results
      setSyncResult({
        totalRepos: data.data.totalRepos,
        totalCommits: data.data.totalCommits,
        processedCommits: data.data.processedCommits,
        duplicateCommits: data.data.duplicateCommits,
        syncDurationMin: data.data.syncDurationMin,
        syncErrors: data.data.syncErrors,
      });

      // Create success message
      const commitText = data.data.processedCommits === 1 ? 'commit' : 'commits';
      const repoText = data.data.totalRepos === 1 ? 'repository' : 'repositories';
      setMessage(`Synced ${data.data.processedCommits} ${commitText} from ${data.data.totalRepos} ${repoText}`);

      // Refresh page after 3 seconds to show new data
      setTimeout(() => window.location.reload(), 3000);
    } catch (error: unknown) {
      setStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Sync failed. Please try again.';
      setMessage(errorMessage);
      console.error('Sync error:', error);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Sync Button */}
      <button
        onClick={handleSync}
        disabled={syncing}
        className={`
          w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl
          font-medium text-sm transition-all duration-300
          ${syncing
            ? 'bg-slate-800/50 border border-slate-700/30 text-slate-400 cursor-not-allowed'
            : 'bg-linear-to-r from-cyan-500/20 via-blue-500/20 to-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:from-cyan-500/30 hover:via-blue-500/30 hover:to-cyan-500/30 hover:border-cyan-500/50 hover:text-cyan-300 hover:scale-[1.02] active:scale-[0.98]'
          }
          backdrop-blur-sm group
        `}
      >
        {syncing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Syncing GitHub Data...</span>
          </>
        ) : (
          <>
            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            <span>Sync GitHub Data</span>
            <Github className="w-4 h-4 opacity-50" />
          </>
        )}
      </button>

      {/* Progress Section */}
      {status !== 'idle' && (
        <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 backdrop-blur-sm space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Progress Bar */}
          <div className="relative h-2 bg-slate-800/80 rounded-full overflow-hidden">
            <div
              className={`
                absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out
                ${status === 'success' 
                  ? 'bg-linear-to-r from-green-500 to-emerald-400' 
                  : status === 'error'
                    ? 'bg-linear-to-r from-red-500 to-rose-400'
                    : 'bg-linear-to-r from-cyan-500 via-blue-500 to-cyan-500'
                }
              `}
              style={{ width: `${progress}%` }}
            />
            {/* Animated shimmer effect during syncing */}
            {syncing && (
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            )}
          </div>

          {/* Status Message */}
          <div className="flex items-center gap-2">
            {status === 'success' && (
              <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
            )}
            {status === 'error' && (
              <XCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            {status === 'syncing' && (
              <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
            )}
            <p
              className={`
                text-sm
                ${status === 'success' 
                  ? 'text-green-400' 
                  : status === 'error'
                    ? 'text-red-400'
                    : 'text-slate-400'
                }
              `}
            >
              {message}
            </p>
          </div>

          {/* Detailed Results on Success */}
          {status === 'success' && syncResult && (
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700/30">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <FolderGit2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>{syncResult.totalRepos} repos</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <GitCommit className="w-3.5 h-3.5 text-green-400" />
                <span>{syncResult.processedCommits} new</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                <span>{syncResult.syncDurationMin}m</span>
              </div>
            </div>
          )}

          {/* Progress percentage */}
          {syncing && (
            <p className="text-xs text-slate-500 text-right">
              {progress}% complete
            </p>
          )}
        </div>
      )}
    </div>
  );
}
