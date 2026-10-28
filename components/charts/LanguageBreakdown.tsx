"use client";

/**
 * Language Breakdown Chart
 *
 * Donut chart and ranked bars for programming language distribution.
 */

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { ChartStat, ChartTooltipContent } from "./chart-primitives";

interface LanguageBreakdownProps {
  data: Array<{ language: string; count: number; percentage: number }>;
  className?: string;
}

export function LanguageBreakdown({
  data,
  className = "",
}: LanguageBreakdownProps) {
  const chartData = data.map((item, index) => ({
    name: item.language,
    value: item.count,
    percentage: item.percentage,
    color: getLanguageColor(index, data.length),
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className={className}>
      <div className="mb-5 grid grid-cols-2 gap-4">
        <ChartStat
          label="Languages"
          value={data.length.toLocaleString("en-US")}
          detail="In this distribution"
        />
        <ChartStat
          label="Commits"
          value={total.toLocaleString("en-US")}
          detail="Language-classified"
        />
      </div>

      {chartData.length > 0 ? (
        <div>
          <div className="flex flex-col items-center gap-6 lg:flex-row">
            <div
              className="relative h-56 w-full min-w-0 lg:w-1/2"
              role="img"
              aria-label={`Language distribution. ${chartData
                .map((item) => `${item.name} ${item.percentage}%`)
                .join(", ")}.`}
            >
              <ResponsiveContainer
                width="100%"
                height="100%"
                minWidth={0}
                minHeight={224}
              >
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={88}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    stroke="var(--surface-2)"
                    strokeWidth={2}
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={<ChartTooltipContent valueSuffix=" commits" />}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="font-display text-2xl font-bold leading-none text-text tabular-nums">
                  {total.toLocaleString("en-US")}
                </p>
                <p className="mt-1 text-label">Commits</p>
              </div>
            </div>

            <div className="w-full space-y-3 lg:w-1/2">
              {chartData.map((item) => (
                <div key={item.name} className="min-w-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-2 text-caption-bold">
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: item.color }}
                        aria-hidden="true"
                      />
                      <span className="truncate">{item.name}</span>
                    </span>
                    <span className="shrink-0 font-mono text-[11px] tabular-nums text-text-2">
                      {item.percentage}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-1 w-full overflow-hidden rounded-pill bg-white/10">
                    <div
                      className="h-full rounded-pill"
                      style={{
                        width: `${Math.max(item.percentage, 1)}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-4 text-caption">
            Scope: {total.toLocaleString("en-US")} language-classified
            commits, grouped by primary language. Commits without a detectable
            language are excluded.
          </p>
        </div>
      ) : (
        <p className="flex h-56 items-center justify-center text-caption">
          No language data available.
        </p>
      )}
    </div>
  );
}

function getLanguageColor(index: number, total: number): string {
  if (total <= 1) return "rgba(108, 180, 255, 0.9)";
  const alpha = 0.95 - (index / (total - 1)) * 0.6;
  return `rgba(108, 180, 255, ${Math.max(alpha, 0.3).toFixed(2)})`;
}
