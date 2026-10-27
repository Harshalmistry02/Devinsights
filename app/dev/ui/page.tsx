import {
  ArrowUpRight,
  BarChart3,
  Calendar,
  Check,
  Code,
  Flame,
  GitCommit,
  Github,
  Layers,
  Lightbulb,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  ChartCard,
  ChartTooltip,
  Chip,
  DeltaChip,
  EmptyState,
  InlineNotice,
  KeyValueList,
  MetricBar,
  PageHeader,
  PageShell,
  SectionHeader,
  Skeleton,
  SkeletonCard,
  StatCard,
  Tooltip,
  TooltipFocusable,
} from "@/components/ui";
import { SpaceBackground } from "@/components/ui/space-background";
import { ToastDemo } from "./toast-demo";

/**
 * Temporary component gallery for Phase 2 review.
 * Removed after the production pages have migrated to the primitives.
 */
export default function DevUIPage() {
  return (
    <main>
      <SpaceBackground variant="app" />
      <PageShell>
        <PageHeader
          eyebrow="Design system"
          title="UI primitives"
          subtitle="The shared building blocks for the polished DevInsight interface."
          actions={
            <Button variant="secondary" leadingIcon={<RefreshCw className="size-4" />}>
              Refresh
            </Button>
          }
        />

        <div className="space-y-10">
          <section>
            <SectionHeader
              title="Typography"
              description="Labels are uppercase, sentences stay sentence case."
            />
            <Card>
              <p className="text-page-title">Understand your code</p>
              <p className="mt-4 text-section-head">Section title</p>
              <p className="mt-4 text-card-title">Card title</p>
              <p className="mt-4 text-label">Micro label</p>
              <p className="mt-4 max-w-2xl text-body">
                AI-powered insights into your GitHub activity, productivity and
                coding patterns. This paragraph is sentence case and readable on
                the near-black canvas.
              </p>
              <p className="mt-3 text-caption">
                Caption text uses --text-3 and never drops below a 4.5:1
                contrast ratio.
              </p>
              <p className="mt-4 text-value">12,483</p>
            </Card>
          </section>

          <section>
            <SectionHeader
              title="Buttons"
              description="Primary, secondary, ghost and danger actions."
              action={<Badge variant="accent">One accent</Badge>}
            />
            <Card>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" leadingIcon={<ArrowUpRight className="size-4" />}>
                  Primary action
                </Button>
                <Button variant="secondary" leadingIcon={<Github className="size-4" />}>
                  Secondary
                </Button>
                <Button variant="ghost">Ghost button</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="primary" loading>
                  Syncing
                </Button>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <ButtonLink href="/dashboard" variant="secondary" size="sm">
                  Button link
                </ButtonLink>
              </div>
            </Card>
          </section>

          <section>
            <SectionHeader
              title="Badges & chips"
              description="Status and metadata share one visual language."
            />
            <Card>
              <div className="flex flex-wrap items-center gap-2">
                <Badge>Neutral</Badge>
                <Badge variant="accent" dot>
                  Active
                </Badge>
                <Badge variant="success" icon={<Check />}>
                  Verified
                </Badge>
                <Badge variant="warning">Partial sync</Badge>
                <Badge variant="danger" dot>
                  Failed
                </Badge>
                <Chip mono>feat ×11</Chip>
                <Chip variant="accent">TypeScript</Chip>
              </div>
            </Card>
          </section>

          <section>
            <SectionHeader
              title="Cards"
              description="Consistent surface, header, body and footer slots."
            />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Card interactive>
                <CardHeader
                  icon={<Sparkles className="size-4" />}
                  title="Patterns"
                  description="How you work"
                  action={
                    <Tooltip content="Open the full analysis">
                      <Button variant="ghost" size="sm" aria-label="Open analysis">
                        <ArrowUpRight className="size-4" />
                      </Button>
                    </Tooltip>
                  }
                />
                <CardBody>
                  <p className="text-body">
                    You do your best work in focused afternoon sessions with a
                    short warm-up.
                  </p>
                </CardBody>
                <CardFooter>
                  <p className="text-caption">All time · 282 commits</p>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader
                  icon={<Layers className="size-4" />}
                  title="Metric bars"
                  description="Threshold colours"
                />
                <div className="space-y-4">
                  <MetricBar label="Productive" value={76} />
                  <MetricBar label="Refactoring" value={54} />
                  <MetricBar label="Churn" value={28} />
                  <MetricBar label="Empty metric" value={0} />
                </div>
              </Card>

              <Card>
                <CardHeader
                  icon={<Users className="size-4" />}
                  title="Deltas"
                  description="Colour follows improvement"
                />
                <div className="flex flex-wrap gap-2">
                  <DeltaChip value={12} suffix="%" isImprovement />
                  <DeltaChip value={-8} suffix="%" isImprovement={false} />
                  <DeltaChip value={-4} suffix="%" isImprovement />
                  <DeltaChip value={0} />
                </div>
                <p className="mt-4 text-caption">
                  Positive direction with a negative meaning still turns red.
                </p>
              </Card>
            </div>
          </section>

          <section>
            <SectionHeader
              title="Statistics"
              description="Every card has a footer, so a row always lines up."
              action={<Badge variant="neutral">All time</Badge>}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={<Github className="size-4" />}
                label="Repositories"
                value="48"
                footer="Synced from GitHub"
              />
              <StatCard
                icon={<GitCommit className="size-4" />}
                label="Total commits"
                value="283"
                delta={{ value: -29, isImprovement: false, suffix: "%" }}
                footer="Last 30 days: 38 · prev 54"
              />
              <StatCard
                icon={<Flame className="size-4" />}
                label="Current streak"
                value="1 day"
                context={
                  <Badge variant="success" dot>
                    Active today
                  </Badge>
                }
                footer="Longest: 7 days"
              />
              <StatCard
                icon={<Star className="size-4" />}
                label="Stars earned"
                value="0"
                tone="muted"
                footer="Across 48 repos"
              />
            </div>
          </section>

          <section>
            <SectionHeader title="Key/value rows" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card>
                <CardHeader title="Account" icon={<ShieldCheck className="size-4" />} />
                <KeyValueList
                  items={[
                    { label: "Email", value: "harshal@example.com", icon: <Github /> },
                    { label: "GitHub username", value: "@harshalmistry02", icon: <Github /> },
                    { label: "Member since", value: "October 27, 2026", icon: <Calendar /> },
                  ]}
                />
              </Card>
              <Card>
                <CardHeader title="Connection" icon={<Github className="size-4" />} />
                <KeyValueList
                  items={[
                    { label: "GitHub connection", value: <Badge variant="success" dot>Linked</Badge> },
                    { label: "Last synced", value: "Oct 27, 8:56 PM" },
                    { label: "Commit SHA", value: "a3f9c21", mono: true },
                  ]}
                />
              </Card>
            </div>
          </section>

          <section>
            <SectionHeader title="Notices" description="One treatment for status and feedback." />
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              <InlineNotice variant="info" title="AI insights are unavailable">
                Showing metric-based analysis until an AI provider is configured.
              </InlineNotice>
              <InlineNotice variant="success" title="Sync complete">
                48 repositories and 283 commits are up to date.
              </InlineNotice>
              <InlineNotice variant="warning" title="Partial sync">
                Some repositories couldn&apos;t be synced. Showing available data.
              </InlineNotice>
              <InlineNotice variant="error" title="Sync failed">
                GitHub returned an error. Your last successful data is still shown.
              </InlineNotice>
            </div>
          </section>

          <section>
            <SectionHeader title="Chart panels & tooltip" />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ChartCard
                title="Commit timeline"
                description="Daily commit volume"
                scope="Last 30 days"
                icon={<TrendingUp className="size-4" />}
                summary={
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-caption">
                    <span>38 commits</span>
                    <span>Peak: 7 on Oct 14</span>
                  </div>
                }
              >
                <div className="flex h-40 items-end gap-1.5">
                  {[18, 32, 24, 48, 36, 58, 44, 70, 38, 52, 28, 42].map(
                    (height, index) => (
                      <div
                        key={index}
                        className="flex-1 rounded-t-[3px] bg-accent/70"
                        style={{ height: `${height}%` }}
                      />
                    )
                  )}
                </div>
              </ChartCard>

              <Card>
                <CardHeader
                  title="Tooltip"
                  description="Shared by every chart"
                  icon={<BarChart3 className="size-4" />}
                />
                <div className="flex min-h-40 items-center justify-center rounded-card border border-dashed border-border-subtle bg-white/[0.02]">
                  <ChartTooltip
                    active
                    label="Oct 27"
                    payload={[
                      { name: "Commits", value: 42, color: "#6cb4ff" },
                      { name: "Previous", value: 35, color: "rgba(240,240,250,0.35)" },
                    ]}
                  />
                </div>
              </Card>
            </div>
          </section>

          <section>
            <SectionHeader title="Tooltip & empty state" />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader title="Truncated names" icon={<Code className="size-4" />} />
                <p className="text-body">
                  Hover or focus the repository name:
                </p>
                <div className="mt-3">
                  <Tooltip content="harshalmistry02/very-long-repository-name">
                    <TooltipFocusable>
                      <span className="block max-w-[180px] truncate text-sm text-text">
                        harshalmistry02/very-long-repository-name
                      </span>
                    </TooltipFocusable>
                  </Tooltip>
                </div>
              </Card>
              <Card>
                <EmptyState
                  icon={<Lightbulb className="size-6" />}
                  title="No insights yet"
                  description="Sync your GitHub data to generate your first analysis."
                  action={<Button size="sm">Sync GitHub</Button>}
                />
              </Card>
            </div>
          </section>

          <section>
            <SectionHeader
              title="Toasts"
              description="Bottom-right, shared surface and semantic icons."
            />
            <Card>
              <ToastDemo />
            </Card>
          </section>

          <section>
            <SectionHeader title="Skeletons" description="Matching geometry, no layout shift." />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SkeletonCard>
                <Skeleton className="size-9 rounded-card" />
                <Skeleton className="mt-4 h-3 w-24" />
                <Skeleton className="mt-2 h-9 w-32" />
                <Skeleton className="mt-6 h-3 w-40" />
              </SkeletonCard>
              <SkeletonCard>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-4 h-3 w-full" />
                <Skeleton className="mt-2 h-3 w-4/5" />
                <Skeleton className="mt-2 h-3 w-3/5" />
              </SkeletonCard>
            </div>
          </section>
        </div>
      </PageShell>
    </main>
  );
}
