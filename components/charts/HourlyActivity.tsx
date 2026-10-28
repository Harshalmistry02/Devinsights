"use client";

/**
 * Hourly Activity Chart
 *
 * Commit distribution across hours of the day.
 */

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartStat,
  ChartTooltipContent,
  chartAxisLine,
  chartGridStroke,
  chartTick,
} from "./chart-primitives";

interface HourlyActivityProps {
  data: Record<string, number>; // { "0": 5, "1": 3, ..., "23": 10 }
  className?: string;
}

export function HourlyActivity({ data, className = "" }: HourlyActivityProps) {
  const chartData = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    label: formatHourLabel(hour),
    commits: data[hour.toString()] || 0,
  }));

  const total = chartData.reduce((sum, item) => sum + item.commits, 0);
  const maxCommits = Math.max(...chartData.map((item) => item.commits));
  const peakHour = chartData.find((item) => item.commits === maxCommits)?.hour ?? 0;

  const morningCommits = chartData
    .slice(6, 12)
    .reduce((sum, item) => sum + item.commits, 0);
  const afternoonCommits = chartData
    .slice(12, 18)
    .reduce((sum, item) => sum + item.commits, 0);
  const eveningCommits = chartData
    .slice(18, 24)
    .reduce((sum, item) => sum + item.commits, 0);
  const nightCommits = chartData
    .slice(0, 6)
    .reduce((sum, item) => sum + item.commits, 0);

  const codingStyle = getCodingStyle(
    morningCommits,
    afternoonCommits,
    eveningCommits,
    nightCommits
  );

  return (
    <div className={className}>
      <div className="mb-5 grid grid-cols-2 gap-4">
        <ChartStat
          label="Peak hour"
          value={total > 0 ? formatPeakTime(peakHour) : "No activity"}
          detail="Across all recorded commits"
        />
        <ChartStat
          label="Coding style"
          value={total > 0 ? codingStyle : "Not enough data"}
          detail="Based on time-of-day share"
        />
      </div>

      {total > 0 ? (
        <div>
          <div
            className="h-48 min-h-48 min-w-0"
            role="img"
            aria-label={`Commits by hour of day. Peak hour is ${formatPeakTime(peakHour)}. The busiest period is ${codingStyle}.`}
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={0}
              minHeight={192}
            >
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 8, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="0"
                  stroke={chartGridStroke}
                  vertical={false}
                />
                <XAxis
                  dataKey="hour"
                  tick={chartTick}
                  tickLine={false}
                  axisLine={chartAxisLine}
                  interval={2}
                  tickFormatter={(hour) => formatHourLabel(hour)}
                />
                <YAxis
                  tick={chartTick}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  width={36}
                />
                <Tooltip
                  content={
                    <ChartTooltipContent
                      valueSuffix=" commits"
                      labelFormatter={(value) => formatHourRange(Number(value))}
                    />
                  }
                  cursor={{ fill: "var(--surface-hover)" }}
                />

                <ReferenceLine
                  x={6}
                  stroke="var(--border-subtle)"
                  strokeDasharray="3 3"
                />
                <ReferenceLine
                  x={12}
                  stroke="var(--border-subtle)"
                  strokeDasharray="3 3"
                />
                <ReferenceLine
                  x={18}
                  stroke="var(--border-subtle)"
                  strokeDasharray="3 3"
                />

                <Bar dataKey="commits" name="Commits" radius={[2, 2, 0, 0]} maxBarSize={22}>
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.hour}
                      fill={
                        entry.commits === maxCommits
                          ? "var(--accent)"
                          : "rgba(240, 240, 250, 0.18)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <TimePeriodStat label="Night" value={nightCommits} total={total} />
            <TimePeriodStat
              label="Morning"
              value={morningCommits}
              total={total}
            />
            <TimePeriodStat
              label="Afternoon"
              value={afternoonCommits}
              total={total}
            />
            <TimePeriodStat
              label="Evening"
              value={eveningCommits}
              total={total}
            />
          </div>

          <p className="mt-4 text-caption">
            Scope: all recorded commits. Periods are 12am–6am, 6am–12pm,
            12pm–6pm and 6pm–12am.
          </p>
        </div>
      ) : (
        <p className="flex h-48 items-center justify-center text-caption">
          No hourly activity data available.
        </p>
      )}
    </div>
  );
}

// ===========================================
// Helper Components
// ===========================================

function TimePeriodStat({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="min-w-0 border-l border-border-subtle pl-3">
      <p className="font-display text-xl font-bold leading-none text-text tabular-nums">
        {percentage}%
      </p>
      <p className="mt-1 text-label">{label}</p>
    </div>
  );
}

// ===========================================
// Helper Functions
// ===========================================

function formatHourLabel(hour: number): string {
  if (hour === 0) return "12a";
  if (hour === 12) return "12p";
  if (hour < 12) return `${hour}a`;
  return `${hour - 12}p`;
}

function formatPeakTime(hour: number): string {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:00 ${period}`;
}

function formatHourRange(hour: number): string {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:00–${displayHour}:59 ${period}`;
}

function getCodingStyle(
  morning: number,
  afternoon: number,
  evening: number,
  night: number
): string {
  const total = morning + afternoon + evening + night;
  if (total === 0) return "Not enough data";

  const max = Math.max(morning, afternoon, evening, night);

  if (max === night && night / total > 0.3) return "Night owl";
  if (max === morning && morning / total > 0.3) return "Early bird";
  if (max === afternoon && afternoon / total > 0.3) return "Afternoon coder";
  if (max === evening && evening / total > 0.3) return "Evening developer";

  return "Balanced";
}
