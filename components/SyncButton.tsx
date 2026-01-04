'use client';

import { useState } from 'react';
import { Loader2, RefreshCw, CheckCircle, XCircle, Github } from 'lucide-react';

/**
 * SyncButton Component
 * Triggers GitHub data synchronization with visual progress feedback
 * Matches the project's glassmorphism design system
 */
export function SyncButton() {
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  const handleSync = async () => {
    setSyncing(true);
    setStatus('syncing');
    setProgress(0);
    setMessage('Starting sync...');

    try {
      // Simulate progress stages while waiting for response
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      const response = await fetch('/api/sync', {
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
      setMessage(`Synced ${data.data.repos} repositories successfully`);

      // Refresh page after 2 seconds to show new data
      setTimeout(() => window.location.reload(), 2000);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Sync failed. Please try again.');
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
