'use client';

import React from 'react';
import { Info } from 'lucide-react';

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
    <div className="brutalist-glass p-6 border-l-2 border-l-white/10 bg-white/[0.02]">
      <div className="flex items-start gap-4">
        <div className="shrink-0 p-2 bg-white/5 opacity-40">
           <Info className="w-5 h-5 text-[#f0f0fa]" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-micro font-bold opacity-80 uppercase tracking-[2px] mb-4">ARCHIVE INTEGRITY NOTES</h4>
          <ul className="space-y-3">
            {hasOutliers && (
              <li className="flex items-start gap-3">
                <span className="h-[1px] w-3 bg-white/20 mt-2 shrink-0" />
                <span className="text-micro opacity-40 uppercase tracking-widest leading-relaxed">
                  <span className="opacity-100 font-bold">{outlierCount}</span> ANOMALOUS COMMITS EXCLUDED FROM STATISTICAL AVERAGES 
                  <span className="opacity-20 italic"> (POTENTIAL SYSTEM NOISE / LOCKFILES)</span>
                </span>
              </li>
            )}
            {hasUnknownTypes && (
              <li className="flex items-start gap-3">
                <span className="h-[1px] w-3 bg-white/20 mt-2 shrink-0" />
                <span className="text-micro opacity-40 uppercase tracking-widest leading-relaxed">
                  <span className="opacity-100 font-bold">{unknownExtensionPercent}%</span> OF ARCHIVED DATA REMAINS UNCLASSIFIED
                </span>
              </li>
            )}
            {lowDataCount && (
              <li className="flex items-start gap-3">
                <span className="h-[1px] w-3 bg-white/20 mt-2 shrink-0" />
                <span className="text-micro opacity-40 uppercase tracking-widest leading-relaxed">
                  INSUFFICIENT ARCHIVE COHESION ({totalCommits} COMMITS). INSIGHT ACCURACY MAY VARY.
                </span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
