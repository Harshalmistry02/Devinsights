'use client';

/**
 * Activity Heatmap
 * 
 * GitHub-style contribution calendar showing daily commit activity
 */

import { useMemo } from 'react';

interface ActivityHeatmapProps {
  data: Record<string, number>; // { "2024-01-15": 5, "2024-01-16": 3 }
  className?: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function ActivityHeatmap({ data, className = '' }: ActivityHeatmapProps) {
  // Generate calendar data for the last 365 days
  const { calendar, months, totalCommits, maxCommits, activeDays } = useMemo(() => {
    return generateCalendarData(data);
  }, [data]);

  return (
    <div className={`bg-slate-900/50 border border-slate-700/30 rounded-xl backdrop-blur-sm ${className}`}>
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-700/30">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-200">Contribution Activity</h3>
            <p className="text-sm text-slate-500">
              <span className="text-cyan-400 font-medium">{totalCommits.toLocaleString()}</span> commits in the last year
              <span className="mx-2">·</span>
              <span className="text-purple-400">{activeDays}</span> active days
            </p>
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-slate-800 border border-slate-700" />
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: getColor(1, 10) }} />
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: getColor(3, 10) }} />
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: getColor(6, 10) }} />
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: getColor(10, 10) }} />
            </div>
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="p-4 sm:p-6 overflow-x-auto">
        <div className="min-w-[750px]">
          {/* Month Labels */}
          <div className="flex mb-2 ml-8">
            {months.map((month, index) => (
              <div
                key={index}
                className="text-xs text-slate-500"
                style={{ 
                  width: `${month.weeks * 14}px`,
                  minWidth: `${month.weeks * 14}px`
                }}
              >
                {month.name}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex">
            {/* Day Labels */}
            <div className="flex flex-col gap-[2px] mr-2 text-xs text-slate-500">
              {DAYS.map((day, index) => (
                <div 
                  key={day} 
                  className="h-3 flex items-center"
                  style={{ visibility: index % 2 === 1 ? 'visible' : 'hidden' }}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="flex gap-[2px]">
              {calendar.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-[2px]">
                  {week.map((day, dayIndex) => (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className="w-3 h-3 rounded-sm transition-all duration-200 hover:ring-2 hover:ring-cyan-400/50 cursor-pointer group relative"
                      style={{
                        backgroundColor: day 
                          ? getColor(day.commits, maxCommits)
                          : 'transparent',
                        border: day && day.commits === 0 ? '1px solid #334155' : 'none',
                      }}
                      title={day ? `${day.date}: ${day.commits} commits` : ''}
                    >
                      {/* Tooltip */}
                      {day && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                          <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
                            <p className="text-xs text-slate-400">
                              {formatDate(day.date)}
                            </p>
                            <p className="text-sm font-semibold text-cyan-400">
                              {day.commits} commit{day.commits !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
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
  
  let currentDate = new Date(startDate);
  let currentMonth = -1;
  let monthWeeks = 0;
  let totalCommits = 0;
  let activeDays = 0;
  let maxCommits = 0;
  
  // Generate weeks
  while (currentDate <= today) {
    const week: (DayData | null)[] = [];
    
    for (let day = 0; day < 7; day++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const commits = data[dateStr] || 0;
      
      if (currentDate <= today && currentDate >= oneYearAgo) {
        week.push({ date: dateStr, commits });
        totalCommits += commits;
        if (commits > 0) activeDays++;
        maxCommits = Math.max(maxCommits, commits);
      } else {
        week.push(null);
      }
      
      // Track months
      const month = currentDate.getMonth();
      if (month !== currentMonth) {
        if (currentMonth !== -1 && monthWeeks > 0) {
          // Don't add empty months
          if (months.length === 0 || months[months.length - 1].name !== MONTHS[currentMonth]) {
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
  
  // Add final month
  if (monthWeeks > 0) {
    const lastMonth = new Date(today).getMonth();
    if (months.length === 0 || months[months.length - 1].name !== MONTHS[lastMonth]) {
      months.push({ name: MONTHS[lastMonth], weeks: monthWeeks });
    }
  }
  
  return { calendar, months, totalCommits, maxCommits, activeDays };
}

function getColor(commits: number, maxCommits: number): string {
  if (commits === 0) return '#1e293b'; // slate-800
  
  const intensity = Math.min(commits / Math.max(maxCommits, 1), 1);
  
  // Cyan color gradient
  if (intensity < 0.25) return '#164e63'; // cyan-900
  if (intensity < 0.5) return '#0e7490'; // cyan-700
  if (intensity < 0.75) return '#06b6d4'; // cyan-500
  return '#22d3ee'; // cyan-400
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
