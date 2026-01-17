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
    <div className={`bg-slate-900/50 border border-slate-700/30 rounded-xl backdrop-blur-sm ${className}`}>
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-700/30">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-200">Commit Activity</h3>
            <p className="text-sm text-slate-500">Your coding activity over time</p>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex items-center gap-1 bg-slate-800/50 p-1 rounded-lg">
            {(['30', '60', '90'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  timeRange === range
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
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
            <p className="text-2xl font-bold text-slate-200">{totalCommits}</p>
            <p className="text-xs text-slate-500">Total Commits</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-cyan-400">{avgPerDay}</p>
            <p className="text-xs text-slate-500">Avg/Active Day</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-400">{maxCommits}</p>
            <p className="text-xs text-slate-500">Peak Day</p>
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
          <div className="h-64 flex items-center justify-center text-slate-500">
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
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
      <p className="text-xs text-slate-400 mb-1">{formattedDate}</p>
      <p className="text-lg font-semibold text-cyan-400">
        {payload[0].value} commit{payload[0].value !== 1 ? 's' : ''}
      </p>
    </div>
  );
}
