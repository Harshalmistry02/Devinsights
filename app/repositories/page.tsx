import { requireAuth } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import {
  Clock,
  Code,
  ExternalLink,
  GitCommit,
  GitFork,
  Globe,
  Lock,
  RefreshCw,
  Star,
} from "lucide-react";
import { Badge, Chip } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { SectionHeader } from "@/components/ui/section-header";
import { SpaceBackground } from "@/components/ui/space-background";
import { StatCard } from "@/components/ui/stat-card";

type RepositoryWithCommitCount = Prisma.RepositoryGetPayload<{
  include: { _count: { select: { commits: true } } };
}>;

/**
 * Repositories Page
 *
 * Lists all synced repositories with stats.
 */
export default async function RepositoriesPage() {
  const session = await requireAuth();
  const { user } = session;

  // Fetch repositories with commit counts
  const repositories = await prisma.repository.findMany({
    where: { userId: user.id },
    include: {
      _count: {
        select: { commits: true },
      },
    },
    orderBy: { lastSyncedAt: "desc" },
  });

  // Calculate totals
  const totalRepos = repositories.length;
  const totalStars = repositories.reduce((sum, repo) => sum + repo.stars, 0);
  const totalForks = repositories.reduce((sum, repo) => sum + repo.forks, 0);
  const totalCommits = repositories.reduce(
    (sum, repo) => sum + repo._count.commits,
    0
  );

  // Group by language
  const languageCounts: Record<string, number> = {};
  repositories.forEach((repo) => {
    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
    }
  });

  const languages = Object.entries(languageCounts).sort(
    (a, b) => b[1] - a[1]
  );

  return (
    <>
      <SpaceBackground variant="app" />

      <PageShell>
        <main
          id="main-content"
          role="main"
          aria-label="Repositories overview"
        >
          <PageHeader
            eyebrow="Archive"
            title="Repositories"
            subtitle="Every repository synced from your connected GitHub account, ordered by most recent sync."
            back={{ href: "/dashboard", label: "Dashboard" }}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Repositories"
              value={totalRepos.toLocaleString("en-US")}
              icon={<Code className="size-4" />}
              context="Synced to DevInsight"
              footer="From your connected GitHub account"
            />
            <StatCard
              label="Commits"
              value={totalCommits.toLocaleString("en-US")}
              icon={<GitCommit className="size-4" />}
              context="Stored commit history"
              footer="Across synced repositories"
            />
            <StatCard
              label="Stars earned"
              value={totalStars.toLocaleString("en-US")}
              icon={<Star className="size-4" />}
              context="Across synced repositories"
              footer="All-time total"
            />
            <StatCard
              label="Forks"
              value={totalForks.toLocaleString("en-US")}
              icon={<GitFork className="size-4" />}
              context="Across synced repositories"
              footer="All-time total"
            />
          </div>

          <section aria-label="Repository list" className="mt-10 sm:mt-12">
            <SectionHeader
              title="Repository list"
              description="Commit counts reflect the history stored during sync."
            />

            {repositories.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {repositories.map((repo) => (
                  <RepositoryCard
                    key={repo.id}
                    repo={repo}
                    commitCount={repo._count.commits}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <EmptyState
                  icon={<Code className="size-5" />}
                  title="No repositories synced"
                  description="Sync your GitHub data from the dashboard to populate your repository archive."
                  action={
                    <ButtonLink
                      href="/dashboard"
                      variant="primary"
                      leadingIcon={<RefreshCw className="size-4" />}
                    >
                      Go to dashboard
                    </ButtonLink>
                  }
                />
              </Card>
            )}
          </section>

          {languages.length > 0 ? (
            <Card className="mt-10 sm:mt-12">
              <SectionHeader
                title="Technology stack"
                description="Repositories grouped by their primary language."
              />

              <div className="flex flex-wrap gap-2">
                {languages.map(([language, count]) => (
                  <Chip key={language} mono>
                    {language}
                    <span className="text-text-3">
                      {count.toLocaleString("en-US")}{" "}
                      {count === 1 ? "repo" : "repos"}
                    </span>
                  </Chip>
                ))}
              </div>
            </Card>
          ) : null}
        </main>
      </PageShell>
    </>
  );
}

function RepositoryCard({
  repo,
  commitCount,
}: {
  repo: RepositoryWithCommitCount;
  commitCount: number;
}) {
  const syncedDate = repo.lastSyncedAt
    ? new Date(repo.lastSyncedAt)
    : null;

  return (
    <Card
      role="article"
      aria-label={`Repository ${repo.fullName}`}
      className="flex h-full flex-col"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Badge
            variant="neutral"
            size="sm"
            icon={repo.isPrivate ? <Lock /> : <Globe />}
          >
            {repo.isPrivate ? "Private" : "Public"}
          </Badge>
          <h2 className="mt-2.5 break-words font-display text-lg font-semibold leading-tight text-text">
            {repo.name}
          </h2>
        </div>

        <a
          href={`https://github.com/${repo.fullName}`}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring -mr-1.5 -mt-1.5 inline-flex size-11 shrink-0 items-center justify-center rounded-pill text-text-3 transition-colors duration-150 hover:bg-surface-hover hover:text-text"
          aria-label={`Open ${repo.fullName} on GitHub in a new tab`}
        >
          <ExternalLink className="size-4" aria-hidden="true" />
        </a>
      </div>

      {repo.description ? (
        <p className="mt-3 line-clamp-2 text-sm leading-snug text-text-2">
          {repo.description}
        </p>
      ) : (
        <p className="mt-3 text-caption">No description provided.</p>
      )}

      <dl className="mt-5 grid grid-cols-3 gap-2 rounded-card border border-border-subtle bg-white/[0.02] p-3">
        <RepoMetric label="Commits" value={commitCount} />
        <RepoMetric label="Stars" value={repo.stars} />
        <RepoMetric label="Forks" value={repo.forks} />
      </dl>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-4">
        {repo.language ? (
          <Chip mono>
            <Code className="size-3" aria-hidden="true" />
            {repo.language}
          </Chip>
        ) : (
          <span aria-hidden="true" />
        )}

        {syncedDate ? (
          <p className="flex items-center gap-1.5 text-caption">
            <Clock className="size-3.5 shrink-0" aria-hidden="true" />
            Synced{" "}
            <time dateTime={syncedDate.toISOString()}>
              {syncedDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </time>
          </p>
        ) : null}
      </div>
    </Card>
  );
}

function RepoMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-0">
      <dt className="text-label">{label}</dt>
      <dd className="mt-1 font-mono text-sm tabular-nums text-text">
        {value.toLocaleString("en-US")}
      </dd>
    </div>
  );
}
