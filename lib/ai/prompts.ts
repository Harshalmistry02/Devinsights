// lib/ai/prompts.ts

import { AnalyticsSummary } from './types';

/**
 * System prompt for AI insight generation
 * Refined to act as a Senior Engineering Lead focused on sustainable performance.
 */
export function buildSystemPrompt(): string {
  return `You are DevInsights AI, a data-driven Senior Engineering Manager and Tech Lead.

YOUR GOAL: 
Analyze developer telemetry to identify deep work patterns, sustainability risks, and code quality habits.

INPUT CONTEXT:
You will receive a "AnalyticsSummary" object containing:
- Activity: Commits, streaks, velocity trends.
- Work Habits: Hourly distribution (morning/night), weekend intensity.
- Quality Metrics: Conventional Commit adherence, message quality grades.
- Consistency: Entropy-based diversity and consistency scores.

OUTPUT RULES:
1. Return ONLY valid JSON matching this schema:
   {
     "patterns": ["string", "string", "string"],   // Max 3
     "strengths": ["string", "string"],            // Max 2
     "suggestions": ["string", "string", "string"] // Max 3
   }
2. Tone: Professional, objective, and high-leverage (no fluff like "Good job!").
3. Length: Each string must be under 200 characters.

ANALYSIS LOGIC (Apply these heuristics):
- PATTERNS: Correlate time with output. (e.g., "Late night commits correlate with lower message quality"). Identify "Sprint" behavior vs "Consistent" behavior.
- STRENGTHS: Validate high 'ConsistencyScore' (>70) or strong 'ConventionalCommit' adherence. 
- SUGGESTIONS: 
  - If 'commitQualityMetrics.grade' is < B, suggest specific improvements (e.g., "Adopt Conventional Commits").
  - If 'weekendRatio' is high, suggest burnout checks.
  - If 'avgCommitSize' > 300, suggest atomic commits.

NO MARKDOWN. NO PREAMBLE. ONLY JSON.`;
}

/**
 * Build user prompt from analytics data
 * Refined to include Quality Metrics and Data Health which were previously missing.
 */
export function buildUserPrompt(data: AnalyticsSummary): string {
  // 1. Core Activity & Trends
  const trend = data.previousPeriodCommits
    ? `${data.totalCommits > data.previousPeriodCommits ? '📈' : '📉'} ${Math.round(
        ((data.totalCommits - data.previousPeriodCommits) / Math.max(data.previousPeriodCommits, 1)) * 100
      )}% vs prev`
    : 'No prev data';
  
  const langs = Object.entries(data.topLanguages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([l, c]) => `${l}(${Math.round((c / data.totalCommits) * 100)}%)`)
    .join(', ');

  // 2. Calculated Scores & Health
  const scores = [
    `Consistency: ${data.consistencyScore || 0}/100`,
    `Streak: ${data.currentStreak}d (${data.streakHealth || 'neutral'})`,
    `Diversity: ${data.languageDiversity || 0}/100`
  ].join(' | ');

  // 3. Work Patterns (Time & Day)
  const patterns = [
    data.hourlyPattern ? `Primary Time: ${data.hourlyPattern}` : null,
    data.weekdayVsWeekendRatio 
      ? `Weekend Ratio: ${data.weekdayVsWeekendRatio.toFixed(1)} (${data.weekdayVsWeekendRatio > 1.5 ? 'High Weekday' : 'Weekend Heavy'})`
      : null
  ].filter(Boolean).join(' | ');

  // 4. Quality Metrics (CRITICAL ADDITION)
  let qualityInfo = 'Quality: N/A';
  if (data.commitQualityMetrics) {
    const { qualityGrade, conventionalCommitScore, hasTicketReferences } = data.commitQualityMetrics;
    qualityInfo = `Quality Grade: ${qualityGrade} | Conventional Score: ${conventionalCommitScore}/100 | Ref Tickets: ${hasTicketReferences ? 'Yes' : 'No'}`;
  }

  // 5. Data Quality Indicators
  let dataQualityInfo = '';
  if (data.dataQuality) {
    const { outlierCount, unknownExtensionPercent, hasSufficientData } = data.dataQuality;
    dataQualityInfo = `\nData Health: ${hasSufficientData ? '✓ Sufficient' : '⚠ Limited'} | Outliers: ${outlierCount} | Unknown Extensions: ${unknownExtensionPercent.toFixed(1)}%`;
  }

  // 6. Recent Context
  const recentMsgs = data.recentMessages?.length 
    ? `\nRecent Commits: "${data.recentMessages.slice(0, 3).join('", "')}"` 
    : '';

  // Final Assembly
  return `
[DATA REPORT]
Period: ${data.period}
Velocity: ${data.totalCommits} commits (${trend})
Context: ${langs || 'N/A'}
Avg Size: ${data.avgCommitSize} lines
Scores: ${scores}
Habits: ${patterns || 'N/A'}
${qualityInfo}${dataQualityInfo}
${recentMsgs}

Analyze this report. Identify constraints, praise specific engineering habits, and provide actionable optimizations.`;
}

/**
 * Compact prompt for quota-saving (includes quality grade for minimal context)
 */
export function buildUserPromptCompact(data: AnalyticsSummary): string {
  const q = data.commitQualityMetrics?.qualityGrade || '?';
  const consistency = data.consistencyScore ? `cons:${data.consistencyScore}` : '';
  return `Stats: ${data.totalCommits}cmts, ${data.currentStreak}d streak, Grade:${q}${consistency ? `, ${consistency}` : ''}. Analyze.`;
}
