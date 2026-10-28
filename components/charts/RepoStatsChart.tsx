"use client";

/**
 * Repository Stats Chart
 *
 * Horizontal bar chart showing the most active repositories by commits.
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
import { ChartTooltip } from "@/components/ui/chart-card";
import { ChartStat, chartAxisLine, chartGridStroke, chartTick } from "./chart-primitives";

interface RepoStat {
  id: string;
  name: string;
  fullName: string;
  commits: number;
  stars: number;
  forks: number;
  language: string | null;
}

interface RepoStatsChartProps {
  data: RepoStat[];
  className?: string;
  limit?: number;
}

export function RepoStatsChart({
  data,
  className = "",
  limit = 6,
}: RepoStatsChartProps) {
  const topRepos = [...data].sort((a, b) => b.commits - a.commits).slice(0, limit);

  const totalCommits = data.reduce((sum, repo) => sum + repo.commits, 0);
  const totalStars = data.reduce((sum, repo) => sum + repo.stars, 0);
  const totalForks = data.reduce((sum, repo) => sum + repo.forks, 0);

  return (
    <div className={className}>
      <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <ChartStat
          label="Repositories"
          value={data.length.toLocaleString("en-US")}
          detail="In this view"
        />
        <ChartStat
          label="Stars"
          value={totalStars.toLocaleString("en-US")}
          detail="Across these repositories"
        />
        <ChartStat
          label="Forks"
          value={totalForks.toLocaleString("en-US")}
          detail="Across these repositories"
        />
      </div>

      {topRepos.length > 0 ? (
        <div>
          <div
            className="h-64 min-h-64 min-w-0"
            role="img"
            aria-label={`Top ${topRepos.length} repositories by commits: ${topRepos
              .map((repo) => `${repo.name}, ${repo.commits} commits`)
              .join("; ")}.`}
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={0}
              minHeight={256}
            >
              <BarChart
                data={topRepos}
                layout="vertical"
                margin={{ top: 5, right: 12, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="0"
                  stroke={chartGridStroke}
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={chartTick}
                  tickLine={false}
                  axisLine={chartAxisLine}
                  allowDecimals={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={chartTick}
                  tickLine={false}
                  axisLine={false}
                  width={112}
                  tickFormatter={(value: string) =>
                    value.length > 15 ? `${value.slice(0, 14)}…` : value
                  }
                />
                <Tooltip
                  content={<RepoTooltipContent totalCommits={totalCommits} />}
                  cursor={{ fill: "var(--surface-hover)" }}
                />
                <Bar dataKey="commits" name="Commits" radius={[0, 3, 3, 0]} maxBarSize={22}>
                  {topRepos.map((repo, index) => (
                    <Cell
                      key={repo.id}
                      fill={
                        index === 0
                          ? "var(--accent)"
                          : "rgba(240, 240, 250, 0.22)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="mt-3 text-caption">
            Scope: all repositories in this view; the chart shows the top{" "}
            {topRepos.length} by stored commit count.
          </p>
        </div>
      ) : (
        <p className="flex h-64 items-center justify-center text-caption">
          No repository data available.
        </p>
      )}
    </div>
  );
}

interface RepoTooltipContentProps {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: RepoStat }>;
  totalCommits: number;
}

function RepoTooltipContent({
  active,
  payload,
  totalCommits,
}: RepoTooltipContentProps) {
  const repo = payload?.[0]?.payload;
  if (!active || !repo) return null;

  const share =
    totalCommits > 0 ? ((repo.commits / totalCommits) * 100).toFixed(1) : "0";

  return (
    <ChartTooltip
      active={active}
      label={repo.fullName}
      payload={[
        { name: "Commits", value: repo.commits.toLocaleString("en-US") },
        { name: "Share", value: `${share}%` },
        ...(repo.language
          ? [{ name: "Language", value: repo.language }]
          : []),
      ]}
    />
  );
}
