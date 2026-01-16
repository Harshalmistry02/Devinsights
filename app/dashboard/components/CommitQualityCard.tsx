'use client';

import { FileText, BadgeCheck, AlertCircle, Ban, TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CommitQualityMetrics,
  getGradeColor,
  getGradeBgColor,
  getGradeDescription,
} from "@/lib/analytics/commit-quality-analyzer";

interface CommitQualityCardProps {
  metrics: CommitQualityMetrics | null;
  className?: string;
}

/**
 * Commit Quality Card Component
 * 
 * Displays commit message quality analysis with:
 * - Letter grade (A-F)
 * - Score breakdown bars
 * - Common commit prefixes
 * - Actionable insights
 */
export function CommitQualityCard({ metrics, className }: CommitQualityCardProps) {
  if (!metrics || metrics.totalAnalyzed === 0) {
    return (
      <div className={cn(
        "bg-slate-900/50 border border-slate-700/30 rounded-xl p-6",
        className
      )}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-slate-800/50 rounded-lg">
            <FileText className="w-5 h-5 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200">Commit Quality</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 bg-slate-800/50 rounded-full flex items-center justify-center mb-3">
            <Info className="w-6 h-6 text-slate-500" />
          </div>
          <p className="text-slate-400 text-sm">No commit data available</p>
          <p className="text-slate-500 text-xs mt-1">Sync your repositories to see quality metrics</p>
        </div>
      </div>
    );
  }

  const gradeColor = getGradeColor(metrics.qualityGrade);
  const gradeBgColor = getGradeBgColor(metrics.qualityGrade);
  const gradeDesc = getGradeDescription(metrics.qualityGrade);

  return (
    <div className={cn(
      "bg-slate-900/50 border border-slate-700/30 rounded-xl p-6 backdrop-blur-sm",
      className
    )}>
      {/* Header with Grade */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800/50 rounded-lg">
            <FileText className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-200">Commit Quality</h3>
            <p className="text-xs text-slate-500">{metrics.totalAnalyzed} commits analyzed</p>
          </div>
        </div>
        
        {/* Grade Badge */}
        <div className="flex flex-col items-center">
          <div className={cn(
            "w-16 h-16 rounded-xl flex items-center justify-center border-2 transition-all duration-300",
            gradeBgColor
          )}>
            <span className={cn("text-3xl font-bold", gradeColor)}>
              {metrics.qualityGrade}
            </span>
          </div>
          <span className={cn("text-xs mt-1 font-medium", gradeColor)}>
            {gradeDesc}
          </span>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="space-y-3 mb-6">
        <MetricBar
          label="Conventional Commits"
          value={metrics.conventionalCommitScore}
          tooltip="% of commits following conventional format (feat:, fix:, etc.)"
          color="cyan"
        />
        <MetricBar
          label="Ticket References"
          value={metrics.hasTicketReferences}
          tooltip="% of commits linking to issues (JIRA-123, #456)"
          color="purple"
        />
        <MetricBar
          label="Subject Quality"
          value={metrics.subjectLineScore}
          tooltip="% of commits with good subject length (10-72 chars)"
          color="blue"
        />
        <MetricBar
          label="Multi-line Messages"
          value={metrics.hasBodyText}
          tooltip="% of commits with detailed body text"
          color="orange"
        />
      </div>

      {/* Common Prefixes */}
      {metrics.commonPrefixes.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-slate-300 mb-2">Common Prefixes</h4>
          <div className="flex flex-wrap gap-2">
            {metrics.commonPrefixes.map((prefix, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/50 border border-slate-700/30 rounded-lg text-xs"
              >
                <span className="text-cyan-400 font-mono">{prefix.prefix}</span>
                <span className="text-slate-500">×{prefix.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      {metrics.insights.length > 0 && (
        <div className="border-t border-slate-700/30 pt-4">
          <h4 className="text-sm font-medium text-slate-300 mb-3">Insights</h4>
          <div className="space-y-2">
            {metrics.insights.map((insight, i) => {
              // Extract emoji properly (emojis are multi-byte)
              const chars = [...insight];
              const emoji = chars[0];
              const text = chars.slice(1).join('').trim();
              return (
                <div 
                  key={i} 
                  className="flex items-start gap-2 text-sm text-slate-300 leading-relaxed"
                >
                  <span className="shrink-0 text-base">{emoji}</span>
                  <span>{text}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Trend Indicator (if available) */}
      {metrics.trend && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-700/30">
          {metrics.trend.direction === 'improving' ? (
            <>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-400">
                Improving from {metrics.trend.previousGrade}
              </span>
            </>
          ) : metrics.trend.direction === 'declining' ? (
            <>
              <TrendingDown className="w-4 h-4 text-rose-400" />
              <span className="text-sm text-rose-400">
                Declining from {metrics.trend.previousGrade}
              </span>
            </>
          ) : (
            <>
              <Minus className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-400">Stable quality</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Metric Bar Component
 */
interface MetricBarProps {
  label: string;
  value: number;
  tooltip?: string;
  color?: 'cyan' | 'purple' | 'blue' | 'orange' | 'emerald';
}

function MetricBar({ label, value, tooltip, color = 'cyan' }: MetricBarProps) {
  const colorClasses = {
    cyan: 'bg-cyan-500',
    purple: 'bg-purple-500',
    blue: 'bg-blue-500',
    orange: 'bg-orange-500',
    emerald: 'bg-emerald-500',
  };
  
  const bgColorClasses = {
    cyan: 'bg-cyan-500/20',
    purple: 'bg-purple-500/20',
    blue: 'bg-blue-500/20',
    orange: 'bg-orange-500/20',
    emerald: 'bg-emerald-500/20',
  };

  const getStatusIcon = () => {
    if (value >= 70) return <span className="text-base">✅</span>;
    if (value >= 40) return <span className="text-base">⚠️</span>;
    return <span className="text-base">❌</span>;
  };

  return (
    <div className="group" title={tooltip}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          {getStatusIcon()}
          <span className="text-xs text-slate-400">{label}</span>
        </div>
        <span className="text-xs font-semibold text-slate-300 tabular-nums">
          {value}%
        </span>
      </div>
      <div className={cn("h-2 rounded-full overflow-hidden", bgColorClasses[color])}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            colorClasses[color]
          )}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Compact version for dashboard grid
 */
export function CommitQualityCardCompact({ metrics, className }: CommitQualityCardProps) {
  if (!metrics || metrics.totalAnalyzed === 0) {
    return (
      <div className={cn(
        "bg-slate-900/50 border border-slate-700/30 rounded-xl p-4",
        className
      )}>
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-300">Commit Quality</span>
        </div>
        <p className="text-xs text-slate-500">No data</p>
      </div>
    );
  }

  const gradeColor = getGradeColor(metrics.qualityGrade);
  const gradeBgColor = getGradeBgColor(metrics.qualityGrade);

  return (
    <div className={cn(
      "bg-slate-900/50 border border-slate-700/30 rounded-xl p-4",
      className
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-medium text-slate-300">Commit Quality</span>
        </div>
        <div className={cn(
          "px-2 py-1 rounded-lg border font-bold text-lg",
          gradeBgColor,
          gradeColor
        )}>
          {metrics.qualityGrade}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-500">Conventional</span>
          <span className="text-slate-300">{metrics.conventionalCommitScore}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Tickets</span>
          <span className="text-slate-300">{metrics.hasTicketReferences}%</span>
        </div>
      </div>
    </div>
  );
}
