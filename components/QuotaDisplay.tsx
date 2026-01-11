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
  
  const getStatusColor = (percent: number) => {
    if (percent >= 90) return 'from-red-500 to-red-600';
    if (percent >= 70) return 'from-amber-500 to-orange-500';
    return 'from-cyan-500 to-purple-500';
  };

  const getTextColor = (percent: number) => {
    if (percent >= 90) return 'text-red-400';
    if (percent >= 70) return 'text-amber-400';
    return 'text-cyan-400';
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-12 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-linear-to-r ${getStatusColor(percentUsed)} rounded-full`}
              style={{ width: `${Math.min(percentUsed, 100)}%` }}
            />
          </div>
          <span className={getTextColor(percentUsed)}>
            {requestsCount}/{QUOTA_LIMITS.maxRequestsPerDay}
          </span>
        </div>
        <span>credits</span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-700/50 bg-gray-800/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
          <svg className="h-4 w-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Daily AI Credits
        </h4>
        {resetAt && (
          <span className="text-xs text-gray-500">
            Resets at {resetAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {/* Requests usage */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">Requests</span>
            <span className={getTextColor(requestsPercent)}>
              {requestsCount} / {QUOTA_LIMITS.maxRequestsPerDay}
            </span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-linear-to-r ${getStatusColor(requestsPercent)} rounded-full transition-all duration-300`}
              style={{ width: `${Math.min(requestsPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Tokens usage */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">Tokens</span>
            <span className={getTextColor(percentUsed)}>
              {tokensUsed.toLocaleString()} / {QUOTA_LIMITS.safeTokenBudget.toLocaleString()}
            </span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-linear-to-r ${getStatusColor(percentUsed)} rounded-full transition-all duration-300`}
              style={{ width: `${Math.min(percentUsed, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {percentUsed >= 90 && (
        <div className="mt-3 flex items-center gap-2 text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
          <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Quota nearly exhausted. New credits available after reset.</span>
        </div>
      )}
    </div>
  );
}
