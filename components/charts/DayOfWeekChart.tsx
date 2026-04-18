'use client';

/**
 * Day of Week Chart
 * 
 * Bar chart showing commit distribution across days of the week
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface DayOfWeekStats {
  Monday: number;
  Tuesday: number;
  Wednesday: number;
  Thursday: number;
  Friday: number;
  Saturday: number;
  Sunday: number;
}

interface DayOfWeekChartProps {
  data: DayOfWeekStats;
  className?: string;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const FULL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function DayOfWeekChart({ data, className = '' }: DayOfWeekChartProps) {
  // Convert to chart format
  const chartData = FULL_DAYS.map((day, index) => ({
    day: DAYS[index],
    fullDay: day,
    commits: data[day as keyof DayOfWeekStats] || 0,
  }));

  // Find the most productive day
  const maxCommits = Math.max(...chartData.map(d => d.commits));
  const mostProductiveDay = chartData.find(d => d.commits === maxCommits)?.fullDay;

  // Calculate weekday vs weekend
  const weekdayTotal = chartData.slice(0, 5).reduce((sum, d) => sum + d.commits, 0);
  const weekendTotal = chartData.slice(5).reduce((sum, d) => sum + d.commits, 0);
  const total = weekdayTotal + weekendTotal;

  return (
    <div className={` border border-[rgba(240,240,250,0.15)]  backdrop-blur-sm ${className}`}>
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-[rgba(240,240,250,0.15)]">
        <h3 className="text-lg font-semibold opacity-80">Weekly Pattern</h3>
        <p className="text-sm opacity-80">
          Most productive on <span className="text-[#f0f0fa] font-medium">{mostProductiveDay}</span>
        </p>
      </div>

      {/* Chart */}
      <div className="p-4 sm:p-6">
        {total > 0 ? (
          <>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: '#475569' }}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(6, 182, 212, 0.1)' }} />
                  <Bar dataKey="commits" radius={[6, 6, 0, 0]} maxBarSize={50}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.commits === maxCommits ? '#06b6d4' : '#475569'}
                        opacity={entry.commits === maxCommits ? 1 : 0.6}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Weekday vs Weekend Stats */}
            <div className="mt-4 flex items-center justify-center gap-8">
              <div className="text-center">
                <p className="text-lg font-semibold opacity-80">{weekdayTotal}</p>
                <p className="text-xs opacity-80">Weekday commits</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-purple-400">{weekendTotal}</p>
                <p className="text-xs opacity-80">Weekend commits</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-[#f0f0fa]">
                  {total > 0 ? Math.round((weekdayTotal / total) * 100) : 0}%
                </p>
                <p className="text-xs opacity-80">Weekday ratio</p>
              </div>
            </div>
          </>
        ) : (
          <div className="h-48 flex items-center justify-center opacity-80">
            <p>No activity data available</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ===========================================
// Custom Tooltip Component
// ===========================================

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div className="border border-[rgba(240,240,250,0.15)] p-3">
      <p className="text-xs opacity-80 mb-1">{data.fullDay}</p>
      <p className="text-lg font-semibold text-[#f0f0fa]">
        {data.commits} commit{data.commits !== 1 ? 's' : ''}
      </p>
    </div>
  );
}
