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
    <div className={` bg-transparent border-none ${className}`}>
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
        <div className="border-l-2 border-[rgba(240,240,250,0.1)] pl-4">
          <p className="text-micro opacity-40 mb-2 tracking-[2px]">MOST PRODUCTIVE DAY</p>
          <p className="text-display-hero text-3xl opacity-90">{mostProductiveDay?.toUpperCase()}</p>
        </div>
        <div className="border-l-2 border-[rgba(240,240,250,0.1)] pl-4">
          <p className="text-micro opacity-40 mb-2 tracking-[2px]">WEEKDAY RATIO</p>
          <p className="text-display-hero text-3xl opacity-90 tabular-nums">{total > 0 ? Math.round((weekdayTotal / total) * 100) : 0}%</p>
        </div>
      </div>

      {/* Chart */}
      <div className="p-4 sm:p-6">
        {total > 0 ? (
          <>
            <div className="h-48 min-h-48 min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={192}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="0" stroke="rgba(240,240,250,0.05)" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: 'rgba(240,240,250,0.3)', fontSize: 10, letterSpacing: '1px' }}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(240,240,250,0.1)' }}
                    tickFormatter={(value) => value.toUpperCase()}
                  />
                  <YAxis
                    tick={{ fill: 'rgba(240,240,250,0.3)', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(240, 240, 250, 0.05)' }} />
                  <Bar dataKey="commits" radius={[0, 0, 0, 0]} maxBarSize={40}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill="#f0f0fa"
                        opacity={entry.commits === maxCommits ? 0.9 : 0.2}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
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
    <div className="brutalist-glass p-3 border-none ring-1 ring-[#f0f0fa]/10">
      <p className="text-micro opacity-40 mb-1 tracking-widest">{data.fullDay.toUpperCase()}</p>
      <p className="text-display-hero text-xl opacity-90">
        {data.commits} COMMITS
      </p>
    </div>
  );
}
