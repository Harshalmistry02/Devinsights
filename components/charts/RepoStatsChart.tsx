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
import { GitBranch, Star, GitFork } from 'lucide-react';

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
  showViewAll?: boolean;
}

const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export function RepoStatsChart({ data, className = '', limit = 6, showViewAll = true }: RepoStatsChartProps) {
  // Get top repos by commits
  const topRepos = data
    .sort((a, b) => b.commits - a.commits)
    .slice(0, limit);

  // Calculate totals
  const totalCommits = data.reduce((sum, r) => sum + r.commits, 0);
  const totalStars = data.reduce((sum, r) => sum + r.stars, 0);
  const totalForks = data.reduce((sum, r) => sum + r.forks, 0);

  const hiddenRepos = data.length - topRepos.length;

  return (
    <div className={` border border-[rgba(240,240,250,0.15)]  backdrop-blur-sm ${className}`}>
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-[rgba(240,240,250,0.15)]">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold opacity-80">
              Top Repositories
              {hiddenRepos > 0 && (
                <span className="text-sm font-normal opacity-80 ml-2">
                  (showing {topRepos.length} of {data.length})
                </span>
              )}
            </h3>
            <p className="text-sm opacity-80">By commit activity</p>
          </div>
          {showViewAll && data.length > limit && (
            <a
              href="/repositories"
              className="text-sm text-[#f0f0fa] hover:text-[#f0f0fa] hover:underline transition-colors"
            >
              View all →
            </a>
          )}
        </div>
        
        {/* Summary Stats */}
        <div className="flex items-center gap-6 mt-3">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-[#f0f0fa]" />
            <span className="text-sm opacity-80">{data.length} repos</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-sm opacity-80">{totalStars.toLocaleString()} stars</span>
          </div>
          <div className="flex items-center gap-2">
            <GitFork className="w-4 h-4 text-purple-400" />
            <span className="text-sm opacity-80">{totalForks.toLocaleString()} forks</span>
          </div>
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
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} horizontal={true} vertical={false} />
                <XAxis
                  type="number"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: '#475569' }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={120}
                />
                <Tooltip content={<CustomTooltip totalCommits={totalCommits} />} cursor={{ fill: 'rgba(6, 182, 212, 0.1)' }} />
                <Bar dataKey="commits" radius={[0, 6, 6, 0]} maxBarSize={30}>
                  {topRepos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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

function CustomTooltip({ active, payload, totalCommits }: any) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const percentage = totalCommits > 0 
    ? ((data.commits / totalCommits) * 100).toFixed(1)
    : '0';

  return (
    <div className="border border-[rgba(240,240,250,0.15)] p-3 min-w-[180px]">
      <p className="text-sm font-medium opacity-80 mb-2 truncate">{data.fullName}</p>
      
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs opacity-80">Commits</span>
          <span className="text-sm font-semibold text-[#f0f0fa]">{data.commits.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs opacity-80">Share</span>
          <span className="text-sm opacity-80">{percentage}%</span>
        </div>
        {data.language && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs opacity-80">Language</span>
            <span className="text-sm text-purple-400">{data.language}</span>
          </div>
        )}
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs opacity-80">Stars</span>
          <span className="text-sm text-yellow-400">⭐ {data.stars}</span>
        </div>
      </div>
    </div>
  );
}
