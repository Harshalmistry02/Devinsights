"use client";

/**
 * Activity Heatmap
 *
 * GitHub-style contribution calendar for the last 365 days.
 */

import { useMemo } from "react";
import { ChartStat } from "./chart-primitives";

interface ActivityHeatmapProps {
  data: Record<string, number>; // { "2024-01-15": 5, "2024-01-16": 3 }
  className?: string;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ActivityHeatmap({ data, className = "" }: ActivityHeatmapProps) {
  const { calendar, months, totalCommits, maxCommits, activeDays } = useMemo(
    () => generateCalendarData(data),
    [data]
  );

  return (
    <div className={className}>
      <div className="mb-5 grid grid-cols-2 gap-4">
        <ChartStat
          label="Commits"
          value={totalCommits.toLocaleString("en-US")}
          detail="Last 365 days"
        />
        <ChartStat
          label="Active days"
          value={activeDays.toLocaleString("en-US")}
          detail="At least one commit"
        />
      </div>

      <div className="mb-3 flex items-center justify-end gap-2 text-caption">
        <span>Less</span>
        <div className="flex gap-0.5" aria-hidden="true">
          <span className="size-2.5 rounded-[2px] bg-white/[0.05]" />
          <span className="size-2.5 rounded-[2px] bg-accent/20" />
          <span className="size-2.5 rounded-[2px] bg-accent/40" />
          <span className="size-2.5 rounded-[2px] bg-accent/65" />
          <span className="size-2.5 rounded-[2px] bg-accent/90" />
        </div>
        <span>More</span>
      </div>

      <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        <div className="min-w-[640px]">
          <div className="mb-2 ml-8 flex">
            {months.map((month, index) => (
              <div
                key={`${month.name}-${index}`}
                className="text-[11px] leading-none text-text-3"
                style={{
                  width: `${month.weeks * 14}px`,
                  minWidth: `${month.weeks * 14}px`,
                }}
              >
                {month.name}
              </div>
            ))}
          </div>

          <div className="flex">
            <div className="mr-2 flex flex-col gap-0.5 text-[11px] leading-none text-text-3">
              {DAYS.map((day, index) => (
                <div
                  key={day}
                  className="flex h-3 items-center"
                  style={{ visibility: index % 2 === 1 ? "visible" : "hidden" }}
                >
                  {day}
                </div>
              ))}
            </div>

            <div
              className="flex gap-0.5"
              role="img"
              aria-label={`Commit heatmap for the last 365 days. ${totalCommits} commits across ${activeDays} active days.`}
            >
              {calendar.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-0.5">
                  {week.map((day, dayIndex) => (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className="group relative size-3 rounded-[2px] border border-transparent transition-colors duration-150 hover:border-accent"
                      style={{
                        backgroundColor: day ? getColor(day.commits, maxCommits) : "transparent",
                        borderColor:
                          day && day.commits === 0
                            ? "var(--border-subtle)"
                            : undefined,
                      }}
                      title={
                        day
                          ? `${formatDate(day.date)}: ${day.commits} ${
                              day.commits === 1 ? "commit" : "commits"
                            }`
                          : undefined
                      }
                    >
                      {day ? (
                        <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 group-hover:block">
                          <div className="whitespace-nowrap rounded-card border border-border bg-surface-2 px-3 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
                            <p className="text-[11px] font-medium text-text">
                              {formatDate(day.date)}
                            </p>
                            <p className="mt-1 text-[11px] text-text-3">
                              {day.commits}{" "}
                              {day.commits === 1 ? "commit" : "commits"}
                            </p>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="mt-3 text-caption">
        Scope: the last 365 days, ending today. Hover a cell for its daily
        commit count.
      </p>
    </div>
  );
}

// ===========================================
// Helper Functions
// ===========================================

interface DayData {
  date: string;
  commits: number;
}

interface MonthData {
  name: string;
  weeks: number;
}

function generateCalendarData(data: Record<string, number>) {
  const calendar: (DayData | null)[][] = [];
  const months: MonthData[] = [];

  const today = new Date();
  const oneYearAgo = new Date(today);
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  // Start from the nearest Sunday before one year ago
  const startDate = new Date(oneYearAgo);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const currentDate = new Date(startDate);
  let currentMonth = -1;
  let monthWeeks = 0;
  let totalCommits = 0;
  let activeDays = 0;
  let maxCommits = 0;

  while (currentDate <= today) {
    const week: (DayData | null)[] = [];

    for (let day = 0; day < 7; day++) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const commits = data[dateStr] || 0;

      if (currentDate <= today && currentDate >= oneYearAgo) {
        week.push({ date: dateStr, commits });
        totalCommits += commits;
        if (commits > 0) activeDays++;
        maxCommits = Math.max(maxCommits, commits);
      } else {
        week.push(null);
      }

      const month = currentDate.getMonth();
      if (month !== currentMonth) {
        if (currentMonth !== -1 && monthWeeks > 0) {
          if (
            months.length === 0 ||
            months[months.length - 1].name !== MONTHS[currentMonth]
          ) {
            months.push({ name: MONTHS[currentMonth], weeks: monthWeeks });
          }
        }
        currentMonth = month;
        monthWeeks = 0;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    monthWeeks++;
    calendar.push(week);
  }

  if (monthWeeks > 0) {
    const lastMonth = new Date(today).getMonth();
    if (
      months.length === 0 ||
      months[months.length - 1].name !== MONTHS[lastMonth]
    ) {
      months.push({ name: MONTHS[lastMonth], weeks: monthWeeks });
    }
  }

  return { calendar, months, totalCommits, maxCommits, activeDays };
}

function getColor(commits: number, maxCommits: number): string {
  if (commits === 0) return "rgba(240, 240, 250, 0.05)";
  const intensity = Math.min(commits / Math.max(maxCommits, 1), 1);
  return `rgba(108, 180, 255, ${0.18 + intensity * 0.72})`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
