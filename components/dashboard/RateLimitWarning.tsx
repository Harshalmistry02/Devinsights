'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Clock } from 'lucide-react';

/**
 * Rate Limit Warning Component
 * Displays warning when GitHub API rate limit is running low
 */
export function RateLimitWarning() {
  const [rateLimitStatus, setRateLimitStatus] = useState<{
    remaining: number;
    reset: number;
    limit: number;
  } | null>(null);

  useEffect(() => {
    const checkRateLimit = async () => {
      try {
        const response = await fetch('/api/github/rate-limit');
        if (response.ok) {
          const data = await response.json();
          setRateLimitStatus(data);
        }
      } catch (error) {
        console.error('Failed to check rate limit:', error);
      }
    };

    checkRateLimit();
    const interval = setInterval(checkRateLimit, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  if (!rateLimitStatus) return null;

  const percentRemaining = (rateLimitStatus.remaining / rateLimitStatus.limit) * 100;
  
  // Only show warning if below 20%
  if (percentRemaining > 20) return null;

  const resetTime = new Date(rateLimitStatus.reset * 1000);
  const minutesUntilReset = Math.max(
    0,
    Math.floor((resetTime.getTime() - Date.now()) / 60000)
  );

  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-amber-400 mb-1">
            GitHub API Rate Limit Warning
          </h4>
          <p className="text-sm text-amber-300/80 mb-2">
            You have {rateLimitStatus.remaining} of {rateLimitStatus.limit} requests remaining.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-3 h-3" />
            <span>Resets in {minutesUntilReset} minutes</span>
          </div>
          <div className="mt-3 h-2 bg-slate-800/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all"
              style={{ width: `${percentRemaining}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
