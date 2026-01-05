import { requireAuth } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { 
  ArrowLeft, 
  Code, 
  Star, 
  GitFork, 
  Clock,
  ExternalLink,
  GitCommit,
  Lock,
  Globe,
  RefreshCw,
} from "lucide-react";

/**
 * Repositories Page
 * 
 * Lists all synced repositories with stats
 */
export default async function RepositoriesPage() {
  const session = await requireAuth();
  const { user } = session;

  // Fetch repositories with commit counts
  const repositories = await prisma.repository.findMany({
    where: { userId: user.id },
    include: {
      _count: {
        select: { commits: true }
      }
    },
    orderBy: { lastSyncedAt: 'desc' }
  });

  // Calculate totals
  const totalRepos = repositories.length;
  const totalStars = repositories.reduce((sum, r) => sum + r.stars, 0);
  const totalForks = repositories.reduce((sum, r) => sum + r.forks, 0);
  const totalCommits = repositories.reduce((sum, r) => sum + r._count.commits, 0);

  // Group by language
  const languageCounts: Record<string, number> = {};
  repositories.forEach(repo => {
    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
    }
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 pt-20 sm:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/dashboard"
              className="p-2 bg-slate-800/50 border border-slate-700/30 rounded-lg hover:bg-slate-800 hover:border-slate-600 transition-all text-slate-400 hover:text-slate-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-200 flex items-center gap-3">
                <Code className="w-8 h-8 text-cyan-400" />
                Repositories
              </h1>
              <p className="text-slate-400 mt-1">
                {totalRepos} repositories synced
              </p>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            icon={<Code className="w-5 h-5" />}
            label="Repositories"
            value={totalRepos}
            color="cyan"
          />
          <SummaryCard
            icon={<GitCommit className="w-5 h-5" />}
            label="Total Commits"
            value={totalCommits}
            color="blue"
          />
          <SummaryCard
            icon={<Star className="w-5 h-5" />}
            label="Stars"
            value={totalStars}
            color="yellow"
          />
          <SummaryCard
            icon={<GitFork className="w-5 h-5" />}
            label="Forks"
            value={totalForks}
            color="purple"
          />
        </div>

        {/* Repository Grid */}
        {repositories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {repositories.map((repo) => (
              <RepositoryCard key={repo.id} repo={repo} commitCount={repo._count.commits} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}

        {/* Language Distribution */}
        {Object.keys(languageCounts).length > 0 && (
          <div className="mt-8 bg-slate-900/50 border border-slate-700/30 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">Languages</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(languageCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([language, count]) => (
                  <span
                    key={language}
                    className="px-3 py-1.5 bg-slate-800/50 border border-slate-700/30 rounded-full text-sm text-slate-300"
                  >
                    {language} <span className="text-slate-500">({count})</span>
                  </span>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ===========================================
// Components
// ===========================================

function SummaryCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'cyan' | 'blue' | 'yellow' | 'purple';
}) {
  const colorClasses = {
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  };

  return (
    <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg border ${colorClasses[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-xl font-bold text-slate-200">{value.toLocaleString()}</p>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

function RepositoryCard({
  repo,
  commitCount,
}: {
  repo: {
    id: string;
    name: string;
    fullName: string;
    description: string | null;
    language: string | null;
    stars: number;
    forks: number;
    isPrivate: boolean;
    lastSyncedAt: Date | null;
  };
  commitCount: number;
}) {
  return (
    <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-5 backdrop-blur-sm hover:border-cyan-500/30 transition-all group">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {repo.isPrivate ? (
            <Lock className="w-4 h-4 text-yellow-500 shrink-0" />
          ) : (
            <Globe className="w-4 h-4 text-green-500 shrink-0" />
          )}
          <h3 className="text-slate-200 font-semibold truncate group-hover:text-cyan-400 transition-colors">
            {repo.name}
          </h3>
        </div>
        <a
          href={`https://github.com/${repo.fullName}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 text-slate-500 hover:text-cyan-400 hover:bg-slate-800 rounded transition-all"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Description */}
      {repo.description && (
        <p className="text-sm text-slate-400 mb-4 line-clamp-2">
          {repo.description}
        </p>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
        <div className="flex items-center gap-1">
          <GitCommit className="w-4 h-4" />
          <span>{commitCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-500" />
          <span>{repo.stars}</span>
        </div>
        <div className="flex items-center gap-1">
          <GitFork className="w-4 h-4 text-purple-400" />
          <span>{repo.forks}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-700/30">
        {repo.language && (
          <span className="px-2 py-1 bg-slate-800/50 rounded text-xs text-slate-400">
            {repo.language}
          </span>
        )}
        {repo.lastSyncedAt && (
          <div className="flex items-center gap-1 text-xs text-slate-600">
            <Clock className="w-3 h-3" />
            <span>
              {new Date(repo.lastSyncedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-12 backdrop-blur-sm text-center">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <Code className="w-8 h-8 text-cyan-400" />
        </div>
        <h2 className="text-xl font-semibold text-slate-200 mb-3">
          No Repositories Synced
        </h2>
        <p className="text-slate-400 mb-6">
          Sync your GitHub data to see your repositories here.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/30 hover:border-cyan-500/50 transition-all font-medium"
        >
          <RefreshCw className="w-5 h-5" />
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
