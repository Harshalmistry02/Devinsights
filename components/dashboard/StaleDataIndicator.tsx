'use client';

import { useEffect, useState } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StaleDataIndicatorProps {
  lastUpdated: Date | null;
  onRefresh: () => void;
}

/**
 * Stale Data Indicator
 * Shows when data was last updated and provides refresh option
 */
export function StaleDataIndicator({ lastUpdated, onRefresh }: StaleDataIndicatorProps) {
  const [isStale, setIsStale] = useState(false);
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    if (!lastUpdated) return;

    const updateStatus = () => {
      const now = Date.now();
      const age = now - new Date(lastUpdated).getTime();
      const minutes = Math.floor(age / 60000);

      // Consider stale after 10 minutes
      setIsStale(age > 10 * 60000);

      // Format time ago
      if (minutes < 1) {
        setTimeAgo('just now');
      } else if (minutes < 60) {
        setTimeAgo(`${minutes}m ago`);
      } else {
        const hours = Math.floor(minutes / 60);
        setTimeAgo(`${hours}h ago`);
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [lastUpdated]);

  if (!lastUpdated) return null;

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs",
      isStale
        ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
        : "bg-slate-800/50 border border-slate-700/30 text-slate-400"
    )}>
      {isStale ? (
        <AlertCircle className="w-3 h-3" />
      ) : (
        <Clock className="w-3 h-3" />
      )}
      <span>Updated {timeAgo}</span>
      {isStale && (
        <button
          onClick={onRefresh}
          className="ml-2 px-2 py-0.5 bg-amber-500/20 rounded hover:bg-amber-500/30 transition-colors"
        >
          Refresh
        </button>
      )}
    </div>
  );
}
