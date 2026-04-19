/**
 * COMPLETE API ROUTE IMPLEMENTATION
 * File: app/api/sync/complete/route.ts
 * 
 * This provides enhanced sync functionality with:
 * - Full commit history (not limited by date or pagination)
 * - Rate limit awareness with automatic throttling
 * - Incremental sync support
 * - Detailed progress logging
 * - Error recovery (continues on individual repo failures)
 */

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
 * POST /api/sync/complete
 * 
 * Performs a complete GitHub data sync:
 * 1. Fetches ALL repositories
 * 2. For each repo, fetches ALL commits (not limited by date)
 * 3. Enriches commits with detailed stats
 * 4. Stores in database with proper error handling
 * 5. Refreshes analytics
 * 6. Returns comprehensive status
 */
export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
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

  // Parse request body for options
  let forceFullSync = false;
  try {
    const body = await req.json().catch(() => ({}));
    forceFullSync = body.forceFullSync === true;
    if (forceFullSync) {
      console.log('🔄 Force full sync requested - will fetch ALL commits regardless of existing data');
    }
  } catch {
    // No body or invalid JSON, use defaults
  }

  // Initialize pipeline for data processing
  const pipeline = createCommitPipeline();

  try {
    // ============================================
    // STEP 1: Get GitHub Access Token & Check Rate Limit
    // ============================================
    console.log('📋 Step 1: Retrieving GitHub credentials and checking rate limits...');

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
          errorMessage: 'Your GitHub token has expired. Please log out and log back in.',
          completedAt: new Date(),
        });
        return NextResponse.json(
          { error: 'GitHub authentication required', message: 'Your GitHub token has expired. Please log out and log back in.', requiresReauth: true },
          { status: 401 }
        );
      }
      await updateSyncJob({
        status: SyncStatus.FAILED,
        errorMessage: 'Unable to verify GitHub API status. Please try again later.',
        completedAt: new Date(),
      });
      return NextResponse.json(
        { error: 'Failed to connect to GitHub', message: 'Unable to verify GitHub API status. Please try again later.' },
        { status: 503 }
      );
    }
    
    console.log(`   Rate limit: ${rateLimitBefore.remaining}/${rateLimitBefore.limit} requests`);

    // ============================================
    // STEP 2: Validate Rate Limit
    // ============================================
    if (rateLimitBefore.remaining === -1) {
      return NextResponse.json(
        {
          error: 'GitHub API unavailable',
          message: 'Unable to connect to GitHub API. Please try again later.',
        },
        { status: 503 }
      );
    }

    if (rateLimitBefore.remaining < 50) {
      return NextResponse.json(
        {
          error: 'Rate limit too low',
          message: 'GitHub rate limit is too low to complete sync. Please try again later.',
          rateLimitResets: new Date(rateLimitBefore.reset * 1000).toISOString(),
        },
        { status: 429 }
      );
    }

    // ============================================
    // STEP 3: Fetch All Repositories
    // ============================================
    console.log('🔄 Step 3: Fetching all repositories...');

    const repos = await syncService.fetchAllRepositories({
      includeForks: false,
      includeArchived: false,
    });

    console.log(`   ✅ Found ${repos.length} repositories`);

    if (repos.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No repositories to sync',
        data: {
          totalRepos: 0,
          totalCommits: 0,
          syncDurationMs: Date.now() - syncStartTime,
          metrics: syncService.getMetrics(),
        },
      });
    }

    // ============================================
    // STEP 4: Store Repositories
    // ============================================
    console.log('💾 Step 4: Storing repositories in database...');

    const repoIdMap = await RepositoryDataPipeline.upsertRepositories(userId, repos);

    console.log(`   ✅ Stored ${repoIdMap.size} repositories`);

    // ============================================
    // STEP 5: Fetch Commits for Each Repository
    // ============================================
    console.log('📥 Step 5: Fetching commits from all repositories...');

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

      if (!storedRepoId) {
        console.warn(`      Missing database ID for ${sanitizeLog(sourceRepo.fullName)}, skipping...`);
        continue;
      }

      console.log(`   Processing ${i + 1}/${repos.length}: ${sanitizeLog(sourceRepo.fullName)}`);

      try {
        const [owner, repoName] = sourceRepo.fullName.split('/');

        // ========================================
        // DETERMINE INCREMENTAL SYNC DATE
        // ========================================
        let sinceDateForRepo: Date | undefined = undefined;

        if (!forceFullSync) {
          // For incremental sync: get the latest commit date we already have for this repo
          // This is more accurate than using last sync job date
          const latestExistingCommit = await prisma.commit.findFirst({
            where: { repositoryId: storedRepoId },
            orderBy: { authorDate: 'desc' },
            select: { authorDate: true },
          });

          // If we have existing commits, fetch only newer ones (incremental sync)
          sinceDateForRepo = latestExistingCommit?.authorDate || undefined;
        }
        
        if (forceFullSync) {
          console.log('      Force full sync enabled - fetching ALL commits');
        } else if (sinceDateForRepo) {
          console.log(`      Incremental sync from: ${sanitizeLog(sinceDateForRepo.toISOString())}`);
        } else {
          console.log('      Full sync (no existing commits found)');
        }

        // ========================================
        // FETCH ALL COMMITS (FULL OR INCREMENTAL)
        // ========================================
        const commits = await syncService.fetchAllCommits(
          owner,
          repoName,
          sinceDateForRepo
        );

        console.log(`      Fetched ${commits.length} commits`);
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
          console.warn(`      No valid commits found for ${sanitizeLog(sourceRepo.fullName)}`);
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

        console.log(`      Inserted: ${insertResult.inserted}, Skipped: ${insertResult.skipped}`);

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
        console.error(`      Error syncing ${sanitizeLog(sourceRepo.fullName)}:`, error);
        // Continue with next repo instead of failing entire sync
      }
    }

    // ============================================
    // STEP 6: Refresh Analytics
    // ============================================
    console.log('\n📈 Step 6: Recalculating analytics...');

    try {
      await refreshUserAnalytics(userId);
      console.log('   ✅ Analytics refreshed successfully');
    } catch (analyticsError) {
      console.error('   ⚠️ Analytics refresh failed:', analyticsError);
      // Don't fail sync if analytics fails
    }

    // ============================================
    // STEP 7: Update Sync Job Status
    // ============================================
    const syncEndTime = Date.now();
    const syncDurationMs = syncEndTime - syncStartTime;
    const syncDurationMin = (syncDurationMs / 60000).toFixed(1);

    await updateSyncJob({
      status: SyncStatus.COMPLETED,
      totalRepos: repos.length,
      processedRepos: processedRepoCount,
      totalCommits: commitStats.total,
      completedAt: new Date(),
    });

    console.log(`\n✨ Sync completed in ${syncDurationMin} minutes`);

    const metrics = syncService.getMetrics();

    return NextResponse.json({
      success: true,
      message: 'Sync completed successfully',
      data: {
        syncJobId,
        totalRepos: repos.length,
        totalCommits: commitStats.total,
        processedCommits: commitStats.processed,
        duplicateCommits: commitStats.duplicates,
        syncErrors: commitStats.errors,
        syncDurationMs,
        syncDurationMin: parseFloat(syncDurationMin),
        timestamp: new Date().toISOString(),
        metrics: {
          totalRequests: metrics.totalRequests,
          rateLimitResets: metrics.rateLimitResets,
          errorsEncountered: metrics.errorsEncountered,
        },
      },
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

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Fatal sync error:', error);

    // Log the failure
    try {
      await updateSyncJob({
        status: SyncStatus.FAILED,
        errorMessage,
        completedAt: new Date(),
      });
    } catch (logError) {
      console.error('Could not log sync failure:', logError);
    }

    return NextResponse.json(
      {
        error: 'Sync failed',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sync/complete
 * 
 * Returns the status of the latest sync job with comprehensive stats
 */
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Get latest sync job
    const latestSync = await prisma.syncJob.findFirst({
      where: { userId: session.user.id },
      orderBy: { startedAt: 'desc' },
    });

    // Get repository and commit counts
    const [repoCount, commitCount, oldestCommit, newestCommit] = await Promise.all([
      prisma.repository.count({
        where: { userId: session.user.id },
      }),
      prisma.commit.count({
        where: {
          repository: {
            userId: session.user.id,
          },
        },
      }),
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

    if (!latestSync) {
      return NextResponse.json({
        status: 'never_synced',
        message: 'No sync has been performed yet',
        stats: {
          repositories: repoCount,
          commits: commitCount,
        },
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
    return NextResponse.json(
      { error: 'Failed to fetch sync status' },
      { status: 500 }
    );
  }
}
