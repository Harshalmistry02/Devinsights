'use client';

/**
 * Language Breakdown Chart
 * 
 * Pie/Donut chart showing programming language distribution
 */

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { LANGUAGE_COLORS } from '@/lib/analytics/language-analyzer';

interface LanguageBreakdownProps {
  data: Array<{ language: string; count: number; percentage: number }>;
  className?: string;
}

export function LanguageBreakdown({ data, className = '' }: LanguageBreakdownProps) {
  // Prepare chart data with colors
  const chartData = data.map((item) => ({
    name: item.language,
    value: item.count,
    percentage: item.percentage,
    color: LANGUAGE_COLORS[item.language] || LANGUAGE_COLORS.Other,
  }));

  // Calculate total
  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className={`bg-slate-900/50 border border-slate-700/30 rounded-xl backdrop-blur-sm ${className}`}>
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-700/30">
        <h3 className="text-lg font-semibold text-slate-200">Language Distribution</h3>
        <p className="text-sm text-slate-500">Commits per programming language</p>
      </div>

      {/* Chart */}
      <div className="p-4 sm:p-6">
        {chartData.length > 0 ? (
          <div className="flex flex-col lg:flex-row items-center gap-6">
            {/* Donut Chart */}
            <div className="w-full lg:w-1/2 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="transparent"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip total={total} />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend / Stats */}
            <div className="w-full lg:w-1/2 space-y-3">
              {chartData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300 font-medium truncate">
                        {item.name}
                      </span>
                      <span className="text-sm text-slate-500 ml-2">
                        {item.percentage}%
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Total */}
              <div className="pt-3 border-t border-slate-700/30">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Total Commits</span>
                  <span className="text-slate-200 font-semibold">{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-slate-500">
            <p>No language data available</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ===========================================
// Custom Tooltip Component
// ===========================================

function CustomTooltip({ active, payload, total }: any) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const percentage = ((data.value / total) * 100).toFixed(1);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
      <div className="flex items-center gap-2 mb-1">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: data.color }}
        />
        <span className="text-sm font-medium text-slate-200">{data.name}</span>
      </div>
      <p className="text-lg font-semibold text-cyan-400">
        {data.value.toLocaleString()} commits
      </p>
      <p className="text-xs text-slate-500">{percentage}% of total</p>
    </div>
  );
}
