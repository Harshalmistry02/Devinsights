import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { GitHubSyncService } from '@/lib/github/sync-service';
import prisma from '@/lib/prisma';

/**
 * POST /api/sync
 * Triggers a full GitHub data sync for the authenticated user
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's GitHub access token from the database
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'github',
      },
      select: {
        access_token: true,
      },
    });

    if (!account?.access_token) {
      return NextResponse.json(
        { error: 'GitHub account not linked or token missing' },
        { status: 401 }
      );
    }

    // For now, sync runs synchronously
    // Later: Move to background queue (BullMQ, Inngest, etc.)
    const syncService = new GitHubSyncService(
      account.access_token,
      session.user.id
    );

    const result = await syncService.syncUserData();

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Sync error:', error);

    return NextResponse.json(
      { error: 'Sync failed', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sync
 * Returns the latest sync job status for the authenticated user
 */
export async function GET(req: NextRequest) {
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
  } catch (error: any) {
    console.error('Error fetching sync status:', error);

    return NextResponse.json(
      { error: 'Failed to fetch sync status', message: error.message },
      { status: 500 }
    );
  }
}
