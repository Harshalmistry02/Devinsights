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
    <div className={` border border-[rgba(240,240,250,0.15)]  backdrop-blur-sm ${className}`}>
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-[rgba(240,240,250,0.15)]">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-semibold opacity-80">Commit Activity</h3>
            <p className="text-sm opacity-80">Your coding activity over time</p>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex items-center gap-1 p-1">
            {(['30', '60', '90'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-xs font-medium  transition-all ${
                  timeRange === range
                    ? 'bg-cyan-500/20 text-[#f0f0fa] border border-cyan-500/30'
                    : 'opacity-80 hover:opacity-80 hover:'
                }`}
              >
                {range}d
              </button>
            ))}
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="flex items-center gap-6 mt-4">
          <div>
            <p className="text-2xl font-bold opacity-80">{totalCommits}</p>
            <p className="text-xs opacity-80">Total Commits</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#f0f0fa]">{avgPerDay}</p>
            <p className="text-xs opacity-80">Avg/Active Day</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-400">{maxCommits}</p>
            <p className="text-xs opacity-80">Peak Day</p>
          </div>
        </div>
      </div>
      
      {/* Chart */}
      <div className="p-4 sm:p-6">
        {chartData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%" minHeight={256}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="commitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickLine={{ stroke: '#475569' }}
                  axisLine={{ stroke: '#475569' }}
                  interval="preserveStartEnd"
                  tickFormatter={(value) => formatDateLabel(value)}
                />
                <YAxis 
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickLine={{ stroke: '#475569' }}
                  axisLine={{ stroke: '#475569' }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="commits"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fill="url(#commitGradient)"
                  dot={false}
                  activeDot={{ r: 6, fill: '#06b6d4', stroke: '#0f172a', strokeWidth: 2 }}
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
    <div className="border border-[rgba(240,240,250,0.15)] p-3">
      <p className="text-xs opacity-80 mb-1">{formattedDate}</p>
      <p className="text-lg font-semibold text-[#f0f0fa]">
        {payload[0].value} commit{payload[0].value !== 1 ? 's' : ''}
      </p>
    </div>
  );
}
