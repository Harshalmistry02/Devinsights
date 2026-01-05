/**
 * Streak Calculator Module
 * 
 * Calculates coding streaks from commit dates.
 * A streak is defined as consecutive days with at least 1 commit.
 */

import { StreakData } from './types';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Calculate coding streaks from commit dates
 * 
 * Rules:
 * - A streak is consecutive days with at least 1 commit
 * - Dates are normalized to UTC for consistency
 * - Returns current streak (ongoing) and longest streak (all-time)
 * - Current streak counts if last commit was today or yesterday
 */
export function calculateStreaks(commitDates: Date[]): StreakData {
  if (commitDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastCommitDate: null,
      streakStartDate: null,
      isActiveToday: false,
    };
  }

  // Sort dates ascending
  const sortedDates = [...commitDates].sort((a, b) => a.getTime() - b.getTime());
  
  // Get unique days (normalize to date strings)
  const uniqueDays = Array.from(
    new Set(sortedDates.map(date => normalizeToDateString(date)))
  ).sort();

  if (uniqueDays.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastCommitDate: null,
      streakStartDate: null,
      isActiveToday: false,
    };
  }

  // Calculate longest streak
  let longestStreak = 1;
  let tempStreak = 1;

  for (let i = 1; i < uniqueDays.length; i++) {
    const prevDate = new Date(uniqueDays[i - 1]);
    const currDate = new Date(uniqueDays[i]);
    const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / DAY_MS);

    if (diffDays === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  // Calculate current streak (counting backwards from today)
  const today = normalizeToDateString(new Date());
  const yesterday = normalizeToDateString(new Date(Date.now() - DAY_MS));
  const lastCommitDay = uniqueDays[uniqueDays.length - 1];
  
  // Check if streak is still active
  const isActiveToday = lastCommitDay === today;
  const wasActiveYesterday = lastCommitDay === yesterday;
  
  let currentStreak = 0;
  let streakStartDate: Date | null = null;

  if (isActiveToday || wasActiveYesterday) {
    currentStreak = 1;
    
    // Count backwards from the last commit day
    for (let i = uniqueDays.length - 2; i >= 0; i--) {
      const currDate = new Date(uniqueDays[i + 1]);
      const prevDate = new Date(uniqueDays[i]);
      const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / DAY_MS);

      if (diffDays === 1) {
        currentStreak++;
        streakStartDate = prevDate;
      } else {
        break;
      }
    }
    
    // If we didn't find a start date, it means streak started on last commit day
    if (!streakStartDate && currentStreak === 1) {
      streakStartDate = new Date(lastCommitDay);
    }
  }

  const lastCommitDate = sortedDates[sortedDates.length - 1];

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, tempStreak),
    lastCommitDate,
    streakStartDate,
    isActiveToday,
  };
}

/**
 * Normalize a Date to a YYYY-MM-DD string (UTC)
 */
function normalizeToDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get streak status message for UI display
 */
export function getStreakStatusMessage(streakData: StreakData): string {
  const { currentStreak, lastCommitDate, isActiveToday } = streakData;

  if (currentStreak === 0) {
    if (lastCommitDate) {
      const daysSince = Math.floor(
        (Date.now() - lastCommitDate.getTime()) / DAY_MS
      );
      if (daysSince === 0) {
        return 'Start your streak today!';
      }
      return `No active streak. Last commit ${daysSince} day${daysSince === 1 ? '' : 's'} ago.`;
    }
    return 'No commits yet. Start your streak today!';
  }

  if (currentStreak === 1) {
    if (isActiveToday) {
      return 'Great start! Keep it going tomorrow.';
    }
    return 'Commit today to continue your streak!';
  }

  if (currentStreak < 7) {
    return `${currentStreak} day streak! Building momentum.`;
  }

  if (currentStreak < 30) {
    return `🔥 ${currentStreak} day streak! You're on fire!`;
  }

  if (currentStreak < 100) {
    return `🏆 ${currentStreak} day streak! Incredible dedication!`;
  }

  return `💎 ${currentStreak} day streak! Legendary commitment!`;
}

/**
 * Get streak health indicator (for UI)
 */
export function getStreakHealth(streakData: StreakData): 'excellent' | 'good' | 'warning' | 'danger' | 'inactive' {
  const { currentStreak, isActiveToday, lastCommitDate } = streakData;

  if (currentStreak === 0) {
    return 'inactive';
  }

  if (isActiveToday) {
    if (currentStreak >= 7) return 'excellent';
    if (currentStreak >= 3) return 'good';
    return 'good';
  }

  // Last commit was yesterday - need to commit today
  if (lastCommitDate) {
    const hoursSinceLastCommit = (Date.now() - lastCommitDate.getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastCommit < 36) return 'warning'; // Still have time
    return 'danger';
  }

  return 'inactive';
}

/**
 * Calculate days until streak milestone
 */
export function getDaysToMilestone(currentStreak: number): { milestone: number; daysRemaining: number } | null {
  const milestones = [7, 14, 30, 50, 100, 150, 200, 365];
  
  for (const milestone of milestones) {
    if (currentStreak < milestone) {
      return {
        milestone,
        daysRemaining: milestone - currentStreak,
      };
    }
  }
  
  return null; // All milestones achieved!
}
