'use client';

import React from 'react';

// Define quota limits directly to avoid importing server-side code
const QUOTA_LIMITS = {
  safeTokenBudget: 12000,
  maxRequestsPerDay: 25,
} as const;

interface QuotaDisplayProps {
  tokensUsed: number;
  requestsCount: number;
  resetAt?: Date;
  compact?: boolean;
}

export function QuotaDisplay({ tokensUsed, requestsCount, resetAt, compact = false }: QuotaDisplayProps) {
  const percentUsed = Math.round((tokensUsed / QUOTA_LIMITS.safeTokenBudget) * 100);
  const requestsPercent = Math.round((requestsCount / QUOTA_LIMITS.maxRequestsPerDay) * 100);
  
  if (compact) {
    return (
      <div className="flex items-center gap-4 text-micro uppercase tracking-widest opacity-40 group">
        <div className="flex items-center gap-2">
          <div className="h-1 w-12 bg-white/5 overflow-hidden">
            <div 
              className="h-full bg-white opacity-40 transition-all duration-700"
              style={{ width: `${Math.min(percentUsed, 100)}%` }}
            />
          </div>
          <span className="font-mono">
            {requestsCount}/{QUOTA_LIMITS.maxRequestsPerDay}
          </span>
        </div>
        <span className="opacity-20 group-hover:opacity-40 transition-opacity">RESOURCES</span>
      </div>
    );
  }

  return (
    <div className="brutalist-glass p-6 border-l-2 border-l-white/10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/5 opacity-40">
             <svg className="h-4 w-4 text-[#f0f0fa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
             </svg>
          </div>
          <h4 className="text-micro font-bold opacity-80 uppercase tracking-widest">
            COGNITIVE RESOURCE QUOTA
          </h4>
        </div>
        {resetAt && (
          <span className="text-micro opacity-20 uppercase tracking-widest font-mono">
           RESET T-{resetAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toUpperCase()}
          </span>
        )}
      </div>

      <div className="space-y-6">
        {/* Requests usage */}
        <div>
          <div className="flex justify-between text-micro uppercase tracking-widest mb-2">
            <span className="opacity-30">SYSTEM REQUESTS</span>
            <span className="opacity-60 font-mono">
              {requestsCount} / {QUOTA_LIMITS.maxRequestsPerDay}
            </span>
          </div>
          <div className="h-1 bg-white/5 overflow-hidden">
            <div 
              className="h-full bg-white opacity-40 transition-all duration-1000"
              style={{ width: `${Math.min(requestsPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Tokens usage */}
        <div>
          <div className="flex justify-between text-micro uppercase tracking-widest mb-2">
            <span className="opacity-30">COGNITIVE TOKENS</span>
            <span className="opacity-60 font-mono">
              {tokensUsed.toLocaleString()} / {QUOTA_LIMITS.safeTokenBudget.toLocaleString()}
            </span>
          </div>
          <div className="h-1 bg-white/5 overflow-hidden">
            <div 
              className="h-full bg-white opacity-20 transition-all duration-1000"
              style={{ width: `${Math.min(percentUsed, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {percentUsed >= 90 && (
        <div className="mt-6 flex items-center gap-3 text-micro uppercase tracking-widest opacity-40 border border-white/5 p-3">
          <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>QUOTA DEPLETION IMMINENT. SYSTEM THROTTLING ENABLED.</span>
        </div>
      )}
    </div>
  );
}
