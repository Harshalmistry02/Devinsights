"use client";

import { FileText, Info, Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { CommitQualityMetrics } from "@/lib/analytics/commit-quality-analyzer";
import { getGradeDescription } from "@/lib/analytics/commit-quality-analyzer";
import { Badge, Chip, type BadgeVariant } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";
import { EmptyState } from "@/components/ui/empty-state";
import { IconTile } from "@/components/ui/icon-tile";
import { MetricBar } from "@/components/ui/metric-bar";
import { Tooltip, TooltipFocusable } from "@/components/ui/tooltip";

interface CommitQualityCardProps {
  metrics: CommitQualityMetrics | null;
  className?: string;
}

const gradeStyles: Record<
  string,
  { panel: string; text: string; variant: BadgeVariant }
> = {
  A: {
    panel: "border-success/30 bg-success-soft",
    text: "text-success",
    variant: "success",
  },
  B: {
    panel: "border-accent/30 bg-accent-soft",
    text: "text-accent",
    variant: "accent",
  },
  C: {
    panel: "border-warning/30 bg-warning-soft",
    text: "text-warning",
    variant: "warning",
  },
  D: {
    panel: "border-danger/30 bg-danger-soft",
    text: "text-danger",
    variant: "danger",
  },
  F: {
    panel: "border-danger/30 bg-danger-soft",
    text: "text-danger",
    variant: "danger",
  },
};

/**
 * Commit Quality Card — SpaceX-inspired minimal aesthetic
 */
export function CommitQualityCard({
  metrics,
  className,
}: CommitQualityCardProps) {
  if (!metrics || metrics.totalAnalyzed === 0) {
    return (
      <Card className={className}>
        <CardHeader
          icon={<FileText className="size-4" />}
          title="Commit quality"
          description="No commits analyzed yet."
        />
        <EmptyState
          variant="compact"
          icon={<FileText className="size-4" />}
          title="No commit quality data"
          description="Sync your repositories to see how your commit messages score."
        />
      </Card>
    );
  }

  const grade = gradeStyles[metrics.qualityGrade] ?? gradeStyles.F;
  const gradeDesc = getGradeDescription(metrics.qualityGrade);

  return (
    <Card padding="none" className={cn("overflow-hidden", className)}>
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border-subtle p-5 sm:p-6">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <IconTile>
            <FileText className="size-4" />
          </IconTile>
          <div className="min-w-0">
            <h2 className="text-card-title">Commit quality</h2>
            <p className="mt-1 text-caption">
              Based on {metrics.totalAnalyzed.toLocaleString("en-US")}{" "}
              analyzed commits.
            </p>
          </div>
        </div>

        <div className="shrink-0 text-center">
          <div
            className={cn(
              "flex size-14 items-center justify-center rounded-card border",
              grade.panel
            )}
            aria-label={`Commit quality grade ${metrics.qualityGrade}: ${gradeDesc}`}
          >
            <span className={cn("text-section-head text-3xl", grade.text)}>
              {metrics.qualityGrade}
            </span>
          </div>
          <Badge variant={grade.variant} size="sm" className="mt-2">
            {gradeDesc}
          </Badge>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div>
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-label">Score breakdown</p>
            <p className="text-caption">
              Share of analyzed commits meeting each criterion
            </p>
          </div>

          <div className="space-y-3">
            <Tooltip
              content="Percentage of commits following the conventional commits format"
              className="block w-full"
            >
              <TooltipFocusable className="block w-full">
                <MetricBar
                  label="Conventional commits"
                  value={metrics.conventionalCommitScore}
                />
              </TooltipFocusable>
            </Tooltip>
            <Tooltip
              content="Percentage of commits that reference an issue or ticket"
              className="block w-full"
            >
              <TooltipFocusable className="block w-full">
                <MetricBar
                  label="Ticket references"
                  value={metrics.hasTicketReferences}
                />
              </TooltipFocusable>
            </Tooltip>
            <Tooltip
              content="Percentage of commits with a well-sized subject line"
              className="block w-full"
            >
              <TooltipFocusable className="block w-full">
                <MetricBar
                  label="Subject quality"
                  value={metrics.subjectLineScore}
                />
              </TooltipFocusable>
            </Tooltip>
            <Tooltip
              content="Percentage of commits with a multi-line message body"
              className="block w-full"
            >
              <TooltipFocusable className="block w-full">
                <MetricBar
                  label="Multi-line messages"
                  value={metrics.hasBodyText}
                />
              </TooltipFocusable>
            </Tooltip>
          </div>
        </div>

        {metrics.commonPrefixes.length > 0 ? (
          <div className="border-t border-border-subtle pt-4">
            <p className="text-label">Common prefixes</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {metrics.commonPrefixes.map((prefix) => (
                <Chip key={prefix.prefix} mono>
                  {prefix.prefix}
                  <span className="text-text-3">
                    {prefix.count.toLocaleString("en-US")}{" "}
                    {prefix.count === 1 ? "use" : "uses"}
                  </span>
                </Chip>
              ))}
            </div>
          </div>
        ) : null}

        {metrics.insights.length > 0 ? (
          <div className="border-t border-border-subtle pt-4">
            <p className="text-label">Insights</p>
            <ul className="mt-2 space-y-2">
              {metrics.insights.map((insight, index) => {
                const text = [...insight].slice(1).join("").trim();

                return (
                  <li
                    key={`${index}-${text}`}
                    className="flex items-start gap-2 text-caption"
                  >
                    <Info
                      className="mt-0.5 size-3.5 shrink-0 text-text-3"
                      aria-hidden="true"
                    />
                    <span>{text}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {metrics.trend ? (
          <div className="flex items-center gap-2 border-t border-border-subtle pt-4">
            {metrics.trend.direction === "improving" ? (
              <>
                <TrendingUp
                  className="size-3.5 text-success"
                  aria-hidden="true"
                />
                <p className="text-caption text-success">
                  Improving from grade {metrics.trend.previousGrade}
                </p>
              </>
            ) : metrics.trend.direction === "declining" ? (
              <>
                <TrendingDown
                  className="size-3.5 text-danger"
                  aria-hidden="true"
                />
                <p className="text-caption text-danger">
                  Declining from grade {metrics.trend.previousGrade}
                </p>
              </>
            ) : (
              <>
                <Minus className="size-3.5 text-text-3" aria-hidden="true" />
                <p className="text-caption">Stable quality</p>
              </>
            )}
          </div>
        ) : null}
      </div>
    </Card>
  );
}

/**
 * Compact version for dashboard grid
 */
export function CommitQualityCardCompact({
  metrics,
  className,
}: CommitQualityCardProps) {
  if (!metrics || metrics.totalAnalyzed === 0) {
    return (
      <div className={cn("py-4", className)}>
        <div className="flex items-center gap-2">
          <FileText className="size-3.5 text-text-3" aria-hidden="true" />
          <span className="text-caption">Commit quality</span>
        </div>
        <p className="mt-1 text-caption">No data</p>
      </div>
    );
  }

  const grade = gradeStyles[metrics.qualityGrade] ?? gradeStyles.F;

  return (
    <div className={cn("py-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="size-3.5 text-text-3" aria-hidden="true" />
          <span className="text-caption">Commit quality</span>
        </div>
        <Badge variant={grade.variant} size="sm" mono>
          {metrics.qualityGrade}
        </Badge>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-2">
        <div className="flex items-center justify-between gap-2">
          <dt className="text-caption">Conventional</dt>
          <dd className="font-mono text-[11px] tabular-nums text-text">
            {metrics.conventionalCommitScore}%
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-caption">Tickets</dt>
          <dd className="font-mono text-[11px] tabular-nums text-text">
            {metrics.hasTicketReferences}%
          </dd>
        </div>
      </dl>
    </div>
  );
}
