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

// Insights data building
export {
  buildAnalyticsSummary,
  calculateConsistencyScore,
  calculateWeekdayWeekendRatio,
  determineHourlyPattern,
  calculateCommitSizeDistribution,
} from './insights-data-builder';

// Insights data fetching  
export {
  fetchRecentCommitMessages,
  calculateDataQuality,
  aggregateFileLanguageStats,
} from './insights-data-fetcher';

// Comparative period analytics
export {
  calculateComparativePeriod,
  calculateWeekOverWeek,
  calculateQuarterOverQuarter,
  formatChangePercent,
  formatChange,
  getTrendIndicator,
  getPeriodLabel,
} from './comparison-calculator';

export type {
  PeriodMetrics,
  ComparativePeriodData,
} from './comparison-calculator';

// Commit quality analysis
export {
  analyzeCommitQuality,
  analyzeRecentCommitQuality,
  compareQualityPeriods,
  getGradeColor,
  getGradeBgColor,
  getGradeDescription,
} from './commit-quality-analyzer';

export type {
  CommitQualityMetrics,
  CommitPrefix,
  CommitGrade,
  QualityTrend,
  CommitForQualityAnalysis,
} from './commit-quality-analyzer';

// Weekly summary analytics
export {
  getWeekNumber,
  getWeekData,
  compareWeeks,
  getMostActiveHour,
  getStreakMilestoneInfo,
  buildWeeklySummary,
  getWeekLabel,
  formatWeekChange,
} from './weekly-summary';

export type {
  WeekData,
  WeekComparison,
  WeeklySummaryData,
  WeeklyHighlights,
  StreakInfo,
} from './weekly-summary';

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

// Code Impact Analysis
export {
  analyzeCodeImpact,
  getImpactRating,
  getChurnSeverity,
} from './code-impact-analyzer';

export type {
  CodeImpactMetrics,
  CommitCategory,
  CommitForImpactAnalysis,
} from './code-impact-analyzer';

// Developer Persona Detection
export {
  detectPersona,
  getEarnedPersonas,
  PERSONAS,
} from './persona-detector';

export type {
  DeveloperPersona,
  PersonaResult,
  PersonaContext,
} from './persona-detector';
