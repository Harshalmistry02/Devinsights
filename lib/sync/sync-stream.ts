// lib/sync/sync-stream.ts
/**
 * Server-Sent Events (SSE) for real-time sync progress
 * Streams progress updates without polling
 */

export interface SyncProgressEvent {
  phase: "init" | "repos" | "commits" | "stats" | "analytics" | "complete" | "error";
  percentage: number;
  message: string;
  stats: {
    reposProcessed: number;
    totalRepos: number;
    commitsProcessed: number;
    totalCommits: number;
    apiRequests: number;
    rateLimitResets: number;
    errors: number;
  };
  estimatedTimeRemaining?: number; // seconds
  currentRepo?: string;
  eta?: Date;
}

/**
 * Calculate ETA based on current progress and rate
 */
export function calculateETA(
  startTime: number,
  currentProgress: number,
  totalItems: number,
  processedItems: number
): Date | null {
  if (processedItems === 0) return null;

  const elapsedMs = Date.now() - startTime;
  const ratePerMs = processedItems / elapsedMs;
  const remainingItems = totalItems - processedItems;
  const remainingMs = remainingItems / ratePerMs;

  return new Date(Date.now() + remainingMs);
}
