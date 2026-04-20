import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { resolveDatabaseUserId, getSessionReauthPayload } from '@/lib/auth-user';
import { GitHubSyncService } from '@/lib/github/sync-service';
import { SyncProgressEvent } from '@/lib/sync/sync-stream';
import {
  withGitHubAuth,
  isGitHubAuthError,
  isGitHubAuthenticationFailure,
  toGitHubAuthErrorPayload,
} from '@/lib/github/auth-token';

/**
 * POST /api/sync/stream
 * Server-Sent Events endpoint for real-time sync progress
 */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resolvedUser = await resolveDatabaseUserId({
    sessionUserId: session.user.id,
    email: session.user.email,
  });

  if (!resolvedUser) {
    return NextResponse.json(getSessionReauthPayload(), { status: 401 });
  }

  const userId = resolvedUser.userId;

  let accessToken: string;
  try {
    accessToken = await withGitHubAuth(
      userId,
      async (token) => token,
      { retryOnAuthFailure: false }
    );
  } catch (error) {
    if (isGitHubAuthError(error)) {
      return NextResponse.json(
        toGitHubAuthErrorPayload(error),
        { status: error.status }
      );
    }

    throw error;
  }

  // Create SSE stream
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let latestStats = {
        reposProcessed: 0,
        totalRepos: 0,
        commitsProcessed: 0,
        totalCommits: 0,
        apiRequests: 0,
        rateLimitResets: 0,
        errors: 0,
      };

      const sendEvent = (event: SyncProgressEvent) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
        );
      };

      try {
        const syncService = new GitHubSyncService(
          accessToken,
          userId
        );

        // Initialize
        sendEvent({
          phase: 'init',
          percentage: 0,
          message: 'Initializing sync...',
          stats: latestStats,
        });

        // Perform sync with progress callbacks
        const result = await syncService.syncUserData((progress) => {
          latestStats = {
            reposProcessed: progress.reposProcessed ?? latestStats.reposProcessed,
            totalRepos: progress.totalRepos ?? latestStats.totalRepos,
            commitsProcessed: progress.commitsProcessed ?? latestStats.commitsProcessed,
            totalCommits: progress.totalCommits ?? latestStats.totalCommits,
            apiRequests: progress.apiRequests ?? latestStats.apiRequests,
            rateLimitResets: progress.rateLimitResets ?? latestStats.rateLimitResets,
            errors: progress.errors ?? latestStats.errors,
          };

          sendEvent({
            phase: progress.step === 'done'
              ? (progress.progress >= 100 ? 'complete' : 'analytics')
              : progress.step,
            percentage: progress.progress,
            message: progress.message,
            stats: latestStats,
          });
        });

        // Complete
        sendEvent({
          phase: 'complete',
          percentage: 100,
          message: 'Sync complete!',
          stats: {
            ...latestStats,
            reposProcessed: result.repos || latestStats.reposProcessed,
            totalRepos: result.repos || latestStats.totalRepos,
          },
        });

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } catch (error) {
        console.error('Sync stream error:', error);

        const message = isGitHubAuthenticationFailure(error)
          ? 'GitHub authentication required. Please log out and log back in.'
          : error instanceof Error
            ? error.message
            : 'Sync failed';

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              phase: 'error',
              percentage: 0,
              message,
              stats: {
                reposProcessed: 0,
                totalRepos: 0,
                commitsProcessed: 0,
                totalCommits: 0,
                apiRequests: 0,
                rateLimitResets: 0,
                errors: 1,
              },
            } as SyncProgressEvent)}\n\n`
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
