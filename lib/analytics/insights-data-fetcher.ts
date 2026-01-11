/**
 * Enhanced Insights Data Fetcher
 * 
 * Fetches recent commit messages and data quality metrics
 * to provide richer context for AI insights generation.
 */

import prisma from '@/lib/prisma';

// Commit metadata type for type safety
interface CommitMetadata {
  fileExtensions?: Record<string, number>;
  languages?: Record<string, number>;
  isOutlier?: boolean;
  outlierReason?: string;
  unknownExtensions?: string[];
}

/**
 * Fetch recent non-merge commit messages for AI analysis
 * Excludes outliers and merge commits for cleaner data
 * 
 * @param userId - The user ID to fetch commits for
 * @param limit - Maximum number of messages to fetch (default: 10)
 */
export async function fetchRecentCommitMessages(
  userId: string,
  limit: number = 10
): Promise<string[]> {
  const commits = await prisma.commit.findMany({
    where: {
      repository: {
        userId,
      },
      // Exclude basic merge commit patterns
      NOT: [
        { message: { startsWith: 'Merge pull request' } },
        { message: { startsWith: 'Merge branch' } },
        { message: { startsWith: 'Merge remote-tracking' } },
      ],
    },
    select: {
      message: true,
      metadata: true,
    },
    orderBy: {
      authorDate: 'desc',
    },
    take: limit * 2, // Fetch extra to filter out outliers
  });

  // Filter out outliers and get messages
  const nonOutlierMessages = commits
    .filter(commit => {
      if (!commit.metadata || typeof commit.metadata !== 'object') return true;
      const meta = commit.metadata as CommitMetadata;
      return !meta.isOutlier;
    })
    .map(commit => {
      // Truncate long commit messages to first line + limit
      const firstLine = commit.message.split('\n')[0];
      return firstLine.length > 100 ? firstLine.slice(0, 100) + '...' : firstLine;
    })
    .slice(0, limit);

  return nonOutlierMessages;
}

/**
 * Calculate data quality metrics from commit metadata
 * Used for UI data quality indicators
 * 
 * @param userId - The user ID to calculate metrics for
 */
export async function calculateDataQuality(userId: string): Promise<{
  outlierCount: number;
  unknownExtensionPercent: number;
  hasSufficientData: boolean;
}> {
  // Fetch all commits with metadata
  const commits = await prisma.commit.findMany({
    where: {
      repository: {
        userId,
      },
    },
    select: {
      metadata: true,
    },
  });

  if (commits.length === 0) {
    return {
      outlierCount: 0,
      unknownExtensionPercent: 0,
      hasSufficientData: false,
    };
  }

  // Count outliers
  let outlierCount = 0;
  let totalFiles = 0;
  let unknownFiles = 0;

  for (const commit of commits) {
    if (!commit.metadata || typeof commit.metadata !== 'object') continue;
    
    const meta = commit.metadata as CommitMetadata;
    
    if (meta.isOutlier) {
      outlierCount++;
    }

    // Sum up file extensions for unknown percentage calculation
    if (meta.fileExtensions) {
      const fileCount = Object.values(meta.fileExtensions).reduce((sum, count) => sum + count, 0);
      totalFiles += fileCount;
    }

    if (meta.unknownExtensions) {
      unknownFiles += meta.unknownExtensions.length;
    }
  }

  const unknownExtensionPercent = totalFiles > 0 
    ? Math.round((unknownFiles / totalFiles) * 100) 
    : 0;

  // Consider data sufficient if at least 5 non-outlier commits exist
  const nonOutlierCount = commits.length - outlierCount;
  const hasSufficientData = nonOutlierCount >= 5;

  return {
    outlierCount,
    unknownExtensionPercent,
    hasSufficientData,
  };
}

/**
 * Aggregates file-level language statistics from commit metadata
 * This provides more granular language breakdown than repo-level stats
 * 
 * @param userId - The user ID to aggregate stats for
 */
export async function aggregateFileLanguageStats(userId: string): Promise<Record<string, number>> {
  const commits = await prisma.commit.findMany({
    where: {
      repository: {
        userId,
      },
    },
    select: {
      metadata: true,
    },
  });

  const languageStats: Record<string, number> = {};

  for (const commit of commits) {
    if (!commit.metadata || typeof commit.metadata !== 'object') continue;
    
    const meta = commit.metadata as CommitMetadata;
    
    // Skip outliers for language stats
    if (meta.isOutlier) continue;
    
    if (meta.languages) {
      for (const [language, count] of Object.entries(meta.languages)) {
        languageStats[language] = (languageStats[language] || 0) + count;
      }
    }
  }

  return languageStats;
}
