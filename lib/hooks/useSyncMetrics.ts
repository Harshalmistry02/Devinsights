'use client';

import { useState, useEffect, useCallback } from 'react';

export interface SyncMetrics {
  totalRequests: number;
  rateLimitResets: number;
  errorsEncountered: number;
  reposProcessed: number;
  commitsProcessed: number;
  startTime: number;
  elapsedMs: number;
}

interface UseSyncMetricsResult {
  metrics: SyncMetrics;
  estimatedTimeRemaining: number | null;
  requestsPerMinute: number;
  isHealthy: boolean;
  reset: () => void;
}

const initialMetrics: SyncMetrics = {
  totalRequests: 0,
  rateLimitResets: 0,
  errorsEncountered: 0,
  reposProcessed: 0,
  commitsProcessed: 0,
  startTime: 0,
  elapsedMs: 0,
};

/**
 * Hook to track sync performance metrics
 * 
 * Useful for:
 * - Performance monitoring
 * - Rate limit tracking
 * - Error diagnostics
 * - Progress estimation
 */
export function useSyncMetrics(): UseSyncMetricsResult {
  const [metrics, setMetrics] = useState<SyncMetrics>(initialMetrics);

  // Calculate elapsed time
  useEffect(() => {
    if (metrics.startTime === 0) return;

    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        elapsedMs: Date.now() - prev.startTime,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [metrics.startTime]);

  // Computed values
  const elapsedMinutes = metrics.elapsedMs / 60000;
  const requestsPerMinute = elapsedMinutes > 0 
    ? Math.round(metrics.totalRequests / elapsedMinutes) 
    : 0;

  // Estimate remaining time based on current rate
  // This is a rough estimate - actual time depends on repo sizes
  const estimatedTimeRemaining = null; // Would need total repos to estimate

  // Health check - sync is "unhealthy" if too many errors or rate limit resets
  const isHealthy = 
    metrics.errorsEncountered < 10 && 
    metrics.rateLimitResets < 3;

  const reset = useCallback(() => {
    setMetrics({
      ...initialMetrics,
      startTime: Date.now(),
    });
  }, []);

  return {
    metrics,
    estimatedTimeRemaining,
    requestsPerMinute,
    isHealthy,
    reset,
  };
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

/**
 * Format large numbers with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}
