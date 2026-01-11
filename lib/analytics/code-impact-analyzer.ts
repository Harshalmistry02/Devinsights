/**
 * Code Impact & Churn Analyzer
 * 
 * Analyzes code changes to measure impact vs churn:
 * - Productive Code: New features and meaningful refactoring
 * - Churn: Rework on recently modified code
 * - Impact Score: Weighted calculation based on code patterns
 */

import { Commit } from '@prisma/client';

// ===========================================
// Type Definitions
// ===========================================

export interface CodeImpactMetrics {
  // Core metrics
  impactScore: number;          // 0-100: Overall impact quality
  churnRate: number;            // 0-100: % of changes that are churn
  productiveRate: number;       // 0-100: % of productive changes
  
  // Breakdown
  churnGauge: {
    productive: number;
    refactoring: number;
    churn: number;
  };
  
  // Derived insights
  commitSizeConsistency: number; // 0-100: How consistent commit sizes are
  avgNetChange: number;          // Average (additions - deletions)
  addDeleteRatio: number;        // additions / (additions + deletions)
  
  // Categories
  commitCategories: CommitCategory;
  
  // Insights
  insights: string[];
}

export interface CommitCategory {
  feature: number;      // Primarily additions
  refactor: number;     // Balanced add/delete
  fix: number;          // Small changes
  cleanup: number;      // Primarily deletions
  maintenance: number;  // Very small changes
}

export interface CommitForImpactAnalysis {
  sha: string;
  additions: number;
  deletions: number;
  filesChanged: number;
  authorDate: Date;
  repositoryId?: string;
}

// ===========================================
// Main Analyzer
// ===========================================

/**
 * Analyze code impact from commit data
 * This should be run during sync/snapshot generation
 */
export function analyzeCodeImpact(
  commits: CommitForImpactAnalysis[]
): CodeImpactMetrics {
  if (commits.length === 0) {
    return {
      impactScore: 0,
      churnRate: 0,
      productiveRate: 0,
      churnGauge: { productive: 0, refactoring: 0, churn: 0 },
      commitSizeConsistency: 0,
      avgNetChange: 0,
      addDeleteRatio: 0.5,
      commitCategories: { feature: 0, refactor: 0, fix: 0, cleanup: 0, maintenance: 0 },
      insights: ['No commits to analyze'],
    };
  }

  // Calculate basic metrics
  const totalAdditions = commits.reduce((sum, c) => sum + c.additions, 0);
  const totalDeletions = commits.reduce((sum, c) => sum + c.deletions, 0);
  const totalChanges = totalAdditions + totalDeletions;
  
  // Avoid division by zero
  const addDeleteRatio = totalChanges > 0 
    ? totalAdditions / totalChanges 
    : 0.5;
  
  // Calculate average net change (positive = growing, negative = shrinking)
  const avgNetChange = Math.round(
    commits.reduce((sum, c) => sum + (c.additions - c.deletions), 0) / commits.length
  );
  
  // Calculate commit size consistency (coefficient of variation)
  const commitSizes = commits.map(c => c.additions + c.deletions);
  const avgSize = commitSizes.reduce((sum, s) => sum + s, 0) / commitSizes.length;
  const variance = commitSizes.reduce((sum, s) => sum + Math.pow(s - avgSize, 2), 0) / commitSizes.length;
  const stdDev = Math.sqrt(variance);
  const cv = avgSize > 0 ? stdDev / avgSize : 0;
  const commitSizeConsistency = Math.max(0, Math.min(100, 100 - (cv * 40)));
  
  // Categorize commits
  const categories = categorizeCommits(commits);
  
  // Calculate churn (modifications to recently touched code)
  const churnAnalysis = calculateChurn(commits);
  
  // Calculate churn gauge breakdown
  const churnGauge = calculateChurnGauge(categories, churnAnalysis.churnRate);
  
  // Calculate final impact score
  const impactScore = calculateImpactScore({
    addDeleteRatio,
    commitSizeConsistency,
    categories,
    churnRate: churnAnalysis.churnRate,
  });
  
  // Generate insights
  const insights = generateImpactInsights({
    impactScore,
    churnRate: churnAnalysis.churnRate,
    addDeleteRatio,
    commitSizeConsistency,
    categories,
    avgNetChange,
  });

  return {
    impactScore: Math.round(impactScore),
    churnRate: Math.round(churnAnalysis.churnRate),
    productiveRate: Math.round(100 - churnAnalysis.churnRate),
    churnGauge,
    commitSizeConsistency: Math.round(commitSizeConsistency),
    avgNetChange,
    addDeleteRatio: Math.round(addDeleteRatio * 100) / 100,
    commitCategories: categories,
    insights,
  };
}

// ===========================================
// Helper Functions
// ===========================================

/**
 * Categorize commits by their change patterns
 */
function categorizeCommits(commits: CommitForImpactAnalysis[]): CommitCategory {
  const categories: CommitCategory = {
    feature: 0,
    refactor: 0,
    fix: 0,
    cleanup: 0,
    maintenance: 0,
  };
  
  for (const commit of commits) {
    const total = commit.additions + commit.deletions;
    const ratio = total > 0 ? commit.additions / total : 0.5;
    
    if (total <= 10) {
      // Very small changes: maintenance tweaks
      categories.maintenance++;
    } else if (total <= 50 && commit.filesChanged <= 3) {
      // Small targeted changes: likely fixes
      categories.fix++;
    } else if (ratio > 0.8) {
      // Primarily additions: new features
      categories.feature++;
    } else if (ratio < 0.3) {
      // Primarily deletions: cleanup
      categories.cleanup++;
    } else {
      // Balanced changes: refactoring
      categories.refactor++;
    }
  }
  
  return categories;
}

/**
 * Calculate code churn (rework on recent code)
 * Uses time-based heuristics since we don't have file-level history
 */
function calculateChurn(commits: CommitForImpactAnalysis[]): { churnRate: number } {
  if (commits.length < 2) {
    return { churnRate: 0 };
  }
  
  // Sort commits by date
  const sorted = [...commits].sort((a, b) => 
    new Date(a.authorDate).getTime() - new Date(b.authorDate).getTime()
  );
  
  // Group commits by repository and day
  const commitsByRepoDay = new Map<string, CommitForImpactAnalysis[]>();
  
  for (const commit of sorted) {
    const repoId = commit.repositoryId || 'default';
    const dateKey = new Date(commit.authorDate).toISOString().split('T')[0];
    const key = `${repoId}-${dateKey}`;
    
    if (!commitsByRepoDay.has(key)) {
      commitsByRepoDay.set(key, []);
    }
    commitsByRepoDay.get(key)!.push(commit);
  }
  
  // Count "churn" commits - multiple commits to same repo in short time
  // with high deletion ratios suggest rework
  let churnCommits = 0;
  let totalAnalyzed = 0;
  
  for (const [, dayCommits] of commitsByRepoDay) {
    if (dayCommits.length > 1) {
      // Multiple commits same day = potential churn indicator
      for (let i = 1; i < dayCommits.length; i++) {
        const commit = dayCommits[i];
        const total = commit.additions + commit.deletions;
        if (total > 0) {
          const delRatio = commit.deletions / total;
          // If subsequent commit has high deletions, likely fixing previous
          if (delRatio > 0.4 && commit.deletions > 10) {
            churnCommits++;
          }
          totalAnalyzed++;
        }
      }
    }
    // First commit of day is always "productive"
    totalAnalyzed += 1;
  }
  
  const churnRate = totalAnalyzed > 0 ? (churnCommits / totalAnalyzed) * 100 : 0;
  
  return { churnRate: Math.min(churnRate * 2, 50) }; // Scale up but cap at 50%
}

/**
 * Calculate churn gauge breakdown for visualization
 */
function calculateChurnGauge(
  categories: CommitCategory, 
  churnRate: number
): { productive: number; refactoring: number; churn: number } {
  const total = Object.values(categories).reduce((sum, v) => sum + v, 0);
  if (total === 0) {
    return { productive: 0, refactoring: 0, churn: 0 };
  }
  
  // Productive = features + fixes
  const productiveCommits = categories.feature + categories.fix;
  // Refactoring = refactor + cleanup
  const refactoringCommits = categories.refactor + categories.cleanup;
  // Maintenance is neutral
  
  return {
    productive: Math.round((productiveCommits / total) * 100),
    refactoring: Math.round((refactoringCommits / total) * 100),
    churn: Math.round(churnRate),
  };
}

/**
 * Calculate overall impact score
 */
function calculateImpactScore(params: {
  addDeleteRatio: number;
  commitSizeConsistency: number;
  categories: CommitCategory;
  churnRate: number;
}): number {
  const { addDeleteRatio, commitSizeConsistency, categories, churnRate } = params;
  
  const total = Object.values(categories).reduce((sum, v) => sum + v, 0);
  if (total === 0) return 0;
  
  // Feature commits are most valuable
  const featureScore = (categories.feature / total) * 40;
  
  // Balanced ratio is good (not too much deletion spam, not just growth)
  // Optimal ratio is around 0.6-0.7 (growing but thoughtful)
  const ratioScore = (1 - Math.abs(addDeleteRatio - 0.65) * 2) * 20;
  
  // Consistency is rewarded
  const consistencyScore = (commitSizeConsistency / 100) * 20;
  
  // Low churn is good
  const noChurnScore = ((100 - churnRate) / 100) * 20;
  
  return Math.max(0, Math.min(100, 
    featureScore + ratioScore + consistencyScore + noChurnScore
  ));
}

/**
 * Generate actionable insights
 */
function generateImpactInsights(params: {
  impactScore: number;
  churnRate: number;
  addDeleteRatio: number;
  commitSizeConsistency: number;
  categories: CommitCategory;
  avgNetChange: number;
}): string[] {
  const insights: string[] = [];
  const { 
    impactScore, 
    churnRate, 
    addDeleteRatio, 
    commitSizeConsistency, 
    categories,
    avgNetChange 
  } = params;
  
  // Impact score lead insight
  if (impactScore >= 80) {
    insights.push('🚀 Excellent impact! Your code changes show high productivity with minimal churn.');
  } else if (impactScore >= 60) {
    insights.push('👍 Good code impact. Most changes are productive and purposeful.');
  } else if (impactScore < 40) {
    insights.push('⚠️ Impact score could improve. Consider focusing on larger, purposeful changes.');
  }
  
  // Churn insight
  if (churnRate > 30) {
    insights.push('🔄 High churn detected. You might be revisiting recent changes frequently.');
  } else if (churnRate < 10) {
    insights.push('✅ Low churn rate - your changes are stable and well-planned.');
  }
  
  // Add/Delete ratio insight
  if (addDeleteRatio > 0.8) {
    insights.push('📈 Heavy on additions. Consider periodic cleanup to manage technical debt.');
  } else if (addDeleteRatio < 0.4) {
    insights.push('🧹 Heavy cleanup phase detected. Good for reducing tech debt!');
  }
  
  // Consistency insight
  if (commitSizeConsistency < 40) {
    insights.push('📊 Commit sizes vary widely. Consider breaking large changes into smaller commits.');
  }
  
  // Category insight
  const total = Object.values(categories).reduce((sum, v) => sum + v, 0);
  if (total > 0) {
    const featurePercent = (categories.feature / total) * 100;
    if (featurePercent > 50) {
      insights.push('🌟 Feature-focused development pattern - great for shipping new functionality!');
    } else if (categories.refactor > categories.feature) {
      insights.push('🔧 Refactoring focus - improving code quality is valuable!');
    }
  }
  
  return insights.slice(0, 4);
}

/**
 * Get impact score rating
 */
export function getImpactRating(score: number): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (score >= 80) {
    return { label: 'Excellent', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20 border-emerald-500/30' };
  }
  if (score >= 60) {
    return { label: 'Good', color: 'text-cyan-400', bgColor: 'bg-cyan-500/20 border-cyan-500/30' };
  }
  if (score >= 40) {
    return { label: 'Fair', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20 border-yellow-500/30' };
  }
  if (score >= 20) {
    return { label: 'Needs Work', color: 'text-orange-400', bgColor: 'bg-orange-500/20 border-orange-500/30' };
  }
  return { label: 'Low Impact', color: 'text-rose-400', bgColor: 'bg-rose-500/20 border-rose-500/30' };
}

/**
 * Get churn severity
 */
export function getChurnSeverity(rate: number): {
  label: string;
  description: string;
  color: string;
} {
  if (rate < 10) {
    return { label: 'Minimal', description: 'Very stable code changes', color: 'text-emerald-400' };
  }
  if (rate < 20) {
    return { label: 'Low', description: 'Normal rework levels', color: 'text-cyan-400' };
  }
  if (rate < 35) {
    return { label: 'Moderate', description: 'Some code churn detected', color: 'text-yellow-400' };
  }
  return { label: 'High', description: 'Significant rework', color: 'text-rose-400' };
}
