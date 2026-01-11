/**
 * Weekly Summary Analytics
 * 
 * Utilities for calculating weekly summary data for the dashboard widget.
 * Provides week-over-week comparisons and highlights.
 */

import { DailyCommitStats, DayOfWeekStats, HourlyStats } from './types';

export interface WeekData {
  weekNumber: number;
  year: number;
  startDate: Date;
  endDate: Date;
  totalCommits: number;
  dailyBreakdown: { date: string; commits: number; dayName: string }[];
  activeDays: number;
  bestDay: { date: string; commits: number; dayName: string } | null;
  weekendCommits: number;
  weekdayCommits: number;
}

export interface WeekComparison {
  commitsDiff: number;
  commitsPercentChange: number;
  activeDaysDiff: number;
  weekendChange: number; // Percentage change in weekend activity
  trend: 'up' | 'down' | 'stable';
}

export interface WeeklySummaryData {
  currentWeek: WeekData;
  previousWeek: WeekData;
  comparison: WeekComparison;
  highlights: WeeklyHighlights;
  streakInfo: StreakInfo;
}

export interface WeeklyHighlights {
  bestDay: { dayName: string; commits: number } | null;
  mostActiveHour: { hour: number; label: string } | null;
  topRepos: string[];
  totalReposTouched: number;
}

export interface StreakInfo {
  current: number;
  isActive: boolean;
  daysToMilestone: number | null;
  nextMilestone: number | null;
  milestoneLabel: string | null;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Get ISO week number for a date
 */
export function getWeekNumber(date: Date = new Date()): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Get the start and end of a week (Monday-Sunday)
 */
function getWeekBounds(weeksAgo: number = 0): { start: Date; end: Date } {
  const now = new Date();
  const currentDay = now.getDay();
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
  
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset - (weeksAgo * 7));
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return { start: monday, end: sunday };
}

/**
 * Extract week data from daily commits
 */
export function getWeekData(
  dailyCommits: DailyCommitStats | null | undefined,
  weeksAgo: number = 0
): WeekData {
  const { start, end } = getWeekBounds(weeksAgo);
  const weekNumber = getWeekNumber(start);
  const year = start.getFullYear();
  
  const dailyBreakdown: WeekData['dailyBreakdown'] = [];
  let totalCommits = 0;
  let activeDays = 0;
  let bestDay: WeekData['bestDay'] = null;
  let weekendCommits = 0;
  let weekdayCommits = 0;
  
  // Iterate through each day of the week
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const dayIndex = date.getDay();
    const dayName = DAY_NAMES[dayIndex];
    
    const commits = dailyCommits?.[dateStr] || 0;
    totalCommits += commits;
    
    dailyBreakdown.push({
      date: dateStr,
      commits,
      dayName: DAY_NAMES_SHORT[dayIndex],
    });
    
    if (commits > 0) {
      activeDays++;
      
      // Track weekend vs weekday
      if (dayIndex === 0 || dayIndex === 6) {
        weekendCommits += commits;
      } else {
        weekdayCommits += commits;
      }
      
      // Track best day
      if (!bestDay || commits > bestDay.commits) {
        bestDay = { date: dateStr, commits, dayName };
      }
    }
  }
  
  return {
    weekNumber,
    year,
    startDate: start,
    endDate: end,
    totalCommits,
    dailyBreakdown,
    activeDays,
    bestDay,
    weekendCommits,
    weekdayCommits,
  };
}

/**
 * Compare two weeks
 */
export function compareWeeks(current: WeekData, previous: WeekData): WeekComparison {
  const commitsDiff = current.totalCommits - previous.totalCommits;
  const commitsPercentChange = previous.totalCommits > 0
    ? Math.round((commitsDiff / previous.totalCommits) * 100)
    : current.totalCommits > 0 ? 100 : 0;
  
  const activeDaysDiff = current.activeDays - previous.activeDays;
  
  // Weekend activity change
  const weekendChange = previous.weekendCommits > 0
    ? Math.round(((current.weekendCommits - previous.weekendCommits) / previous.weekendCommits) * 100)
    : current.weekendCommits > 0 ? 100 : 0;
  
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (Math.abs(commitsPercentChange) < 5) {
    trend = 'stable';
  } else {
    trend = commitsPercentChange > 0 ? 'up' : 'down';
  }
  
  return {
    commitsDiff,
    commitsPercentChange,
    activeDaysDiff,
    weekendChange,
    trend,
  };
}

/**
 * Get the most active hour from hourly stats
 */
export function getMostActiveHour(hourlyStats: HourlyStats | null | undefined): { hour: number; label: string } | null {
  if (!hourlyStats) return null;
  
  let maxHour = 0;
  let maxCount = 0;
  
  for (const [hour, count] of Object.entries(hourlyStats)) {
    if (count > maxCount) {
      maxCount = count;
      maxHour = parseInt(hour, 10);
    }
  }
  
  if (maxCount === 0) return null;
  
  // Format hour label
  const startHour = maxHour;
  const endHour = (maxHour + 2) % 24;
  const formatHour = (h: number) => {
    if (h === 0) return '12 AM';
    if (h === 12) return '12 PM';
    return h > 12 ? `${h - 12} PM` : `${h} AM`;
  };
  
  return {
    hour: maxHour,
    label: `${formatHour(startHour)}-${formatHour(endHour)}`,
  };
}

/**
 * Calculate streak milestone info
 */
export function getStreakMilestoneInfo(currentStreak: number): StreakInfo {
  const milestones = [7, 14, 21, 30, 50, 75, 100, 150, 200, 365];
  
  let nextMilestone: number | null = null;
  let daysToMilestone: number | null = null;
  let milestoneLabel: string | null = null;
  
  for (const milestone of milestones) {
    if (currentStreak < milestone) {
      nextMilestone = milestone;
      daysToMilestone = milestone - currentStreak;
      
      // Create label
      if (milestone === 7) milestoneLabel = '1-week';
      else if (milestone === 14) milestoneLabel = '2-week';
      else if (milestone === 21) milestoneLabel = '3-week';
      else if (milestone === 30) milestoneLabel = '1-month';
      else if (milestone === 50) milestoneLabel = '50-day';
      else if (milestone === 75) milestoneLabel = '75-day';
      else if (milestone === 100) milestoneLabel = '100-day';
      else if (milestone === 150) milestoneLabel = '150-day';
      else if (milestone === 200) milestoneLabel = '200-day';
      else if (milestone === 365) milestoneLabel = '1-year';
      
      break;
    }
  }
  
  return {
    current: currentStreak,
    isActive: currentStreak > 0,
    daysToMilestone,
    nextMilestone,
    milestoneLabel,
  };
}

/**
 * Build complete weekly summary data
 */
export function buildWeeklySummary(
  dailyCommits: DailyCommitStats | null | undefined,
  hourlyStats: HourlyStats | null | undefined,
  currentStreak: number = 0,
  isActiveToday: boolean = false,
  repoStats?: { name: string; commits: number }[]
): WeeklySummaryData {
  const currentWeek = getWeekData(dailyCommits, 0);
  const previousWeek = getWeekData(dailyCommits, 1);
  const comparison = compareWeeks(currentWeek, previousWeek);
  
  // Weekly repos touched (from recent activity)
  const topRepos = repoStats
    ?.sort((a, b) => b.commits - a.commits)
    .slice(0, 3)
    .map(r => r.name) || [];
  
  const highlights: WeeklyHighlights = {
    bestDay: currentWeek.bestDay
      ? { dayName: currentWeek.bestDay.dayName, commits: currentWeek.bestDay.commits }
      : null,
    mostActiveHour: getMostActiveHour(hourlyStats),
    topRepos,
    totalReposTouched: repoStats?.filter(r => r.commits > 0).length || 0,
  };
  
  const streakInfo: StreakInfo = {
    ...getStreakMilestoneInfo(currentStreak),
    isActive: isActiveToday,
  };
  
  return {
    currentWeek,
    previousWeek,
    comparison,
    highlights,
    streakInfo,
  };
}

/**
 * Get formatted week label
 */
export function getWeekLabel(weekNumber: number, year: number): string {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const month = monthNames[now.getMonth()];
  return `Week ${weekNumber}, ${month} ${year}`;
}

/**
 * Format change with sign and percentage
 */
export function formatWeekChange(diff: number, showPlus: boolean = true): string {
  const sign = diff > 0 && showPlus ? '+' : '';
  return `${sign}${diff}`;
}
