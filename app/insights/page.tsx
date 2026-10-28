import type { Metadata } from "next";
import {
  AlertTriangle,
  BarChart3,
  Brain,
  Clock,
  Flame,
  GitCommit,
  RefreshCw,
  Sparkles,
  Trophy,
} from "lucide-react";
import { requireAuth } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
import { AIInsightsHero } from "./AIInsightsHero";
import { InsightsChartsSection } from "./InsightsChartsSection";
import { CodeImpactCard } from "./components/CodeImpactCard";
import { RepoDeepDive } from "./components/RepoDeepDive";
import { CommitQualityCard } from "@/app/dashboard/components/CommitQualityCard";
import { DataQualityIndicator } from "@/components/DataQualityIndicator";
import { Badge, Chip } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { IconTile } from "@/components/ui/icon-tile";
import { InlineNotice } from "@/components/ui/inline-notice";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { SectionHeader } from "@/components/ui/section-header";
import { SpaceBackground } from "@/components/ui/space-background";
import { StatCard } from "@/components/ui/stat-card";
import { detectPersona, type PersonaContext, type PersonaResult } from "@/lib/analytics/persona-detector";
import type { CodeImpactMetrics } from "@/lib/analytics/code-impact-analyzer";
import type { CommitQualityMetrics } from "@/lib/analytics/commit-quality-analyzer";

export const metadata: Metadata = {
  title: "Coding insights",
  description:
    "AI-assisted patterns, strengths, commit quality and repository analysis from your synced GitHub history.",
};

// Type definitions for JSON fields
type DailyCommits = Record<string, number>;
type DayOfWeekStats = Record<string, number>;
type HourlyStats = Record<string, number>;
type RepoStat = {
  id: string;
  name: string;
  fullName: string;
  commits: number;
  stars: number;
  forks: number;
  language: string | null;
};
type TopLanguage = { language: string; count: number; percentage: number };

/**
 * Insights Page
 *
 * AI analysis, developer persona, quality metrics and visual analytics for the
 * user's latest analytics snapshot.
 */
export default async function InsightsPage() {
  const session = await requireAuth();
  const { user } = session;

  // Fetch analytics snapshot
  const analytics = await prisma.analyticsSnapshot.findUnique({
    where: { userId: user.id },
  });

  const [outlierCount, insightCount] = await Promise.all([
    prisma.commit
      .count({
        where: {
          repository: { userId: user.id },
          metadata: { path: ["isOutlier"], equals: true },
        },
      })
      .catch(() => 0),
    prisma.insightCache.count({ where: { userId: user.id } }),
  ]);

  const hasData = analytics !== null;
  const isDataStale = analytics?.calculatedAt
    ? new Date().getTime() - new Date(analytics.calculatedAt).getTime() >
      24 * 60 * 60 * 1000
    : false;

  const repoStats = analytics?.repoStats as RepoStat[] | null;
  const codeImpactMetrics = (
    analytics as unknown as { codeImpactMetrics?: CodeImpactMetrics | null } | null
  )?.codeImpactMetrics;
  const commitQualityMetrics = (
    analytics as unknown as { commitQualityMetrics?: CommitQualityMetrics | null } | null
  )?.commitQualityMetrics;

  const personaContext: PersonaContext = {
    hourlyStats: analytics?.hourlyStats as HourlyStats | null,
    dayOfWeekStats: analytics?.dayOfWeekStats as unknown as PersonaContext["dayOfWeekStats"],
    topLanguages: analytics?.topLanguages as TopLanguage[] | null,
    currentStreak: analytics?.currentStreak,
    totalCommits: analytics?.totalCommits,
    totalRepos: analytics?.totalRepos,
  };
  const persona = analytics ? detectPersona(personaContext) : null;

  const calculatedAt = analytics?.calculatedAt
    ? new Date(analytics.calculatedAt)
    : null;

  return (
    <>
      <SpaceBackground variant="app" />

      <PageShell>
        <main
          id="main-content"
          role="main"
          aria-label="Coding insights"
        >
          <PageHeader
            eyebrow="Insights"
            title="Coding insights"
            subtitle="How you work, what you ship and where your patterns repeat."
            back={{ href: "/dashboard", label: "Dashboard" }}
            actions={
              calculatedAt ? (
                <Chip icon={<Clock />} className="text-caption">
                  Updated{" "}
                  <time dateTime={calculatedAt.toISOString()}>
                    {calculatedAt.toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </Chip>
              ) : null
            }
          />

          {hasData ? (
            <div className="space-y-8 sm:space-y-10">
              <AIInsightsHero
                analytics={{
                  totalCommits: analytics.totalCommits,
                  currentStreak: analytics.currentStreak,
                  longestStreak: analytics.longestStreak,
                  isActiveToday: analytics.isActiveToday,
                  lastCommitDate: analytics.lastCommitDate,
                }}
              />

              {persona ? <PersonaPanel persona={persona} /> : null}

              <section aria-label="Snapshot overview">
                <SectionHeader
                  title="Snapshot"
                  description={
                    calculatedAt
                      ? `Calculated ${calculatedAt.toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}.`
                      : "Your latest synced analytics."
                  }
                  action={
                    isDataStale ? (
                      <Badge variant="warning" size="sm" dot>
                        Stale snapshot
                      </Badge>
                    ) : (
                      <Badge variant="success" size="sm" dot>
                        Current snapshot
                      </Badge>
                    )
                  }
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    label="Cached insights"
                    value={insightCount.toLocaleString("en-US")}
                    icon={<Sparkles className="size-4" />}
                    context="Stored AI analyses"
                    footer="For this account"
                  />
                  <StatCard
                    label="Commits indexed"
                    value={analytics.totalCommits.toLocaleString("en-US")}
                    icon={<GitCommit className="size-4" />}
                    context={`Across ${analytics.totalRepos.toLocaleString(
                      "en-US"
                    )} repositories`}
                    footer="From the latest analytics snapshot"
                  />
                  <StatCard
                    label="Current streak"
                    value={analytics.currentStreak.toLocaleString("en-US")}
                    icon={<Flame className="size-4" />}
                    context={
                      analytics.isActiveToday ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className="size-1.5 rounded-full bg-success"
                            aria-hidden="true"
                          />
                          Active today
                        </span>
                      ) : analytics.currentStreak > 0 ? (
                        "Consecutive active days"
                      ) : (
                        "No active streak"
                      )
                    }
                    footer="As of today"
                  />
                  <StatCard
                    label="Longest streak"
                    value={analytics.longestStreak.toLocaleString("en-US")}
                    icon={<Trophy className="size-4" />}
                    context="Consecutive active days"
                    footer="All-time record"
                  />
                </div>
              </section>

              {isDataStale ? (
                <InlineNotice
                  variant="warning"
                  icon={<AlertTriangle />}
                  title="This snapshot may be out of date"
                  action={
                    <ButtonLink
                      href="/dashboard"
                      variant="secondary"
                      size="sm"
                      leadingIcon={<RefreshCw className="size-3.5" />}
                    >
                      Open dashboard
                    </ButtonLink>
                  }
                >
                  It was calculated more than 24 hours ago. Sync from the
                  dashboard to refresh these insights.
                </InlineNotice>
              ) : null}

              <DataQualityIndicator
                outlierCount={outlierCount}
                unknownExtensionPercent={0}
                totalCommits={analytics.totalCommits}
              />

              <section aria-label="Quality and impact">
                <SectionHeader
                  title="Quality and impact"
                  description="How much of your change volume is productive work, and how your commit messages score."
                />

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  <CodeImpactCard
                    metrics={codeImpactMetrics ?? null}
                    className="h-full"
                  />
                  <CommitQualityCard
                    metrics={commitQualityMetrics ?? null}
                    className="h-full"
                  />
                </div>
              </section>

              {repoStats && repoStats.length > 0 ? (
                <RepoDeepDive repoStats={repoStats} />
              ) : null}

              <InsightsChartsSection
                dailyCommits={analytics.dailyCommits as DailyCommits}
                dayOfWeekStats={analytics.dayOfWeekStats as DayOfWeekStats}
                hourlyStats={analytics.hourlyStats as HourlyStats}
                repoStats={repoStats}
                topLanguages={analytics.topLanguages as TopLanguage[]}
              />
            </div>
          ) : (
            <Card>
              <EmptyState
                icon={<BarChart3 className="size-5" />}
                title="No analytics yet"
                description="Sync your GitHub data from the dashboard to generate AI analysis, quality metrics and charts."
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
        </main>
      </PageShell>
    </>
  );
}

function PersonaPanel({ persona }: { persona: PersonaResult }) {
  const confidence = Math.min(Math.max(persona.confidence, 0), 100);

  return (
    <Card
      role="region"
      aria-labelledby="persona-title"
      className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 items-start gap-4">
        <IconTile size="lg">
          <Brain className="size-5" />
        </IconTile>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-label">Developer persona</p>
            <Badge variant="accent" size="sm">
              {persona.primary.rarity}
            </Badge>
          </div>

          <h2
            id="persona-title"
            className="mt-1.5 font-display text-2xl font-bold leading-tight text-text"
          >
            {persona.primary.name}
          </h2>
          <p className="mt-1 max-w-2xl text-caption">
            {persona.primary.description}
          </p>

          {persona.secondary ? (
            <Chip className="mt-3">
              Also matches {persona.secondary.name}
            </Chip>
          ) : null}
        </div>
      </div>

      <div className="w-full shrink-0 sm:w-48">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-label">Confidence</p>
          <p className="font-mono text-sm tabular-nums text-text">
            {confidence}%
          </p>
        </div>
        <div
          className="mt-2 h-1.5 w-full overflow-hidden rounded-pill bg-white/10"
          role="progressbar"
          aria-label="Persona match confidence"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={confidence}
        >
          <div
            className="h-full rounded-pill bg-accent"
            style={{ width: `${confidence}%` }}
          />
        </div>
        <p className="mt-2 text-caption">Match strength for this persona</p>
      </div>
    </Card>
  );
}
