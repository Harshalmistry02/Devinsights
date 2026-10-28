"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Eye,
  EyeOff,
  GitBranch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";
import { EmptyState } from "@/components/ui/empty-state";
import { IconTile } from "@/components/ui/icon-tile";

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

type SortField = "commits" | "stars" | "name" | "language";
type SortDirection = "asc" | "desc";
type ViewMode = "treemap" | "table";

const PAGE_SIZE = 20;

// ===========================================
// Main Component
// ===========================================

export function RepoDeepDive({
  repoStats,
  onRepoSelect,
  selectedRepoId,
  className,
}: RepoDeepDiveProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("treemap");
  const [sortField, setSortField] = useState<SortField>("commits");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [showAll, setShowAll] = useState(false);

  const sortedRepos = useMemo(() => {
    if (!repoStats || repoStats.length === 0) return [];

    return [...repoStats].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "commits":
          comparison = a.commits - b.commits;
          break;
        case "stars":
          comparison = a.stars - b.stars;
          break;
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "language":
          comparison = (a.language || "").localeCompare(b.language || "");
          break;
      }

      return sortDirection === "desc" ? -comparison : comparison;
    });
  }, [repoStats, sortField, sortDirection]);

  const displayedRepos = showAll ? sortedRepos : sortedRepos.slice(0, PAGE_SIZE);
  const hasMore = sortedRepos.length > PAGE_SIZE;

  if (!repoStats || repoStats.length === 0) {
    return (
      <Card className={cn("flex h-full flex-col", className)}>
        <div className="mb-4 flex items-center gap-3">
          <IconTile>
            <GitBranch className="size-4" />
          </IconTile>
          <div>
            <h2 className="text-card-title">Repository deep dive</h2>
            <p className="mt-1 text-caption">
              Compare activity across your synced repositories.
            </p>
          </div>
        </div>
        <EmptyState
          variant="compact"
          icon={<GitBranch className="size-4" />}
          title="No repositories in this snapshot"
          description="Sync your GitHub data to populate the repository breakdown."
        />
      </Card>
    );
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleRepoClick = (repoId: string) => {
    if (onRepoSelect) {
      onRepoSelect(selectedRepoId === repoId ? null : repoId);
    }
  };

  return (
    <Card
      padding="none"
      className={cn("overflow-hidden", className)}
      role="region"
      aria-labelledby="repo-deep-dive-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border-subtle p-5 sm:p-6">
        <div className="flex min-w-0 items-start gap-3">
          <IconTile>
            <GitBranch className="size-4" />
          </IconTile>
          <div className="min-w-0">
            <h2 id="repo-deep-dive-title" className="text-card-title">
              Repository deep dive
            </h2>
            <p className="mt-1 text-caption">
              {repoStats.length.toLocaleString("en-US")}{" "}
              {repoStats.length === 1 ? "repository" : "repositories"} in the
              latest analytics snapshot.
            </p>
          </div>
        </div>

        <div
          className="flex items-center gap-1 rounded-pill border border-border-subtle p-1"
          role="group"
          aria-label="Repository view"
        >
          <Button
            variant={viewMode === "treemap" ? "primary" : "ghost"}
            size="sm"
            className="border-transparent"
            aria-pressed={viewMode === "treemap"}
            onClick={() => setViewMode("treemap")}
          >
            Treemap
          </Button>
          <Button
            variant={viewMode === "table" ? "primary" : "ghost"}
            size="sm"
            className="border-transparent"
            aria-pressed={viewMode === "table"}
            onClick={() => setViewMode("table")}
          >
            Table
          </Button>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {viewMode === "treemap" ? (
          <TreemapView
            repos={displayedRepos}
            onRepoClick={onRepoSelect ? handleRepoClick : undefined}
            selectedRepoId={selectedRepoId}
          />
        ) : (
          <TableView
            repos={displayedRepos}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            onRepoClick={onRepoSelect ? handleRepoClick : undefined}
            selectedRepoId={selectedRepoId}
          />
        )}

        {hasMore ? (
          <div className="mt-6 flex justify-center">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAll((previous) => !previous)}
              leadingIcon={
                showAll ? (
                  <EyeOff className="size-3.5" />
                ) : (
                  <Eye className="size-3.5" />
                )
              }
            >
              {showAll
                ? "Show fewer repositories"
                : `Show all ${sortedRepos.length} repositories`}
            </Button>
          </div>
        ) : null}
      </div>
    </Card>
  );
}

// ===========================================
// Treemap View
// ===========================================

function TreemapView({
  repos,
  onRepoClick,
  selectedRepoId,
}: {
  repos: RepoStat[];
  onRepoClick?: (repoId: string) => void;
  selectedRepoId?: string | null;
}) {
  const totalCommits = repos.reduce((sum, repo) => sum + repo.commits, 0);

  const treemapData = useMemo(() => {
    return repos.map((repo) => {
      const percentage =
        totalCommits > 0 ? (repo.commits / totalCommits) * 100 : 0;
      return {
        ...repo,
        percentage,
        span: percentage >= 20 ? 2 : 1,
      };
    });
  }, [repos, totalCommits]);

  return (
    <div
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
      style={{ gridAutoRows: "minmax(108px, auto)" }}
    >
      {treemapData.map((repo) => {
        const isSelected = selectedRepoId === repo.id;

        return (
          <RepoCell
            key={repo.id}
            repo={repo}
            isSelected={isSelected}
            onClick={onRepoClick ? () => onRepoClick(repo.id) : undefined}
          />
        );
      })}
    </div>
  );
}

function RepoCell({
  repo,
  isSelected,
  onClick,
}: {
  repo: RepoStat & { percentage: number; span: number };
  isSelected: boolean;
  onClick?: () => void;
}) {
  const content = (
    <>
      <div className="flex min-w-0 items-start justify-between gap-2">
        <p className="truncate text-sm font-semibold leading-snug text-text">
          {repo.name}
        </p>
        {isSelected ? (
          <span
            className="mt-1 size-1.5 shrink-0 rounded-full bg-accent"
            aria-hidden="true"
          />
        ) : null}
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[11px] text-text-3">
            {repo.language ?? "No language"}
          </span>
          <span className="shrink-0 font-mono text-[11px] tabular-nums text-text-2">
            {repo.commits.toLocaleString("en-US")}
          </span>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-pill bg-white/10">
          <div
            className="h-full rounded-pill bg-accent"
            style={{ width: `${Math.max(repo.percentage, 2)}%` }}
          />
        </div>
      </div>
    </>
  );

  const className = cn(
    "flex min-w-0 flex-col justify-between rounded-card border p-4 text-left transition-colors duration-150",
    isSelected
      ? "border-accent/60 bg-accent-soft"
      : "border-border-subtle bg-white/[0.02]",
    onClick && "focus-ring hover:border-border-strong hover:bg-surface-hover"
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={isSelected}
        aria-label={`${repo.fullName}, ${repo.commits} commits`}
        className={className}
        style={{ gridColumn: `span ${repo.span}` }}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={className}
      style={{ gridColumn: `span ${repo.span}` }}
      aria-label={`${repo.fullName}, ${repo.commits} commits`}
    >
      {content}
    </div>
  );
}

// ===========================================
// Table View
// ===========================================

function TableView({
  repos,
  sortField,
  sortDirection,
  onSort,
  onRepoClick,
  selectedRepoId,
}: {
  repos: RepoStat[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onRepoClick?: (repoId: string) => void;
  selectedRepoId?: string | null;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left">
        <thead>
          <tr className="border-b border-border">
            <SortableHeader
              label="Repository"
              field="name"
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
            />
            <SortableHeader
              label="Language"
              field="language"
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
            />
            <SortableHeader
              label="Commits"
              field="commits"
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
              align="right"
            />
            <SortableHeader
              label="Stars"
              field="stars"
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
              align="right"
            />
            <th className="px-3 py-2 text-right">
              <span className="text-label">Link</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {repos.map((repo) => {
            const isSelected = selectedRepoId === repo.id;

            return (
              <tr
                key={repo.id}
                className={cn(
                  "transition-colors",
                  isSelected ? "bg-accent-soft" : "hover:bg-surface-hover"
                )}
              >
                <td className="px-3 py-2.5">
                  {onRepoClick ? (
                    <button
                      type="button"
                      onClick={() => onRepoClick(repo.id)}
                      aria-pressed={isSelected}
                      className="focus-ring inline-flex min-h-11 items-center rounded-[4px] text-left text-sm font-medium text-text hover:text-accent"
                    >
                      {repo.name}
                    </button>
                  ) : (
                    <span className="inline-flex min-h-11 items-center text-sm font-medium text-text">
                      {repo.name}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <span className="text-caption">
                    {repo.language ?? "No language"}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right font-mono text-xs tabular-nums text-text">
                  {repo.commits.toLocaleString("en-US")}
                </td>
                <td className="px-3 py-2.5 text-right font-mono text-xs tabular-nums text-text-2">
                  {repo.stars.toLocaleString("en-US")}
                </td>
                <td className="px-3 py-2.5 text-right">
                  <a
                    href={`https://github.com/${repo.fullName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focus-ring inline-flex size-11 items-center justify-center rounded-pill text-text-3 transition-colors hover:bg-surface-hover hover:text-text"
                    aria-label={`Open ${repo.fullName} on GitHub in a new tab`}
                  >
                    <ExternalLink className="size-3.5" aria-hidden="true" />
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

function SortableHeader({
  label,
  field,
  sortField,
  sortDirection,
  onSort,
  align = "left",
}: {
  label: string;
  field: SortField;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  align?: "left" | "right";
}) {
  const isActive = sortField === field;

  return (
    <th
      className={cn("px-3 py-2", align === "right" && "text-right")}
      aria-sort={
        isActive
          ? sortDirection === "asc"
            ? "ascending"
            : "descending"
          : "none"
      }
    >
      <button
        type="button"
        onClick={() => onSort(field)}
        className={cn(
          "focus-ring inline-flex min-h-11 items-center gap-2 text-label transition-colors hover:text-text",
          align === "right" && "justify-end"
        )}
      >
        {label}
        {isActive ? (
          sortDirection === "desc" ? (
            <ChevronDown className="size-3.5" aria-hidden="true" />
          ) : (
            <ChevronUp className="size-3.5" aria-hidden="true" />
          )
        ) : (
          <ArrowUpDown className="size-3.5" aria-hidden="true" />
        )}
      </button>
    </th>
  );
}
