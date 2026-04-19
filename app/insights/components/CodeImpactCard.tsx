'use client';

import React, { useState } from 'react';
import { 
  Gauge, 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  CodeImpactMetrics, 
  getImpactRating, 
} from '@/lib/analytics/code-impact-analyzer';

interface CodeImpactCardProps {
  metrics: CodeImpactMetrics | null;
  className?: string;
}

/**
 * Code Impact & Quality Card - SpaceX Industrial Design
 */
export function CodeImpactCard({ metrics, className }: CodeImpactCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  if (!metrics) {
    return (
      <div className={cn(
        "brutalist-glass p-8 sm:p-16 text-center border-white/5",
        className
      )}>
        <Gauge className="w-16 h-16 opacity-10 mx-auto mb-8" />
        <h3 className="text-caption-bold text-lg opacity-40 mb-4 tracking-widest uppercase">METRIC DATABASE EMPTY</h3>
        <p className="text-micro opacity-20 uppercase tracking-[2px]">SYNC REPOSITORIES TO INITIALIZE IMPACT ANALYSIS</p>
      </div>
    );
  }

  const impactRating = getImpactRating(metrics.impactScore);

  return (
    <div className={cn(
      "brutalist-glass p-5 sm:p-8 border-l-2 border-l-white/10",
      className
    )}>
      {/* Header */}
      <div className="py-4 border-b border-white/5 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/5 opacity-40">
            <Gauge className="w-6 h-6 text-[#f0f0fa]" />
          </div>
          <div>
            <h3 className="text-caption-bold text-sm tracking-widest uppercase opacity-80">CODE IMPACT ANALYSIS</h3>
            <p className="text-micro opacity-20 uppercase tracking-widest mt-1">MEANINGFUL PRODUCTION VS SYSTEM CHURN</p>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="py-2">
        {/* Impact Score & Gauge Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 mb-10 sm:mb-12 items-center">
          {/* Impact Score */}
          <div className="text-center md:text-left">
             <div className="text-micro opacity-30 uppercase tracking-[4px] mb-4">IMPACT COEFFICIENT</div>
            <div className="text-display-hero text-6xl sm:text-7xl font-bold opacity-80 mb-6 font-mono tracking-tighter">
              {metrics.impactScore}
            </div>
            <div className={cn(
              "inline-block px-5 py-2 text-micro font-bold border border-white/10",
              "uppercase tracking-[3px]",
            )}>
              STRETCH: {impactRating.label.toUpperCase()}
            </div>
          </div>
          
          {/* Churn Gauge */}
          <div className="flex flex-col items-center justify-center">
            <ChurnGauge 
              productive={metrics.productiveRate}
              refactoring={metrics.churnGauge.refactoring}
              churn={metrics.churnRate}
            />
            <div className="mt-6 text-micro opacity-20 uppercase tracking-[3px]">CHURN GRADIENT</div>
          </div>
        </div>
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="brutalist-glass p-6 border-l-2 border-l-white/10">
            <p className="text-micro opacity-20 mb-3 tracking-[2px] uppercase">PRODUCTIVE</p>
            <p className="text-3xl font-bold opacity-80 tabular-nums font-mono">{metrics.productiveRate}%</p>
          </div>
          <div className="brutalist-glass p-6 border-l-2 border-l-white/10">
            <p className="text-micro opacity-20 mb-3 tracking-[2px] uppercase">REFACTORING</p>
            <p className="text-3xl font-bold opacity-80 tabular-nums font-mono">{metrics.churnGauge.refactoring}%</p>
          </div>
          <div className="brutalist-glass p-6 border-l-2 border-l-white/10">
            <p className="text-micro opacity-20 mb-3 tracking-[2px] uppercase">SYSTEM CHURN</p>
            <p className="text-3xl font-bold opacity-80 tabular-nums font-mono">{metrics.churnRate}%</p>
          </div>
        </div>
        
        {/* Insights */}
        {metrics.insights.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-white/5">
             <div className="text-micro opacity-20 uppercase tracking-[2px] mb-2">ARCHIVE OBSERVATIONS:</div>
            {metrics.insights.slice(0, expanded ? undefined : 2).map((insight, index) => (
              <div 
                key={index}
                className="flex items-start gap-4 text-micro opacity-40 hover:opacity-100 transition-opacity uppercase tracking-widest leading-relaxed"
              >
                <span className="shrink-0 w-8 h-px bg-white/20 mt-2" />
                <span>{insight.toUpperCase()}</span>
              </div>
            ))}
            
            {metrics.insights.length > 2 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-micro opacity-30 hover:opacity-100 transition-all mt-4 uppercase tracking-[3px] border-b border-dashed border-white/10 pb-1"
              >
                {expanded ? "COLLAPSE ARCHIVE" : `EXPAND ${metrics.insights.length - 2} ADDITIONAL OBSERVATIONS`}
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

function ChurnGauge({ productive, refactoring, churn }: { productive: number, refactoring: number, churn: number }) {
  const total = productive + refactoring + churn;
  const pAngle = total > 0 ? (productive / total) * 180 : 60;
  const rAngle = total > 0 ? (refactoring / total) * 180 : 60;
  
  const radius = 50;
  const strokeWidth = 14;
  const circumference = Math.PI * radius;
  
  const pLen = (pAngle / 180) * circumference;
  const rLen = (rAngle / 180) * circumference;
  const cLen = circumference - pLen - rLen;
  
  return (
    <div className="relative w-48 h-28">
      <svg 
        viewBox="0 0 120 70" 
        className="w-full h-full"
      >
        <path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none"
          stroke="white"
          strokeWidth={strokeWidth}
          className="opacity-5"
        />
        
        {/* Productive segment */}
        <path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none"
          stroke="white"
          strokeWidth={strokeWidth}
          strokeDasharray={`${pLen} ${circumference}`}
          strokeOpacity={0.6}
        />
        
        {/* Refactoring segment */}
        <path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none"
          stroke="white"
          strokeWidth={strokeWidth}
          strokeDasharray={`${rLen} ${circumference}`}
          strokeDashoffset={-pLen}
          strokeOpacity={0.25}
        />
        
        {/* Churn segment */}
        <path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none"
          stroke="white"
          strokeWidth={strokeWidth}
          strokeDasharray={`${cLen} ${circumference}`}
          strokeDashoffset={-(pLen + rLen)}
          strokeOpacity={0.1}
        />
      </svg>
      
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2 text-center">
        <div className="text-3xl font-bold opacity-80 font-mono tracking-tighter">{Math.round(churn)}%</div>
      </div>
    </div>
  );
}

// ===========================================
// Compact Version
// ===========================================

export function CodeImpactCardCompact({ metrics, className }: CodeImpactCardProps) {
  if (!metrics) return null;

  return (
    <div className={cn("py-6 border-t border-white/5", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Gauge className="w-4 h-4 opacity-40 text-[#f0f0fa]" />
          <span className="text-micro uppercase tracking-widest opacity-40">CODE IMPACT</span>
        </div>
        <div className="text-2xl font-bold opacity-80 tracking-widest font-mono">
          {metrics.impactScore}
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-micro uppercase tracking-widest opacity-20">
        <span className="opacity-60">{metrics.productiveRate}% PROD</span>
        <span className="opacity-60">{metrics.churnRate}% CHURN</span>
      </div>
    </div>
  );
}
