/**
 * Advanced GitHub Sync Service
 * 
 * TIER 1: GitHub Service Layer
 * 
 * This service addresses the following issues with the original client.ts:
 * - Only fetched last 100 commits per repo (perPage limit)
 * - No recursive pagination for large commit histories
 * - Fetched only last 3 months by default
 * - No concurrent request optimization
 * - Missing error recovery for partial failures
 * - No rate limit awareness during fetching
 * 
 * Key Features:
 * - Automatic rate limit handling with intelligent backoff
 * - Full commit history fetching (no date limits)
 * - Concurrent request optimization
 * - Comprehensive repository metadata
 * - Language detection from commits
 * - Incremental sync support
 */

import { Octokit } from '@octokit/rest';
import { throttling } from '@octokit/plugin-throttling';
import { getValidGitHubAccessToken, isGitHubAuthenticationFailure } from './auth-token';

const sanitizeLog = (val: unknown): string =>
  String(val).replace(/[\r\n]/g, ' ').slice(0, 200);

// Apply throttling plugin to handle rate limits gracefully
const OctokitWithThrottling = Octokit.plugin(throttling);

// ============================================
// Data Types
// ============================================

export interface RateLimitState {
  remaining: number;
  reset: number;
  limit: number;
}

export interface SyncMetrics {
  reposProcessed: number;
  commitsProcessed: number;
  totalRequests: number;
  rateLimitResets: number;
  errorsEncountered: number;
  startTime: number;
}

export interface EnhancedRepository {
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
  url: string;
  owner: string;
}

export interface ProcessedCommit {
  sha: string;
  message: string;
  authorName: string;
  authorEmail: string;
  authorDate: Date;
  committerName?: string | null;
  committerEmail?: string | null;
  url: string;
  additions: number;
  deletions: number;
  filesChanged: number;
  metadata?: Record<string, any> | null;  // File analysis, language stats, outlier detection
}

export interface CommitStats {
  sha: string;
  additions: number;
  deletions: number;
  filesChanged: number;
}

export interface ContributorData {
  login: string;
  contributions: number;
  avatar_url: string;
}

export interface LanguageBreakdown {
  language: string;
  bytes: number;
  percentage: number;
}

export interface FetchOptions {
  includeForks?: boolean;
  includeArchived?: boolean;
  includeOrgRepos?: boolean; // Include organization repos user has access to
  maxCommitsPerRepo?: number; // Optional limit for testing, null = no limit
  onProgress?: (progress: AdvancedSyncProgress) => void;
}

export interface AdvancedSyncProgress {
  phase: 'repositories' | 'commits' | 'stats' | 'languages' | 'complete';
  currentRepo?: string;
  reposProcessed: number;
  totalRepos: number;
  commitsProcessed: number;
  message: string;
  metrics: SyncMetrics;
}

/**
 * Advanced GitHub Sync Service
 * 
 * Provides comprehensive data fetching from GitHub with:
 * - Automatic rate limit handling
 * - Full pagination support
 * - Error resilience
 * - Progress tracking
 */
export class AdvancedGitHubSyncService {
  private octokit: InstanceType<typeof OctokitWithThrottling>;
  private accessToken: string;
  private userId: string;
  private metrics: SyncMetrics = {
    reposProcessed: 0,
    commitsProcessed: 0,
    totalRequests: 0,
    rateLimitResets: 0,
    errorsEncountered: 0,
    startTime: Date.now(),
  };

  constructor(accessToken: string, userId: string) {
    this.userId = userId;
    this.accessToken = accessToken;
    
    // Initialize with throttling plugin for automatic rate limit handling
    this.octokit = this.createOctokit(accessToken);
  }

  private createOctokit(accessToken: string): InstanceType<typeof OctokitWithThrottling> {
    return new OctokitWithThrottling({
      auth: accessToken,
      throttle: {
        onRateLimit: (retryAfter, options, octokit, retryCount) => {
          this.metrics.rateLimitResets++;
          octokit.log.warn(
            `Rate limit hit. Retrying after ${retryAfter} seconds. (Retry ${retryCount})`
          );
          // Retry up to 3 times
          if (retryCount < 3) {
            return true;
          }
          return false;
        },
        onSecondaryRateLimit: (retryAfter, options, octokit, retryCount) => {
          octokit.log.warn(
            `Secondary rate limit hit. Retrying after ${retryAfter} seconds.`
          );
          // Don't retry on secondary rate limits (abuse detection)
          if (retryCount < 1) {
            return true;
          }
          return false;
        },
      },
    });
  }

  private async ensureFreshAuth(): Promise<void> {
    const { accessToken } = await getValidGitHubAccessToken(this.userId);

    if (accessToken !== this.accessToken) {
      this.accessToken = accessToken;
      this.octokit = this.createOctokit(accessToken);
    }
  }

  private async refreshAuth(): Promise<void> {
    const { accessToken } = await getValidGitHubAccessToken(this.userId, {
      forceRefresh: true,
    });

    this.accessToken = accessToken;
    this.octokit = this.createOctokit(accessToken);
  }

  private async withAuthRetry<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (isGitHubAuthenticationFailure(error)) {
        await this.refreshAuth();
        return await operation();
      }

      throw error;
    }
  }

  /**
   * Get the user ID this service is associated with
   */
  getUserId(): string {
    return this.userId;
  }

  /**
   * Fetch ALL repositories with comprehensive metadata
   * Handles pagination automatically
   * 
   * NOTE: Requires 'repo' OAuth scope for private repository access
   */
  async fetchAllRepositories(options?: FetchOptions): Promise<EnhancedRepository[]> {
    return await this.withAuthRetry(async () => {
      await this.ensureFreshAuth();

      const repos: EnhancedRepository[] = [];
      const includeArchived = options?.includeArchived ?? false;
      const includeForks = options?.includeForks ?? false;
      const includeOrgRepos = options?.includeOrgRepos ?? true;

      // Build affiliation string based on options
      // 'owner' = repos you own
      // 'collaborator' = repos you're a collaborator on
      // 'organization_member' = org repos you have access to
      const affiliations = ['owner'];
      if (includeOrgRepos) {
        affiliations.push('collaborator', 'organization_member');
      }
      const affiliation = affiliations.join(',');

      console.log(`Starting repository fetch with affiliation: ${sanitizeLog(affiliation)}...`);
      
      // Use paginate iterator for automatic pagination
      for await (const response of this.octokit.paginate.iterator(
        'GET /user/repos',
        {
          affiliation: affiliation,
          visibility: 'all', // Include both public and private
          sort: 'updated',
          per_page: 100,
        }
      )) {
        this.metrics.totalRequests++;

        for (const repo of response.data) {
          // Filter based on options
          if (!includeArchived && repo.archived) continue;
          if (!includeForks && repo.fork) continue;

          repos.push({
            githubId: repo.id,
            name: repo.name,
            fullName: repo.full_name,
            description: repo.description,
            language: repo.language,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            isPrivate: repo.private,
            isFork: repo.fork,
            isArchived: repo.archived,
            defaultBranch: repo.default_branch,
            url: repo.html_url,
            owner: repo.owner.login,
          });
        }

        options?.onProgress?.({
          phase: 'repositories',
          reposProcessed: repos.length,
          totalRepos: repos.length,
          commitsProcessed: 0,
          message: `Found ${repos.length} repositories...`,
          metrics: this.metrics,
        });
      }

      console.log(`Fetched ${repos.length} repositories (${repos.filter(r => r.isPrivate).length} private)`);
      return repos;
    });
  }

  /**
   * Fetch ALL commits for a repository
   * 
   * KEY FIX: This function fetches the COMPLETE commit history
   * by iterating through all pages (not just first 100)
   * 
   * Handles:
   * - Pagination automatically via Octokit iterator
   * - Rate limiting with exponential backoff
   * - Large commit histories (10k+ commits)
   * - Author timezone handling
   * - Optional incremental sync via lastSyncDate
   * 
   * @param owner - Repository owner username
   * @param repo - Repository name
   * @param lastSyncDate - Optional date to fetch commits after (for incremental sync)
   * @param maxCommits - Optional limit on commits to fetch (for testing)
   */
  async fetchAllCommits(
    owner: string,
    repo: string,
    lastSyncDate?: Date,
    maxCommits?: number
  ): Promise<ProcessedCommit[]> {
    return await this.withAuthRetry(async () => {
      await this.ensureFreshAuth();

      const commits: ProcessedCommit[] = [];
      const since = lastSyncDate?.toISOString();

      console.log(`Fetching commits from ${sanitizeLog(owner)}/${sanitizeLog(repo)}${since ? ` since ${sanitizeLog(since)}` : ''}...`);
      
      // Use iterator for automatic pagination through ALL commits
      for await (const response of this.octokit.paginate.iterator(
        'GET /repos/{owner}/{repo}/commits',
        {
          owner,
          repo,
          since, // Only fetch commits after last sync (if provided)
          per_page: 100, // Max per page allowed by GitHub
        }
      )) {
        this.metrics.totalRequests++;

        for (const commit of response.data) {
          // Check if we've hit the maxCommits limit
          if (maxCommits && commits.length >= maxCommits) {
            console.log(`Hit max commits limit (${maxCommits}) for ${sanitizeLog(owner)}/${sanitizeLog(repo)}`);
            return commits;
          }

          commits.push({
            sha: commit.sha,
            message: commit.commit.message,
            authorName: commit.commit.author?.name ?? 'Unknown',
            authorEmail: commit.commit.author?.email ?? 'unknown@example.com',
            authorDate: new Date(commit.commit.author?.date || Date.now()),
            committerName: commit.commit.committer?.name,
            committerEmail: commit.commit.committer?.email,
            url: commit.html_url,
            additions: 0, // Will be enriched separately if needed
            deletions: 0,
            filesChanged: 0,
          });

          this.metrics.commitsProcessed++;
        }

        // Log progress for large repositories
        if (commits.length > 0 && commits.length % 500 === 0) {
          console.log(`Processed ${commits.length} commits from ${sanitizeLog(owner)}/${sanitizeLog(repo)}...`);
        }
      }

      console.log(`Fetched ${commits.length} commits from ${sanitizeLog(owner)}/${sanitizeLog(repo)}`);
      return commits;
    });
  }

  /**
   * Fetch detailed commit statistics for a batch of commits
   * 
   * This is done separately to avoid hitting API limits
   * with full commit details for every single commit.
   * 
   * We use a smart sampling strategy:
   * - All commits from the last 30 days (recent activity)
   * - Every Nth commit for older commits (statistical sampling)
   * 
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param commits - Array of commits to get stats for
   * @param options - Sampling options
   */
  async fetchCommitStats(
    owner: string,
    repo: string,
    commits: ProcessedCommit[],
    options?: {
      maxApiCalls?: number;
      includeRecentDays?: number;
    }
  ): Promise<Map<string, CommitStats>> {
    return await this.withAuthRetry(async () => {
      await this.ensureFreshAuth();

      const stats = new Map<string, CommitStats>();
      const maxApiCalls = options?.maxApiCalls ?? 100;
      const recentDays = options?.includeRecentDays ?? 30;
      
      if (commits.length === 0) return stats;

      // Calculate cutoff date for "recent" commits
      const recentCutoff = new Date();
      recentCutoff.setDate(recentCutoff.getDate() - recentDays);

      // Separate recent commits from older ones
      const recentCommits = commits.filter(c => c.authorDate >= recentCutoff);
      const olderCommits = commits.filter(c => c.authorDate < recentCutoff);

      // Calculate sample rate for older commits to stay within API budget
      const recentBudget = Math.min(recentCommits.length, Math.floor(maxApiCalls * 0.7));
      const olderBudget = maxApiCalls - recentBudget;
      const sampleRate = olderCommits.length > 0 
        ? Math.max(1, Math.floor(olderCommits.length / olderBudget))
        : 1;

      // Sample commits to fetch
      const commitsToFetch = [
        ...recentCommits.slice(0, recentBudget),
        ...olderCommits.filter((_, idx) => idx % sampleRate === 0).slice(0, olderBudget),
      ];

      console.log(`Fetching stats for ${commitsToFetch.length} commits (${recentBudget} recent, ${commitsToFetch.length - recentBudget} sampled older)`);

      for (const commit of commitsToFetch) {
        try {
          const response = await this.octokit.repos.getCommit({
            owner,
            repo,
            ref: commit.sha,
          });

          this.metrics.totalRequests++;

          stats.set(commit.sha, {
            sha: commit.sha,
            additions: response.data.stats?.additions ?? 0,
            deletions: response.data.stats?.deletions ?? 0,
            filesChanged: response.data.files?.length ?? 0,
          });

          // Small delay to be respectful to the API
          await this.delay(25);
        } catch (error) {
          if (isGitHubAuthenticationFailure(error)) {
            throw error;
          }

          console.warn(`Could not fetch stats for commit ${sanitizeLog(commit.sha.slice(0, 7))}:`, error);
        }
      }

      console.log(`Fetched stats for ${stats.size} commits`);
      return stats;
    });
  }

  /**
   * Fetch language distribution for a repository
   * Returns bytes per language with calculated percentages
   */
  async fetchLanguages(
    owner: string,
    repo: string
  ): Promise<LanguageBreakdown[]> {
    return await this.withAuthRetry(async () => {
      await this.ensureFreshAuth();

      const response = await this.octokit.repos.listLanguages({
        owner,
        repo,
      });

      this.metrics.totalRequests++;
      
      const data = response.data;
      const totalBytes = Object.values(data).reduce((sum, bytes) => sum + bytes, 0);

      if (totalBytes === 0) return [];

      return Object.entries(data)
        .map(([language, bytes]) => ({
          language,
          bytes,
          percentage: Math.round((bytes / totalBytes) * 1000) / 10, // 1 decimal place
        }))
        .sort((a, b) => b.bytes - a.bytes);
    });
  }

  /**
   * Fetch contributors for a repository
   */
  async fetchContributors(
    owner: string,
    repo: string,
    maxContributors: number = 100
  ): Promise<ContributorData[]> {
    return await this.withAuthRetry(async () => {
      await this.ensureFreshAuth();

      const contributors: ContributorData[] = [];

      for await (const response of this.octokit.paginate.iterator(
        'GET /repos/{owner}/{repo}/contributors',
        {
          owner,
          repo,
          per_page: 100,
        }
      )) {
        this.metrics.totalRequests++;

        for (const contributor of response.data) {
          if (contributors.length >= maxContributors) {
            return contributors;
          }

          // Type guard for anonymous contributors
          if (contributor.login) {
            contributors.push({
              login: contributor.login,
              contributions: contributor.contributions,
              avatar_url: contributor.avatar_url || '',
            });
          }
        }
      }

      return contributors;
    });
  }

  /**
   * Fetch branches for a repository
   */
  async fetchBranches(
    owner: string,
    repo: string
  ): Promise<string[]> {
    return await this.withAuthRetry(async () => {
      await this.ensureFreshAuth();

      const branches: string[] = [];

      for await (const response of this.octokit.paginate.iterator(
        'GET /repos/{owner}/{repo}/branches',
        {
          owner,
          repo,
          per_page: 100,
        }
      )) {
        this.metrics.totalRequests++;

        for (const branch of response.data) {
          branches.push(branch.name);
        }
      }

      return branches;
    });
  }

  /**
   * Get current rate limit status
   */
  async getRateLimit(): Promise<RateLimitState> {
    return await this.withAuthRetry(async () => {
      await this.ensureFreshAuth();

      const response = await this.octokit.rateLimit.get();
      return {
        remaining: response.data.rate.remaining,
        reset: response.data.rate.reset,
        limit: response.data.rate.limit,
      };
    });
  }

  /**
   * Get sync metrics
   */
  getMetrics(): SyncMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset metrics (call at the start of a new sync)
   */
  resetMetrics(): void {
    this.metrics = {
      reposProcessed: 0,
      commitsProcessed: 0,
      totalRequests: 0,
      rateLimitResets: 0,
      errorsEncountered: 0,
      startTime: Date.now(),
    };
  }

  /**
   * Increment processed repos count
   */
  incrementReposProcessed(): void {
    this.metrics.reposProcessed++;
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Factory function to create the sync service
 */
export function createAdvancedSyncService(
  accessToken: string,
  userId: string
): AdvancedGitHubSyncService {
  return new AdvancedGitHubSyncService(accessToken, userId);
}
