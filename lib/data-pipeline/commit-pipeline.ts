/**
 * TIER 2: Data Pipeline
 * 
 * Handles validation, transformation, and batch storage of commit data.
 * 
 * Key Features:
 * - Commit data validation
 * - Data enrichment with statistics
 * - Efficient batch database operations
 * - Duplicate handling
 */

import prisma from '@/lib/prisma';
import type { ProcessedCommit, CommitStats } from '@/lib/github/advanced-sync-service';

// ============================================
// Types
// ============================================

export interface BatchInsertResult {
  inserted: number;
  skipped: number;
  errors: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface PipelineMetrics {
  validated: number;
  failed: number;
  enriched: number;
  inserted: number;
  skipped: number;
}

// ============================================
// Commit Data Pipeline
// ============================================

export class CommitDataPipeline {
  private metrics: PipelineMetrics = {
    validated: 0,
    failed: 0,
    enriched: 0,
    inserted: 0,
    skipped: 0,
  };

  /**
   * Validate commit data before storing
   * 
   * A valid commit must have:
   * - A valid 40-character hex SHA
   * - A non-empty message
   * - A valid date
   */
  validateCommit(commit: ProcessedCommit): ValidationResult {
    const errors: string[] = [];

    // Validate SHA (40 hex characters)
    if (!commit.sha) {
      errors.push('Missing SHA');
    } else if (!/^[a-f0-9]{40}$/i.test(commit.sha)) {
      errors.push(`Invalid SHA format: ${commit.sha.slice(0, 10)}...`);
    }

    // Validate message
    if (!commit.message || commit.message.trim().length === 0) {
      errors.push('Missing or empty commit message');
    }

    // Validate date
    if (!(commit.authorDate instanceof Date) || isNaN(commit.authorDate.getTime())) {
      errors.push('Invalid author date');
    }

    const isValid = errors.length === 0;
    
    if (isValid) {
      this.metrics.validated++;
    } else {
      this.metrics.failed++;
    }

    return { isValid, errors };
  }

  /**
   * Validate a batch of commits
   * Returns only valid commits and logs any validation failures
   */
  validateBatch(commits: ProcessedCommit[]): ProcessedCommit[] {
    const validCommits: ProcessedCommit[] = [];

    for (const commit of commits) {
      const result = this.validateCommit(commit);
      if (result.isValid) {
        validCommits.push(commit);
      } else {
        console.warn(
          `⚠️ Invalid commit ${commit.sha?.slice(0, 7) ?? 'unknown'}:`,
          result.errors.join(', ')
        );
      }
    }

    console.log(`✅ Validated ${validCommits.length}/${commits.length} commits`);
    return validCommits;
  }

  /**
   * Enrich commit with additional statistics
   */
  enrichCommit(
    commit: ProcessedCommit,
    stats: CommitStats | undefined
  ): ProcessedCommit {
    this.metrics.enriched++;
    
    return {
      ...commit,
      additions: stats?.additions ?? commit.additions ?? 0,
      deletions: stats?.deletions ?? commit.deletions ?? 0,
      filesChanged: stats?.filesChanged ?? commit.filesChanged ?? 0,
    };
  }

  /**
   * Enrich multiple commits with statistics
   */
  enrichBatch(
    commits: ProcessedCommit[],
    statsMap: Map<string, CommitStats>
  ): ProcessedCommit[] {
    return commits.map(commit => 
      this.enrichCommit(commit, statsMap.get(commit.sha))
    );
  }

  /**
   * Batch insert commits into database
   * 
   * Uses Prisma's createMany where possible for better performance,
   * with fallback to individual inserts for conflict handling.
   * 
   * @param repositoryId - The repository ID to associate commits with
   * @param commits - Array of validated, enriched commits
   * @returns Insert statistics
   */
  async batchInsertCommits(
    repositoryId: string,
    commits: ProcessedCommit[]
  ): Promise<BatchInsertResult> {
    if (commits.length === 0) {
      return { inserted: 0, skipped: 0, errors: 0 };
    }

    let inserted = 0;
    let skipped = 0;
    let errors = 0;

    // Process in batches of 500 to avoid query size limits
    const BATCH_SIZE = 500;
    
    for (let i = 0; i < commits.length; i += BATCH_SIZE) {
      const batch = commits.slice(i, i + BATCH_SIZE);
      
      // Try createMany first (faster, but skips on ANY conflict)
      try {
        const result = await prisma.commit.createMany({
          data: batch.map(commit => ({
            repositoryId,
            sha: commit.sha,
            message: commit.message,
            authorName: commit.authorName,
            authorEmail: commit.authorEmail,
            authorDate: commit.authorDate,
            additions: commit.additions,
            deletions: commit.deletions,
            filesChanged: commit.filesChanged,
          })),
          skipDuplicates: true, // Skip duplicates silently
        });

        inserted += result.count;
        skipped += batch.length - result.count;
        
        console.log(`  📝 Batch ${Math.floor(i / BATCH_SIZE) + 1}: Inserted ${result.count}, Skipped ${batch.length - result.count}`);
      } catch (error: unknown) {
        // Fallback to individual inserts if batch fails
        console.warn('Batch insert failed, falling back to individual inserts...');
        
        for (const commit of batch) {
          try {
            await prisma.commit.create({
              data: {
                repositoryId,
                sha: commit.sha,
                message: commit.message,
                authorName: commit.authorName,
                authorEmail: commit.authorEmail,
                authorDate: commit.authorDate,
                additions: commit.additions,
                deletions: commit.deletions,
                filesChanged: commit.filesChanged,
              },
            });
            inserted++;
          } catch (insertError: unknown) {
            // Check if it's a unique constraint violation (P2002 = duplicate)
            if (
              insertError &&
              typeof insertError === 'object' &&
              'code' in insertError &&
              insertError.code === 'P2002'
            ) {
              skipped++;
            } else {
              errors++;
              console.error(`Failed to insert commit ${commit.sha.slice(0, 7)}:`, insertError);
            }
          }
        }
      }
    }

    this.metrics.inserted += inserted;
    this.metrics.skipped += skipped;

    console.log(`✅ Batch insert complete: ${inserted} inserted, ${skipped} skipped, ${errors} errors`);
    return { inserted, skipped, errors };
  }

  /**
   * Update existing commits with new statistics
   * Used when we've sampled stats for a subset of commits
   */
  async updateCommitStats(
    repositoryId: string,
    statsMap: Map<string, CommitStats>
  ): Promise<number> {
    let updated = 0;

    for (const [sha, stats] of statsMap) {
      try {
        await prisma.commit.updateMany({
          where: {
            repositoryId,
            sha,
          },
          data: {
            additions: stats.additions,
            deletions: stats.deletions,
            filesChanged: stats.filesChanged,
          },
        });
        updated++;
      } catch (error) {
        console.warn(`Failed to update stats for ${sha.slice(0, 7)}:`, error);
      }
    }

    console.log(`✅ Updated stats for ${updated} commits`);
    return updated;
  }

  /**
   * Get pipeline metrics
   */
  getMetrics(): PipelineMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset pipeline metrics
   */
  resetMetrics(): void {
    this.metrics = {
      validated: 0,
      failed: 0,
      enriched: 0,
      inserted: 0,
      skipped: 0,
    };
  }
}

// ============================================
// Repository Data Pipeline
// ============================================

export class RepositoryDataPipeline {
  /**
   * Upsert repositories to database
   * 
   * @param userId - The user ID to associate repositories with
   * @param repositories - Array of repository data
   * @returns Map of githubId -> database repository id
   */
  static async upsertRepositories(
    userId: string,
    repositories: Array<{
      githubId: number;
      name: string;
      fullName: string;
      description: string | null;
      language: string | null;
      stars: number;
      forks: number;
      isPrivate: boolean;
      isFork: boolean;
      isArchived: boolean;
      defaultBranch: string;
    }>
  ): Promise<Map<number, string>> {
    const idMap = new Map<number, string>();

    for (const repo of repositories) {
      try {
        const upserted = await prisma.repository.upsert({
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
        });

        idMap.set(repo.githubId, upserted.id);
      } catch (error) {
        console.error(`Failed to upsert repository ${repo.fullName}:`, error);
      }
    }

    console.log(`✅ Upserted ${idMap.size}/${repositories.length} repositories`);
    return idMap;
  }

  /**
   * Get the last sync date for a repository
   * Used for incremental syncing
   */
  static async getLastCommitDate(repositoryId: string): Promise<Date | null> {
    try {
      const lastCommit = await prisma.commit.findFirst({
        where: { repositoryId },
        orderBy: { authorDate: 'desc' },
        select: { authorDate: true },
      });

      return lastCommit?.authorDate ?? null;
    } catch (error) {
      console.warn(`Could not get last commit date for repo ${repositoryId}:`, error);
      return null;
    }
  }

  /**
   * Get commit count for a repository
   */
  static async getCommitCount(repositoryId: string): Promise<number> {
    try {
      return await prisma.commit.count({
        where: { repositoryId },
      });
    } catch (error) {
      console.warn(`Could not get commit count for repo ${repositoryId}:`, error);
      return 0;
    }
  }
}

// ============================================
// Factory Functions
// ============================================

/**
 * Create a new commit data pipeline instance
 */
export function createCommitPipeline(): CommitDataPipeline {
  return new CommitDataPipeline();
}
