'use client';

import React, { useState, useMemo } from 'react';
import { 
  GitBranch,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Eye,
  EyeOff,
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
        "brutalist-glass p-16 text-center border-white/5",
        className
      )}>
        <GitBranch className="w-16 h-16 opacity-10 mx-auto mb-8" />
        <h3 className="text-caption-bold text-lg opacity-40 mb-4 tracking-widest uppercase">ARCHIVE EMPTY</h3>
        <p className="text-micro opacity-20 uppercase tracking-[2px]">INITIALIZE GITHUB SYNC TO POPULATE REPOSITORY DATABASE</p>
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
    <div className={className}>
      {/* Header */}
      <div className="py-6 border-b border-white/5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="border-l-2 border-white/20 pl-6">
              <h3 className="text-caption-bold text-sm tracking-widest uppercase opacity-80">REPOSITORY DEEP DIVE</h3>
              <p className="text-micro opacity-20 uppercase tracking-widest mt-2 font-mono">
                {repoStats.length} ENTRIES ARCHIVED
              </p>
            </div>
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('treemap')}
              className={cn(
                "px-5 py-2 text-micro tracking-widest transition-all uppercase border border-white/10",
                viewMode === 'treemap' 
                  ? "bg-[#f0f0fa] text-[#000000] font-bold"
                  : "opacity-30 hover:opacity-100"
              )}
            >
              TREEMAP
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                "px-5 py-2 text-micro tracking-widest transition-all uppercase border border-white/10",
                viewMode === 'table' 
                  ? "bg-[#f0f0fa] text-[#000000] font-bold"
                  : "opacity-30 hover:opacity-100"
              )}
            >
              TABLE
            </button>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="py-8">
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
          <div className="mt-8 text-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="btn-ghost flex items-center gap-3 px-8 py-3 text-micro uppercase tracking-widest mx-auto"
            >
              {showAll ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 opacity-40" />
                  DISPLAY COMPACT
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 opacity-40" />
                  ARCHIVE EXPANSION ({sortedRepos.length - 20} ADDITIONAL)
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

function TreemapView({ repos, onRepoClick, selectedRepoId }: {
  repos: RepoStat[];
  onRepoClick?: (repoId: string) => void;
  selectedRepoId?: string | null;
}) {
  const totalCommits = repos.reduce((sum, r) => sum + r.commits, 0);
  
  const treemapData = useMemo(() => {
    return repos.map(repo => {
      const percentage = totalCommits > 0 ? (repo.commits / totalCommits) * 100 : 0;
      const size = Math.max(percentage, 4);
      return { ...repo, percentage, size };
    });
  }, [repos, totalCommits]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 xl:grid-cols-12 gap-3 auto-rows-fr" style={{ minHeight: '320px' }}>
      {treemapData.map((repo) => {
        const span = repo.size > 20 ? 3 : repo.size > 10 ? 2 : 1;
        const isSelected = selectedRepoId === repo.id;
        
        return (
          <div
            key={repo.id}
            className={cn(
              "brutalist-glass relative overflow-hidden cursor-pointer transition-all duration-500 group border border-white/5",
              isSelected 
                ? "border-white/40 bg-white/5 ring-4 ring-white/5" 
                : "hover:border-white/20 hover:bg-white/[0.02]"
            )}
            style={{ 
              gridColumn: `span ${span}`,
              gridRow: `span ${span}`,
            }}
            onClick={() => onRepoClick?.(repo.id)}
          >
            {/* Intensity gradient hint (achromatic) */}
            <div 
              className="absolute inset-0 opacity-5 pointer-events-none"
              style={{ background: `linear-gradient(to bottom right, white, transparent)` }}
            />
            
            {/* Content */}
            <div className="p-5 h-full flex flex-col justify-between relative z-10">
              <div className="text-micro font-bold tracking-widest opacity-60 group-hover:opacity-100 transition-opacity truncate">
                {repo.name.toUpperCase()}
              </div>
              <div className="mt-auto space-y-1">
                 <div className="flex items-center justify-between">
                    <span className="text-micro opacity-20 uppercase tracking-widest truncate">{repo.language?.toUpperCase() || 'VOID'}</span>
                    <span className="text-micro opacity-40 font-mono">{repo.commits}</span>
                 </div>
              </div>
            </div>

            {/* Selection indicator */}
            {isSelected && (
              <div className="absolute top-0 right-0 p-1">
                 <div className="w-1.5 h-1.5 bg-white shadow-glow" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ===========================================
// Table View
// ===========================================

function renderSortIcon(field: SortField, sortField: SortField, sortDirection: SortDirection) {
  if (sortField !== field) {
    return <ArrowUpDown className="w-3 h-3 opacity-20" />;
  }

  return sortDirection === 'desc'
    ? <ChevronDown className="w-3.5 h-3.5 opacity-80" />
    : <ChevronUp className="w-3.5 h-3.5 opacity-80" />;
}

function TableView({ 
  repos, 
  sortField, 
  sortDirection, 
  onSort, 
  onRepoClick,
  selectedRepoId 
}: {
  repos: RepoStat[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onRepoClick?: (repoId: string) => void;
  selectedRepoId?: string | null;
}) {
  return (
    <div className="overflow-x-auto brutalist-glass">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-white/10">
            <th 
              className="py-5 px-6 opacity-30 text-micro font-bold tracking-widest cursor-pointer hover:opacity-100 transition-all uppercase"
              onClick={() => onSort('name')}
            >
              <div className="flex items-center gap-2">REPOSITORY {renderSortIcon('name', sortField, sortDirection)}</div>
            </th>
            <th 
              className="py-5 px-6 opacity-30 text-micro font-bold tracking-widest cursor-pointer hover:opacity-100 transition-all uppercase"
              onClick={() => onSort('language')}
            >
              <div className="flex items-center gap-2">LANGUAGE {renderSortIcon('language', sortField, sortDirection)}</div>
            </th>
            <th 
              className="py-5 px-6 opacity-30 text-micro font-bold tracking-widest text-right cursor-pointer hover:opacity-100 transition-all uppercase"
              onClick={() => onSort('commits')}
            >
              <div className="flex items-center justify-end gap-2">ACTIVITY {renderSortIcon('commits', sortField, sortDirection)}</div>
            </th>
            <th className="py-5 px-6 opacity-30 text-micro font-bold tracking-widest text-right uppercase">ACTION</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {repos.map((repo) => {
            const isSelected = selectedRepoId === repo.id;
            return (
              <tr 
                key={repo.id}
                className={cn(
                  "hover:bg-white/[0.02] transition-colors cursor-pointer group",
                  isSelected && "bg-white/5"
                )}
                onClick={() => onRepoClick?.(repo.id)}
              >
                <td className="py-4 px-6">
                  <span className="text-micro font-bold opacity-70 group-hover:opacity-100 transition-opacity uppercase tracking-widest">{repo.name}</span>
                </td>
                <td className="py-4 px-6 text-micro opacity-40 uppercase tracking-widest">
                  {repo.language || 'UNKNOWN'}
                </td>
                <td className="py-4 px-6 text-right font-mono text-micro opacity-40 group-hover:opacity-80 transition-opacity">
                  {repo.commits.toLocaleString()}
                </td>
                <td className="py-4 px-6 text-right">
                  <a
                    href={`https://github.com/${repo.fullName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex p-2 opacity-20 hover:opacity-100 transition-opacity border border-white/5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
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
