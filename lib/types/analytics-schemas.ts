/**
 * Analytics Schema Types
 * 
 * Defines the structure of JSON fields in AnalyticsSnapshot
 * to provide type safety and documentation for analytics data
 */

/**
 * Language statistics - counts of commits and repositories by language
 * 
 * Example:
 * {
 *   "TypeScript": { commits: 145, repos: 3, color: "#3178c6" },
 *   "Python": { commits: 89, repos: 2, color: "#3776ab" }
 * }
 */
export interface LanguageStats {
  [language: string]: {
    commits: number;
    repos: number;
    color?: string;
  };
}

/**
 * Daily commit counts - maps dates to commit count
 * 
 * Example:
 * {
 *   "2026-04-19": 5,
 *   "2026-04-18": 3,
 *   "2026-04-17": 0
 * }
 */
export interface DailyCommits {
  [dateString: string]: number;  // Format: YYYY-MM-DD
}

/**
 * Day of week statistics - commit distribution by day
 * 
 * Example:
 * {
 *   "Sunday": 2,
 *   "Monday": 8,
 *   "Tuesday": 12,
 *   "Wednesday": 10,
 *   "Thursday": 15,
 *   "Friday": 9,
 *   "Saturday": 3
 * }
 */
export interface DayOfWeekStats {
  Sunday: number;
  Monday: number;
  Tuesday: number;
  Wednesday: number;
  Thursday: number;
  Friday: number;
  Saturday: number;
}

/**
 * Hourly activity statistics - commit distribution by hour
 * 
 * Example:
 * {
 *   0: 2,
 *   1: 0,
 *   ...
 *   14: 15,  // Most active at 2 PM
 *   15: 12,
 *   ...
 *   23: 1
 * }
 */
export interface HourlyStats {
  [hour: number]: number;  // 0-23
}

/**
 * Repository statistics - metrics per repository
 * 
 * Example:
 * {
 *   "repo-id-1": {
 *     name: "my-project",
 *     commits: 150,
 *     additions: 5000,
 *     deletions: 2000,
 *     languages: ["TypeScript", "Python"]
 *   }
 * }
 */
export interface RepoStats {
  [repoId: string]: {
    name: string;
    commits: number;
    additions: number;
    deletions: number;
    languages: string[];
  };
}

/**
 * Top languages - ordered list of most used languages
 * 
 * Example:
 * [
 *   { language: "TypeScript", count: 234 },
 *   { language: "Python", count: 145 },
 *   { language: "JavaScript", count: 89 }
 * ]
 */
export interface TopLanguages {
  language: string;
  count: number;
  color?: string;
}

/**
 * Commit quality metrics - measures of commit quality and patterns
 * 
 * Example:
 * {
 *   averageSize: 42,
 *   outlierCount: 3,
 *   avgMessageLength: 52,
 *   codeImpactScore: 7.8,
 *   messageQuality: "good",
 *   testCoverage: 0.85,
 *   reviewedPercentage: 0.92
 * }
 */
export interface CommitQualityMetrics {
  averageSize: number;                    // Avg additions + deletions
  outlierCount: number;                   // Commits with unusual size
  avgMessageLength: number;               // Avg characters in message
  codeImpactScore: number;                // 0-10 scale
  messageQuality?: 'excellent' | 'good' | 'average' | 'poor';
  testCoverage?: number;                  // 0-1
  reviewedPercentage?: number;            // 0-1
}

/**
 * Code impact metrics - measures of code productivity and impact
 * 
 * Example:
 * {
 *   totalLinesChanged: 12450,
 *   avgLinesPerCommit: 89,
 *   refactoringPercentage: 0.23,
 *   productivityScore: 8.5,
 *   consistencyScore: 0.92,
 *   diversityScore: 0.78
 * }
 */
export interface CodeImpactMetrics {
  totalLinesChanged: number;              // Additions + deletions
  avgLinesPerCommit: number;
  refactoringPercentage: number;          // 0-1 (estimated)
  productivityScore: number;              // 0-10 scale
  consistencyScore?: number;              // 0-1 (commit regularity)
  diversityScore?: number;                // 0-1 (variety of repos/languages)
}

/**
 * Type helper to ensure JSON fields are properly structured
 */
export type AnalyticsJsonField = 
  | LanguageStats 
  | DailyCommits 
  | DayOfWeekStats 
  | HourlyStats 
  | RepoStats 
  | TopLanguages[] 
  | CommitQualityMetrics 
  | CodeImpactMetrics;

/**
 * Validation helper to safely cast JSON to typed schema
 */
export function validateLanguageStats(data: unknown): LanguageStats | null {
  if (!data || typeof data !== 'object') return null;
  
  const stats = data as Record<string, any>;
  const isValid = Object.values(stats).every(v => 
    v && typeof v === 'object' && 'commits' in v && 'repos' in v
  );
  
  return isValid ? (stats as LanguageStats) : null;
}

export function validateDayOfWeekStats(data: unknown): DayOfWeekStats | null {
  if (!data || typeof data !== 'object') return null;
  
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const stats = data as Record<string, any>;
  
  const isValid = days.every(day => day in stats && typeof stats[day] === 'number');
  
  return isValid ? (stats as DayOfWeekStats) : null;
}

export function validateCommitQualityMetrics(data: unknown): CommitQualityMetrics | null {
  if (!data || typeof data !== 'object') return null;
  
  const metrics = data as Record<string, any>;
  const hasRequired = 'averageSize' in metrics && 'outlierCount' in metrics && 'avgMessageLength' in metrics;
  
  return hasRequired ? (metrics as CommitQualityMetrics) : null;
}
