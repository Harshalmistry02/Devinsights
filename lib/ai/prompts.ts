// lib/ai/prompts.ts

import { AnalyticsSummary } from './types';

/**
 * System prompt for AI insight generation
 * Compact format to reduce token usage
 */
export function buildSystemPrompt(): string {
  return `You are an expert developer coach analyzing coding patterns.

Output ONLY valid JSON with this exact structure:
{
  "patterns": ["pattern1", "pattern2", "pattern3"],
  "strengths": ["strength1", "strength2"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
}

Rules:
- Each insight: specific, actionable, under 150 chars
- Focus on non-obvious patterns from the data
- Be encouraging but data-driven
- NO markdown, NO explanation text, ONLY JSON`;
}

/**
 * Build user prompt from analytics data
 * Optimized for token efficiency (~150 tokens vs ~300 original)
 */
export function buildUserPrompt(data: AnalyticsSummary): string {
  // Compact language string
  const langs = Object.entries(data.topLanguages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([l, c]) => `${l}:${c}`)
    .join(', ');

  // Build comparison string if available
  const trend = data.previousPeriodCommits
    ? `${data.totalCommits > data.previousPeriodCommits ? '+' : ''}${Math.round(
        ((data.totalCommits - data.previousPeriodCommits) / Math.max(data.previousPeriodCommits, 1)) * 100
      )}%`
    : null;

  // Build scores section
  const scores: string[] = [];
  if (data.consistencyScore !== undefined) {
    scores.push(`Consistency: ${data.consistencyScore}/100`);
  }
  if (data.languageDiversity !== undefined) {
    const diversityLabel = data.languageDiversity > 70 ? 'polyglot' : data.languageDiversity > 40 ? 'versatile' : 'specialized';
    scores.push(`Diversity: ${data.languageDiversity}/100 (${diversityLabel})`);
  }
  if (data.streakHealth) {
    scores.push(`Streak health: ${data.streakHealth}`);
  }

  // Build work pattern section
  const patterns: string[] = [];
  if (data.weekdayVsWeekendRatio !== undefined) {
    patterns.push(data.weekdayVsWeekendRatio > 3 ? 'weekday-focused' : 'balanced week coverage');
  }
  if (data.hourlyPattern) {
    patterns.push(`${data.hourlyPattern} coder`);
  }
  if (data.isActiveToday) {
    patterns.push('active today');
  }

  return `Dev stats (${data.period}):
Commits: ${data.totalCommits}${trend ? ` (${trend} vs prev)` : ''} | Streak: ${data.currentStreak}d (best: ${data.longestStreak}d)
Langs: ${langs || 'N/A'}
Avg size: ${data.avgCommitSize} lines | Peak day: ${data.mostActiveDay || 'N/A'}
${scores.length > 0 ? scores.join(' | ') + '\n' : ''}${patterns.length > 0 ? 'Pattern: ' + patterns.join(', ') + '\n' : ''}${data.daysToMilestone ? `Next milestone: ${data.daysToMilestone.milestone}d streak in ${data.daysToMilestone.daysRemaining}d\n` : ''}
Analyze patterns, identify strengths, suggest improvements.`;
}

/**
 * Compact version of user prompt for even more token savings
 * Use when approaching quota limits
 */
export function buildUserPromptCompact(data: AnalyticsSummary): string {
  const langs = Object.entries(data.topLanguages)
    .slice(0, 3)
    .map(([l, c]) => `${l}:${c}`)
    .join(',');

  return `Stats: ${data.totalCommits}cmts, ${data.currentStreak}d streak, langs:${langs || 'none'}, peak:${data.mostActiveDay || 'N/A'}. Analyze.`;
}

