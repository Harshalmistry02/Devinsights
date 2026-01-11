import { Octokit } from '@octokit/rest';

export class GitHubClient {
  private octokit: Octokit;
  private rateLimit = {
    remaining: 5000,
    reset: Date.now(),
  };

  constructor(accessToken: string) {
    this.octokit = new Octokit({ auth: accessToken });
  }

  /**
   * Check rate limit before making requests
   */
  async checkRateLimit(): Promise<boolean> {
    try {
      const { data } = await this.octokit.rateLimit.get();
      this.rateLimit = {
        remaining: data.rate.remaining,
        reset: data.rate.reset * 1000, // Convert to milliseconds
      };

      if (this.rateLimit.remaining < 100) {
        console.warn(`Low rate limit: ${this.rateLimit.remaining} remaining`);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return false;
    }
  }

  /**
   * Fetch all repositories for authenticated user
   */
  async fetchRepositories(options = { includePrivate: true, includeForks: false }) {
    await this.checkRateLimit();

    const repos = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const { data } = await this.octokit.repos.listForAuthenticatedUser({
        visibility: options.includePrivate ? 'all' : 'public',
        affiliation: 'owner',
        sort: 'updated',
        per_page: perPage,
        page,
      });

      if (data.length === 0) break;

      // Filter based on options
      const filtered = data.filter(repo => {
        if (repo.archived) return false; // Skip archived
        if (!options.includeForks && repo.fork) return false;
        return true;
      });

      repos.push(...filtered);
      
      if (data.length < perPage) break; // Last page
      page++;
    }

    return repos.map(repo => ({
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
    }));
  }

  /**
   * Fetch commits for a specific repository
   */
  async fetchCommits(owner: string, repo: string, options = { since: null, maxCommits: 100 }) {
    await this.checkRateLimit();

    const commits = [];
    let page = 1;
    const perPage = 100;

    // Calculate 'since' date (last 3 months by default)
    const sinceDate = options.since || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    while (commits.length < options.maxCommits) {
      try {
        const { data } = await this.octokit.repos.listCommits({
          owner,
          repo,
          since: sinceDate.toISOString(),
          per_page: perPage,
          page,
        });

        if (data.length === 0) break;

        // Fetch detailed commit info (to get file changes)
        const detailedCommits = await Promise.all(
          data.map(async (commit) => {
            try {
              const { data: detail } = await this.octokit.repos.getCommit({
                owner,
                repo,
                ref: commit.sha,
              });

              // Extract file information for language detection and outlier analysis
              const files = detail.files?.map(file => ({
                filename: file.filename,
                additions: file.additions || 0,
                deletions: file.deletions || 0,
                status: file.status,
              })) || [];

              return {
                sha: commit.sha,
                message: commit.commit.message,
                authorName: commit.commit.author?.name,
                authorEmail: commit.commit.author?.email,
                authorDate: new Date(commit.commit.author?.date || Date.now()),
                additions: detail.stats?.additions || 0,
                deletions: detail.stats?.deletions || 0,
                filesChanged: detail.files?.length || 0,
                files, // Include file info for language detection
              };
            } catch (error) {
              console.error(`Failed to fetch commit ${commit.sha}:`, error);
              return null;
            }
          })
        );

        commits.push(...detailedCommits.filter(Boolean));

        if (data.length < perPage) break;
        page++;
      } catch (error) {
        console.error(`Error fetching commits for ${owner}/${repo}:`, error);
        break;
      }
    }

    return commits;
  }

  /**
   * Get time until rate limit resets
   */
  getResetTime(): number {
    return Math.max(0, this.rateLimit.reset - Date.now());
  }
}