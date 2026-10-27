/**
 * Minimal view model shared by the dashboard cards.
 *
 * The Prisma snapshot is structurally assignable to this shape, while JSON
 * columns stay `unknown` and are narrowed where they are actually consumed.
 */
export interface DashboardAnalytics {
  totalRepos?: number | null;
  totalCommits?: number | null;
  totalStars?: number | null;
  totalAdditions?: number | null;
  totalDeletions?: number | null;
  totalForks?: number | null;
  currentStreak?: number | null;
  longestStreak?: number | null;
  isActiveToday?: boolean | null;
  averageCommitsPerDay?: number | null;
  mostProductiveDay?: string | null;
  mostProductiveHour?: number | null;
  dailyCommits?: unknown;
  dayOfWeekStats?: unknown;
  hourlyStats?: unknown;
  repoStats?: unknown;
  topLanguages?: unknown;
}
