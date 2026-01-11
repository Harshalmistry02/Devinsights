/**
 * Insights Data Builder
 * 
 * Builds comprehensive AnalyticsSummary for AI insights from raw analytics data.
 * Calculates derived metrics like consistency score, work patterns, etc.
 */

import { AnalyticsSummary, CommitSizeDistribution } from '@/lib/ai/types';
import { AnalyticsSnapshot } from '@prisma/client';
import { calculateLanguageDiversity, categorizeLanguages, getPrimaryExpertise } from './language-analyzer';
import { getStreakHealth, getDaysToMilestone } from './streak-calculator';

// Type for daily commits from JSON
type DailyCommits = Record<string, number>;
type DayOfWeekStats = Record<string, number>;
type HourlyStats = Record<string, number>;
type TopLanguageItem = { language: string; count: number; percentage?: number };

/**
 * Calculate consistency score based on daily commit patterns
 * Higher score = more consistent coding habits
 */
export function calculateConsistencyScore(dailyCommits: DailyCommits | null | undefined): number {
  if (!dailyCommits || Object.keys(dailyCommits).length === 0) {
    return 0;
  }

  const values = Object.values(dailyCommits);
  const total = values.reduce((sum, v) => sum + v, 0);
  const mean = total / values.length;
  
  if (mean === 0) return 0;

  // Calculate coefficient of variation (lower = more consistent)
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const cv = stdDev / mean;

  // Convert to 0-100 score (lower CV = higher consistency)
  // CV of 0 = perfect consistency (100), CV > 2 = very inconsistent (0)
  const score = Math.max(0, Math.min(100, 100 - (cv * 50)));
  
  return Math.round(score);
}

/**
 * Calculate weekday vs weekend commit ratio
 */
export function calculateWeekdayWeekendRatio(dayOfWeekStats: DayOfWeekStats | null | undefined): number {
  if (!dayOfWeekStats) return 1;

  const weekdayDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const weekendDays = ['Saturday', 'Sunday'];

  const weekdayCommits = weekdayDays.reduce((sum, day) => 
    sum + (dayOfWeekStats[day] || 0), 0);
  const weekendCommits = weekendDays.reduce((sum, day) => 
    sum + (dayOfWeekStats[day] || 0), 0);

  // Normalize by number of days (5 weekdays vs 2 weekend days)
  const weekdayAvg = weekdayCommits / 5;
  const weekendAvg = weekendCommits / 2;

  if (weekendAvg === 0) return weekdayAvg > 0 ? 10 : 1; // Very weekday focused or no data
  
  return Math.round((weekdayAvg / weekendAvg) * 10) / 10;
}

/**
 * Determine hourly coding pattern
 */
export function determineHourlyPattern(hourlyStats: HourlyStats | null | undefined): 
  'morning' | 'afternoon' | 'evening' | 'night' | 'mixed' {
  if (!hourlyStats) return 'mixed';

  // Define time periods
  const periods = {
    morning: ['6', '7', '8', '9', '10', '11'],      // 6 AM - 11 AM
    afternoon: ['12', '13', '14', '15', '16', '17'], // 12 PM - 5 PM
    evening: ['18', '19', '20', '21', '22', '23'],  // 6 PM - 11 PM
    night: ['0', '1', '2', '3', '4', '5'],          // 12 AM - 5 AM
  };

  const periodSums = {
    morning: periods.morning.reduce((sum, h) => sum + (hourlyStats[h] || 0), 0),
    afternoon: periods.afternoon.reduce((sum, h) => sum + (hourlyStats[h] || 0), 0),
    evening: periods.evening.reduce((sum, h) => sum + (hourlyStats[h] || 0), 0),
    night: periods.night.reduce((sum, h) => sum + (hourlyStats[h] || 0), 0),
  };

  const total = Object.values(periodSums).reduce((sum, v) => sum + v, 0);
  if (total === 0) return 'mixed';

  // Find dominant period (needs to be at least 40% of activity)
  const dominantPeriod = Object.entries(periodSums)
    .sort((a, b) => b[1] - a[1])[0];
  
  if (dominantPeriod[1] / total >= 0.4) {
    return dominantPeriod[0] as 'morning' | 'afternoon' | 'evening' | 'night';
  }

  return 'mixed';
}

/**
 * Calculate commit size distribution from commit data
 * This is an approximation based on averages since we don't have individual commit data here
 */
export function calculateCommitSizeDistribution(
  totalAdditions: number,
  totalDeletions: number,
  totalCommits: number
): CommitSizeDistribution {
  if (totalCommits === 0) {
    return { small: 0, medium: 0, large: 0 };
  }

  const avgSize = (totalAdditions + totalDeletions) / totalCommits;
  
  // Estimate distribution based on average size
  // This is a heuristic - real implementation would need individual commit data
  if (avgSize < 50) {
    return { small: Math.round(totalCommits * 0.7), medium: Math.round(totalCommits * 0.25), large: Math.round(totalCommits * 0.05) };
  } else if (avgSize < 150) {
    return { small: Math.round(totalCommits * 0.3), medium: Math.round(totalCommits * 0.5), large: Math.round(totalCommits * 0.2) };
  } else {
    return { small: Math.round(totalCommits * 0.2), medium: Math.round(totalCommits * 0.3), large: Math.round(totalCommits * 0.5) };
  }
}

/**
 * Build comprehensive AnalyticsSummary from AnalyticsSnapshot
 * @param snapshot - The analytics snapshot from the database
 * @param previousPeriodCommits - Optional commit count from previous period for comparison
 * @param recentMessages - Optional array of recent non-merge commit messages for AI analysis
 * @param dataQuality - Optional data quality metrics for UI indicators
 */
export function buildAnalyticsSummary(
  snapshot: AnalyticsSnapshot,
  previousPeriodCommits?: number,
  recentMessages?: string[],
  dataQuality?: {
    outlierCount: number;
    unknownExtensionPercent: number;
    hasSufficientData: boolean;
  }
): AnalyticsSummary {
  // Parse JSON fields safely
  const topLanguages = (snapshot.topLanguages as TopLanguageItem[] | null) || [];
  const languageStats = (snapshot.languageStats as Record<string, number> | null) || {};
  const dailyCommits = snapshot.dailyCommits as DailyCommits | null;
  const dayOfWeekStats = snapshot.dayOfWeekStats as DayOfWeekStats | null;
  const hourlyStats = snapshot.hourlyStats as HourlyStats | null;

  // Convert topLanguages array to Record format
  const topLanguagesRecord = topLanguages.reduce((acc, item) => {
    acc[item.language] = item.count;
    return acc;
  }, {} as Record<string, number>);

  // Calculate average commit size
  const avgCommitSize = snapshot.totalCommits > 0
    ? Math.round((snapshot.totalAdditions + snapshot.totalDeletions) / snapshot.totalCommits)
    : 0;

  // Calculate derived metrics
  const consistencyScore = calculateConsistencyScore(dailyCommits);
  const languageDiversity = calculateLanguageDiversity(languageStats);
  const weekdayVsWeekendRatio = calculateWeekdayWeekendRatio(dayOfWeekStats);
  const hourlyPattern = determineHourlyPattern(hourlyStats);
  const commitSizeDistribution = calculateCommitSizeDistribution(
    snapshot.totalAdditions,
    snapshot.totalDeletions,
    snapshot.totalCommits
  );

  // Build streak health info
  const streakData = {
    currentStreak: snapshot.currentStreak,
    longestStreak: snapshot.longestStreak,
    lastCommitDate: snapshot.lastCommitDate,
    streakStartDate: null,
    isActiveToday: snapshot.isActiveToday,
  };
  const streakHealth = getStreakHealth(streakData);
  const daysToMilestone = getDaysToMilestone(snapshot.currentStreak);

  return {
    // Core metrics
    totalCommits: snapshot.totalCommits,
    currentStreak: snapshot.currentStreak,
    longestStreak: snapshot.longestStreak,
    topLanguages: topLanguagesRecord,
    avgCommitSize,
    mostActiveDay: snapshot.mostProductiveDay || 'N/A',
    period: 'last_30_days',

    // Enhanced metrics
    previousPeriodCommits,
    commitSizeDistribution,
    
    // Calculated scores
    consistencyScore,
    languageDiversity,

    // Work patterns
    weekdayVsWeekendRatio,
    hourlyPattern,
    isActiveToday: snapshot.isActiveToday,

    // Streak health
    streakHealth,
    daysToMilestone,

  // Repository insights
    totalRepos: snapshot.totalRepos,
    
    // Commit message content for AI "vibe/style" analysis
    recentMessages,
    
    // Commit quality metrics (if available)
    // Note: Uses type assertion since field may not be in Prisma types until regenerated
    commitQualityMetrics: parseCommitQualityMetrics((snapshot as Record<string, unknown>).commitQualityMetrics),
    
    // Data quality indicators
    dataQuality,
  };
}

/**
 * Parse commit quality metrics from JSON snapshot
 */
function parseCommitQualityMetrics(
  raw: unknown
): {
  qualityGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  conventionalCommitScore: number;
  hasTicketReferences: number;
  hasBodyText: number;
  insights: string[];
} | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  
  const data = raw as Record<string, unknown>;
  
  if (
    typeof data.qualityGrade === 'string' &&
    ['A', 'B', 'C', 'D', 'F'].includes(data.qualityGrade) &&
    typeof data.conventionalCommitScore === 'number'
  ) {
    return {
      qualityGrade: data.qualityGrade as 'A' | 'B' | 'C' | 'D' | 'F',
      conventionalCommitScore: data.conventionalCommitScore,
      hasTicketReferences: (data.hasTicketReferences as number) || 0,
      hasBodyText: (data.hasBodyText as number) || 0,
      insights: Array.isArray(data.insights) ? data.insights : [],
    };
  }
  
  return undefined;
}

