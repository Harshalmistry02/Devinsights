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
    <div className="section-cinematic bg-black">
      <div 
        className="section-photo" 
        style={{ 
          backgroundImage: "url('/space-hero.png')", 
          backgroundSize: "cover", 
          backgroundPosition: "center",
          position: "fixed"
        }} 
      />
      <div className="section-overlay" style={{ position: "fixed" }} />
      <div className="section-content relative z-20 w-full" style={{ padding: "120px clamp(24px, 6vw, 80px) 40px" }}>
        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "24px" }}>
            <Link
              href="/dashboard"
              className="p-3 brutalist-glass hover:bg-white/5 transition-all opacity-40 hover:opacity-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <p className="text-micro uppercase tracking-widest opacity-40 mb-2">ARCHIVE</p>
              <h1 className="text-section-head flex items-center gap-4">
                <Code className="w-8 h-8 opacity-50" />
                REPOSITORIES
              </h1>
              <p className="text-micro uppercase tracking-widest opacity-30 mt-2">
                {totalRepos} DEPLOYMENTS SYNCED TO THE ARCHIVE
              </p>
            </div>
          </div>
        </div>

        {/* Summary Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <SummaryCard
            label="TOTAL REPOS"
            value={totalRepos}
          />
          <SummaryCard
            label="COMMIT LOGS"
            value={totalCommits}
          />
          <SummaryCard
            label="STAR COUNT"
            value={totalStars}
          />
          <SummaryCard
            label="FORK COUNT"
            value={totalForks}
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

        {/* Language Archive */}
        {Object.keys(languageCounts).length > 0 && (
          <div className="mt-12 brutalist-glass p-8">
            <p className="text-micro uppercase tracking-widest opacity-40 mb-6">TECHNOLOGY STACK</p>
            <div className="flex flex-wrap gap-3">
              {Object.entries(languageCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([language, count]) => (
                  <span
                    key={language}
                    className="px-4 py-2 border border-[rgba(240,240,250,0.1)] text-micro uppercase tracking-widest opacity-60"
                  >
                    {language} <span className="opacity-30">[{count}]</span>
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
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="brutalist-glass p-6 border-l-2 border-l-[rgba(240,240,250,0.1)]">
      <p className="text-micro opacity-40 mb-3 tracking-[2px] uppercase">{label}</p>
      <p className="text-display-hero text-3xl font-bold opacity-80 tabular-nums">{value.toLocaleString()}</p>
    </div>
  );
}

function RepositoryCard({
  repo,
  commitCount,
}: {
  repo: any;
  commitCount: number;
}) {
  return (
    <div className="brutalist-glass p-8 hover:bg-white/[0.02] transition-all group flex flex-col justify-between h-some min-h-[220px]">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {repo.isPrivate ? (
            <Lock className="w-4 h-4 text-yellow-500 shrink-0" />
          ) : (
            <Globe className="w-4 h-4 text-green-500 shrink-0" />
          )}
          <h3 className="opacity-80 font-semibold truncate group-hover:text-[#f0f0fa] transition-colors">
            {repo.name}
          </h3>
        </div>
        <a
          href={`https://github.com/${repo.fullName}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 opacity-80 hover:text-[#f0f0fa] hover: transition-all"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Description */}
      {repo.description && (
        <p className="text-sm opacity-80 mb-4 line-clamp-2">
          {repo.description}
        </p>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm opacity-80 mb-4">
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
      <div className="flex items-center justify-between pt-3 border-t border-[rgba(240,240,250,0.15)]">
        {repo.language && (
          <span className="px-2 py-1 text-xs opacity-80">
            {repo.language}
          </span>
        )}
        {repo.lastSyncedAt && (
          <div className="flex items-center gap-1 text-xs opacity-80">
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
    <div className="border border-[rgba(240,240,250,0.15)] p-12 backdrop-blur-sm text-center">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/30 -full flex items-center justify-center mx-auto mb-6">
          <Code className="w-8 h-8 text-[#f0f0fa]" />
        </div>
        <h2 className="text-xl font-semibold opacity-80 mb-3">
          No Repositories Synced
        </h2>
        <p className="opacity-80 mb-6">
          Sync your GitHub data to see your repositories here.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500/20 border border-cyan-500/30 text-[#f0f0fa] hover:bg-cyan-500/30 hover:border-cyan-500/50 transition-all font-medium"
        >
          <RefreshCw className="w-5 h-5" />
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
