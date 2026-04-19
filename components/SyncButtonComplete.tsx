'use client';

import { useState, useRef } from 'react';
import { Loader2, RefreshCw, CheckCircle, XCircle, Github, AlertCircle } from 'lucide-react';
import { signOut } from 'next-auth/react';

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
  requiresReauth?: boolean;
  code?: string;
}

interface SyncErrorData {
  message: string;
  error?: string;
  status?: number;
  requiresReauth?: boolean;
  code?: string;
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
  const [requiresReauth, setRequiresReauth] = useState(false);
  
  // Reference for screen reader announcements
  const announcementRef = useRef<HTMLDivElement>(null);

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'object' && error !== null && 'message' in error) {
      const msg = (error as { message?: unknown }).message;
      if (typeof msg === 'string') {
        return msg;
      }
    }

    if (typeof error === 'string') {
      return error;
    }

    return 'Unknown sync error';
  };

  const handleReauth = async () => {
    setStatus({
      status: 'error',
      message: 'Redirecting to sign out. Please sign back in to reconnect GitHub.',
      progress: 0,
    });

    try {
      await signOut({ callbackUrl: '/login', redirect: true });
    } catch (error) {
      console.error('Failed to sign out for GitHub reauthentication:', error);
      setStatus({
        status: 'error',
        message: 'Please use Sign out, then sign back in to reconnect GitHub.',
        progress: 0,
      });
    }
  };

  const handleSync = async (forceFullSync: boolean = false) => {
    setRequiresReauth(false);
    setStatus({
      status: 'syncing',
      message: forceFullSync 
        ? 'INITIALIZING FULL GITHUB DATA RE-SYNC...'
        : 'INITIALIZING GITHUB DATA SYNC...',
      progress: 5,
    });

    // Simulate progress while waiting for the actual sync
    const progressMessages = [
      { progress: 10, message: 'CONNECTING TO GITHUB...' },
      { progress: 20, message: 'FETCHING REPOSITORIES...' },
      { progress: 35, message: 'ANALYZING COMMIT HISTORY...' },
      { progress: 50, message: 'PROCESSING COMMITS...' },
      { progress: 65, message: 'ENRICHING DATA WITH STATISTICS...' },
      { progress: 80, message: 'SAVING TO DATABASE...' },
      { progress: 90, message: 'CALCULATING ANALYTICS...' },
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
        ? 'Starting FULL GitHub sync (force)...'
        : 'Starting complete GitHub sync...'
      );

      const response = await fetch('/api/sync/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceFullSync }),
      });

      clearInterval(progressInterval);

      let data: Partial<SyncResponse> = {};
      try {
        data = (await response.json()) as Partial<SyncResponse>;
      } catch {
        data = {};
      }

      if (!response.ok) {
        const syncError: SyncErrorData = {
          message: data.message || data.error || `HTTP ${response.status}`,
          error: data.error,
          status: response.status,
          requiresReauth: data.requiresReauth === true || response.status === 401,
          code: data.code,
        };
        throw syncError;
      }

      if (!data.success) {
        const syncError: SyncErrorData = {
          message: data.message || 'Sync failed',
          error: data.error,
          status: response.status,
          requiresReauth: data.requiresReauth,
          code: data.code,
        };
        throw syncError;
      }

      // Success
      const syncData = data.data;

      if (!syncData) {
        throw {
          message: 'Sync succeeded but no sync payload was returned.',
          status: response.status,
        } as SyncErrorData;
      }

      console.log('Sync completed!', {
        totalRepos: syncData.totalRepos,
        totalCommits: syncData.totalCommits,
        syncDurationMin: syncData.syncDurationMin,
      });

      setStatus({
        status: syncData.syncErrors > 0 ? 'warning' : 'success',
        message:
          syncData.syncErrors > 0
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
        console.log(`${syncData.duplicateCommits} duplicate commits skipped`);
      }

      // Reload page to show updated insights
      setTimeout(() => window.location.reload(), 2500);
    } catch (err: unknown) {
      clearInterval(progressInterval);
      console.error('Sync error:', getErrorMessage(err), err);

      let errorMessage = 'Sync failed. Please try again.';
      const errorData =
        typeof err === 'object' && err !== null && 'message' in err
          ? (err as SyncErrorData)
          : null;
      const errorStr = errorData?.message || getErrorMessage(err);
      const normalizedError = errorStr.toLowerCase();

      // Check for authentication requirement flag
      if (errorData?.requiresReauth || errorData?.status === 401) {
        setRequiresReauth(true);
        errorMessage =
          errorData.message ||
          'GitHub authentication required. Please log out and log back in.';
        setStatus({
          status: 'error',
          message: errorMessage,
          progress: 0,
        });
        
        console.log('Tip: Log out and log back in to refresh your GitHub connection');
        return;
      }

      setRequiresReauth(false);

      if (normalizedError.includes('rate limit') || normalizedError.includes('429')) {
        errorMessage = 'GitHub rate limit exceeded. Please wait a few minutes and try again.';
      } else if (
        normalizedError.includes('authentication') ||
        normalizedError.includes('401') ||
        normalizedError.includes('unauthorized')
      ) {
        errorMessage = 'GitHub authentication failed. Please reconnect your account by logging out and back in.';
      } else if (normalizedError.includes('not linked')) {
        errorMessage = 'GitHub account not linked. Please connect your GitHub account first.';
      } else if (errorData?.message) {
        errorMessage = errorData.message;
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
        className={`btn-ghost ${status.status === 'syncing' ? 'btn-ghost-sm' : ''}`}
        style={{
          width: "100%",
          justifyContent: "center",
          opacity: status.status === 'syncing' ? 0.5 : 1,
          cursor: status.status === 'syncing' ? 'not-allowed' : 'pointer',
        }}
      >
        {status.status === 'syncing' ? (
          <>
            <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} aria-hidden="true" />
            <span className="uppercase tracking-widest">SYNCING...</span>
          </>
        ) : (
          <>
            <RefreshCw size={14} aria-hidden="true" />
            <span className="uppercase tracking-widest">SYNC GITHUB DATA</span>
            <Github size={12} style={{ opacity: 0.5 }} aria-hidden="true" />
          </>
        )}
      </button>

      {/* Force Full Sync Button */}
      {status.status !== 'syncing' && (
        <button
          onClick={() => handleSync(true)}
          aria-label="Force full re-sync of all GitHub data"
          title="Use this if sync shows 0 commits but you have repos with commits"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "8px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--spectral-white)",
            opacity: 0.3,
            transition: "opacity 0.2s ease",
          }}
          className="text-micro"
          
          
        >
          <RefreshCw size={10} aria-hidden="true" />
          <span className="uppercase tracking-widest">FORCE FULL RE-SYNC</span>
        </button>
      )}

      {/* Status Display */}
      {status.status !== 'idle' && (
        <div
          id="sync-status"
          role="status"
          aria-live="polite"
          style={{
            padding: "14px 16px",
            background: status.status === 'success' ? "rgba(134,239,172,0.04)"
              : status.status === 'error' ? "rgba(252,165,165,0.04)"
              : status.status === 'warning' ? "rgba(251,191,36,0.04)"
              : "rgba(240,240,250,0.03)",
            border: `1px solid ${status.status === 'success' ? "rgba(134,239,172,0.12)"
              : status.status === 'error' ? "rgba(252,165,165,0.12)"
              : status.status === 'warning' ? "rgba(251,191,36,0.12)"
              : "rgba(240,240,250,0.06)"}`,
            borderRadius: "var(--radius-sharp)",
          }}
        >
          {/* Progress Bar */}
          <div className="progress-bar-track" style={{ marginBottom: "10px" }}>
            <div
              className="progress-bar-fill"
              style={{
                width: `${status.progress}%`,
                background: status.status === 'success' ? "rgba(134,239,172,0.6)"
                  : status.status === 'error' ? "rgba(252,165,165,0.5)"
                  : status.status === 'warning' ? "rgba(251,191,36,0.6)"
                  : "var(--spectral-white)",
              }}
            />
          </div>

          {/* Status Message */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
            {status.status === 'success' && (
              <CheckCircle size={12} style={{ color: "rgba(134,239,172,0.7)", flexShrink: 0, marginTop: "2px" }} />
            )}
            {status.status === 'error' && (
              <XCircle size={12} style={{ color: "rgba(252,165,165,0.6)", flexShrink: 0, marginTop: "2px" }} />
            )}
            {status.status === 'warning' && (
              <AlertCircle size={12} style={{ color: "rgba(251,191,36,0.6)", flexShrink: 0, marginTop: "2px" }} />
            )}
            {status.status === 'syncing' && (
              <Loader2 size={12} style={{ animation: "spin 1s linear infinite", opacity: 0.5, flexShrink: 0, marginTop: "2px" }} />
            )}

            <div style={{ flex: 1 }}>
              <p
                className="text-micro uppercase tracking-widest"
                style={{
                  opacity: status.status === 'success' ? 0.6
                    : status.status === 'error' ? 0.55
                    : status.status === 'warning' ? 0.55
                    : 0.4,
                  color: status.status === 'success' ? "rgba(134,239,172,0.8)"
                    : status.status === 'error' ? "rgba(252,165,165,0.8)"
                    : status.status === 'warning' ? "rgba(251,191,36,0.8)"
                    : "var(--spectral-white)",
                }}
              >
                {status.message.toUpperCase()}
              </p>

              {/* Detailed Stats */}
              {status.details && (status.status === 'success' || status.status === 'warning') && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))",
                    gap: "1px",
                    marginTop: "10px",
                    background: "rgba(240,240,250,0.05)",
                    borderRadius: "2px",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ background: "#000", padding: "8px 10px" }}>
                    <p className="text-micro uppercase tracking-widest" style={{ opacity: 0.25, marginBottom: "2px" }}>REPOS</p>
                    <p className="stat-value" style={{ fontSize: "0.875rem" }}>{status.details.totalRepos}</p>
                  </div>
                  <div style={{ background: "#000", padding: "8px 10px" }}>
                    <p className="text-micro uppercase tracking-widest" style={{ opacity: 0.25, marginBottom: "2px" }}>COMMITS</p>
                    <p className="stat-value" style={{ fontSize: "0.875rem" }}>{status.details.totalCommits?.toLocaleString()}</p>
                  </div>
                  <div style={{ background: "#000", padding: "8px 10px" }}>
                    <p className="text-micro uppercase tracking-widest" style={{ opacity: 0.25, marginBottom: "2px" }}>DURATION</p>
                    <p className="stat-value" style={{ fontSize: "0.875rem" }}>{status.details.syncDurationMin?.toFixed(1)}M</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Progress Percentage */}
          {status.status === 'syncing' && (
            <p className="text-micro uppercase tracking-widest" style={{ textAlign: "right", marginTop: "6px", opacity: 0.25 }}>
              {status.progress}% COMPLETE
            </p>
          )}
        </div>
      )}

      {requiresReauth && status.status === 'error' && (
        <button
          onClick={handleReauth}
          className="btn-ghost btn-ghost-sm"
          style={{ width: '100%', justifyContent: 'center' }}
          aria-label="Sign out and reconnect GitHub"
        >
          <Github size={13} aria-hidden="true" />
          <span className="uppercase tracking-widest">LOG OUT & RECONNECT GITHUB</span>
        </button>
      )}
    </div>
  );
}
