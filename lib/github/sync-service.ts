import prisma from '@/lib/prisma';
import { GitHubClient } from './client';
import { SyncStatus } from '@prisma/client';

export class GitHubSyncService {
  private client: GitHubClient;
  private userId: string;
  private syncJobId: string = '';

  constructor(accessToken: string, userId: string) {
    this.client = new GitHubClient(accessToken);
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

    try {
      // Step 1: Fetch repositories
      onProgress?.({ step: 'repos', progress: 0, message: 'Fetching repositories...' });
      const repos = await this.client.fetchRepositories();

      await this.updateSyncJob({ totalRepos: repos.length });
      onProgress?.({ step: 'repos', progress: 100, message: `Found ${repos.length} repositories` });

      // Step 2: Store repositories
      for (let i = 0; i < repos.length; i++) {
        const repo = repos[i];

        // Upsert repository
        const storedRepo = await prisma.repository.upsert({
          where: { githubId: repo.githubId },
          update: {
            ...repo,
            lastSyncedAt: new Date(),
          },
          create: {
            ...repo,
            userId: this.userId,
          },
        });

        // Step 3: Fetch commits for this repo
        onProgress?.({
          step: 'commits',
          progress: (i / repos.length) * 100,
          message: `Syncing ${repo.name}...`,
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
                },
              });
            } catch (error: any) {
              // Skip duplicates (unique constraint violation on [repositoryId, sha])
              if (error.code !== 'P2002') {
                throw error;
              }
            }
          }
        }

        await this.updateSyncJob({ processedRepos: i + 1 });
      }

      // Complete sync job
      await this.updateSyncJob({
        status: SyncStatus.COMPLETED,
        completedAt: new Date(),
      });

      onProgress?.({ step: 'done', progress: 100, message: 'Sync completed!' });

      return { success: true, repos: repos.length };
    } catch (error: any) {
      await this.updateSyncJob({
        status: SyncStatus.FAILED,
        errorMessage: error.message,
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
}