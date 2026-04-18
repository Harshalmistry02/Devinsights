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
    <div className={` bg-transparent border-none ${className}`}>
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
        <div className="border-l-2 border-[rgba(240,240,250,0.1)] pl-4">
          <p className="text-micro opacity-40 mb-2 tracking-[2px]">PEAK ACTIVITY</p>
          <p className="text-display-hero text-3xl opacity-90">{formatPeakTime(peakHour).toUpperCase()}</p>
        </div>
        <div className="border-l-2 border-[rgba(240,240,250,0.1)] pl-4">
          <p className="text-micro opacity-40 mb-2 tracking-[2px]">CODING STYLE</p>
          <p className="text-display-hero text-3xl opacity-90">{codingStyle.replace(/[^a-zA-Z\s]/g, '').trim().toUpperCase()}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="p-4 sm:p-6">
        {total > 0 ? (
          <>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="0" stroke="rgba(240,240,250,0.05)" vertical={false} />
                  <XAxis
                    dataKey="hour"
                    tick={{ fill: 'rgba(240,240,250,0.3)', fontSize: 10, letterSpacing: '1px' }}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(240,240,250,0.1)' }}
                    interval={2}
                    tickFormatter={(h) => formatHourLabel(h).toUpperCase()}
                  />
                  <YAxis
                    tick={{ fill: 'rgba(240,240,250,0.3)', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(240, 240, 250, 0.05)' }} />
                  
                  {/* Time period reference lines */}
                  <ReferenceLine x={6} stroke="rgba(240,240,250,0.1)" strokeDasharray="3 3" />
                  <ReferenceLine x={12} stroke="rgba(240,240,250,0.1)" strokeDasharray="3 3" />
                  <ReferenceLine x={18} stroke="rgba(240,240,250,0.1)" strokeDasharray="3 3" />
                  
                  <Bar dataKey="commits" radius={[0, 0, 0, 0]} maxBarSize={30}>
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

            <div className="mt-8 grid grid-cols-4 gap-4">
              <TimePeriodStat
                label="NIGHT"
                sublabel="00-06"
                value={nightCommits}
                total={total}
              />
              <TimePeriodStat
                label="MORNING"
                sublabel="06-12"
                value={morningCommits}
                total={total}
              />
              <TimePeriodStat
                label="AFTERNOON"
                sublabel="12-18"
                value={afternoonCommits}
                total={total}
              />
              <TimePeriodStat
                label="EVENING"
                sublabel="18-00"
                value={eveningCommits}
                total={total}
              />
            </div>
          </>
        ) : (
          <div className="h-48 flex items-center justify-center opacity-80">
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
}: {
  label: string;
  sublabel: string;
  value: number;
  total: number;
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  
  return (
    <div className="border-l-2 border-[rgba(240,240,250,0.05)] pl-3">
      <p className="text-display-hero text-xl opacity-90 tabular-nums">{percentage}%</p>
      <p className="text-micro opacity-40 tracking-widest mt-1">{label}</p>
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
  
  if (max === night && night / total > 0.3) return 'NIGHT OWL';
  if (max === morning && morning / total > 0.3) return 'EARLY BIRD';
  if (max === afternoon && afternoon / total > 0.3) return 'AFTERNOON CODER';
  if (max === evening && evening / total > 0.3) return 'EVENING DEVELOPER';
  
  return 'BALANCED';
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
    <div className="brutalist-glass p-3 border-none ring-1 ring-[#f0f0fa]/10">
      <p className="text-micro opacity-40 mb-1 tracking-widest">
        {displayHour}:00 - {displayHour}:59 {period}
      </p>
      <p className="text-display-hero text-xl opacity-90">
        {data.commits} COMMITS
      </p>
    </div>
  );
}
