// lib/ai/enhanced-prompts.ts
import { AnalyticsSummary } from './types';

export interface EnhancedAnalyticsContext {
  current: AnalyticsSummary;
  previous?: AnalyticsSummary;
  trend: 'improving' | 'declining' | 'stable';
  anomalies: string[];
}

/**
 * Build enhanced system prompt with Senior Tech Lead persona
 * Aligns with the base prompts.ts for consistent AI behavior
 */
export function buildEnhancedSystemPrompt(): string {
  return `You are DevInsights AI, a data-driven Senior Engineering Manager and Tech Lead.

YOUR GOAL: 
Perform deep analysis of developer telemetry to identify performance trends, sustainability risks, and code quality evolution over multiple periods.

INPUT CONTEXT:
You will receive an enhanced analytics report containing:
- CURRENT METRICS: Latest period activity, commits, streaks, velocity.
- PREVIOUS PERIOD COMPARISON: Historical delta analysis for trend detection.
- ANOMALIES DETECTED: System-flagged behavioral deviations.
- WORK PATTERNS: Time-of-day, weekend/weekday distribution.
- STREAK STATUS: Health indicators and milestone proximity.
- QUALITY METRICS: Commit message grades, conventional commit adherence.
- DATA QUALITY: Outlier counts, data sufficiency indicators.

OUTPUT RULES:
1. Return ONLY valid JSON matching this schema:
   {
     "patterns": ["string", "string", "string"],   // Max 3
     "strengths": ["string", "string"],            // Max 2
     "suggestions": ["string", "string", "string"] // Max 3
   }
2. Tone: Professional, objective, and high-leverage (no fluff).
3. Length: Each string must be under 200 characters.

ADVANCED ANALYSIS LOGIC:
- PATTERNS: 
  - Correlate time-of-day patterns with quality grades (e.g., "Night commits show 20% lower conventional adherence").
  - Identify sprint vs. marathon developer profiles from consistency scores.
  - Flag potential burnout: high weekend ratio + declining quality grade.
- STRENGTHS: 
  - Validate high consistency (>70), strong conventional commit scores (>80).
  - Praise improving trends explicitly with delta values.
- SUGGESTIONS:
  - Low quality grade (C/D/F): "Adopt Conventional Commits (feat:, fix:, docs:) to improve from Grade \${grade}".
  - High avgCommitSize (>300): "Break down large commits into atomic, reviewable chunks".
  - High weekend ratio with declining metrics: "Monitor for burnout - consider work-life balance review".
  - No ticket references: "Add issue references (e.g., #123) for better traceability".

When anomalies are present, ALWAYS reference them in your patterns analysis.
Prioritize sustainability and maintainability over raw velocity.

NO MARKDOWN. NO PREAMBLE. ONLY JSON.`;
}

/**
 * Build enhanced prompt with historical comparison, anomaly detection, and quality metrics
 */
export function buildEnhancedUserPrompt(context: EnhancedAnalyticsContext): string {
  const { current, previous, trend, anomalies } = context;

  // 1. Core Current Metrics Section
  let prompt = `[ENHANCED DATA REPORT]

═══ CURRENT METRICS (${current.period}) ═══
Commits: ${current.totalCommits} | Streak: ${current.currentStreak}d (best: ${current.longestStreak}d)
Languages: ${Object.entries(current.topLanguages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([l, c]) => `${l}(${Math.round((c / current.totalCommits) * 100)}%)`)
    .join(', ') || 'N/A'}
Avg Commit Size: ${current.avgCommitSize} lines | Peak Day: ${current.mostActiveDay || 'N/A'}
Consistency: ${current.consistencyScore || 0}/100 | Diversity: ${current.languageDiversity || 0}/100
`;

  // 2. Previous Period Comparison
  if (previous) {
    const commitChange = current.totalCommits - previous.totalCommits;
    const commitPct = previous.totalCommits > 0 
      ? Math.round((commitChange / previous.totalCommits) * 100)
      : 0;
    const streakChange = current.currentStreak - (previous.currentStreak || 0);
    const consistencyChange = (current.consistencyScore || 0) - (previous.consistencyScore || 0);

    prompt += `
═══ PERIOD COMPARISON ═══
Commits: ${previous.totalCommits} → ${current.totalCommits} (${commitChange > 0 ? '+' : ''}${commitChange}, ${commitPct > 0 ? '+' : ''}${commitPct}%)
Streak: ${previous.currentStreak}d → ${current.currentStreak}d (${streakChange > 0 ? '+' : ''}${streakChange}d)
Consistency: ${previous.consistencyScore || 0} → ${current.consistencyScore || 0} (${consistencyChange > 0 ? '+' : ''}${consistencyChange})
Overall Trend: ${trend} ${getTrendEmoji(trend)}
`;
  }

  // 3. Anomalies Section
  if (anomalies.length > 0) {
    prompt += `
═══ ⚠ ANOMALIES DETECTED ═══
${anomalies.map(a => `• ${a}`).join('\n')}
`;
  }

  // 4. Work Patterns Section
  const hasWorkPatterns = current.hourlyPattern || current.weekdayVsWeekendRatio !== undefined;
  if (hasWorkPatterns) {
    const weekendLabel = current.weekdayVsWeekendRatio !== undefined
      ? (current.weekdayVsWeekendRatio > 2 ? 'Weekday Heavy' : current.weekdayVsWeekendRatio < 0.8 ? '⚠ Weekend Heavy' : 'Balanced')
      : 'N/A';
    
    prompt += `
═══ WORK PATTERNS ═══
Primary Coding Time: ${current.hourlyPattern || 'mixed'}
Weekend Ratio: ${current.weekdayVsWeekendRatio?.toFixed(1) || 'N/A'} (${weekendLabel})
Active Today: ${current.isActiveToday ? '✓ Yes' : '✗ No'}
`;
  }

  // 5. Streak Health Section
  if (current.streakHealth) {
    const healthEmoji = {
      excellent: '🟢',
      good: '🟡',
      warning: '🟠',
      danger: '🔴',
      inactive: '⚫'
    }[current.streakHealth] || '⚪';
    
    prompt += `
═══ STREAK STATUS ═══
Health: ${healthEmoji} ${current.streakHealth}
${current.daysToMilestone ? `Next Milestone: ${current.daysToMilestone.milestone}d streak in ${current.daysToMilestone.daysRemaining} days` : 'No upcoming milestone'}
`;
  }

  // 6. CRITICAL: Quality Metrics Section
  if (current.commitQualityMetrics) {
    const qm = current.commitQualityMetrics;
    const gradeEmoji = { A: '🟢', B: '🟢', C: '🟡', D: '🟠', F: '🔴' }[qm.qualityGrade] || '⚪';
    
    prompt += `
═══ COMMIT QUALITY ═══
Quality Grade: ${gradeEmoji} ${qm.qualityGrade}
Conventional Commit Score: ${qm.conventionalCommitScore}/100
Ticket References: ${qm.hasTicketReferences ? `✓ Yes (${qm.hasTicketReferences})` : '✗ No'}
Has Body Text: ${qm.hasBodyText ? `✓ Yes (${qm.hasBodyText})` : '✗ No'}
${qm.insights.length > 0 ? `Quality Insights: ${qm.insights.slice(0, 2).join('; ')}` : ''}
`;
  }

  // 7. Data Quality Indicators
  if (current.dataQuality) {
    const dq = current.dataQuality;
    prompt += `
═══ DATA QUALITY ═══
Sufficient Data: ${dq.hasSufficientData ? '✓ Yes' : '⚠ Limited (insights may be less accurate)'}
Outliers Flagged: ${dq.outlierCount}
Unknown Extensions: ${dq.unknownExtensionPercent.toFixed(1)}%
`;
  }

  // 8. Recent Commit Messages for Style Analysis
  if (current.recentMessages && current.recentMessages.length > 0) {
    prompt += `
═══ RECENT COMMITS (for style analysis) ═══
"${current.recentMessages.slice(0, 5).join('"\n"')}"
`;
  }

  // 9. Analysis Instructions
  prompt += `
═══ ANALYSIS REQUEST ═══
Based on the above data, provide:
1. Three key patterns (correlate time, quality, and behavior)
2. Two notable strengths (cite specific metrics)
3. Three actionable suggestions (address quality grade if below B, burnout risks, atomic commits)

Focus on sustainability and engineering best practices over raw productivity.`;

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
 * Enhanced with quality metric anomaly detection
 */
export function detectAnomalies(
  current: AnalyticsSummary,
  previous?: AnalyticsSummary
): string[] {
  const anomalies: string[] = [];

  // Self-contained anomalies (don't need previous period)
  
  // Quality Grade Warning
  if (current.commitQualityMetrics) {
    const grade = current.commitQualityMetrics.qualityGrade;
    if (grade === 'D' || grade === 'F') {
      anomalies.push(`Commit quality grade is ${grade} - significant improvement opportunity`);
    }
    if (current.commitQualityMetrics.conventionalCommitScore < 30) {
      anomalies.push('Very low Conventional Commit adherence (<30%) - consider adopting commit standards');
    }
  }

  // Data Quality Warning
  if (current.dataQuality && !current.dataQuality.hasSufficientData) {
    anomalies.push('Insufficient data for high-confidence insights - need more commit history');
  }

  // Weekend Heavy Pattern Warning
  if (current.weekdayVsWeekendRatio !== undefined && current.weekdayVsWeekendRatio < 0.5) {
    anomalies.push('Weekend-heavy coding pattern detected - potential work-life balance concern');
  }

  // Night-heavy pattern with quality concerns
  if (current.hourlyPattern === 'night' && current.commitQualityMetrics?.qualityGrade) {
    const grade = current.commitQualityMetrics.qualityGrade;
    if (grade === 'C' || grade === 'D' || grade === 'F') {
      anomalies.push(`Night coding pattern correlates with lower quality grade (${grade}) - consider reviewing timing`);
    }
  }

  if (!previous) return anomalies;

  // Period comparison anomalies

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
        anomalies.push(`Coding consistency significantly improved (+${consistencyChange} points)`);
      } else {
        anomalies.push(`Coding consistency significantly decreased (-${consistencyChange} points)`);
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
        anomalies.push('Average commit size increased significantly (larger features or less atomic?)');
      } else {
        anomalies.push('Average commit size decreased significantly (more atomic commits - good!)');
      }
    }
  }

  // 9. Quality grade drop
  if (previous.commitQualityMetrics && current.commitQualityMetrics) {
    const gradeOrder = ['A', 'B', 'C', 'D', 'F'];
    const prevIdx = gradeOrder.indexOf(previous.commitQualityMetrics.qualityGrade);
    const currIdx = gradeOrder.indexOf(current.commitQualityMetrics.qualityGrade);
    if (currIdx > prevIdx + 1) {
      anomalies.push(
        `Quality grade dropped from ${previous.commitQualityMetrics.qualityGrade} to ${current.commitQualityMetrics.qualityGrade}`
      );
    }
  }

  return anomalies;
}

/**
 * Determine overall trend based on multiple metrics including quality
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

  // Quality grade (weight: 3) - NEW
  if (current.commitQualityMetrics && previous.commitQualityMetrics) {
    const gradeOrder = ['F', 'D', 'C', 'B', 'A'];
    const prevIdx = gradeOrder.indexOf(previous.commitQualityMetrics.qualityGrade);
    const currIdx = gradeOrder.indexOf(current.commitQualityMetrics.qualityGrade);
    score += (currIdx - prevIdx) * 1.5; // Each grade level change is worth 1.5 points
  }

  // Conventional commit score (weight: 2) - NEW
  if (current.commitQualityMetrics && previous.commitQualityMetrics) {
    const convChange = current.commitQualityMetrics.conventionalCommitScore - 
                       previous.commitQualityMetrics.conventionalCommitScore;
    if (convChange > 20) score += 2;
    else if (convChange < -20) score -= 2;
  }

  // Determine trend based on score
  if (score >= 3) return 'improving';
  if (score <= -3) return 'declining';
  return 'stable';
}
