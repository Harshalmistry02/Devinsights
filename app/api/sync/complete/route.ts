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
import { 
  AdvancedGitHubSyncService,
  type ProcessedCommit,
} from '@/lib/github/advanced-sync-service';
import { 
  CommitDataPipeline,
  createCommitPipeline,
} from '@/lib/data-pipeline/commit-pipeline';
import { refreshUserAnalytics } from '@/lib/analytics';

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
    // STEP 1: Get GitHub Access Token
    // ============================================
    console.log('📋 Step 1: Retrieving GitHub credentials...');

    const account = await prisma.account.findFirst({
      where: {
        userId,
        provider: 'github',
      },
      select: { access_token: true },
    });

    if (!account?.access_token) {
      return NextResponse.json(
        { 
          error: 'GitHub account not linked',
          message: 'Please reconnect your GitHub account',
        },
        { status: 401 }
      );
    }

    // Initialize sync service with throttling
    const syncService = new AdvancedGitHubSyncService(
      account.access_token,
      userId
    );

    // ============================================
    // STEP 2: Check Rate Limit Before Starting
    // ============================================
    console.log('🔍 Step 2: Checking GitHub API rate limits...');

    const rateLimitBefore = await syncService.getRateLimit();
    console.log(`   Rate limit: ${rateLimitBefore.remaining}/${rateLimitBefore.limit} requests`);

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

    const storedRepos = await Promise.all(
      repos.map((repo) =>
        prisma.repository.upsert({
          where: { githubId: repo.githubId },
          update: {
            name: repo.name,
            fullName: repo.fullName,
            description: repo.description,
            language: repo.language,
            stars: repo.stars,
            forks: repo.forks,
            isPrivate: repo.isPrivate,
            isFork: repo.isFork,
            isArchived: repo.isArchived,
            defaultBranch: repo.defaultBranch,
            lastSyncedAt: new Date(),
          },
          create: {
            userId,
            githubId: repo.githubId,
            name: repo.name,
            fullName: repo.fullName,
            description: repo.description,
            language: repo.language,
            stars: repo.stars,
            forks: repo.forks,
            isPrivate: repo.isPrivate,
            isFork: repo.isFork,
            isArchived: repo.isArchived,
            defaultBranch: repo.defaultBranch,
          },
        })
      )
    );

    console.log(`   ✅ Stored ${storedRepos.length} repositories`);

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

    for (let i = 0; i < storedRepos.length; i++) {
      const storedRepo = storedRepos[i];
      const sourceRepo = repos[i];

      console.log(`\n   📦 Processing ${i + 1}/${storedRepos.length}: ${sourceRepo.fullName}`);

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
            where: { repositoryId: storedRepo.id },
            orderBy: { authorDate: 'desc' },
            select: { authorDate: true },
          });

          // If we have existing commits, fetch only newer ones (incremental sync)
          sinceDateForRepo = latestExistingCommit?.authorDate || undefined;
        }
        
        if (forceFullSync) {
          console.log(`      🔄 Force full sync enabled - fetching ALL commits`);
        } else if (sinceDateForRepo) {
          console.log(`      📅 Incremental sync from: ${sinceDateForRepo.toISOString()}`);
        } else {
          console.log(`      🆕 Full sync (no existing commits found)`);
        }

        // ========================================
        // FETCH ALL COMMITS (FULL OR INCREMENTAL)
        // ========================================
        const commits = await syncService.fetchAllCommits(
          owner,
          repoName,
          sinceDateForRepo
        );

        console.log(`      📝 Fetched ${commits.length} commits`);
        commitStats.total += commits.length;

        if (commits.length === 0) {
          continue;
        }

        // ========================================
        // FETCH COMMIT STATISTICS (SAMPLED)
        // ========================================
        console.log(`      📊 Enriching commits with statistics...`);

        const stats = await syncService.fetchCommitStats(
          owner,
          repoName,
          commits
        );

        // Enrich commits with stats
        const enrichedCommits = pipeline.enrichBatch(commits, stats);

        // ========================================
        // VALIDATE COMMITS
        // ========================================
        const validCommits = pipeline.validateBatch(enrichedCommits);

        if (validCommits.length === 0) {
          console.warn(`      ⚠️ No valid commits found for ${sourceRepo.fullName}`);
          continue;
        }

        // ========================================
        // BATCH INSERT INTO DATABASE
        // ========================================
        const insertResult = await pipeline.batchInsertCommits(
          storedRepo.id,
          validCommits
        );

        commitStats.processed += insertResult.inserted;
        commitStats.duplicates += insertResult.skipped;

        console.log(`      ✅ Inserted: ${insertResult.inserted}, Skipped: ${insertResult.skipped}`);

        // Update last synced timestamp
        await prisma.repository.update({
          where: { id: storedRepo.id },
          data: { lastSyncedAt: new Date() },
        });
      } catch (error) {
        commitStats.errors++;
        console.error(`      ❌ Error syncing ${sourceRepo.fullName}:`, error);
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

    const syncJob = await prisma.syncJob.create({
      data: {
        userId,
        status: 'COMPLETED',
        totalRepos: storedRepos.length,
        processedRepos: storedRepos.length,
        totalCommits: commitStats.total,
        completedAt: new Date(),
      },
    });

    console.log(`\n✨ Sync completed in ${syncDurationMin} minutes`);

    const metrics = syncService.getMetrics();

    return NextResponse.json({
      success: true,
      message: 'Sync completed successfully',
      data: {
        syncJobId: syncJob.id,
        totalRepos: storedRepos.length,
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Fatal sync error:', error);

    // Log the failure
    try {
      await prisma.syncJob.create({
        data: {
          userId,
          status: 'FAILED',
          errorMessage,
          completedAt: new Date(),
        },
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
export async function GET(req: NextRequest) {
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
