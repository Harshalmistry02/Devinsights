'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Loader2, GitBranch, Star, GitFork, Clock, Code2, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RepositoryDetailModalProps {
  repoId: string;
  open: boolean;
  onClose: () => void;
}

interface RepositoryData {
  id: string;
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  language: string | null;
  stars: number;
  forks: number;
  isPrivate: boolean;
  defaultBranch: string;
  lastPushedAt: Date | null;
  createdAt: Date;
  commits: Array<{
    id: string;
    sha: string;
    message: string;
    authorName: string;
    authorDate: Date;
  }>;
  _count: {
    commits: number;
  };
}

/**
 * Repository Detail Modal
 * Displays detailed information about a specific repository
 * with tabs for overview, commits, and activity
 */
export function RepositoryDetailModal({ repoId, open, onClose }: RepositoryDetailModalProps) {
  const [repoData, setRepoData] = useState<RepositoryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'commits' | 'activity'>('overview');

  const fetchRepositoryDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/repositories/${repoId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch repository details');
      }
      const data = await response.json();
      setRepoData(data);
    } catch (err) {
      console.error('Failed to fetch repository details:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [repoId]);

  useEffect(() => {
    if (!open || !repoId) return;

    void fetchRepositoryDetails();
  }, [open, repoId, fetchRepositoryDetails]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm bg-black/85"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="repo-modal-title"
    >
      <div
        className="border border-[rgba(240,240,250,0.15)] rounded-2xl w-full max-w-4xl max-h-[90dvh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-3 p-4 sm:p-6 border-b border-[rgba(240,240,250,0.15)]">
          <h2 id="repo-modal-title" className="text-lg sm:text-xl font-semibold opacity-80 break-words">
            {loading ? 'Loading...' : repoData?.fullName || 'Repository Details'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 opacity-80" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#f0f0fa]" />
              <span className="ml-3 opacity-80">Loading repository details...</span>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchRepositoryDetails}
                className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 text-[#f0f0fa] hover:bg-cyan-500/20 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : repoData ? (
            <>
              {/* Tabs */}
              <div className="border-b border-[rgba(240,240,250,0.15)] px-4 sm:px-6 overflow-x-auto">
                <div className="flex gap-4 sm:gap-6 min-w-max">
                  {(['overview', 'commits', 'activity'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "py-3 px-1 border-b-2 font-medium text-sm transition-colors capitalize",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
                        activeTab === tab
                          ? "border-cyan-400 text-[#f0f0fa]"
                          : "border-transparent opacity-80 hover:opacity-80"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-4 sm:p-6">
                {activeTab === 'overview' && (
                  <RepositoryOverview data={repoData} />
                )}
                {activeTab === 'commits' && (
                  <CommitsList commits={repoData.commits} totalCount={repoData._count.commits} />
                )}
                {activeTab === 'activity' && (
                  <ActivityView data={repoData} />
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// Sub-components for each tab

function RepositoryOverview({ data }: { data: RepositoryData }) {
  return (
    <div className="space-y-6">
      {data.description && (
        <div>
          <h3 className="text-sm font-medium opacity-80 mb-2">Description</h3>
          <p className="opacity-80">{data.description}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <StatBox
          icon={<Star className="w-4 h-4" />}
          label="Stars"
          value={data.stars.toLocaleString()}
        />
        <StatBox
          icon={<GitFork className="w-4 h-4" />}
          label="Forks"
          value={data.forks.toLocaleString()}
        />
        <StatBox
          icon={<GitBranch className="w-4 h-4" />}
          label="Default Branch"
          value={data.defaultBranch}
        />
        <StatBox
          icon={<Code2 className="w-4 h-4" />}
          label="Language"
          value={data.language || 'N/A'}
        />
        <StatBox
          icon={<Activity className="w-4 h-4" />}
          label="Commits"
          value={data._count.commits.toLocaleString()}
        />
        <StatBox
          icon={<Clock className="w-4 h-4" />}
          label="Last Push"
          value={data.lastPushedAt ? new Date(data.lastPushedAt).toLocaleDateString() : 'N/A'}
        />
      </div>

      <div>
        <a
          href={data.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 text-[#f0f0fa] hover:bg-cyan-500/20 transition-colors"
        >
          View on GitHub
          <span aria-hidden="true">→</span>
        </a>
      </div>
    </div>
  );
}

function CommitsList({ commits, totalCount }: { commits: RepositoryData['commits']; totalCount: number }) {
  return (
    <div className="space-y-4">
      <p className="text-sm opacity-80">
        Showing {commits.length} of {totalCount} total commits
      </p>
      <div className="space-y-3">
        {commits.length === 0 ? (
          <p className="opacity-80 text-center py-8">No commits found</p>
        ) : (
          commits.map((commit) => (
            <div
              key={commit.id}
              className="border border-[rgba(240,240,250,0.15)] p-4"
            >
              <p className="text-sm opacity-80 mb-1">{commit.message}</p>
              <div className="flex items-center justify-between text-xs opacity-80 gap-3 flex-wrap">
                <span>{commit.authorName}</span>
                <span>{new Date(commit.authorDate).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ActivityView({ data }: { data: RepositoryData }) {
  return (
    <div className="space-y-4">
      <div className="border border-[rgba(240,240,250,0.15)] p-4">
        <h4 className="text-sm font-medium opacity-80 mb-2">Repository Timeline</h4>
        <div className="space-y-2 text-sm opacity-80">
          <div className="flex justify-between gap-3 flex-wrap">
            <span>Created</span>
            <span className="opacity-80">{new Date(data.createdAt).toLocaleDateString()}</span>
          </div>
          {data.lastPushedAt && (
            <div className="flex justify-between gap-3 flex-wrap">
              <span>Last Push</span>
              <span className="opacity-80">{new Date(data.lastPushedAt).toLocaleDateString()}</span>
            </div>
          )}
          <div className="flex justify-between gap-3 flex-wrap">
            <span>Total Commits</span>
            <span className="opacity-80">{data._count.commits.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="border border-[rgba(240,240,250,0.15)] p-4">
      <div className="flex items-center gap-2 opacity-80 mb-1">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-lg font-semibold opacity-80">{value}</p>
    </div>
  );
}
