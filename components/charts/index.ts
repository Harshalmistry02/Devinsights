/**
 * Charts Module Index
 * 
 * Exports all chart components for easy importing
 */

// Static imports (for SSR or when you need immediate loading)
export { CommitTimeline } from './CommitTimeline';
export { LanguageBreakdown } from './LanguageBreakdown';
export { DayOfWeekChart } from './DayOfWeekChart';
export { HourlyActivity } from './HourlyActivity';
export { ActivityHeatmap } from './ActivityHeatmap';
export { RepoStatsChart } from './RepoStatsChart';

// Dynamic imports (code-split, lazy-loaded for better performance)
export {
  DynamicCommitTimeline,
  DynamicActivityHeatmap,
  DynamicDayOfWeekChart,
  DynamicHourlyActivity,
  DynamicLanguageBreakdown,
  DynamicRepoStatsChart,
} from './DynamicCharts';
