'use client';

/**
 * Hourly Activity Chart
 * 
 * Bar chart showing commit distribution across hours of the day
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
  ReferenceLine,
} from 'recharts';

interface HourlyActivityProps {
  data: Record<string, number>; // { "0": 5, "1": 3, ..., "23": 10 }
  className?: string;
}

export function HourlyActivity({ data, className = '' }: HourlyActivityProps) {
  // Convert to chart format
  const chartData = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    label: formatHourLabel(hour),
    commits: data[hour.toString()] || 0,
  }));

  // Find peak hour
  const maxCommits = Math.max(...chartData.map(d => d.commits));
  const peakHour = chartData.find(d => d.commits === maxCommits)?.hour ?? 0;
  
  // Calculate time period stats
  const morningCommits = chartData.slice(6, 12).reduce((sum, d) => sum + d.commits, 0);
  const afternoonCommits = chartData.slice(12, 18).reduce((sum, d) => sum + d.commits, 0);
  const eveningCommits = chartData.slice(18, 24).reduce((sum, d) => sum + d.commits, 0);
  const nightCommits = [...chartData.slice(0, 6)].reduce((sum, d) => sum + d.commits, 0);
  const total = morningCommits + afternoonCommits + eveningCommits + nightCommits;

  // Determine coding style
  const codingStyle = getCodingStyle(morningCommits, afternoonCommits, eveningCommits, nightCommits);

  return (
    <div className={`bg-slate-900/50 border border-slate-700/30 rounded-xl backdrop-blur-sm ${className}`}>
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-700/30">
        <h3 className="text-lg font-semibold text-slate-200">Daily Pattern</h3>
        <p className="text-sm text-slate-500">
          Peak coding time: <span className="text-cyan-400 font-medium">{formatPeakTime(peakHour)}</span>
          <span className="mx-2">·</span>
          <span className="text-purple-400">{codingStyle}</span>
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
                    dataKey="hour"
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    tickLine={false}
                    axisLine={{ stroke: '#475569' }}
                    interval={2}
                    tickFormatter={(h) => formatHourLabel(h)}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }} />
                  
                  {/* Time period reference lines */}
                  <ReferenceLine x={6} stroke="#475569" strokeDasharray="3 3" />
                  <ReferenceLine x={12} stroke="#475569" strokeDasharray="3 3" />
                  <ReferenceLine x={18} stroke="#475569" strokeDasharray="3 3" />
                  
                  <Bar dataKey="commits" radius={[4, 4, 0, 0]} maxBarSize={20}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getHourColor(entry.hour, entry.commits === maxCommits)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Time Period Stats */}
            <div className="mt-4 grid grid-cols-4 gap-2 text-center">
              <TimePeriodStat
                label="Night"
                sublabel="12am-6am"
                value={nightCommits}
                total={total}
                color="indigo"
              />
              <TimePeriodStat
                label="Morning"
                sublabel="6am-12pm"
                value={morningCommits}
                total={total}
                color="amber"
              />
              <TimePeriodStat
                label="Afternoon"
                sublabel="12pm-6pm"
                value={afternoonCommits}
                total={total}
                color="cyan"
              />
              <TimePeriodStat
                label="Evening"
                sublabel="6pm-12am"
                value={eveningCommits}
                total={total}
                color="purple"
              />
            </div>
          </>
        ) : (
          <div className="h-48 flex items-center justify-center text-slate-500">
            <p>No hourly data available</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ===========================================
// Helper Components
// ===========================================

function TimePeriodStat({
  label,
  sublabel,
  value,
  total,
  color,
}: {
  label: string;
  sublabel: string;
  value: number;
  total: number;
  color: 'indigo' | 'amber' | 'cyan' | 'purple';
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  
  const colorClasses = {
    indigo: 'text-indigo-400',
    amber: 'text-amber-400',
    cyan: 'text-cyan-400',
    purple: 'text-purple-400',
  };

  return (
    <div className="bg-slate-800/30 rounded-lg p-2">
      <p className={`text-lg font-semibold ${colorClasses[color]}`}>{percentage}%</p>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-xs text-slate-600">{sublabel}</p>
    </div>
  );
}

// ===========================================
// Helper Functions
// ===========================================

function formatHourLabel(hour: number): string {
  if (hour === 0) return '12a';
  if (hour === 12) return '12p';
  if (hour < 12) return `${hour}a`;
  return `${hour - 12}p`;
}

function formatPeakTime(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:00 ${period}`;
}

function getHourColor(hour: number, isPeak: boolean): string {
  if (isPeak) return '#06b6d4'; // cyan for peak
  
  // Color by time period
  if (hour < 6) return '#6366f1'; // indigo for night
  if (hour < 12) return '#f59e0b'; // amber for morning
  if (hour < 18) return '#0ea5e9'; // sky for afternoon
  return '#a855f7'; // purple for evening
}

function getCodingStyle(morning: number, afternoon: number, evening: number, night: number): string {
  const total = morning + afternoon + evening + night;
  if (total === 0) return 'No data';
  
  const max = Math.max(morning, afternoon, evening, night);
  
  if (max === night && night / total > 0.3) return '🦉 Night Owl';
  if (max === morning && morning / total > 0.3) return '🌅 Early Bird';
  if (max === afternoon && afternoon / total > 0.3) return '☀️ Afternoon Coder';
  if (max === evening && evening / total > 0.3) return '🌙 Evening Developer';
  
  return '⚖️ Balanced';
}

// ===========================================
// Custom Tooltip Component
// ===========================================

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const period = data.hour >= 12 ? 'PM' : 'AM';
  const displayHour = data.hour % 12 || 12;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
      <p className="text-xs text-slate-400 mb-1">
        {displayHour}:00 - {displayHour}:59 {period}
      </p>
      <p className="text-lg font-semibold text-cyan-400">
        {data.commits} commit{data.commits !== 1 ? 's' : ''}
      </p>
    </div>
  );
}
