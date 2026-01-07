/**
 * Analytics Aggregator
 * 
 * Main service for calculating and caching user analytics from raw commit data.
 * Designed to be run after sync or on-demand with intelligent caching.
 */

import prisma from '@/lib/prisma';
import { calculateStreaks } from './streak-calculator';
import { aggregateLanguageStats, getTopLanguages, getLanguageColor } from './language-analyzer';
import type { Prisma } from '@prisma/client';
import {
  AnalyticsResult,
  DailyCommitStats,
  DayOfWeekStats,
  HourlyStats,
  RepoStat,
  LanguageStats,
  LanguageDetail,
} from './types';

const DAY_NAMES: (keyof DayOfWeekStats)[] = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

// Default cache TTL: 5 minutes
const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * AnalyticsAggregator Class
 * 
 * Calculates comprehensive analytics from user's GitHub data.
 */
export class AnalyticsAggregator {
  private userId: string;
  
  constructor(userId: string) {
    this.userId = userId;
  }
  
  /**
   * Calculate comprehensive analytics for the user
   */
  async calculate(): Promise<AnalyticsResult> {
    // Fetch all repositories for user with commit counts
    const repositories = await prisma.repository.findMany({
      where: { userId: this.userId },
      select: {
        id: true,
        name: true,
        fullName: true,
        language: true,
        stars: true,
        forks: true,
        _count: {
          select: { commits: true }
        }
      }
    });
    
    // Fetch all commits for user's repositories
    const commits = await prisma.commit.findMany({
      where: {
        repository: { userId: this.userId }
      },
      select: {
        id: true,
        sha: true,
        authorDate: true,
        additions: true,
        deletions: true,
        filesChanged: true,
        repositoryId: true,
        repository: {
          select: {
            id: true,
            name: true,
            fullName: true,
            language: true,
            stars: true,
            forks: true,
          }
        }
      },
      orderBy: { authorDate: 'asc' }
    });
    
    // ============================================
    // Calculate Summary Statistics
    // ============================================
    const totalRepos = repositories.length;
    const totalCommits = commits.length;
    const totalAdditions = commits.reduce((sum, c) => sum + c.additions, 0);
    const totalDeletions = commits.reduce((sum, c) => sum + c.deletions, 0);
    const totalStars = repositories.reduce((sum, r) => sum + r.stars, 0);
    const totalForks = repositories.reduce((sum, r) => sum + r.forks, 0);
    
    // ============================================
    // Calculate Streaks
    // ============================================
    const commitDates = commits.map(c => c.authorDate);
    const streakData = calculateStreaks(commitDates);
    
    // ============================================
    // Calculate Language Statistics
    // ============================================
    const repoLanguageData = repositories.map(r => ({
      language: r.language,
      commits: r._count.commits
    }));
    const languageStats = aggregateLanguageStats(repoLanguageData);
    const topLanguages = getTopLanguages(languageStats, 6);
    
    // ============================================
    // Calculate Time-based Statistics
    // ============================================
    const dailyCommits = this.calculateDailyCommits(commits);
    const dayOfWeekStats = this.calculateDayOfWeekStats(commits);
    const hourlyStats = this.calculateHourlyStats(commits);
    
    // ============================================
    // Calculate Computed Insights
    // ============================================
    const averageCommitsPerDay = this.calculateAverageCommitsPerDay(dailyCommits);
    const mostProductiveDay = this.getMostProductiveDay(dayOfWeekStats);
    const mostProductiveHour = this.getMostProductiveHour(hourlyStats);
    
    // ============================================
    // Build Repository Stats
    // ============================================
    const repoStats = this.buildRepoStats(repositories, commits);
    
    // ============================================
    // Determine Date Range
    // ============================================
    const dataRangeStart = commits.length > 0 ? commits[0].authorDate : null;
    const dataRangeEnd = commits.length > 0 ? commits[commits.length - 1].authorDate : null;
    
    return {
      // Summary
      totalRepos,
      totalCommits,
      totalAdditions,
      totalDeletions,
      totalStars,
      totalForks,
      
      // Streaks
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
      lastCommitDate: streakData.lastCommitDate,
      isActiveToday: streakData.isActiveToday,
      
      // Detailed Stats
      languageStats,
      dailyCommits,
      dayOfWeekStats,
      hourlyStats,
      repoStats,
      topLanguages,
      
      // Computed Insights
      averageCommitsPerDay,
      mostProductiveDay,
      mostProductiveHour,
      
      // Metadata
      calculatedAt: new Date(),
      dataRangeStart,
      dataRangeEnd,
    };
  }
  
  /**
   * Calculate and save snapshot to database
   */
  async calculateAndSave(): Promise<AnalyticsResult> {
    const result = await this.calculate();
    
    // Upsert analytics snapshot (one per user)
    await prisma.analyticsSnapshot.upsert({
      where: { userId: this.userId },
      update: {
        // Summary
        totalRepos: result.totalRepos,
        totalCommits: result.totalCommits,
        totalAdditions: result.totalAdditions,
        totalDeletions: result.totalDeletions,
        totalStars: result.totalStars,
        totalForks: result.totalForks,
        
        // Streaks
        currentStreak: result.currentStreak,
        longestStreak: result.longestStreak,
        lastCommitDate: result.lastCommitDate,
        isActiveToday: result.isActiveToday,
        
        // JSON Stats - cast for Prisma compatibility
        languageStats: result.languageStats as Prisma.InputJsonValue,
        dailyCommits: result.dailyCommits as Prisma.InputJsonValue,
        dayOfWeekStats: result.dayOfWeekStats as Prisma.InputJsonValue,
        hourlyStats: result.hourlyStats as Prisma.InputJsonValue,
        repoStats: result.repoStats as unknown as Prisma.InputJsonValue,
        topLanguages: result.topLanguages as unknown as Prisma.InputJsonValue,
        
        // Computed Insights
        averageCommitsPerDay: result.averageCommitsPerDay,
        mostProductiveDay: result.mostProductiveDay,
        mostProductiveHour: result.mostProductiveHour,
        
        // Metadata
        calculatedAt: result.calculatedAt,
        dataRangeStart: result.dataRangeStart,
        dataRangeEnd: result.dataRangeEnd,
      },
      create: {
        userId: this.userId,
        
        // Summary
        totalRepos: result.totalRepos,
        totalCommits: result.totalCommits,
        totalAdditions: result.totalAdditions,
        totalDeletions: result.totalDeletions,
        totalStars: result.totalStars,
        totalForks: result.totalForks,
        
        // Streaks
        currentStreak: result.currentStreak,
        longestStreak: result.longestStreak,
        lastCommitDate: result.lastCommitDate,
        isActiveToday: result.isActiveToday,
        
        // JSON Stats - cast for Prisma compatibility
        languageStats: result.languageStats as Prisma.InputJsonValue,
        dailyCommits: result.dailyCommits as Prisma.InputJsonValue,
        dayOfWeekStats: result.dayOfWeekStats as Prisma.InputJsonValue,
        hourlyStats: result.hourlyStats as Prisma.InputJsonValue,
        repoStats: result.repoStats as unknown as Prisma.InputJsonValue,
        topLanguages: result.topLanguages as unknown as Prisma.InputJsonValue,
        
        // Computed Insights
        averageCommitsPerDay: result.averageCommitsPerDay,
        mostProductiveDay: result.mostProductiveDay,
        mostProductiveHour: result.mostProductiveHour,
        
        // Metadata
        calculatedAt: result.calculatedAt,
        dataRangeStart: result.dataRangeStart,
        dataRangeEnd: result.dataRangeEnd,
      }
    });
    
    return result;
  }
  
  /**
   * Get cached analytics or calculate fresh if stale
   */
  async getOrCalculate(maxAgeMs: number = DEFAULT_CACHE_TTL_MS): Promise<AnalyticsResult> {
    // Check for recent cached snapshot
    const cached = await prisma.analyticsSnapshot.findUnique({
      where: { userId: this.userId }
    });
    
    if (cached) {
      const age = Date.now() - cached.calculatedAt.getTime();
      if (age < maxAgeMs) {
        // Return cached data (convert from DB format)
        return this.snapshotToResult(cached);
      }
    }
    
    // Calculate fresh and save
    return this.calculateAndSave();
  }
  
  /**
   * Convert database snapshot to AnalyticsResult
   */
  private snapshotToResult(snapshot: any): AnalyticsResult {
    return {
      totalRepos: snapshot.totalRepos,
      totalCommits: snapshot.totalCommits,
      totalAdditions: snapshot.totalAdditions,
      totalDeletions: snapshot.totalDeletions,
      totalStars: snapshot.totalStars,
      totalForks: snapshot.totalForks,
      currentStreak: snapshot.currentStreak,
      longestStreak: snapshot.longestStreak,
      lastCommitDate: snapshot.lastCommitDate,
      isActiveToday: snapshot.isActiveToday,
      languageStats: (snapshot.languageStats as LanguageStats) || {},
      dailyCommits: (snapshot.dailyCommits as DailyCommitStats) || {},
      dayOfWeekStats: (snapshot.dayOfWeekStats as DayOfWeekStats) || this.emptyDayOfWeekStats(),
      hourlyStats: (snapshot.hourlyStats as HourlyStats) || {},
      repoStats: (snapshot.repoStats as RepoStat[]) || [],
      topLanguages: (snapshot.topLanguages as LanguageDetail[]) || [],
      averageCommitsPerDay: snapshot.averageCommitsPerDay || 0,
      mostProductiveDay: snapshot.mostProductiveDay || 'N/A',
      mostProductiveHour: snapshot.mostProductiveHour ?? 0,
      calculatedAt: snapshot.calculatedAt,
      dataRangeStart: snapshot.dataRangeStart,
      dataRangeEnd: snapshot.dataRangeEnd,
    };
  }
  
  /**
   * Calculate daily commit counts for the last 90 days
   */
  private calculateDailyCommits(commits: Array<{ authorDate: Date }>): DailyCommitStats {
    const stats: DailyCommitStats = {};
    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    
    // Initialize all days with 0
    for (let d = new Date(ninetyDaysAgo); d <= now; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      stats[dateKey] = 0;
    }
    
    // Count commits per day
    for (const commit of commits) {
      if (commit.authorDate >= ninetyDaysAgo) {
        const dateKey = commit.authorDate.toISOString().split('T')[0];
        if (dateKey in stats) {
          stats[dateKey]++;
        }
      }
    }
    
    return stats;
  }
  
  /**
   * Calculate commit distribution by day of week
   */
  private calculateDayOfWeekStats(commits: Array<{ authorDate: Date }>): DayOfWeekStats {
    const stats = this.emptyDayOfWeekStats();
    
    for (const commit of commits) {
      const dayIndex = commit.authorDate.getDay();
      const dayName = DAY_NAMES[dayIndex];
      stats[dayName]++;
    }
    
    return stats;
  }
  
  /**
   * Calculate commit distribution by hour of day
   */
  private calculateHourlyStats(commits: Array<{ authorDate: Date }>): HourlyStats {
    const stats: HourlyStats = {};
    
    // Initialize all hours with 0
    for (let h = 0; h < 24; h++) {
      stats[h.toString()] = 0;
    }
    
    for (const commit of commits) {
      const hour = commit.authorDate.getHours().toString();
      stats[hour]++;
    }
    
    return stats;
  }
  
  /**
   * Build repository stats with commit details
   */
  private buildRepoStats(
    repositories: Array<{
      id: string;
      name: string;
      fullName: string;
      language: string | null;
      stars: number;
      forks: number;
      _count: { commits: number };
    }>,
    commits: Array<{
      repositoryId: string;
      authorDate: Date;
      additions: number;
      deletions: number;
    }>
  ): RepoStat[] {
    return repositories
      .map(repo => {
        const repoCommits = commits.filter(c => c.repositoryId === repo.id);
        const lastCommit = repoCommits.length > 0
          ? repoCommits[repoCommits.length - 1].authorDate
          : null;
        const additions = repoCommits.reduce((sum, c) => sum + c.additions, 0);
        const deletions = repoCommits.reduce((sum, c) => sum + c.deletions, 0);
        
        return {
          id: repo.id,
          name: repo.name,
          fullName: repo.fullName,
          commits: repo._count.commits,
          stars: repo.stars,
          forks: repo.forks,
          language: repo.language,
          lastCommitDate: lastCommit,
          additions,
          deletions,
        };
      })
      .sort((a, b) => b.commits - a.commits); // Sort by most commits
  }
  
  /**
   * Calculate average commits per day (last 90 days)
   */
  private calculateAverageCommitsPerDay(dailyCommits: DailyCommitStats): number {
    const values = Object.values(dailyCommits);
    if (values.length === 0) return 0;
    
    const total = values.reduce((sum, count) => sum + count, 0);
    const activeDays = values.filter(count => count > 0).length;
    
    // Average over active days (more meaningful than all days)
    return activeDays > 0 ? Math.round((total / activeDays) * 10) / 10 : 0;
  }
  
  /**
   * Get the most productive day of the week
   */
  private getMostProductiveDay(dayOfWeekStats: DayOfWeekStats): string {
    let maxDay = 'Monday';
    let maxCount = 0;
    
    for (const [day, count] of Object.entries(dayOfWeekStats)) {
      if (count > maxCount) {
        maxCount = count;
        maxDay = day;
      }
    }
    
    return maxDay;
  }
  
  /**
   * Get the most productive hour of the day
   */
  private getMostProductiveHour(hourlyStats: HourlyStats): number {
    let maxHour = 0;
    let maxCount = 0;
    
    for (const [hour, count] of Object.entries(hourlyStats)) {
      if (count > maxCount) {
        maxCount = count;
        maxHour = parseInt(hour, 10);
      }
    }
    
    return maxHour;
  }
  
  /**
   * Create empty day of week stats object
   */
  private emptyDayOfWeekStats(): DayOfWeekStats {
    return {
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
      Sunday: 0,
    };
  }
}

// ============================================
// Convenience Functions
// ============================================

/**
 * Get analytics for a user (uses cache if available)
 */
export async function getUserAnalytics(userId: string): Promise<AnalyticsResult> {
  const aggregator = new AnalyticsAggregator(userId);
  return aggregator.getOrCalculate();
}

/**
 * Force recalculate analytics (after sync)
 */
export async function refreshUserAnalytics(userId: string): Promise<AnalyticsResult> {
  const aggregator = new AnalyticsAggregator(userId);
  return aggregator.calculateAndSave();
}

/**
 * Check if user has analytics data
 */
export async function hasAnalyticsData(userId: string): Promise<boolean> {
  const snapshot = await prisma.analyticsSnapshot.findUnique({
    where: { userId },
    select: { totalCommits: true }
  });
  
  return snapshot !== null && snapshot.totalCommits > 0;
}

/**
 * Get quick stats for dashboard (lightweight)
 */
export async function getQuickStats(userId: string): Promise<{
  totalRepos: number;
  totalCommits: number;
  currentStreak: number;
  totalStars: number;
} | null> {
  const snapshot = await prisma.analyticsSnapshot.findUnique({
    where: { userId },
    select: {
      totalRepos: true,
      totalCommits: true,
      currentStreak: true,
      totalStars: true,
    }
  });
  
  return snapshot;
}
