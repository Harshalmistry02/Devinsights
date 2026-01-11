/**
 * Commit Quality Analyzer
 * 
 * Analyzes commit message quality to provide actionable insights.
 * Unique feature that most GitHub analytics don't offer.
 */

/**
 * Commit Quality Metrics interface
 * Tracks various aspects of commit message quality
 */
export interface CommitQualityMetrics {
  totalAnalyzed: number;
  averageMessageLength: number;
  conventionalCommitScore: number;  // 0-100: % following conventional commits
  hasTicketReferences: number;      // 0-100: % with JIRA/GitHub issue references
  hasBodyText: number;              // 0-100: % with multi-line messages
  subjectLineScore: number;         // 0-100: % with good subject length (< 72 chars)
  commonPrefixes: CommitPrefix[];
  qualityGrade: CommitGrade;
  insights: string[];
  trend?: QualityTrend;
}

export interface CommitPrefix {
  prefix: string;
  count: number;
  percentage: number;
}

export type CommitGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface QualityTrend {
  direction: 'improving' | 'declining' | 'stable';
  previousGrade?: CommitGrade;
  changePercent: number;
}

/**
 * Minimal commit structure for analysis
 */
export interface CommitForQualityAnalysis {
  message: string;
  authorDate?: Date;
}

// Conventional Commits regex patterns
const CONVENTIONAL_REGEX = /^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?!?:\s/i;
const CONVENTIONAL_SCOPE_REGEX = /^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)\(([^)]+)\)!?:/i;

// Ticket/Issue reference patterns
const TICKET_PATTERNS = [
  /\b([A-Z]{2,10}-\d+)\b/,           // JIRA-style: PROJ-123
  /\b#(\d{1,6})\b/,                  // GitHub-style: #123
  /\bGH-(\d{1,6})\b/i,               // Explicit GitHub: GH-123
  /\bissues?\/(\d+)\b/i,             // issues/123
  /\bfix(?:es|ed)?\s+#(\d+)\b/i,     // fixes #123
  /\bclose[sd]?\s+#(\d+)\b/i,        // closes #123
  /\bresolve[sd]?\s+#(\d+)\b/i,      // resolves #123
];

// Merge commit patterns (to exclude from analysis)
const MERGE_PATTERNS = [
  /^Merge (pull request|branch|remote)/i,
  /^Merge '.+' into/i,
  /^Merged in .+/i,
  /^Automatic merge/i,
];

/**
 * Check if a commit message follows conventional commits format
 */
function isConventionalCommit(message: string): boolean {
  return CONVENTIONAL_REGEX.test(message.split('\n')[0]);
}

/**
 * Extract conventional commit type and scope
 */
function getConventionalParts(message: string): { type: string; scope?: string } | null {
  const firstLine = message.split('\n')[0];
  const match = firstLine.match(CONVENTIONAL_SCOPE_REGEX);
  
  if (match) {
    return { type: match[1].toLowerCase(), scope: match[2] };
  }
  
  const simpleMatch = firstLine.match(/^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert):/i);
  if (simpleMatch) {
    return { type: simpleMatch[1].toLowerCase() };
  }
  
  return null;
}

/**
 * Check if message references a ticket/issue
 */
function hasTicketReference(message: string): boolean {
  return TICKET_PATTERNS.some(pattern => pattern.test(message));
}

/**
 * Check if message has a body (multi-line)
 */
function hasMessageBody(message: string): boolean {
  const lines = message.split('\n').filter(line => line.trim().length > 0);
  return lines.length > 1;
}

/**
 * Check if message is a merge commit
 */
function isMergeCommit(message: string): boolean {
  return MERGE_PATTERNS.some(pattern => pattern.test(message));
}

/**
 * Get subject line (first line) length
 */
function getSubjectLength(message: string): number {
  return message.split('\n')[0].trim().length;
}

/**
 * Calculate quality grade from component scores
 */
function calculateGrade(scores: {
  conventional: number;
  ticket: number;
  body: number;
  subject: number;
}): CommitGrade {
  // Weighted scoring:
  // - Conventional commits: 40% (most important for consistency)
  // - Ticket references: 30% (traceability)
  // - Subject line quality: 20% (readability)
  // - Body text: 10% (context)
  const weightedScore = 
    scores.conventional * 0.40 +
    scores.ticket * 0.30 +
    scores.subject * 0.20 +
    scores.body * 0.10;
  
  if (weightedScore >= 85) return 'A';
  if (weightedScore >= 70) return 'B';
  if (weightedScore >= 55) return 'C';
  if (weightedScore >= 40) return 'D';
  return 'F';
}

/**
 * Generate actionable insights based on scores
 */
function generateInsights(
  metrics: {
    conventionalScore: number;
    ticketScore: number;
    bodyScore: number;
    subjectScore: number;
    avgLength: number;
    grade: CommitGrade;
  }
): string[] {
  const insights: string[] = [];
  
  // Grade-based lead insight
  if (metrics.grade === 'A') {
    insights.push('✨ Excellent commit discipline! Your messages are clear and consistent.');
  } else if (metrics.grade === 'B') {
    insights.push('👍 Good commit quality! A few tweaks could make it even better.');
  }
  
  // Conventional commits insight
  if (metrics.conventionalScore < 30) {
    insights.push('🎯 Consider adopting conventional commits (feat:, fix:, docs:) for better changelog generation and team clarity.');
  } else if (metrics.conventionalScore < 60) {
    insights.push('📋 You\'re using conventional commits sometimes. Try to use them consistently for all commits.');
  }
  
  // Ticket reference insight
  if (metrics.ticketScore < 20) {
    insights.push('🔗 Link commits to issues/tickets (JIRA-123, #456) for better traceability and project management.');
  } else if (metrics.ticketScore >= 70) {
    insights.push('🎫 Great job linking commits to issues! This helps with project tracking.');
  }
  
  // Subject line insight
  if (metrics.subjectScore < 50) {
    insights.push('📏 Keep commit subjects under 50-72 characters for better readability in git log.');
  }
  
  // Body text insight
  if (metrics.bodyScore < 20) {
    insights.push('📝 Add commit body text for complex changes to explain the "why" behind your code.');
  }
  
  // Average length insight
  if (metrics.avgLength < 15) {
    insights.push('💬 Commit messages are quite short. More descriptive messages help future debugging.');
  } else if (metrics.avgLength > 100) {
    insights.push('📐 Consider moving detailed explanations to the commit body, keeping the subject concise.');
  }
  
  // Limit to top 5 insights
  return insights.slice(0, 5);
}

/**
 * Main function: Analyze commit quality from an array of commits
 * 
 * @param commits - Array of commits with at least a message property
 * @returns CommitQualityMetrics with scores, grade, and insights
 */
export function analyzeCommitQuality(
  commits: CommitForQualityAnalysis[]
): CommitQualityMetrics {
  // Filter out merge commits for more accurate analysis
  const regularCommits = commits.filter(c => !isMergeCommit(c.message));
  
  if (regularCommits.length === 0) {
    return {
      totalAnalyzed: 0,
      averageMessageLength: 0,
      conventionalCommitScore: 0,
      hasTicketReferences: 0,
      hasBodyText: 0,
      subjectLineScore: 0,
      commonPrefixes: [],
      qualityGrade: 'F',
      insights: ['No regular commits found to analyze (merge commits are excluded).'],
    };
  }
  
  let conventionalCount = 0;
  let ticketCount = 0;
  let multilineCount = 0;
  let goodSubjectCount = 0;
  let totalLength = 0;
  const prefixCounts: Record<string, number> = {};
  
  for (const commit of regularCommits) {
    const message = commit.message || '';
    const firstLine = message.split('\n')[0];
    
    // Conventional commit check
    if (isConventionalCommit(message)) {
      conventionalCount++;
      const parts = getConventionalParts(message);
      if (parts) {
        const prefix = parts.scope ? `${parts.type}(${parts.scope})` : parts.type;
        prefixCounts[prefix] = (prefixCounts[prefix] || 0) + 1;
      }
    }
    
    // Ticket reference check
    if (hasTicketReference(message)) {
      ticketCount++;
    }
    
    // Multi-line check
    if (hasMessageBody(message)) {
      multilineCount++;
    }
    
    // Subject line length check (good: 20-72 chars)
    const subjectLen = getSubjectLength(message);
    if (subjectLen >= 10 && subjectLen <= 72) {
      goodSubjectCount++;
    }
    
    // Length tracking
    totalLength += firstLine.length;
  }
  
  const count = regularCommits.length;
  const avgLength = Math.round(totalLength / count);
  const conventionalScore = Math.round((conventionalCount / count) * 100);
  const ticketScore = Math.round((ticketCount / count) * 100);
  const bodyScore = Math.round((multilineCount / count) * 100);
  const subjectScore = Math.round((goodSubjectCount / count) * 100);
  
  // Calculate overall grade
  const grade = calculateGrade({
    conventional: conventionalScore,
    ticket: ticketScore,
    body: bodyScore,
    subject: subjectScore,
  });
  
  // Build prefix leaderboard
  const commonPrefixes: CommitPrefix[] = Object.entries(prefixCounts)
    .map(([prefix, cnt]) => ({
      prefix,
      count: cnt,
      percentage: Math.round((cnt / count) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  // Generate insights
  const insights = generateInsights({
    conventionalScore,
    ticketScore,
    bodyScore,
    subjectScore,
    avgLength,
    grade,
  });
  
  return {
    totalAnalyzed: count,
    averageMessageLength: avgLength,
    conventionalCommitScore: conventionalScore,
    hasTicketReferences: ticketScore,
    hasBodyText: bodyScore,
    subjectLineScore: subjectScore,
    commonPrefixes,
    qualityGrade: grade,
    insights,
  };
}

/**
 * Get grade color for UI
 */
export function getGradeColor(grade: CommitGrade): string {
  const colors: Record<CommitGrade, string> = {
    A: 'text-emerald-400',
    B: 'text-blue-400',
    C: 'text-yellow-400',
    D: 'text-orange-400',
    F: 'text-rose-400',
  };
  return colors[grade];
}

/**
 * Get grade background color for UI badges
 */
export function getGradeBgColor(grade: CommitGrade): string {
  const colors: Record<CommitGrade, string> = {
    A: 'bg-emerald-500/20 border-emerald-500/30',
    B: 'bg-blue-500/20 border-blue-500/30',
    C: 'bg-yellow-500/20 border-yellow-500/30',
    D: 'bg-orange-500/20 border-orange-500/30',
    F: 'bg-rose-500/20 border-rose-500/30',
  };
  return colors[grade];
}

/**
 * Get human-readable grade description
 */
export function getGradeDescription(grade: CommitGrade): string {
  const descriptions: Record<CommitGrade, string> = {
    A: 'Excellent',
    B: 'Good',
    C: 'Fair',
    D: 'Needs Work',
    F: 'Poor',
  };
  return descriptions[grade];
}

/**
 * Analyze recent commits only (last N days)
 */
export function analyzeRecentCommitQuality(
  commits: CommitForQualityAnalysis[],
  daysBack: number = 30
): CommitQualityMetrics {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);
  
  const recentCommits = commits.filter(c => {
    if (!c.authorDate) return true; // Include if no date
    return c.authorDate >= cutoffDate;
  });
  
  return analyzeCommitQuality(recentCommits);
}

/**
 * Compare quality between two periods
 */
export function compareQualityPeriods(
  currentMetrics: CommitQualityMetrics,
  previousMetrics: CommitQualityMetrics
): QualityTrend {
  const gradeValues: Record<CommitGrade, number> = {
    A: 5, B: 4, C: 3, D: 2, F: 1
  };
  
  const currentValue = gradeValues[currentMetrics.qualityGrade];
  const previousValue = gradeValues[previousMetrics.qualityGrade];
  
  const diff = currentValue - previousValue;
  const changePercent = previousValue > 0 
    ? ((currentValue - previousValue) / previousValue) * 100 
    : 0;
  
  let direction: 'improving' | 'declining' | 'stable' = 'stable';
  if (diff > 0) direction = 'improving';
  else if (diff < 0) direction = 'declining';
  
  return {
    direction,
    previousGrade: previousMetrics.qualityGrade,
    changePercent: Math.round(changePercent),
  };
}
