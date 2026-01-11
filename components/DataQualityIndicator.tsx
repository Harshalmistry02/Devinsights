'use client';

import React from 'react';

interface DataQualityIndicatorProps {
  outlierCount: number;
  unknownExtensionPercent: number;
  totalCommits: number;
}

export function DataQualityIndicator({ 
  outlierCount, 
  unknownExtensionPercent, 
  totalCommits 
}: DataQualityIndicatorProps) {
  const hasOutliers = outlierCount > 0;
  const hasUnknownTypes = unknownExtensionPercent > 20;
  const lowDataCount = totalCommits < 10;

  if (!hasOutliers && !hasUnknownTypes && !lowDataCount) {
    return null;
  }

  return (
    <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
      <div className="flex items-start gap-3">
        <div className="shrink-0 p-2 rounded-lg bg-amber-500/10">
          <svg className="h-5 w-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-amber-300 mb-2">Data Quality Notes</h4>
          <ul className="space-y-1.5 text-xs text-gray-400">
            {hasOutliers && (
              <li className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-amber-400" />
                <span>
                  <span className="text-amber-300">{outlierCount}</span> large commits excluded from average calculations 
                  <span className="text-gray-500"> (likely lockfiles or generated code)</span>
                </span>
              </li>
            )}
            {hasUnknownTypes && (
              <li className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-amber-400" />
                <span>
                  <span className="text-amber-300">{unknownExtensionPercent}%</span> of file types could not be categorized
                </span>
              </li>
            )}
            {lowDataCount && (
              <li className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-amber-400" />
                <span>
                  Limited data available ({totalCommits} commits). Insights may improve with more activity.
                </span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
