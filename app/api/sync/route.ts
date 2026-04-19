import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { GitHubSyncService } from '@/lib/github/sync-service';
import prisma from '@/lib/prisma';
import {
  withGitHubAuth,
  isGitHubAuthError,
  isGitHubAuthenticationFailure,
  toGitHubAuthErrorPayload,
} from '@/lib/github/auth-token';

/**
 * POST /api/sync
 * Triggers a full GitHub data sync for the authenticated user
 */
export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await withGitHubAuth(
      session.user.id,
      async (accessToken) => {
      const syncService = new GitHubSyncService(accessToken, session.user.id!);
      return syncService.syncUserData();
      },
      { retryOnAuthFailure: false }
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
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

    console.error('Sync error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: 'Sync failed', message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sync
 * Returns the latest sync job status for the authenticated user
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch latest sync job for user
    const job = await prisma.syncJob.findFirst({
      where: { userId: session.user.id },
      orderBy: { startedAt: 'desc' },
    });

    return NextResponse.json({ job: job || null });
  } catch (error: unknown) {
    console.error('Error fetching sync status:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: 'Failed to fetch sync status', message },
      { status: 500 }
    );
  }
}
