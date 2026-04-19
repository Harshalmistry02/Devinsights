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
    <div className={` bg-transparent border-none ${className}`}>
      {/* Summary Stats */}
      <div className="border-l-2 border-[rgba(240,240,250,0.1)] pl-4 mb-10">
        <p className="text-micro opacity-40 mb-2 tracking-[2px]">TOTAL LANGUAGES</p>
        <p className="text-display-hero text-3xl opacity-90 tabular-nums">{data.length}</p>
      </div>

      {/* Chart */}
      <div className="p-4 sm:p-6">
        {chartData.length > 0 ? (
          <div className="flex flex-col lg:flex-row items-center gap-6">
            {/* Donut Chart */}
            <div className="w-full lg:w-1/2 h-64 min-h-64 min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={256}>
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
                      <Cell 
                        key={`cell-${index}`} 
                        fill="#f0f0fa" 
                        opacity={0.1 + (index / chartData.length) * 0.8}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip total={total} />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend / Stats */}
            <div className="w-full lg:w-1/2 space-y-3">
              {chartData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-4">
                  <div
                    className="w-2.5 h-2.5"
                    style={{ 
                      backgroundColor: "#f0f0fa",
                      opacity: 0.1 + (index / chartData.length) * 0.8
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-micro font-medium truncate tracking-widest opacity-80">
                        {item.name.toUpperCase()}
                      </span>
                      <span className="text-micro opacity-40 ml-2 tabular-nums">
                        {item.percentage}%
                      </span>
                    </div>
                    <div className="mt-1 h-px bg-[rgba(240,240,250,0.05)] overflow-hidden">
                      <div
                        className="h-full bg-[#f0f0fa] transition-all duration-500"
                        style={{
                          width: `${item.percentage}%`,
                          opacity: 0.1 + (index / chartData.length) * 0.8
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Total */}
              <div className="pt-3 border-t border-[rgba(240,240,250,0.15)]">
                <div className="flex items-center justify-between text-sm">
                  <span className="opacity-80">Total Commits</span>
                  <span className="opacity-80 font-semibold">{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center opacity-80">
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

type LanguageTooltipDatum = {
  name: string;
  value: number;
  percentage: number;
  color: string;
};

type LanguageTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload: LanguageTooltipDatum }>;
  total: number;
};

function CustomTooltip({ active, payload, total }: LanguageTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const percentage = ((data.value / total) * 100).toFixed(1);

  return (
    <div className="brutalist-glass p-3 border-none ring-1 ring-[#f0f0fa]/10">
      <div className="flex items-center gap-2 mb-2">
         <span className="text-micro font-medium opacity-40 tracking-widest">{data.name.toUpperCase()}</span>
      </div>
      <p className="text-display-hero text-xl opacity-90">
        {percentage}%
      </p>
      <p className="text-micro opacity-30 mt-1">{data.value.toLocaleString()} COMMITS</p>
    </div>
  );
}
