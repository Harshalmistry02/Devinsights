import { AnalyticsSummary } from './types';
import { buildSystemPrompt } from './prompts';

export interface EnhancedAnalyticsContext {
  current: AnalyticsSummary;
  previous?: AnalyticsSummary;
  trend: 'improving' | 'declining' | 'stable';
  anomalies: string[];
}

/** The enhanced path must use the same strict output and safety contract. */
export function buildEnhancedSystemPrompt(): string {
  return buildSystemPrompt();
}

/**
 * Provide comparison data as structured JSON rather than prose decorated with
 * status symbols, which prevents the model from treating presentation labels
 * as measurements.
 */
export function buildEnhancedUserPrompt(context: EnhancedAnalyticsContext): string {
  return `Analyze this enhanced AnalyticsSummary. The current, previous, trend, and anomalies fields are the complete source of truth. Address supplied anomalies in patterns. Do not infer a correlation unless the telemetry states it.\n\n${JSON.stringify(context, null, 2)}`;
}

/** Detect behavioral deviations that should be surfaced to the AI and UI. */
export function detectAnomalies(
  current: AnalyticsSummary,
  previous?: AnalyticsSummary
): string[] {
  const anomalies: string[] = [];

  if (current.commitQualityMetrics) {
    const { qualityGrade, conventionalCommitScore } = current.commitQualityMetrics;
    if (qualityGrade === 'D' || qualityGrade === 'F') {
      anomalies.push(`Commit quality grade is ${qualityGrade}; this is a significant improvement opportunity.`);
    }
    if (conventionalCommitScore < 30) {
      anomalies.push('Conventional Commit adherence is below 30%.');
    }
  }

  if (current.dataQuality && !current.dataQuality.hasSufficientData) {
    anomalies.push('Telemetry is insufficient for high-confidence insights.');
  }

  if (current.weekdayVsWeekendRatio !== undefined && current.weekdayVsWeekendRatio < 0.5) {
    anomalies.push('Weekend-heavy coding pattern detected; review sustainability alongside quality and streak health.');
  }

  if (
    current.hourlyPattern === 'night' &&
    ['C', 'D', 'F'].includes(current.commitQualityMetrics?.qualityGrade ?? '')
  ) {
    anomalies.push(`Night coding coincides with quality grade ${current.commitQualityMetrics?.qualityGrade}.`);
  }

  if (!previous) return anomalies;

  if (previous.currentStreak > 7 && current.currentStreak === 0) {
    anomalies.push(`A ${previous.currentStreak}-day streak was broken.`);
  }

  if (previous.totalCommits > 20) {
    const commitChange = ((current.totalCommits - previous.totalCommits) / previous.totalCommits) * 100;
    if (commitChange <= -50) anomalies.push(`Commit activity decreased ${Math.round(Math.abs(commitChange))}% from the previous period.`);
    if (commitChange >= 50) anomalies.push(`Commit activity increased ${Math.round(commitChange)}% from the previous period.`);
  }

  const prevPrimaryLanguage = getPrimaryLanguage(previous);
  const currentPrimaryLanguage = getPrimaryLanguage(current);
  if (prevPrimaryLanguage && currentPrimaryLanguage && prevPrimaryLanguage !== currentPrimaryLanguage) {
    anomalies.push(`Primary language shifted from ${prevPrimaryLanguage} to ${currentPrimaryLanguage}.`);
  }

  if (
    previous.hourlyPattern && current.hourlyPattern &&
    previous.hourlyPattern !== 'mixed' && current.hourlyPattern !== 'mixed' &&
    previous.hourlyPattern !== current.hourlyPattern
  ) {
    anomalies.push(`Primary coding time shifted from ${previous.hourlyPattern} to ${current.hourlyPattern}.`);
  }

  if (previous.consistencyScore !== undefined && current.consistencyScore !== undefined) {
    const difference = current.consistencyScore - previous.consistencyScore;
    if (Math.abs(difference) > 30) {
      anomalies.push(`Consistency score ${difference > 0 ? 'increased' : 'decreased'} by ${Math.abs(difference)} points.`);
    }
  }

  if (
    previous.weekdayVsWeekendRatio !== undefined && current.weekdayVsWeekendRatio !== undefined &&
    Math.abs(current.weekdayVsWeekendRatio - previous.weekdayVsWeekendRatio) > 2
  ) {
    anomalies.push(current.weekdayVsWeekendRatio > previous.weekdayVsWeekendRatio
      ? 'Activity shifted toward weekdays.'
      : 'Activity shifted toward weekends.');
  }

  if (previous.avgCommitSize > 0 && current.avgCommitSize > 0) {
    const change = ((current.avgCommitSize - previous.avgCommitSize) / previous.avgCommitSize) * 100;
    if (Math.abs(change) > 100) {
      anomalies.push(`Average commit size ${change > 0 ? 'increased' : 'decreased'} ${Math.round(Math.abs(change))}% from the previous period.`);
    }
  }

  if (previous.commitQualityMetrics && current.commitQualityMetrics) {
    const gradeOrder = ['A', 'B', 'C', 'D', 'F'];
    const previousIndex = gradeOrder.indexOf(previous.commitQualityMetrics.qualityGrade);
    const currentIndex = gradeOrder.indexOf(current.commitQualityMetrics.qualityGrade);
    if (currentIndex > previousIndex + 1) {
      anomalies.push(`Quality grade dropped from ${previous.commitQualityMetrics.qualityGrade} to ${current.commitQualityMetrics.qualityGrade}.`);
    }
  }

  return anomalies;
}

/** Determine the overall trend from the measurements that are actually present. */
export function calculateTrend(
  current: AnalyticsSummary,
  previous?: AnalyticsSummary
): 'improving' | 'declining' | 'stable' {
  if (!previous) return 'stable';

  let score = 0;
  const commitChange = current.totalCommits - previous.totalCommits;
  if (commitChange > 10) score += 2;
  else if (commitChange < -10) score -= 2;

  if (current.consistencyScore !== undefined && previous.consistencyScore !== undefined) {
    const difference = current.consistencyScore - previous.consistencyScore;
    if (difference > 10) score += 3;
    else if (difference < -10) score -= 3;
  }

  if (current.currentStreak > previous.currentStreak) score += 2;
  else if (previous.currentStreak > 7 && current.currentStreak === 0) score -= 3;

  if (current.languageDiversity !== undefined && previous.languageDiversity !== undefined) {
    if (current.languageDiversity > previous.languageDiversity) score += 1;
    else if (current.languageDiversity < previous.languageDiversity) score -= 1;
  }

  if (current.commitQualityMetrics && previous.commitQualityMetrics) {
    const gradeOrder = ['F', 'D', 'C', 'B', 'A'];
    score += (gradeOrder.indexOf(current.commitQualityMetrics.qualityGrade) -
      gradeOrder.indexOf(previous.commitQualityMetrics.qualityGrade)) * 1.5;

    const conventionalChange = current.commitQualityMetrics.conventionalCommitScore -
      previous.commitQualityMetrics.conventionalCommitScore;
    if (conventionalChange > 20) score += 2;
    else if (conventionalChange < -20) score -= 2;
  }

  if (score >= 3) return 'improving';
  if (score <= -3) return 'declining';
  return 'stable';
}

function getPrimaryLanguage(summary: AnalyticsSummary): string | undefined {
  return Object.entries(summary.topLanguages)
    .sort(([, first], [, second]) => second - first)[0]?.[0];
}
