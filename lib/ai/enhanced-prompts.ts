// lib/ai/enhanced-prompts.ts
import { AnalyticsSummary } from './types';

export interface EnhancedAnalyticsContext {
  current: AnalyticsSummary;
  previous?: AnalyticsSummary;
  trend: 'improving' | 'declining' | 'stable';
  anomalies: string[];
}

/**
 * Build enhanced prompt with historical comparison and anomaly detection
 */
export function buildEnhancedUserPrompt(context: EnhancedAnalyticsContext): string {
  const { current, previous, trend, anomalies } = context;

  let prompt = `Dev coding analysis (${current.period}):

CURRENT METRICS:
- Commits: ${current.totalCommits}
- Streak: ${current.currentStreak}d (best: ${current.longestStreak}d)
- Languages: ${Object.entries(current.topLanguages)
    .slice(0, 3)
    .map(([l, c]) => `${l}:${c}`)
    .join(', ')}
- Avg commit size: ${current.avgCommitSize} lines
- Peak day: ${current.mostActiveDay || 'N/A'}
- Consistency: ${current.consistencyScore || 0}/100
`;

  if (previous) {
    const commitChange = current.totalCommits - previous.totalCommits;
    const streakChange = current.currentStreak - (previous.currentStreak || 0);
    const consistencyChange = (current.consistencyScore || 0) - (previous.consistencyScore || 0);

    prompt += `\nPREVIOUS PERIOD COMPARISON:
- Commits: ${previous.totalCommits} (${commitChange > 0 ? '+' : ''}${commitChange})
- Streak: ${previous.currentStreak}d (${streakChange > 0 ? '+' : ''}${streakChange}d)
- Consistency: ${previous.consistencyScore || 0}/100 (${consistencyChange > 0 ? '+' : ''}${consistencyChange})
- Trend: ${trend} ${getTrendEmoji(trend)}`;
  }

  if (anomalies.length > 0) {
    prompt += `\n\nANOMALIES DETECTED:
- ${anomalies.join('\n- ')}`;
  }

  // Add work pattern insights
  if (current.hourlyPattern) {
    prompt += `\n\nWORK PATTERNS:
- Primary coding time: ${current.hourlyPattern}
- Weekday vs Weekend ratio: ${current.weekdayVsWeekendRatio?.toFixed(1) || 'N/A'}
- Active today: ${current.isActiveToday ? 'Yes' : 'No'}`;
  }

  // Add streak health
  if (current.streakHealth) {
    prompt += `\n\nSTREAK STATUS:
- Health: ${current.streakHealth}
${current.daysToMilestone ? `- ${current.daysToMilestone.daysRemaining} days to ${current.daysToMilestone.milestone}-day milestone` : ''}`;
  }

  prompt += `\n\nProvide:
1. Three key patterns observed in the data (focus on trends and changes)
2. Two notable strengths in coding habits
3. Three specific, actionable suggestions for improvement

Be data-driven and focus on meaningful insights. If anomalies exist, explain them.`;

  return prompt;
}

function getTrendEmoji(trend: 'improving' | 'declining' | 'stable'): string {
  return {
    improving: '📈',
    declining: '📉',
    stable: '➡️',
  }[trend];
}

/**
 * Detect anomalies in user's behavior by comparing periods
 */
export function detectAnomalies(
  current: AnalyticsSummary,
  previous?: AnalyticsSummary
): string[] {
  const anomalies: string[] = [];

  if (!previous) return anomalies;

  // 1. Streak broken
  if (previous.currentStreak > 7 && current.currentStreak === 0) {
    anomalies.push(`Long streak of ${previous.currentStreak} days was broken`);
  }

  // 2. Dramatic drop in commits (>50% decrease)
  if (previous.totalCommits > 20) {
    const commitDrop = ((previous.totalCommits - current.totalCommits) / previous.totalCommits) * 100;
    if (commitDrop > 50) {
      anomalies.push(
        `Commit activity dropped ${Math.round(commitDrop)}% (possible vacation/break?)`
      );
    }
  }

  // 3. Dramatic increase in commits (>50% increase)
  if (previous.totalCommits > 10) {
    const commitIncrease = ((current.totalCommits - previous.totalCommits) / previous.totalCommits) * 100;
    if (commitIncrease > 50) {
      anomalies.push(
        `Commit activity increased ${Math.round(commitIncrease)}% (sprint or project deadline?)`
      );
    }
  }

  // 4. Language shift
  const prevPrimaryLang = Object.entries(previous.topLanguages).sort((a, b) => b[1] - a[1])[0]?.[0];
  const currPrimaryLang = Object.entries(current.topLanguages).sort((a, b) => b[1] - a[1])[0]?.[0];
  
  if (prevPrimaryLang && currPrimaryLang && prevPrimaryLang !== currPrimaryLang) {
    anomalies.push(
      `Primary language shifted from ${prevPrimaryLang} to ${currPrimaryLang}`
    );
  }

  // 5. Work pattern change
  if (
    previous.hourlyPattern &&
    current.hourlyPattern &&
    previous.hourlyPattern !== current.hourlyPattern &&
    previous.hourlyPattern !== 'mixed' &&
    current.hourlyPattern !== 'mixed'
  ) {
    anomalies.push(
      `Coding schedule changed from ${previous.hourlyPattern} to ${current.hourlyPattern}`
    );
  }

  // 6. Consistency score dramatic change
  if (previous.consistencyScore && current.consistencyScore) {
    const consistencyChange = Math.abs(current.consistencyScore - previous.consistencyScore);
    if (consistencyChange > 30) {
      if (current.consistencyScore > previous.consistencyScore) {
        anomalies.push('Coding consistency significantly improved');
      } else {
        anomalies.push('Coding consistency significantly decreased');
      }
    }
  }

  // 7. Weekday/Weekend ratio shift
  if (
    previous.weekdayVsWeekendRatio &&
    current.weekdayVsWeekendRatio &&
    Math.abs(current.weekdayVsWeekendRatio - previous.weekdayVsWeekendRatio) > 2
  ) {
    if (current.weekdayVsWeekendRatio > previous.weekdayVsWeekendRatio) {
      anomalies.push('Shifted to more weekday-focused coding');
    } else {
      anomalies.push('Increased weekend coding activity');
    }
  }

  // 8. Commit size change
  if (previous.avgCommitSize && current.avgCommitSize) {
    const sizeChange = ((current.avgCommitSize - previous.avgCommitSize) / previous.avgCommitSize) * 100;
    if (Math.abs(sizeChange) > 100) {
      if (sizeChange > 0) {
        anomalies.push('Average commit size increased significantly (larger features?)');
      } else {
        anomalies.push('Average commit size decreased significantly (smaller, atomic commits?)');
      }
    }
  }

  return anomalies;
}

/**
 * Determine overall trend based on multiple metrics
 */
export function calculateTrend(
  current: AnalyticsSummary,
  previous?: AnalyticsSummary
): 'improving' | 'declining' | 'stable' {
  if (!previous) return 'stable';

  let score = 0;

  // Commit volume (weight: 2)
  const commitChange = current.totalCommits - previous.totalCommits;
  if (commitChange > 10) score += 2;
  else if (commitChange < -10) score -= 2;

  // Consistency score (weight: 3)
  if (current.consistencyScore && previous.consistencyScore) {
    const consistencyChange = current.consistencyScore - previous.consistencyScore;
    if (consistencyChange > 10) score += 3;
    else if (consistencyChange < -10) score -= 3;
  }

  // Streak maintenance (weight: 2)
  if (current.currentStreak > previous.currentStreak) score += 2;
  else if (previous.currentStreak > 7 && current.currentStreak === 0) score -= 3;

  // Language diversity (weight: 1)
  if (current.languageDiversity && previous.languageDiversity) {
    if (current.languageDiversity > previous.languageDiversity) score += 1;
    else if (current.languageDiversity < previous.languageDiversity) score -= 1;
  }

  // Determine trend based on score
  if (score >= 3) return 'improving';
  if (score <= -3) return 'declining';
  return 'stable';
}
