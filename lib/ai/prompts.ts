// lib/ai/prompts.ts

import { AnalyticsSummary } from './types';

export function buildSystemPrompt(): string {
  return `You are an expert software engineering manager analyzing developer productivity patterns.

Your task:
1. Identify meaningful coding patterns and work habits
2. Recognize strengths and positive behaviors
3. Suggest actionable improvements

Rules:
- Output ONLY valid JSON, no additional text
- Each insight must be specific and under 150 characters
- Focus on actionable, non-obvious patterns
- Be encouraging but honest
- Base conclusions strictly on provided data

Output format:
{
  "patterns": ["pattern1", "pattern2", "pattern3"],
  "strengths": ["strength1", "strength2"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
}`;
}

export function buildUserPrompt(data: AnalyticsSummary): string {
  const languageBreakdown = Object.entries(data.topLanguages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([lang, count]) => `${lang}: ${count} commits`)
    .join(', ');

  const comparison = data.previousPeriodCommits
    ? `Previous period: ${data.previousPeriodCommits} commits (${
        data.totalCommits > data.previousPeriodCommits ? '+' : ''
      }${Math.round(
        ((data.totalCommits - data.previousPeriodCommits) /
          data.previousPeriodCommits) *
          100
      )}%)`
    : '';

  return `Analyze this developer's coding activity for ${data.period}:

Commit Activity:
- Total commits: ${data.totalCommits}
- Current streak: ${data.currentStreak} days
- Longest streak: ${data.longestStreak} days
- Average commit size: ${data.avgCommitSize} lines changed
- Most active day: ${data.mostActiveDay}

Language Distribution:
${languageBreakdown}

${comparison}

Provide insights in JSON format only.`;
}
