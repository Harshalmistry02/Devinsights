// lib/ai/types.ts

import { z } from 'zod';

// Commit size categories
export interface CommitSizeDistribution {
  small: number;   // < 50 lines changed
  medium: number;  // 50-200 lines changed
  large: number;   // > 200 lines changed
}

// Previous period stats for comparison
export interface ComparisonStats {
  commits: number;
  streak: number;
  languages: Record<string, number>;
}

// Input: What we send to the AI
export interface AnalyticsSummary {
  // Core metrics
  totalCommits: number;
  currentStreak: number;
  longestStreak: number;
  topLanguages: Record<string, number>; // { "TypeScript": 150 }
  avgCommitSize: number;
  mostActiveDay: string;
  period: string; // "last_30_days"
  
  // Enhanced metrics for better insights
  previousPeriodCommits?: number; // For comparison
  previousPeriodStats?: ComparisonStats; // Full comparison data
  commitSizeDistribution?: CommitSizeDistribution;
  
  // Calculated scores (0-100)
  consistencyScore?: number; // Based on daily commit regularity
  languageDiversity?: number; // Shannon entropy normalized
  
  // Work patterns
  weekdayVsWeekendRatio?: number; // >1 means more weekday activity
  hourlyPattern?: 'morning' | 'afternoon' | 'evening' | 'night' | 'mixed';
  isActiveToday?: boolean;
  
  // Streak health
  streakHealth?: 'excellent' | 'good' | 'warning' | 'danger' | 'inactive';
  daysToMilestone?: { milestone: number; daysRemaining: number } | null;
  
  // Repository insights
  activeRepos?: number;
  totalRepos?: number;
  
  // Commit message content for AI "vibe/style" analysis
  recentMessages?: string[];
  
  // Commit quality analysis
  commitQualityMetrics?: {
    qualityGrade: 'A' | 'B' | 'C' | 'D' | 'F';
    conventionalCommitScore: number;
    hasTicketReferences: number;
    hasBodyText: number;
    insights: string[];
  };
  
  // Data quality indicators
  dataQuality?: {
    outlierCount: number;       // Number of flagged outlier commits
    unknownExtensionPercent: number; // % of files with unknown extensions
    hasSufficientData: boolean; // Has enough data for meaningful insights
  };
}

// Output: What AI returns (validated with Zod)
export const InsightSchema = z.object({
  patterns: z.array(z.string().max(200)).min(1).max(5),
  strengths: z.array(z.string().max(200)).min(1).max(5),
  suggestions: z.array(z.string().max(200)).min(1).max(5),
});

export type InsightResponse = z.infer<typeof InsightSchema>;

// Error types for better handling
export class AIServiceError extends Error {
  constructor(
    message: string,
    public code: 'RATE_LIMIT' | 'TIMEOUT' | 'INVALID_RESPONSE' | 'API_ERROR' | 'QUOTA_EXCEEDED'
  ) {
    super(message);
    this.name = 'AIServiceError';
  }
}
