import prisma from '@/lib/prisma';
import { GitHubClient } from './client';
import { SyncStatus } from '@prisma/client';
import { refreshUserAnalytics } from '@/lib/analytics';
import { analyzeCommitFiles } from '@/lib/utils/language-detector';
import { upsertRepositoryForUser } from './repository-upsert';

export class GitHubSyncService {
  private client: GitHubClient;
  private userId: string;
  private syncJobId: string = '';

  constructor(accessToken: string, userId: string) {
    this.client = new GitHubClient(accessToken, userId);
    this.userId = userId;
  }

  /**
   * Main sync orchestrator
   */
  async syncUserData(onProgress?: (progress: SyncProgress) => void) {
    // Create sync job
    const job = await prisma.syncJob.create({
      data: {
        userId: this.userId,
        status: SyncStatus.IN_PROGRESS,
      },
    });

    this.syncJobId = job.id;
    let totalCommitsProcessed = 0;

    try {
      // Step 1: Fetch repositories
      onProgress?.({
        step: 'repos',
        progress: 0,
        message: 'Fetching repositories...',
        reposProcessed: 0,
        totalRepos: 0,
        commitsProcessed: 0,
        totalCommits: 0,
        apiRequests: 0,
        rateLimitResets: 0,
        errors: 0,
      });
      const repos = await this.client.fetchRepositories();

      await this.updateSyncJob({ totalRepos: repos.length });
      onProgress?.({
        step: 'repos',
        progress: 100,
        message: `Found ${repos.length} repositories`,
        reposProcessed: 0,
        totalRepos: repos.length,
        commitsProcessed: 0,
        totalCommits: 0,
        apiRequests: 0,
        rateLimitResets: 0,
        errors: 0,
      });

      // Step 2: Store repositories
      for (let i = 0; i < repos.length; i++) {
        const repo = repos[i];

        // Upsert repository
        let storedRepo;
        try {
          storedRepo = await upsertRepositoryForUser(this.userId, repo);
        } catch (error) {
          console.error(`Failed to upsert repository ${repo.fullName}:`, error);
          await this.updateSyncJob({ processedRepos: i + 1 });
          continue;
        }

        // Step 3: Fetch commits for this repo
        onProgress?.({
          step: 'commits',
          progress: (i / repos.length) * 100,
          message: `Syncing ${repo.name}...`,
          reposProcessed: i,
          totalRepos: repos.length,
          commitsProcessed: totalCommitsProcessed,
          totalCommits: totalCommitsProcessed,
          apiRequests: 0,
          rateLimitResets: 0,
          errors: 0,
        });

        const [owner, repoName] = repo.fullName.split('/');
        const repoCommits = await this.client.fetchCommits(owner, repoName);

        // Store commits (skip duplicates using unique constraint)
        if (repoCommits.length > 0) {
          for (const commit of repoCommits) {
            // Skip commits with missing required fields
            if (!commit || !commit.sha || !commit.message) {
              continue;
            }

            try {
              // Analyze commit files for language detection and outlier flagging
              const fileAnalysis = analyzeCommitFiles(
                commit.files || [],
                commit.additions ?? 0,
                commit.deletions ?? 0
              );

              // Build metadata object
              const metadata = {
                fileExtensions: fileAnalysis.fileExtensions,
                languages: fileAnalysis.languages,
                isOutlier: fileAnalysis.isOutlier,
                outlierReason: fileAnalysis.outlierReason,
                unknownExtensions: fileAnalysis.unknownExtensions,
              };

              await prisma.commit.create({
                data: {
                  repositoryId: storedRepo.id,
                  sha: commit.sha,
                  message: commit.message,
                  authorName: commit.authorName ?? null,
                  authorEmail: commit.authorEmail ?? null,
                  authorDate: commit.authorDate,
                  additions: commit.additions ?? 0,
                  deletions: commit.deletions ?? 0,
                  filesChanged: commit.filesChanged ?? 0,
                  metadata, // Store file analysis metadata
                },
              });
            } catch (error: unknown) {
              // Skip duplicates (unique constraint violation on [repositoryId, sha])
              const isDuplicateCommit =
                typeof error === 'object' &&
                error !== null &&
                'code' in error &&
                (error as { code?: string }).code === 'P2002';

              if (!isDuplicateCommit) {
                throw error;
              }
            }
          }
        }

        totalCommitsProcessed += repoCommits.length;

        await this.updateSyncJob({ processedRepos: i + 1 });
      }

      // Complete sync job
      await this.updateSyncJob({
        status: SyncStatus.COMPLETED,
        completedAt: new Date(),
      });

      // Refresh analytics after successful sync
      onProgress?.({
        step: 'done',
        progress: 95,
        message: 'Calculating analytics...',
        reposProcessed: repos.length,
        totalRepos: repos.length,
        commitsProcessed: totalCommitsProcessed,
        totalCommits: totalCommitsProcessed,
        apiRequests: 0,
        rateLimitResets: 0,
        errors: 0,
      });
      try {
        await refreshUserAnalytics(this.userId);
        console.log('Analytics refreshed successfully for user:', this.userId);
      } catch (analyticsError) {
        // Log but don't fail the sync if analytics fails
        console.error('Failed to refresh analytics:', analyticsError);
      }

      onProgress?.({
        step: 'done',
        progress: 100,
        message: 'Sync completed!',
        reposProcessed: repos.length,
        totalRepos: repos.length,
        commitsProcessed: totalCommitsProcessed,
        totalCommits: totalCommitsProcessed,
        apiRequests: 0,
        rateLimitResets: 0,
        errors: 0,
      });

      return { success: true, repos: repos.length };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';

      await this.updateSyncJob({
        status: SyncStatus.FAILED,
        errorMessage,
        completedAt: new Date(),
      });

      throw error;
    }
  }

  private async updateSyncJob(updates: {
    totalRepos?: number;
    processedRepos?: number;
    status?: SyncStatus;
    errorMessage?: string;
    completedAt?: Date;
  }) {
    await prisma.syncJob.update({
      where: { id: this.syncJobId },
      data: updates,
    });
  }
}

export interface SyncProgress {
  step: 'repos' | 'commits' | 'done';
  progress: number; // 0-100
  message: string;
  reposProcessed?: number;
  totalRepos?: number;
  commitsProcessed?: number;
  totalCommits?: number;
  apiRequests?: number;
  rateLimitResets?: number;
  errors?: number;
}