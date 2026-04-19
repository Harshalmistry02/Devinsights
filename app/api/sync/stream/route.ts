import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
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

  const userId = session.user.id;

  let accessToken: string;
  try {
    accessToken = await withGitHubAuth(userId, async (token) => token);
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
          stats: {
            reposProcessed: 0,
            totalRepos: 0,
            commitsProcessed: 0,
            totalCommits: 0,
            apiRequests: 0,
            rateLimitResets: 0,
            errors: 0,
          },
        });

        // Perform sync with progress callbacks
        // Note: This is a basic implementation
        // You'll need to modify GitHubSyncService to support progress callbacks
        const result = await syncService.syncUserData();

        // Complete
        sendEvent({
          phase: 'complete',
          percentage: 100,
          message: 'Sync complete!',
          stats: {
            reposProcessed: result.repos || 0,
            totalRepos: result.repos || 0,
            commitsProcessed: 0, // Not available in current implementation
            totalCommits: 0, // Not available in current implementation
            apiRequests: 0,
            rateLimitResets: 0,
            errors: 0,
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
