'use client';

import { useState, useEffect, useCallback } from 'react';

export interface SyncJobStatus {
  status: 'never_synced' | 'pending' | 'in_progress' | 'completed' | 'failed';
  startedAt: string | null;
  completedAt: string | null;
  totalRepos: number | null;
  processedRepos: number | null;
  totalCommits: number | null;
  errorMessage: string | null;
  stats?: {
    repositories: number;
    commits: number;
    dateRange: {
      oldest: string | null;
      newest: string | null;
    };
  };
}

interface UseSyncStatusResult {
  status: SyncJobStatus | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isInProgress: boolean;
  lastSyncedAt: Date | null;
}

/**
 * Hook to monitor sync job status
 * 
 * Features:
 * - Auto-polling when sync is in progress
 * - Manual refetch capability
 * - Computed properties for common checks
 * 
 * @param pollInterval - Polling interval in ms (default: 2000ms when syncing)
 */
export function useSyncStatus(pollInterval = 2000): UseSyncStatusResult {
  const [status, setStatus] = useState<SyncJobStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/sync/complete');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setStatus(data);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch sync status';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Poll when sync is in progress
  useEffect(() => {
    if (status?.status === 'in_progress' || status?.status === 'pending') {
      const interval = setInterval(fetchStatus, pollInterval);
      return () => clearInterval(interval);
    }
  }, [status?.status, fetchStatus, pollInterval]);

  // Computed properties
  const isInProgress = status?.status === 'in_progress' || status?.status === 'pending';
  const lastSyncedAt = status?.completedAt ? new Date(status.completedAt) : null;

  return {
    status,
    loading,
    error,
    refetch: fetchStatus,
    isInProgress,
    lastSyncedAt,
  };
}

/**
 * Hook to get a human-readable time since last sync
 */
export function useLastSyncTime(): string {
  const { lastSyncedAt } = useSyncStatus();
  const [timeAgo, setTimeAgo] = useState<string>('Never');

  useEffect(() => {
    if (!lastSyncedAt) {
      setTimeAgo('Never');
      return;
    }

    const updateTimeAgo = () => {
      const now = new Date();
      const diffMs = now.getTime() - lastSyncedAt.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) {
        setTimeAgo('Just now');
      } else if (diffMins < 60) {
        setTimeAgo(`${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`);
      } else if (diffHours < 24) {
        setTimeAgo(`${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`);
      } else {
        setTimeAgo(`${diffDays} day${diffDays !== 1 ? 's' : ''} ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [lastSyncedAt]);

  return timeAgo;
}
