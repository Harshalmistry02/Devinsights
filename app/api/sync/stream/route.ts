import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { GitHubSyncService } from '@/lib/github/sync-service';
import prisma from '@/lib/prisma';
import { SyncProgressEvent } from '@/lib/sync/sync-stream';

/**
 * POST /api/sync/stream
 * Server-Sent Events endpoint for real-time sync progress
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  // Get GitHub token
  const account = await prisma.account.findFirst({
    where: { userId, provider: 'github' },
    select: { access_token: true },
  });

  if (!account?.access_token) {
    return NextResponse.json({ error: 'GitHub not connected' }, { status: 401 });
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
          account.access_token,
          userId
        );

        const startTime = Date.now();
        let processedRepos = 0;
        let totalRepos = 0;
        let processedCommits = 0;

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
            reposProcessed: result.reposCount || 0,
            totalRepos: result.reposCount || 0,
            commitsProcessed: result.commitsCount || 0,
            totalCommits: result.commitsCount || 0,
            apiRequests: 0,
            rateLimitResets: 0,
            errors: 0,
          },
        });

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } catch (error) {
        console.error('Sync stream error:', error);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              phase: 'error',
              percentage: 0,
              message: error instanceof Error ? error.message : 'Sync failed',
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
