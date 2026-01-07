'use client';

import React from 'react';

export function InsightsContent({ analytics }: { analytics: any }) {
  return (
    <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-6 backdrop-blur-sm">
      <h3 className="text-xl font-semibold text-slate-200 mb-4">Detailed Analytics</h3>
      <p className="text-slate-400">
        This section is under maintenance. Please check back soon for detailed visualizations.
      </p>
    </div>
  );
}
