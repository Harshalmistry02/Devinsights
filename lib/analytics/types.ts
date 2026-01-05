/**
 * Analytics Type Definitions
 * 
 * TypeScript interfaces for the analytics aggregation system.
 * These types define the structure of calculated metrics and statistics.
 */

// ===========================================
// Language Statistics
// ===========================================

export interface LanguageStats {
  [language: string]: number; // language name -> commit count
}

export interface LanguageDetail {
  language: string;
  count: number;
  percentage: number;
}

// ===========================================
// Time-based Statistics
// ===========================================

export interface DailyCommitStats {
  [date: string]: number; // ISO date string (YYYY-MM-DD) -> commit count
}

export interface DayOfWeekStats {
  Monday: number;
  Tuesday: number;
  Wednesday: number;
  Thursday: number;
  Friday: number;
  Saturday: number;
  Sunday: number;
}

export interface HourlyStats {
  [hour: string]: number; // "0"-"23" -> commit count
}

// ===========================================
// Streak Data
// ===========================================

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCommitDate: Date | null;
  streakStartDate: Date | null;
  isActiveToday: boolean;
}

// ===========================================
// Repository Statistics
// ===========================================

export interface RepoStat {
  id: string;
  name: string;
  fullName: string;
  commits: number;
  stars: number;
  forks: number;
  language: string | null;
  lastCommitDate: Date | null;
  additions: number;
  deletions: number;
}

// ===========================================
// Commit Analysis Types
// ===========================================

export interface CommitForAnalysis {
  id: string;
  sha: string;
  authorDate: Date;
  additions: number;
  deletions: number;
  filesChanged: number;
  repository: {
    id: string;
    name: string;
    fullName: string;
    language: string | null;
    stars: number;
    forks: number;
  };
}

// ===========================================
// Main Analytics Result
// ===========================================

export interface AnalyticsResult {
  // Summary Statistics
  totalRepos: number;
  totalCommits: number;
  totalAdditions: number;
  totalDeletions: number;
  totalStars: number;
  totalForks: number;
  
  // Streak Information
  currentStreak: number;
  longestStreak: number;
  lastCommitDate: Date | null;
  isActiveToday: boolean;
  
  // Detailed Statistics (JSON fields)
  languageStats: LanguageStats;
  dailyCommits: DailyCommitStats;
  dayOfWeekStats: DayOfWeekStats;
  hourlyStats: HourlyStats;
  repoStats: RepoStat[];
  topLanguages: LanguageDetail[];
  
  // Computed Insights
  averageCommitsPerDay: number;
  mostProductiveDay: string;
  mostProductiveHour: number;
  
  // Metadata
  calculatedAt: Date;
  dataRangeStart: Date | null;
  dataRangeEnd: Date | null;
}

// ===========================================
// API Response Types
// ===========================================

export interface AnalyticsApiResponse {
  success: boolean;
  data?: AnalyticsResult;
  error?: string;
  message?: string;
}

// ===========================================
// Dashboard Display Types
// ===========================================

export interface DashboardStats {
  totalRepos: number;
  totalCommits: number;
  currentStreak: number;
  totalStars: number;
  weeklyChange: {
    repos: number;
    commits: number;
    streak: number;
    stars: number;
  };
}

export interface ActivityData {
  date: string;
  commits: number;
}

export interface LanguageChartData {
  name: string;
  value: number;
  color: string;
}
