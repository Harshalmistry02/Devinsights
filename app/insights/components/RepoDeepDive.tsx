'use client';

import React, { useState, useMemo } from 'react';
import { 
  GitBranch,
  Star,
  GitFork,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Code,
  Eye,
  EyeOff,
  LayoutGrid,
  List,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ===========================================
// Type Definitions
// ===========================================

interface RepoStat {
  id: string;
  name: string;
  fullName: string;
  commits: number;
  stars: number;
  forks: number;
  language: string | null;
  additions?: number;
  deletions?: number;
  lastCommitDate?: Date | string | null;
}

interface RepoDeepDiveProps {
  repoStats: RepoStat[] | null;
  onRepoSelect?: (repoId: string | null) => void;
  selectedRepoId?: string | null;
  className?: string;
}

type SortField = 'commits' | 'stars' | 'name' | 'language';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'treemap' | 'table';

// Language color mapping
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  Python: '#3572a5',
  Java: '#b07219',
  Go: '#00add8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4f5d95',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Swift: '#f05138',
  Kotlin: '#a97bff',
  Dart: '#00b4ab',
  Scala: '#c22d40',
  Shell: '#89e051',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Vue: '#41b883',
  Svelte: '#ff3e00',
};

const DEFAULT_LANGUAGE_COLOR = '#6e7681';

// ===========================================
// Main Component
// ===========================================

export function RepoDeepDive({ 
  repoStats, 
  onRepoSelect, 
  selectedRepoId,
  className 
}: RepoDeepDiveProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('treemap');
  const [sortField, setSortField] = useState<SortField>('commits');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showAll, setShowAll] = useState(false);
  
  // Sort repos
  const sortedRepos = useMemo(() => {
    if (!repoStats || repoStats.length === 0) return [];
    
    return [...repoStats].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'commits':
          comparison = a.commits - b.commits;
          break;
        case 'stars':
          comparison = a.stars - b.stars;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'language':
          comparison = (a.language || '').localeCompare(b.language || '');
          break;
      }
      
      return sortDirection === 'desc' ? -comparison : comparison;
    });
  }, [repoStats, sortField, sortDirection]);
  
  // Limit display for performance
  const displayedRepos = showAll ? sortedRepos : sortedRepos.slice(0, 20);
  const hasMore = sortedRepos.length > 20;
  
  if (!repoStats || repoStats.length === 0) {
    return (
      <div className={cn(
        "bg-slate-900/50 border border-slate-700/30 rounded-xl p-8 text-center",
        className
      )}>
        <GitBranch className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-400 mb-2">No repository data</h3>
        <p className="text-slate-500 text-sm">Sync your GitHub data to see repository breakdown</p>
      </div>
    );
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleRepoClick = (repoId: string) => {
    if (onRepoSelect) {
      onRepoSelect(selectedRepoId === repoId ? null : repoId);
    }
  };

  return (
    <div className={cn(
      "bg-slate-900/50 border border-slate-700/30 rounded-xl overflow-hidden backdrop-blur-sm",
      className
    )}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800/50 rounded-lg">
              <GitBranch className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h3 className="font-medium text-slate-200">Repository Deep Dive</h3>
              <p className="text-xs text-slate-500">{repoStats.length} repositories analyzed</p>
            </div>
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700/30 rounded-lg p-1">
            <button
              onClick={() => setViewMode('treemap')}
              className={cn(
                "p-2 rounded-md transition-all",
                viewMode === 'treemap' 
                  ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
              )}
              title="Treemap View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                "p-2 rounded-md transition-all",
                viewMode === 'table' 
                  ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
              )}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {viewMode === 'treemap' ? (
          <TreemapView 
            repos={displayedRepos} 
            onRepoClick={handleRepoClick}
            selectedRepoId={selectedRepoId}
          />
        ) : (
          <TableView 
            repos={displayedRepos} 
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            onRepoClick={handleRepoClick}
            selectedRepoId={selectedRepoId}
          />
        )}
        
        {/* Show More Button */}
        {hasMore && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700/30 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all"
            >
              {showAll ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  Show Less
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Show All ({sortedRepos.length - 20} more)
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ===========================================
// Treemap View
// ===========================================

interface TreemapViewProps {
  repos: RepoStat[];
  onRepoClick?: (repoId: string) => void;
  selectedRepoId?: string | null;
}

function TreemapView({ repos, onRepoClick, selectedRepoId }: TreemapViewProps) {
  // Calculate total commits for sizing
  const totalCommits = repos.reduce((sum, r) => sum + r.commits, 0);
  
  // Create treemap layout
  const treemapData = useMemo(() => {
    // Simple squarified layout approximation
    return repos.map(repo => {
      const percentage = totalCommits > 0 ? (repo.commits / totalCommits) * 100 : 0;
      // Size based on percentage, min size for visibility
      const size = Math.max(percentage, 3);
      
      return {
        ...repo,
        percentage,
        size,
        color: LANGUAGE_COLORS[repo.language || ''] || DEFAULT_LANGUAGE_COLOR,
      };
    });
  }, [repos, totalCommits]);

  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 auto-rows-fr" style={{ minHeight: '240px' }}>
      {treemapData.map((repo, index) => {
        // Determine grid span based on size
        const span = repo.size > 15 ? 2 : 1;
        const isSelected = selectedRepoId === repo.id;
        
        return (
          <div
            key={repo.id}
            className={cn(
              "relative rounded-lg overflow-hidden cursor-pointer transition-all duration-300 group",
              "border-2",
              isSelected 
                ? "border-teal-400 ring-2 ring-teal-400/30 scale-[1.02]" 
                : "border-transparent hover:border-slate-600"
            )}
            style={{ 
              gridColumn: `span ${span}`,
              gridRow: `span ${span}`,
              backgroundColor: `${repo.color}20`,
            }}
            onClick={() => onRepoClick?.(repo.id)}
            title={`${repo.fullName}: ${repo.commits} commits`}
          >
            {/* Color bar */}
            <div 
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: repo.color }}
            />
            
            {/* Content */}
            <div className="p-2 h-full flex flex-col justify-between">
              <div className="text-xs font-medium text-slate-200 truncate">
                {repo.name}
              </div>
              <div className="flex items-center justify-between mt-auto">
                <span 
                  className="text-xs truncate" 
                  style={{ color: repo.color }}
                >
                  {repo.language || 'Unknown'}
                </span>
                <span className="text-xs text-slate-400 tabular-nums">
                  {repo.commits}
                </span>
              </div>
            </div>
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
              <div className="text-center">
                <div className="text-sm font-medium text-slate-200 truncate">{repo.name}</div>
                <div className="text-xs text-slate-400 mt-1">{repo.commits} commits</div>
                <div className="flex items-center justify-center gap-3 mt-2 text-xs">
                  <span className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-3 h-3" /> {repo.stars}
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <GitFork className="w-3 h-3" /> {repo.forks}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ===========================================
// Table View
// ===========================================

interface TableViewProps {
  repos: RepoStat[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onRepoClick?: (repoId: string) => void;
  selectedRepoId?: string | null;
}

function TableView({ 
  repos, 
  sortField, 
  sortDirection, 
  onSort, 
  onRepoClick,
  selectedRepoId 
}: TableViewProps) {
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-600" />;
    }
    return sortDirection === 'desc' 
      ? <ChevronDown className="w-3 h-3 text-teal-400" />
      : <ChevronUp className="w-3 h-3 text-teal-400" />;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700/30">
            <th 
              className="text-left py-3 px-2 text-slate-400 font-medium cursor-pointer hover:text-slate-200 transition-colors"
              onClick={() => onSort('name')}
            >
              <div className="flex items-center gap-1">
                Repository <SortIcon field="name" />
              </div>
            </th>
            <th 
              className="text-left py-3 px-2 text-slate-400 font-medium cursor-pointer hover:text-slate-200 transition-colors"
              onClick={() => onSort('language')}
            >
              <div className="flex items-center gap-1">
                Language <SortIcon field="language" />
              </div>
            </th>
            <th 
              className="text-right py-3 px-2 text-slate-400 font-medium cursor-pointer hover:text-slate-200 transition-colors"
              onClick={() => onSort('commits')}
            >
              <div className="flex items-center justify-end gap-1">
                Commits <SortIcon field="commits" />
              </div>
            </th>
            <th 
              className="text-right py-3 px-2 text-slate-400 font-medium cursor-pointer hover:text-slate-200 transition-colors"
              onClick={() => onSort('stars')}
            >
              <div className="flex items-center justify-end gap-1">
                Stars <SortIcon field="stars" />
              </div>
            </th>
            <th className="text-right py-3 px-2 text-slate-400 font-medium">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {repos.map((repo) => {
            const languageColor = LANGUAGE_COLORS[repo.language || ''] || DEFAULT_LANGUAGE_COLOR;
            const isSelected = selectedRepoId === repo.id;
            
            return (
              <tr 
                key={repo.id}
                className={cn(
                  "border-b border-slate-800/50 cursor-pointer transition-all",
                  isSelected 
                    ? "bg-teal-500/10" 
                    : "hover:bg-slate-800/30"
                )}
                onClick={() => onRepoClick?.(repo.id)}
              >
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: languageColor }}
                    />
                    <span className="text-slate-200 font-medium truncate max-w-[200px]">
                      {repo.name}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <span 
                    className="text-sm"
                    style={{ color: languageColor }}
                  >
                    {repo.language || 'Unknown'}
                  </span>
                </td>
                <td className="py-3 px-2 text-right tabular-nums text-slate-300">
                  {repo.commits.toLocaleString()}
                </td>
                <td className="py-3 px-2 text-right">
                  <div className="flex items-center justify-end gap-1 text-yellow-400/80">
                    <Star className="w-3 h-3" />
                    {repo.stars}
                  </div>
                </td>
                <td className="py-3 px-2 text-right">
                  <a
                    href={`https://github.com/${repo.fullName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ===========================================
// Legend Component
// ===========================================

export function RepoLanguageLegend({ repos }: { repos: RepoStat[] }) {
  const languageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const repo of repos) {
      const lang = repo.language || 'Unknown';
      counts[lang] = (counts[lang] || 0) + repo.commits;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [repos]);

  return (
    <div className="flex flex-wrap gap-3">
      {languageCounts.map(([language, count]) => (
        <div key={language} className="flex items-center gap-1.5 text-xs">
          <div 
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: LANGUAGE_COLORS[language] || DEFAULT_LANGUAGE_COLOR }}
          />
          <span className="text-slate-400">{language}</span>
          <span className="text-slate-600">({count})</span>
        </div>
      ))}
    </div>
  );
}
