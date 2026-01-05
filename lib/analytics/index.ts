/**
 * Analytics Module Index
 * 
 * Exports all analytics-related functions and types.
 */

// Main aggregator functions
export {
  AnalyticsAggregator,
  getUserAnalytics,
  refreshUserAnalytics,
  hasAnalyticsData,
  getQuickStats,
} from './aggregator';

// Streak calculations
export {
  calculateStreaks,
  getStreakStatusMessage,
  getStreakHealth,
  getDaysToMilestone,
} from './streak-calculator';

// Language analysis
export {
  aggregateLanguageStats,
  detectLanguageFromExtension,
  getTopLanguages,
  getLanguageColor,
  categorizeLanguages,
  getPrimaryExpertise,
  calculateLanguageDiversity,
  EXTENSION_MAP,
  LANGUAGE_COLORS,
} from './language-analyzer';

// Types
export type {
  AnalyticsResult,
  LanguageStats,
  LanguageDetail,
  DailyCommitStats,
  DayOfWeekStats,
  HourlyStats,
  RepoStat,
  StreakData,
  CommitForAnalysis,
  AnalyticsApiResponse,
  DashboardStats,
  ActivityData,
  LanguageChartData,
} from './types';
