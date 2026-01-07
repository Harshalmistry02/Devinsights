/**
 * Debug API Route: GET /api/debug/sync-status
 * 
 * Returns comprehensive status of user's sync data for debugging.
 * Only available in development mode.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const userId = session.user.id;

  try {
    // Get user's GitHub account
    const account = await prisma.account.findFirst({
      where: {
        userId,
        provider: 'github',
      },
      select: {
        access_token: true,
        provider: true,
        providerAccountId: true,
        scope: true,
      },
    });

    // Get repositories
    const repositories = await prisma.repository.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        fullName: true,
        lastSyncedAt: true,
        _count: {
          select: { commits: true }
        }
      },
    });

    // Get total commit count
    const commitCount = await prisma.commit.count({
      where: {
        repository: { userId }
      }
    });

    // Get sync jobs
    const syncJobs = await prisma.syncJob.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        status: true,
        totalRepos: true,
        totalCommits: true,
        errorMessage: true,
        startedAt: true,
        completedAt: true,
      }
    });

    // Get analytics snapshot
    const analytics = await prisma.analyticsSnapshot.findUnique({
      where: { userId },
      select: {
        totalRepos: true,
        totalCommits: true,
        currentStreak: true,
        calculatedAt: true,
      }
    });

    // Get sample commits (latest 5)
    const sampleCommits = await prisma.commit.findMany({
      where: {
        repository: { userId }
      },
      orderBy: { authorDate: 'desc' },
      take: 5,
      select: {
        id: true,
        sha: true,
        message: true,
        authorDate: true,
        repository: {
          select: { fullName: true }
        }
      }
    });

    return NextResponse.json({
      userId,
      githubAccount: {
        linked: !!account,
        hasAccessToken: !!account?.access_token,
        accessTokenPreview: account?.access_token 
          ? `${account.access_token.slice(0, 10)}...${account.access_token.slice(-5)}`
          : null,
        scope: account?.scope || 'Not stored (may be default)',
      },
      repositories: {
        count: repositories.length,
        list: repositories.map(r => ({
          name: r.fullName,
          commitCount: r._count.commits,
          lastSynced: r.lastSyncedAt,
        })),
      },
      commits: {
        totalCount: commitCount,
        samples: sampleCommits.map(c => ({
          repo: c.repository.fullName,
          sha: c.sha.slice(0, 7),
          message: c.message.slice(0, 50) + (c.message.length > 50 ? '...' : ''),
          date: c.authorDate,
        })),
      },
      syncJobs,
      analytics,
    });
  } catch (error: any) {
    console.error('Debug sync-status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debug info', message: error.message },
      { status: 500 }
    );
  }
}
