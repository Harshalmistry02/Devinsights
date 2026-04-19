/**
 * Advanced Sync API Route
 * 
 * TIER 3: API Layer
 * 
 * This route provides advanced syncing capabilities:
 * - Full commit history fetching (not limited to 100 or 3 months)
 * - Incremental sync support
 * - Progress tracking via response
 * - Rate limit awareness
 * 
 * Usage:
 * POST /api/sync/advanced - Trigger advanced sync
 * GET /api/sync/advanced  - Get sync status
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createSyncOrchestrator } from '@/lib/github/sync-orchestrator';
import {
  withGitHubAuth,
  isGitHubAuthError,
  isGitHubAuthenticationFailure,
  toGitHubAuthErrorPayload,
} from '@/lib/github/auth-token';

const sanitizeLog = (val: unknown): string =>
  String(val).replace(/[\r\n]/g, ' ').slice(0, 200);

/**
 * POST /api/sync/advanced
 * 
 * Triggers an advanced GitHub data sync that fetches complete commit history.
 * 
 * Request body (optional):
 * {
 *   fullSync?: boolean,      // If true, re-fetch all commits (ignores last sync date)
 *   includeForks?: boolean,  // Include forked repos
 *   includeArchived?: boolean // Include archived repos
 *   maxCommitsPerRepo?: number // Limit commits per repo (for testing)
 *   fetchCommitStats?: boolean // Fetch detailed stats (adds/dels)
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request options
    let options = {
      fullSync: false,
      includeForks: false,
      includeArchived: false,
      maxCommitsPerRepo: undefined as number | undefined,
      fetchCommitStats: true,
    };

    try {
      const body = await req.json();
      options = {
        fullSync: body.fullSync ?? false,
        includeForks: body.includeForks ?? false,
        includeArchived: body.includeArchived ?? false,
        maxCommitsPerRepo: body.maxCommitsPerRepo,
        fetchCommitStats: body.fetchCommitStats ?? true,
      };
    } catch {
      // No body or invalid JSON, use defaults
    }

    const result = await withGitHubAuth(
      session.user.id,
      async (accessToken) => {
      const orchestrator = createSyncOrchestrator(accessToken, session.user.id!);
      return orchestrator.sync({
        ...options,
        onProgress: (progress) => {
          console.log(`[${sanitizeLog(progress.phase)}] ${sanitizeLog(progress.message)} (${progress.percentage}%)`);
        },
      });
      },
      { retryOnAuthFailure: false }
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          repositoriesProcessed: result.repositoriesProcessed,
          commitsInserted: result.commitsInserted,
          commitsSkipped: result.commitsSkipped,
          errors: result.errors,
          duration: result.duration,
          durationFormatted: formatDuration(result.duration),
          metrics: result.metrics,
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Sync completed with errors',
          data: {
            commitsInserted: result.commitsInserted,
            commitsSkipped: result.commitsSkipped,
            errors: result.errors,
            duration: result.duration,
          },
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    if (isGitHubAuthError(error)) {
      return NextResponse.json(
        toGitHubAuthErrorPayload(error),
        { status: error.status }
      );
    }

    if (isGitHubAuthenticationFailure(error)) {
      return NextResponse.json(
        {
          error: 'GitHub authentication required',
          message: 'Your GitHub token has expired. Please log out and log back in to reconnect your GitHub account.',
          requiresReauth: true,
        },
        { status: 401 }
      );
    }

    console.error('Advanced sync error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: 'Sync failed', message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sync/advanced
 * 
 * Returns sync status and statistics for the authenticated user
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get latest sync job
    const latestJob = await prisma.syncJob.findFirst({
      where: { userId: session.user.id },
      orderBy: { startedAt: 'desc' },
    });

    // Get repository and commit counts
    const repoCount = await prisma.repository.count({
      where: { userId: session.user.id },
    });

    const commitCount = await prisma.commit.count({
      where: {
        repository: {
          userId: session.user.id,
        },
      },
    });

    // Get date range of commits
    const [oldestCommit, newestCommit] = await Promise.all([
      prisma.commit.findFirst({
        where: {
          repository: {
            userId: session.user.id,
          },
        },
        orderBy: { authorDate: 'asc' },
        select: { authorDate: true },
      }),
      prisma.commit.findFirst({
        where: {
          repository: {
            userId: session.user.id,
          },
        },
        orderBy: { authorDate: 'desc' },
        select: { authorDate: true },
      }),
    ]);

    return NextResponse.json({
      job: latestJob || null,
      stats: {
        repositories: repoCount,
        commits: commitCount,
        dateRange: {
          oldest: oldestCommit?.authorDate || null,
          newest: newestCommit?.authorDate || null,
        },
      },
    });
  } catch (error: unknown) {
    console.error('Error fetching advanced sync status:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: 'Failed to fetch sync status', message },
      { status: 500 }
    );
  }
}

/**
 * Format duration in human-readable format
 */
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}
