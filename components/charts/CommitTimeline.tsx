'use client';

/**
 * Commit Timeline Chart
 * 
 * Line chart showing commit activity over time (last 30/60/90 days)
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { useState } from 'react';

interface CommitTimelineProps {
  data: Record<string, number>; // { "2024-01-15": 5, "2024-01-16": 3 }
  className?: string;
}

type TimeRange = '30' | '60' | '90';

export function CommitTimeline({ data, className = '' }: CommitTimelineProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('30');

  // Convert data to chart format and filter by time range
  const chartData = getChartData(data, parseInt(timeRange));
  
  // Calculate summary stats
  const totalCommits = chartData.reduce((sum, d) => sum + d.commits, 0);
  const avgPerDay = chartData.length > 0 
    ? (totalCommits / chartData.filter(d => d.commits > 0).length || 1).toFixed(1)
    : '0';
  const maxCommits = Math.max(...chartData.map(d => d.commits), 0);

  return (
    <div className={` bg-transparent border-none ${className}`}>
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
        <div className="border-l-2 border-[rgba(240,240,250,0.1)] pl-4">
          <p className="text-micro opacity-40 mb-2 tracking-[2px]">TOTAL COMMITS</p>
          <p className="text-display-hero text-3xl opacity-90 tabular-nums">{totalCommits}</p>
        </div>
        <div className="border-l-2 border-[rgba(240,240,250,0.1)] pl-4">
          <p className="text-micro opacity-40 mb-2 tracking-[2px]">AVG/ACTIVE DAY</p>
          <p className="text-display-hero text-3xl opacity-90 tabular-nums">{avgPerDay}</p>
        </div>
        <div className="border-l-2 border-[rgba(240,240,250,0.1)] pl-4">
          <p className="text-micro opacity-40 mb-2 tracking-[2px]">PEAK DAY</p>
          <p className="text-display-hero text-3xl opacity-90 tabular-nums">{maxCommits}</p>
        </div>
      </div>
      
      {/* Chart */}
      <div className="p-4 sm:p-6">
        {chartData.length > 0 ? (
          <div className="h-64 min-h-64 min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={256}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="commitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f0f0fa" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f0f0fa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="0" stroke="rgba(240,240,250,0.05)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: 'rgba(240,240,250,0.3)', fontSize: 10, letterSpacing: '1px' }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(240,240,250,0.1)' }}
                  interval="preserveStartEnd"
                  tickFormatter={(value) => formatDateLabel(value).toUpperCase()}
                />
                <YAxis 
                   tick={{ fill: 'rgba(240,240,250,0.3)', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="commits"
                  stroke="#f0f0fa"
                  strokeWidth={1.5}
                  fill="url(#commitGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#f0f0fa', stroke: '#000000', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center opacity-80">
            <p>No commit data available</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ===========================================
// Helper Functions
// ===========================================

function getChartData(data: Record<string, number>, days: number) {
  const result: { date: string; commits: number }[] = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    result.push({
      date: dateStr,
      commits: data[dateStr] || 0,
    });
  }
  
  return result;
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ===========================================
// Custom Tooltip Component
// ===========================================

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  
  const date = new Date(label);
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  
  return (
    <div className="brutalist-glass p-3 border-none ring-1 ring-[#f0f0fa]/10">
      <p className="text-micro opacity-40 mb-2 tracking-widest">{formattedDate.toUpperCase()}</p>
      <p className="text-display-hero text-xl opacity-90">
        {payload[0].value} COMMITS
      </p>
    </div>
  );
}
