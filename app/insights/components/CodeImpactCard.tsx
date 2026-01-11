'use client';

import React, { useState } from 'react';
import { 
  Gauge, 
  TrendingUp, 
  RefreshCw, 
  Zap, 
  Target,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  CodeImpactMetrics, 
  getImpactRating, 
  getChurnSeverity 
} from '@/lib/analytics/code-impact-analyzer';

interface CodeImpactCardProps {
  metrics: CodeImpactMetrics | null;
  className?: string;
}

/**
 * Code Impact & Quality Card
 * 
 * "The Senior Metric" - displays:
 * - Churn Gauge (semi-circle visualization)
 * - Impact Score (0-100)
 * - Breakdown of productive vs churn work
 */
export function CodeImpactCard({ metrics, className }: CodeImpactCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  if (!metrics) {
    return (
      <div className={cn(
        "bg-slate-900/50 border border-slate-700/30 rounded-xl p-6 backdrop-blur-sm",
        className
      )}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-slate-800/50 rounded-lg">
            <Gauge className="w-5 h-5 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200">Code Impact</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 bg-slate-800/50 rounded-full flex items-center justify-center mb-3">
            <Info className="w-6 h-6 text-slate-500" />
          </div>
          <p className="text-slate-400 text-sm">No commit data available</p>
          <p className="text-slate-500 text-xs mt-1">Sync your repositories to see impact metrics</p>
        </div>
      </div>
    );
  }

  const impactRating = getImpactRating(metrics.impactScore);
  const churnSeverity = getChurnSeverity(metrics.churnRate);

  return (
    <div className={cn(
      "bg-slate-900/50 border border-slate-700/30 rounded-xl overflow-hidden backdrop-blur-sm",
      className
    )}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700/30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800/50 rounded-lg">
            <Gauge className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-medium text-slate-200">Code Impact</h3>
            <p className="text-xs text-slate-500">Measuring meaningful work vs churn</p>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="p-6">
        {/* Impact Score & Gauge Row */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Impact Score */}
          <div className="flex flex-col items-center">
            <div className="text-5xl font-bold text-slate-200 mb-2">
              {metrics.impactScore}
            </div>
            <div className={cn(
              "px-3 py-1 rounded-full text-sm font-medium border",
              impactRating.bgColor,
              impactRating.color
            )}>
              {impactRating.label}
            </div>
            <div className="text-xs text-slate-500 mt-2">Impact Score</div>
          </div>
          
          {/* Churn Gauge */}
          <div className="flex flex-col items-center">
            <ChurnGauge 
              productive={metrics.churnGauge.productive}
              refactoring={metrics.churnGauge.refactoring}
              churn={metrics.churnGauge.churn}
            />
          </div>
        </div>
        
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatBlock
            label="Productive"
            value={`${metrics.productiveRate}%`}
            icon={<Zap className="w-4 h-4 text-emerald-400" />}
            color="emerald"
          />
          <StatBlock
            label="Refactoring"
            value={`${metrics.churnGauge.refactoring}%`}
            icon={<RefreshCw className="w-4 h-4 text-blue-400" />}
            color="blue"
          />
          <StatBlock
            label="Churn"
            value={`${metrics.churnRate}%`}
            icon={<Target className="w-4 h-4 text-orange-400" />}
            color="orange"
            tooltip={churnSeverity.description}
          />
        </div>
        
        {/* Insights */}
        {metrics.insights.length > 0 && (
          <div className="space-y-2">
            {metrics.insights.slice(0, expanded ? undefined : 2).map((insight, index) => (
              <div 
                key={index}
                className="flex items-start gap-2 text-sm text-slate-300"
              >
                <span className="shrink-0">{insight.slice(0, 2)}</span>
                <span>{insight.slice(2)}</span>
              </div>
            ))}
            
            {metrics.insights.length > 2 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors mt-2"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="w-3 h-3" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" />
                    Show {metrics.insights.length - 2} more insights
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ===========================================
// Churn Gauge Component (Semi-circle)
// ===========================================

interface ChurnGaugeProps {
  productive: number;
  refactoring: number;
  churn: number;
}

function ChurnGauge({ productive, refactoring, churn }: ChurnGaugeProps) {
  // Calculate angles for semi-circle segments
  const total = productive + refactoring + churn;
  const productiveAngle = total > 0 ? (productive / total) * 180 : 60;
  const refactoringAngle = total > 0 ? (refactoring / total) * 180 : 60;
  // Churn fills the rest
  
  // SVG semi-circle gauge
  const radius = 50;
  const strokeWidth = 12;
  const circumference = Math.PI * radius;
  
  const productiveLength = (productiveAngle / 180) * circumference;
  const refactoringLength = (refactoringAngle / 180) * circumference;
  const churnLength = circumference - productiveLength - refactoringLength;
  
  return (
    <div className="relative w-32 h-20">
      <svg 
        viewBox="0 0 120 70" 
        className="w-full h-full"
        style={{ transform: 'rotate(0deg)' }}
      >
        {/* Background arc */}
        <path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-800"
        />
        
        {/* Productive segment (green) */}
        <path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none"
          stroke="url(#productive-gradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${productiveLength} ${circumference}`}
          strokeLinecap="round"
        />
        
        {/* Refactoring segment (blue) */}
        <path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none"
          stroke="url(#refactor-gradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${refactoringLength} ${circumference}`}
          strokeDashoffset={-productiveLength}
          strokeLinecap="round"
        />
        
        {/* Churn segment (orange) */}
        <path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none"
          stroke="url(#churn-gradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${churnLength} ${circumference}`}
          strokeDashoffset={-(productiveLength + refactoringLength)}
          strokeLinecap="round"
        />
        
        {/* Gradients */}
        <defs>
          <linearGradient id="productive-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <linearGradient id="refactor-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
          <linearGradient id="churn-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Center label */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 text-center">
        <div className="text-xs text-slate-500">Churn Rate</div>
      </div>
    </div>
  );
}

// ===========================================
// Stat Block Component
// ===========================================

interface StatBlockProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: 'emerald' | 'blue' | 'orange' | 'cyan' | 'purple';
  tooltip?: string;
}

function StatBlock({ label, value, icon, color, tooltip }: StatBlockProps) {
  const colorClasses = {
    emerald: 'bg-emerald-500/10 border-emerald-500/30',
    blue: 'bg-blue-500/10 border-blue-500/30',
    orange: 'bg-orange-500/10 border-orange-500/30',
    cyan: 'bg-cyan-500/10 border-cyan-500/30',
    purple: 'bg-purple-500/10 border-purple-500/30',
  };

  return (
    <div 
      className={cn(
        "rounded-lg border p-3 text-center",
        colorClasses[color]
      )}
      title={tooltip}
    >
      <div className="flex items-center justify-center gap-1 mb-1">
        {icon}
        <span className="text-lg font-bold text-slate-200">{value}</span>
      </div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}

// ===========================================
// Compact Version
// ===========================================

export function CodeImpactCardCompact({ metrics, className }: CodeImpactCardProps) {
  if (!metrics) {
    return (
      <div className={cn(
        "bg-slate-900/50 border border-slate-700/30 rounded-xl p-4",
        className
      )}>
        <div className="flex items-center gap-2 mb-2">
          <Gauge className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-300">Code Impact</span>
        </div>
        <p className="text-xs text-slate-500">No data</p>
      </div>
    );
  }

  const impactRating = getImpactRating(metrics.impactScore);

  return (
    <div className={cn(
      "bg-slate-900/50 border border-slate-700/30 rounded-xl p-4",
      className
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-medium text-slate-300">Code Impact</span>
        </div>
        <div className={cn(
          "px-2 py-1 rounded-lg border font-bold text-lg",
          impactRating.bgColor,
          impactRating.color
        )}>
          {metrics.impactScore}
        </div>
      </div>
      
      <div className="flex items-center gap-3 text-xs">
        <span className="text-emerald-400">{metrics.productiveRate}% productive</span>
        <span className="text-slate-600">•</span>
        <span className="text-orange-400">{metrics.churnRate}% churn</span>
      </div>
    </div>
  );
}
