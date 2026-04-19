'use client';

/**
 * Repository Stats Chart
 * 
 * Horizontal bar chart showing top repositories by commits
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

export function RepoStatsChart({ data, className = '', limit = 6 }: RepoStatsChartProps) {
  // Get top repos by commits
  const topRepos = data
    .sort((a, b) => b.commits - a.commits)
    .slice(0, limit);

  // Calculate totals
  const totalCommits = data.reduce((sum, r) => sum + r.commits, 0);
  const totalStars = data.reduce((sum, r) => sum + r.stars, 0);
  const totalForks = data.reduce((sum, r) => sum + r.forks, 0);

  return (
    <div className={` bg-transparent border-none ${className}`}>
      {/* Header */}
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
        <div className="border-l-2 border-[rgba(240,240,250,0.1)] pl-4">
          <p className="text-micro opacity-40 mb-2 tracking-[2px]">TOTAL REPOSITORIES</p>
          <p className="text-display-hero text-3xl opacity-90 tabular-nums">{data.length}</p>
        </div>
        <div className="border-l-2 border-[rgba(240,240,250,0.1)] pl-4">
          <p className="text-micro opacity-40 mb-2 tracking-[2px]">TOTAL STARS</p>
          <p className="text-display-hero text-3xl opacity-90 tabular-nums">{totalStars.toLocaleString()}</p>
        </div>
        <div className="border-l-2 border-[rgba(240,240,250,0.1)] pl-4">
          <p className="text-micro opacity-40 mb-2 tracking-[2px]">TOTAL FORKS</p>
          <p className="text-display-hero text-3xl opacity-90 tabular-nums">{totalForks.toLocaleString()}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="p-4 sm:p-6">
        {topRepos.length > 0 ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topRepos}
                layout="vertical"
                margin={{ top: 5, right: 16, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="0" stroke="rgba(240,240,250,0.05)" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: 'rgba(240,240,250,0.3)', fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(240,240,250,0.1)' }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fill: 'rgba(240,240,250,0.6)', fontSize: 9, letterSpacing: '1px' }}
                  tickLine={false}
                  axisLine={false}
                  width={100}
                  tickFormatter={(val) => val.slice(0, 12).toUpperCase()}
                />
                <Tooltip content={<CustomTooltip totalCommits={totalCommits} />} cursor={{ fill: 'rgba(240, 240, 250, 0.05)' }} />
                <Bar dataKey="commits" radius={[0, 0, 0, 0]} maxBarSize={30}>
                  {topRepos.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill="#f0f0fa" 
                      opacity={0.8 - (index / topRepos.length) * 0.6}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-72 flex items-center justify-center opacity-80">
            <p>No repository data available</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ===========================================
// Custom Tooltip Component
// ===========================================

type CustomTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload: RepoStat }>;
  totalCommits: number;
};

function CustomTooltip({ active, payload, totalCommits }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const percentage = totalCommits > 0 
    ? ((data.commits / totalCommits) * 100).toFixed(1)
    : '0';

  return (
    <div className="brutalist-glass p-3 border-none ring-1 ring-[#f0f0fa]/10">
      <p className="text-micro font-medium opacity-40 mb-2 tracking-widest truncate">{data.fullName.toUpperCase()}</p>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-6">
          <span className="text-micro opacity-40 tracking-widest">COMMITS</span>
          <span className="text-display-hero text-lg opacity-90 tabular-nums">{data.commits.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span className="text-micro opacity-40 tracking-widest">SHARE</span>
          <span className="text-display-hero text-lg opacity-90 tabular-nums">{percentage}%</span>
        </div>
        {data.language && (
          <div className="flex items-center justify-between gap-6">
            <span className="text-micro opacity-40 tracking-widest">LANGUAGE</span>
            <span className="text-micro opacity-90 tracking-widest">{data.language.toUpperCase()}</span>
          </div>
        )}
      </div>
    </div>
  );
}
