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
        "brutalist-glass p-12 text-center",
        className
      )}>
        <Gauge className="w-12 h-12 opacity-20 mx-auto mb-6" />
        <h3 className="text-display-hero text-xl opacity-80 mb-3 tracking-widest">NO IMPACT DATA</h3>
        <p className="text-micro opacity-40 uppercase tracking-[2px]">SYNC YOUR REPOSITORIES TO SEE IMPACT METRICS</p>
      </div>
    );
  }

  const impactRating = getImpactRating(metrics.impactScore);
  const churnSeverity = getChurnSeverity(metrics.churnRate);

  return (
    <div className={cn(
      "brutalist-glass p-8",
      className
    )}>
      {/* Header */}
      <div className="py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 opacity-30">
            <Gauge className="w-5 h-5 text-[#f0f0fa]" />
          </div>
          <div>
            <h3 className="text-caption-bold text-sm tracking-widest">CODE IMPACT</h3>
            <p className="text-micro opacity-50 uppercase tracking-widest">MEASURING MEANINGFUL WORK VS CHURN</p>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="py-2">
        {/* Impact Score & Gauge Row */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Impact Score */}
          <div className="flex flex-col items-center">
            <div className="text-section-head text-5xl font-bold opacity-80 mb-2">
              {metrics.impactScore}
            </div>
            <div className={cn(
              "px-3 py-1 text-sm font-medium border border-[rgba(240,240,250,0.35)]",
              "uppercase tracking-widest text-shadow-glow",
            )}>
              {impactRating.label}
            </div>
            <div className="text-micro opacity-50 mt-2 tracking-widest uppercase">IMPACT SCORE</div>
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
        <div className="grid grid-cols-3 gap-8">
          <div className="border-l-2 border-[rgba(240,240,250,0.1)] pl-4">
            <p className="text-micro opacity-40 mb-2 tracking-[2px]">PRODUCTIVE</p>
            <p className="text-display-hero text-2xl opacity-90 tabular-nums">{metrics.productiveRate}%</p>
          </div>
          <div className="border-l-2 border-[rgba(240,240,250,0.1)] pl-4">
            <p className="text-micro opacity-40 mb-2 tracking-[2px]">REFACTORING</p>
            <p className="text-display-hero text-2xl opacity-90 tabular-nums">{metrics.churnGauge.refactoring}%</p>
          </div>
          <div className="border-l-2 border-[rgba(240,240,250,0.1)] pl-4">
            <p className="text-micro opacity-40 mb-2 tracking-[2px]">CHURN</p>
            <p className="text-display-hero text-2xl opacity-90 tabular-nums">{metrics.churnRate}%</p>
          </div>
        </div>
        
        {/* Insights */}
        {metrics.insights.length > 0 && (
          <div className="space-y-2">
            {metrics.insights.slice(0, expanded ? undefined : 2).map((insight, index) => (
              <div 
                key={index}
                className="flex items-start gap-2 text-micro opacity-80 tracking-widest uppercase"
              >
                <span className="shrink-0">{insight.slice(0, 2)}</span>
                <span>{insight.slice(2)}</span>
              </div>
            ))}
            
            {metrics.insights.length > 2 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-micro text-[#f0f0fa] hover:text-[#f0f0fa] transition-colors mt-2 uppercase tracking-widest"
              >
                {expanded ? (
                  <>
                     SHOW LESS
                  </>
                ) : (
                  <>
                     SHOW {metrics.insights.length - 2} MORE INSIGHTS
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
          className="opacity-80"
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
        
        {/* Center label */}
        <defs>
          <linearGradient id="productive-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f0f0fa" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#f0f0fa" stopOpacity={0.7} />
          </linearGradient>
          <linearGradient id="refactor-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f0f0fa" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#f0f0fa" stopOpacity={0.3} />
          </linearGradient>
          <linearGradient id="churn-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f0f0fa" stopOpacity={0.1} />
            <stop offset="100%" stopColor="#f0f0fa" stopOpacity={0.05} />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Center label */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 text-center">
        <div className="text-xs opacity-80">Churn Rate</div>
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
        " border p-3 text-center",
        colorClasses[color]
      )}
      title={tooltip}
    >
      <div className="flex items-center justify-center gap-1 mb-1">
        {icon}
        <span className="text-lg font-bold opacity-80">{value}</span>
      </div>
      <div className="text-xs opacity-80">{label}</div>
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
        " bg-transparent py-4",
        className
      )}>
        <div className="flex items-center gap-2 mb-2">
          <Gauge className="w-4 h-4 opacity-80" />
          <span className="text-sm font-medium opacity-80">Code Impact</span>
        </div>
        <p className="text-xs opacity-80">No data</p>
      </div>
    );
  }

  const impactRating = getImpactRating(metrics.impactScore);

  return (
    <div className={cn(
      " bg-transparent py-4",
      className
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-[#f0f0fa]" />
          <span className="text-sm font-medium opacity-80">Code Impact</span>
        </div>
        <div className={cn(
          "px-2 py-1  border font-bold text-lg",
          impactRating.bgColor,
          impactRating.color
        )}>
          {metrics.impactScore}
        </div>
      </div>
      
      <div className="flex items-center gap-3 text-xs">
        <span className="text-emerald-400">{metrics.productiveRate}% productive</span>
        <span className="opacity-80">•</span>
        <span className="text-orange-400">{metrics.churnRate}% churn</span>
      </div>
    </div>
  );
}
