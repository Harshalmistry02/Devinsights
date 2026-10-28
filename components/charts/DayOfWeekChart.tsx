"use client";

/**
 * Day of Week Chart
 *
 * Commit distribution across days of the week.
 */

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const FULL_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function DayOfWeekChart({ data, className = "" }: DayOfWeekChartProps) {
  const chartData = FULL_DAYS.map((day, index) => ({
    day: DAYS[index],
    fullDay: day,
    commits: data[day as keyof DayOfWeekStats] || 0,
  }));

  const total = chartData.reduce((sum, item) => sum + item.commits, 0);
  const maxCommits = Math.max(...chartData.map((item) => item.commits));
  const mostProductiveDay =
    total > 0
      ? chartData.find((item) => item.commits === maxCommits)?.fullDay
      : null;

  const weekdayTotal = chartData
    .slice(0, 5)
    .reduce((sum, item) => sum + item.commits, 0);
  const weekdayRatio = total > 0 ? Math.round((weekdayTotal / total) * 100) : 0;

  return (
    <div className={className}>
      <div className="mb-5 grid grid-cols-2 gap-4">
        <ChartStat
          label="Most productive day"
          value={mostProductiveDay ?? "No activity"}
          detail="Across all recorded commits"
        />
        <ChartStat
          label="Weekday ratio"
          value={`${weekdayRatio}%`}
          detail="Monday to Friday share"
        />
      </div>

      {total > 0 ? (
        <div>
          <div
            className="h-48 min-h-48 min-w-0"
            role="img"
            aria-label={`Commits by day of week. ${mostProductiveDay} is the most productive day. ${weekdayRatio}% of commits fall on weekdays.`}
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
                  dataKey="day"
                  tick={chartTick}
                  tickLine={false}
                  axisLine={chartAxisLine}
                />
                <YAxis
                  tick={chartTick}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  width={36}
                />
                <Tooltip
                  content={<ChartTooltipContent valueSuffix=" commits" />}
                  cursor={{ fill: "var(--surface-hover)" }}
                />
                <Bar dataKey="commits" name="Commits" radius={[3, 3, 0, 0]} maxBarSize={36}>
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.fullDay}
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

          <p className="mt-3 text-caption">
            Scope: all recorded commits. The accent bar marks your most active
            day.
          </p>
        </div>
      ) : (
        <p className="flex h-48 items-center justify-center text-caption">
          No weekly activity data available.
        </p>
      )}
    </div>
  );
}
