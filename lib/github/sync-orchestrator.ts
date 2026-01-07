/**
 * Advanced Sync Orchestrator
 * 
 * This service orchestrates the complete sync process using:
 * - Tier 1: AdvancedGitHubSyncService (data fetching)
 * - Tier 2: CommitDataPipeline (validation & storage)
 * 
 * Key Features:
 * - Incremental sync support (only fetch new commits)
 * - Full sync mode (fetch complete history)
 * - Progress tracking
 * - Error recovery
 * - Analytics refresh trigger
 */

import prisma from '@/lib/prisma';
import { SyncStatus } from '@prisma/client';
import { refreshUserAnalytics } from '@/lib/analytics';
import {
  AdvancedGitHubSyncService,
  createAdvancedSyncService,
  type EnhancedRepository,
  type SyncMetrics,
} from '@/lib/github/advanced-sync-service';
import {
  CommitDataPipeline,
  RepositoryDataPipeline,
  createCommitPipeline,
} from '@/lib/data-pipeline/commit-pipeline';

// ============================================
// Types
// ============================================

export interface SyncOptions {
  /**
   * If true, fetch complete commit history for all repos.
   * If false, only fetch commits since last sync.
   */
  fullSync?: boolean;

  /**
   * Include forked repositories
   */
  includeForks?: boolean;

  /**
   * Include archived repositories
   */
  includeArchived?: boolean;

  /**
   * Maximum commits to fetch per repository (for testing/throttling)
   * Set to null for unlimited
   */
  maxCommitsPerRepo?: number;

  /**
   * Whether to fetch detailed commit stats (adds/dels/files)
   * This requires additional API calls
   */
  fetchCommitStats?: boolean;

  /**
   * Progress callback
   */
  onProgress?: (progress: OrchestratorProgress) => void;
}

export interface OrchestratorProgress {
  phase: 'init' | 'repositories' | 'commits' | 'stats' | 'analytics' | 'complete' | 'error';
  currentRepo?: string;
  reposProcessed: number;
  totalRepos: number;
  commitsProcessed: number;
  totalCommits: number;
  message: string;
  percentage: number;
  metrics?: SyncMetrics;
  error?: string;
}

export interface SyncResult {
  success: boolean;
  repositoriesProcessed: number;
  commitsInserted: number;
  commitsSkipped: number;
  errors: number;
  duration: number; // milliseconds
  metrics: SyncMetrics;
}

// ============================================
// Advanced Sync Orchestrator
// ============================================

export class AdvancedSyncOrchestrator {
  private syncService: AdvancedGitHubSyncService;
  private pipeline: CommitDataPipeline;
  private userId: string;
  private syncJobId: string = '';
  private startTime: number = 0;

  constructor(accessToken: string, userId: string) {
    this.userId = userId;
    this.syncService = createAdvancedSyncService(accessToken, userId);
    this.pipeline = createCommitPipeline();
  }

  /**
   * Execute a full sync operation
   */
  async sync(options: SyncOptions = {}): Promise<SyncResult> {
    const {
      fullSync = false,
      includeForks = false,
      includeArchived = false,
      maxCommitsPerRepo,
      fetchCommitStats = true,
      onProgress,
    } = options;

    this.startTime = Date.now();
    this.syncService.resetMetrics();
    this.pipeline.resetMetrics();

    let totalCommitsInserted = 0;
    let totalCommitsSkipped = 0;
    let totalErrors = 0;

    // Create sync job
    const job = await this.createSyncJob();
    this.syncJobId = job.id;

    try {
      // ======================================
      // Phase 1: Fetch Repositories
      // ======================================
      onProgress?.({
        phase: 'repositories',
        reposProcessed: 0,
        totalRepos: 0,
        commitsProcessed: 0,
        totalCommits: 0,
        message: 'Fetching repositories...',
        percentage: 5,
      });

      console.log('📦 Phase 1: Fetching repositories...');
      const repositories = await this.syncService.fetchAllRepositories({
        includeForks,
        includeArchived,
      });

      await this.updateSyncJob({ totalRepos: repositories.length });

      onProgress?.({
        phase: 'repositories',
        reposProcessed: 0,
        totalRepos: repositories.length,
        commitsProcessed: 0,
        totalCommits: 0,
        message: `Found ${repositories.length} repositories`,
        percentage: 10,
      });

      // ======================================
      // Phase 2: Upsert Repositories to DB
      // ======================================
      console.log('💾 Phase 2: Saving repositories to database...');
      const repoIdMap = await RepositoryDataPipeline.upsertRepositories(
        this.userId,
        repositories
      );

      // ======================================
      // Phase 3: Fetch & Store Commits
      // ======================================
      console.log('📝 Phase 3: Fetching commits...');
      
      for (let i = 0; i < repositories.length; i++) {
        const repo = repositories[i];
        const [owner, repoName] = repo.fullName.split('/');
        const dbRepoId = repoIdMap.get(repo.githubId);

        if (!dbRepoId) {
          console.warn(`⚠️ No DB ID for repo ${repo.fullName}, skipping...`);
          continue;
        }

        onProgress?.({
          phase: 'commits',
          currentRepo: repo.name,
          reposProcessed: i,
          totalRepos: repositories.length,
          commitsProcessed: totalCommitsInserted,
          totalCommits: totalCommitsInserted + totalCommitsSkipped,
          message: `Syncing ${repo.name}...`,
          percentage: 10 + ((i / repositories.length) * 70),
          metrics: this.syncService.getMetrics(),
        });

        // Get last sync date for incremental sync
        let lastSyncDate: Date | null = null;
        if (!fullSync) {
          lastSyncDate = await RepositoryDataPipeline.getLastCommitDate(dbRepoId);
          if (lastSyncDate) {
            console.log(`  📅 Incremental sync from ${lastSyncDate.toISOString()}`);
          }
        }

        // Fetch commits
        const commits = await this.syncService.fetchAllCommits(
          owner,
          repoName,
          lastSyncDate ?? undefined,
          maxCommitsPerRepo
        );

        if (commits.length === 0) {
          console.log(`  ✨ No new commits in ${repo.name}`);
          this.syncService.incrementReposProcessed();
          await this.updateSyncJob({ processedRepos: i + 1 });
          continue;
        }

        // Validate commits
        const validCommits = this.pipeline.validateBatch(commits);

        // Optionally fetch commit stats
        if (fetchCommitStats && validCommits.length > 0) {
          onProgress?.({
            phase: 'stats',
            currentRepo: repo.name,
            reposProcessed: i,
            totalRepos: repositories.length,
            commitsProcessed: totalCommitsInserted,
            totalCommits: totalCommitsInserted + totalCommitsSkipped,
            message: `Fetching stats for ${repo.name}...`,
            percentage: 10 + ((i / repositories.length) * 70),
            metrics: this.syncService.getMetrics(),
          });

          const stats = await this.syncService.fetchCommitStats(
            owner,
            repoName,
            validCommits,
            { maxApiCalls: 50 } // Limit API calls per repo
          );

          // Enrich commits with stats
          const enrichedCommits = this.pipeline.enrichBatch(validCommits, stats);

          // Insert to database
          const result = await this.pipeline.batchInsertCommits(dbRepoId, enrichedCommits);
          totalCommitsInserted += result.inserted;
          totalCommitsSkipped += result.skipped;
          totalErrors += result.errors;
        } else {
          // Insert without stats
          const result = await this.pipeline.batchInsertCommits(dbRepoId, validCommits);
          totalCommitsInserted += result.inserted;
          totalCommitsSkipped += result.skipped;
          totalErrors += result.errors;
        }

        this.syncService.incrementReposProcessed();
        await this.updateSyncJob({ processedRepos: i + 1 });
      }

      // ======================================
      // Phase 4: Refresh Analytics
      // ======================================
      onProgress?.({
        phase: 'analytics',
        reposProcessed: repositories.length,
        totalRepos: repositories.length,
        commitsProcessed: totalCommitsInserted,
        totalCommits: totalCommitsInserted + totalCommitsSkipped,
        message: 'Calculating analytics...',
        percentage: 85,
        metrics: this.syncService.getMetrics(),
      });

      console.log('📊 Phase 4: Refreshing analytics...');
      try {
        await refreshUserAnalytics(this.userId);
        console.log('✅ Analytics refreshed successfully');
      } catch (analyticsError) {
        console.error('⚠️ Failed to refresh analytics:', analyticsError);
        // Don't fail the entire sync if analytics fails
      }

      // ======================================
      // Phase 5: Complete
      // ======================================
      await this.updateSyncJob({
        status: SyncStatus.COMPLETED,
        totalCommits: totalCommitsInserted + totalCommitsSkipped,
        completedAt: new Date(),
      });

      const duration = Date.now() - this.startTime;

      onProgress?.({
        phase: 'complete',
        reposProcessed: repositories.length,
        totalRepos: repositories.length,
        commitsProcessed: totalCommitsInserted,
        totalCommits: totalCommitsInserted + totalCommitsSkipped,
        message: `Sync complete! ${totalCommitsInserted} commits synced`,
        percentage: 100,
        metrics: this.syncService.getMetrics(),
      });

      console.log(`\n✅ Sync completed in ${(duration / 1000).toFixed(1)}s`);
      console.log(`   📊 Repositories: ${repositories.length}`);
      console.log(`   📝 Commits: ${totalCommitsInserted} inserted, ${totalCommitsSkipped} skipped`);
      console.log(`   ⚠️ Errors: ${totalErrors}`);

      return {
        success: true,
        repositoriesProcessed: repositories.length,
        commitsInserted: totalCommitsInserted,
        commitsSkipped: totalCommitsSkipped,
        errors: totalErrors,
        duration,
        metrics: this.syncService.getMetrics(),
      };

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      await this.updateSyncJob({
        status: SyncStatus.FAILED,
        errorMessage,
        completedAt: new Date(),
      });

      onProgress?.({
        phase: 'error',
        reposProcessed: 0,
        totalRepos: 0,
        commitsProcessed: totalCommitsInserted,
        totalCommits: totalCommitsInserted + totalCommitsSkipped,
        message: `Sync failed: ${errorMessage}`,
        percentage: 0,
        error: errorMessage,
      });

      console.error('❌ Sync failed:', error);

      return {
        success: false,
        repositoriesProcessed: 0,
        commitsInserted: totalCommitsInserted,
        commitsSkipped: totalCommitsSkipped,
        errors: totalErrors + 1,
        duration: Date.now() - this.startTime,
        metrics: this.syncService.getMetrics(),
      };
    }
  }

  /**
   * Create a new sync job record
   */
  private async createSyncJob() {
    return prisma.syncJob.create({
      data: {
        userId: this.userId,
        status: SyncStatus.IN_PROGRESS,
      },
    });
  }

  /**
   * Update sync job status
   */
  private async updateSyncJob(updates: {
    totalRepos?: number;
    processedRepos?: number;
    totalCommits?: number;
    status?: SyncStatus;
    errorMessage?: string;
    completedAt?: Date;
  }) {
    if (!this.syncJobId) return;

    try {
      await prisma.syncJob.update({
        where: { id: this.syncJobId },
        data: updates,
      });
    } catch (error) {
      console.warn('Failed to update sync job:', error);
    }
  }

  /**
   * Get the current sync service metrics
   */
  getMetrics(): SyncMetrics {
    return this.syncService.getMetrics();
  }

  /**
   * Get the pipeline metrics
   */
  getPipelineMetrics() {
    return this.pipeline.getMetrics();
  }
}

/**
 * Factory function to create an orchestrator
 */
export function createSyncOrchestrator(
  accessToken: string,
  userId: string
): AdvancedSyncOrchestrator {
  return new AdvancedSyncOrchestrator(accessToken, userId);
}
