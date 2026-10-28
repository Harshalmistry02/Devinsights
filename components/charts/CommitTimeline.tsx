"use client";

/**
 * Commit Timeline Chart
 *
 * Daily commit activity for the last 30 days.
 */

import {
  Area,
  AreaChart,
  CartesianGrid,
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

interface CommitTimelineProps {
  data: Record<string, number>; // { "2024-01-15": 5, "2024-01-16": 3 }
  className?: string;
}

const TIMELINE_DAYS = 30;

export function CommitTimeline({ data, className = "" }: CommitTimelineProps) {
  const chartData = getChartData(data, TIMELINE_DAYS);

  const totalCommits = chartData.reduce((sum, item) => sum + item.commits, 0);
  const activeDays = chartData.filter((item) => item.commits > 0).length;
  const avgPerActiveDay =
    activeDays > 0 ? (totalCommits / activeDays).toFixed(1) : "0";
  const maxCommits = Math.max(...chartData.map((item) => item.commits), 0);

  return (
    <div className={className}>
      <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <ChartStat label="Commits" value={totalCommits.toLocaleString("en-US")} />
        <ChartStat label="Avg per active day" value={avgPerActiveDay} />
        <ChartStat label="Peak day" value={maxCommits.toLocaleString("en-US")} />
      </div>

      {chartData.length > 0 ? (
        <div>
          <div
            className="h-64 min-h-64 min-w-0"
            role="img"
            aria-label={`Daily commits over the last ${TIMELINE_DAYS} days. ${totalCommits} commits across ${activeDays} active days.`}
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={0}
              minHeight={256}
            >
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 8, left: -16, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="commitTimelineGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--accent)"
                      stopOpacity={0.28}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--accent)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="0"
                  stroke={chartGridStroke}
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={chartTick}
                  tickLine={false}
                  axisLine={chartAxisLine}
                  interval="preserveStartEnd"
                  minTickGap={28}
                  tickFormatter={(value) => formatDateLabel(value)}
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
                      labelFormatter={(value) => formatTooltipDate(value)}
                    />
                  }
                  cursor={{ stroke: "var(--border-strong)" }}
                />
                <Area
                  type="monotone"
                  dataKey="commits"
                  name="Commits"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  fill="url(#commitTimelineGradient)"
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: "var(--accent)",
                    stroke: "var(--surface-2)",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <p className="mt-3 text-caption">
            Scope: the last {TIMELINE_DAYS} days. Days without commits are
            included in the timeline.
          </p>
        </div>
      ) : (
        <p className="flex h-64 items-center justify-center text-caption">
          No commit data available.
        </p>
      )}
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
    const dateStr = date.toISOString().split("T")[0];

    result.push({
      date: dateStr,
      commits: data[dateStr] || 0,
    });
  }

  return result;
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTooltipDate(value: string | number): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
