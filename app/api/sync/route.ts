import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { SyncStatus } from '@prisma/client';
import {
  withGitHubAuth,
  isGitHubAuthError,
  isGitHubAuthenticationFailure,
  toGitHubAuthErrorPayload,
} from '@/lib/github/auth-token';
import {
  AdvancedGitHubSyncService,
} from '@/lib/github/advanced-sync-service';
import {
  createCommitPipeline,
  RepositoryDataPipeline,
} from '@/lib/data-pipeline/commit-pipeline';
import { refreshUserAnalytics } from '@/lib/analytics';

const sanitizeLog = (val: unknown): string =>
  String(val).replace(/[\r\n]/g, ' ').slice(0, 200);

/**
 * POST /api/sync
 * Performs a complete GitHub data sync with all commits
 */
export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const syncStartTime = Date.now();

  const syncJob = await prisma.syncJob.create({
    data: {
      userId,
      status: SyncStatus.IN_PROGRESS,
      totalRepos: 0,
      processedRepos: 0,
      totalCommits: 0,
    },
  });

  const syncJobId = syncJob.id;

  const updateSyncJob = async (updates: {
    totalRepos?: number;
    processedRepos?: number;
    totalCommits?: number;
    status?: SyncStatus;
    errorMessage?: string;
    completedAt?: Date;
  }) => {
    try {
      await prisma.syncJob.update({
        where: { id: syncJobId },
        data: updates,
      });
    } catch (error) {
      console.warn('Failed to update sync job:', error);
    }
  };

  let forceFullSync = false;
  try {
    const body = await req.json().catch(() => ({}));
    forceFullSync = body.forceFullSync === true;
  } catch {
    // Use defaults
  }

  const pipeline = createCommitPipeline();

  try {
    let syncService: AdvancedGitHubSyncService;
    let rateLimitBefore: Awaited<ReturnType<AdvancedGitHubSyncService['getRateLimit']>>;

    try {
      ({ syncService, rateLimitBefore } = await withGitHubAuth(userId, async (token) => {
        const svc = new AdvancedGitHubSyncService(token, userId);
        const rl = await svc.getRateLimit();
        return { syncService: svc, rateLimitBefore: rl };
      }, { retryOnAuthFailure: false }));
    } catch (initError) {
      if (isGitHubAuthError(initError)) {
        await updateSyncJob({
          status: SyncStatus.FAILED,
          errorMessage: initError.message,
          completedAt: new Date(),
        });
        return NextResponse.json(toGitHubAuthErrorPayload(initError), { status: initError.status });
      }
      if (isGitHubAuthenticationFailure(initError)) {
        await updateSyncJob({
          status: SyncStatus.FAILED,
          errorMessage: 'GitHub token expired',
          completedAt: new Date(),
        });
        return NextResponse.json(
          { error: 'GitHub authentication required', message: 'Your GitHub token has expired. Please log out and log back in.', requiresReauth: true },
          { status: 401 }
        );
      }
      await updateSyncJob({
        status: SyncStatus.FAILED,
        errorMessage: 'Unable to connect to GitHub',
        completedAt: new Date(),
      });
      return NextResponse.json(
        { error: 'Failed to connect to GitHub', message: 'Unable to verify GitHub API status.' },
        { status: 503 }
      );
    }

    if (rateLimitBefore.remaining === -1) {
      return NextResponse.json(
        { error: 'GitHub API unavailable', message: 'Unable to connect to GitHub API.' },
        { status: 503 }
      );
    }

    if (rateLimitBefore.remaining < 50) {
      return NextResponse.json(
        {
          error: 'Rate limit too low',
          message: 'GitHub rate limit is too low. Please try again later.',
          rateLimitResets: new Date(rateLimitBefore.reset * 1000).toISOString(),
        },
        { status: 429 }
      );
    }

    const repos = await syncService.fetchAllRepositories({
      includeForks: false,
      includeArchived: false,
    });

    if (repos.length === 0) {
      const syncDurationMs = Date.now() - syncStartTime;
      return NextResponse.json({
        success: true,
        message: 'No repositories to sync',
        data: {
          totalRepos: 0,
          totalCommits: 0,
          syncDurationMs,
          syncDurationMin: Number((syncDurationMs / 60000).toFixed(2)),
        },
      });
    }

    const repoIdMap = await RepositoryDataPipeline.upsertRepositories(userId, repos);
    const repositoryUpsertFailures = repos.length - repoIdMap.size;

    if (repoIdMap.size === 0) {
      const syncDurationMs = Date.now() - syncStartTime;

      await updateSyncJob({
        status: SyncStatus.FAILED,
        totalRepos: repos.length,
        processedRepos: 0,
        totalCommits: 0,
        errorMessage: 'Unable to persist repositories to database',
        completedAt: new Date(),
      });

      return NextResponse.json(
        {
          error: 'Repository sync setup failed',
          message:
            'Could not persist repositories to the database. Verify your database schema and run migrations on the deployed environment.',
          data: {
            totalRepos: repos.length,
            persistedRepos: 0,
            repositoryUpsertFailures,
            syncDurationMs,
            syncDurationMin: Number((syncDurationMs / 60000).toFixed(2)),
          },
        },
        { status: 500 }
      );
    }

    const commitStats = {
      total: 0,
      processed: 0,
      duplicates: 0,
      errors: 0,
    };

    let processedRepoCount = 0;

    for (let i = 0; i < repos.length; i++) {
      const sourceRepo = repos[i];
      const storedRepoId = repoIdMap.get(sourceRepo.githubId);

      if (!storedRepoId) continue;

      try {
        const [owner, repoName] = sourceRepo.fullName.split('/');

        let sinceDateForRepo: Date | undefined = undefined;

        if (!forceFullSync) {
          const latestExistingCommit = await prisma.commit.findFirst({
            where: { repositoryId: storedRepoId },
            orderBy: { authorDate: 'desc' },
            select: { authorDate: true },
          });
          sinceDateForRepo = latestExistingCommit?.authorDate || undefined;
        }

        const commits = await syncService.fetchAllCommits(owner, repoName, sinceDateForRepo);
        commitStats.total += commits.length;

        if (commits.length === 0) {
          await prisma.repository.update({
            where: { id: storedRepoId },
            data: { lastSyncedAt: new Date() },
          });
          processedRepoCount++;
          await updateSyncJob({
            processedRepos: processedRepoCount,
            totalCommits: commitStats.total,
          });
          continue;
        }

        const stats = await syncService.fetchCommitStats(owner, repoName, commits);
        const enrichedCommits = pipeline.enrichBatch(commits, stats);
        const validCommits = pipeline.validateBatch(enrichedCommits);

        if (validCommits.length === 0) {
          await prisma.repository.update({
            where: { id: storedRepoId },
            data: { lastSyncedAt: new Date() },
          });
          processedRepoCount++;
          await updateSyncJob({
            processedRepos: processedRepoCount,
            totalCommits: commitStats.total,
          });
          continue;
        }

        const insertResult = await pipeline.batchInsertCommits(storedRepoId, validCommits);
        commitStats.processed += insertResult.inserted;
        commitStats.duplicates += insertResult.skipped;

        await prisma.repository.update({
          where: { id: storedRepoId },
          data: { lastSyncedAt: new Date() },
        });

        processedRepoCount++;
        await updateSyncJob({
          processedRepos: processedRepoCount,
          totalCommits: commitStats.total,
        });
      } catch (error) {
        commitStats.errors++;
        console.error(`Error syncing ${sanitizeLog(sourceRepo.fullName)}:`, error);
      }
    }

    try {
      await refreshUserAnalytics(userId);
    } catch (analyticsError) {
      console.error('Analytics refresh failed:', analyticsError);
    }

    const syncDurationMs = Date.now() - syncStartTime;

    await updateSyncJob({
      status: SyncStatus.COMPLETED,
      totalRepos: repos.length,
      processedRepos: processedRepoCount,
      totalCommits: commitStats.total,
      completedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Sync completed successfully',
      data: {
        syncJobId,
        totalRepos: repos.length,
        totalCommits: commitStats.total,
        processedCommits: commitStats.processed,
        duplicateCommits: commitStats.duplicates,
        syncErrors: commitStats.errors + repositoryUpsertFailures,
        repositoryUpsertFailures,
        syncDurationMs,
        syncDurationMin: Number((syncDurationMs / 60000).toFixed(2)),
      },
    });
  } catch (error: unknown) {
    if (isGitHubAuthError(error)) {
      return NextResponse.json(toGitHubAuthErrorPayload(error), { status: error.status });
    }

    if (isGitHubAuthenticationFailure(error)) {
      return NextResponse.json(
        { error: 'GitHub authentication required', message: 'Your GitHub token has expired. Please log out and log back in.', requiresReauth: true },
        { status: 401 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Sync error:', error);

    try {
      await updateSyncJob({
        status: SyncStatus.FAILED,
        errorMessage,
        completedAt: new Date(),
      });
    } catch (logError) {
      console.error('Could not log sync failure:', logError);
    }

    return NextResponse.json({ error: 'Sync failed', message: errorMessage }, { status: 500 });
  }
}

/**
 * GET /api/sync
 * Returns the latest sync job status
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const latestSync = await prisma.syncJob.findFirst({
      where: { userId: session.user.id },
      orderBy: { startedAt: 'desc' },
    });

    const [repoCount, commitCount, oldestCommit, newestCommit] = await Promise.all([
      prisma.repository.count({ where: { userId: session.user.id } }),
      prisma.commit.count({ where: { repository: { userId: session.user.id } } }),
      prisma.commit.findFirst({
        where: { repository: { userId: session.user.id } },
        orderBy: { authorDate: 'asc' },
        select: { authorDate: true },
      }),
      prisma.commit.findFirst({
        where: { repository: { userId: session.user.id } },
        orderBy: { authorDate: 'desc' },
        select: { authorDate: true },
      }),
    ]);

    if (!latestSync) {
      return NextResponse.json({
        status: 'never_synced',
        message: 'No sync has been performed yet',
        stats: { repositories: repoCount, commits: commitCount },
      });
    }

    return NextResponse.json({
      status: latestSync.status.toLowerCase(),
      startedAt: latestSync.startedAt,
      completedAt: latestSync.completedAt,
      totalRepos: latestSync.totalRepos,
      processedRepos: latestSync.processedRepos,
      totalCommits: latestSync.totalCommits,
      errorMessage: latestSync.errorMessage,
      stats: {
        repositories: repoCount,
        commits: commitCount,
        dateRange: {
          oldest: oldestCommit?.authorDate || null,
          newest: newestCommit?.authorDate || null,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching sync status:', error);
    return NextResponse.json({ error: 'Failed to fetch sync status' }, { status: 500 });
  }
}
