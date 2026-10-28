"use client";

import { useState } from "react";
import { Gauge, Info } from "lucide-react";
import {
  type CodeImpactMetrics,
  getImpactRating,
} from "@/lib/analytics/code-impact-analyzer";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";
import { EmptyState } from "@/components/ui/empty-state";

interface CodeImpactCardProps {
  metrics: CodeImpactMetrics | null;
  className?: string;
}

/**
 * Code Impact Card
 *
 * Compares productive change volume with refactoring and rework.
 */
export function CodeImpactCard({ metrics, className }: CodeImpactCardProps) {
  const [expanded, setExpanded] = useState(false);

  if (!metrics) {
    return (
      <Card className={cn("flex h-full flex-col", className)}>
        <CardHeader
          icon={<Gauge className="size-4" />}
          title="Code impact"
          description="Productive work versus rework."
        />
        <EmptyState
          variant="compact"
          icon={<Gauge className="size-4" />}
          title="No impact data"
          description="Sync your repositories to analyse change volume and churn."
        />
      </Card>
    );
  }

  const impactRating = getImpactRating(metrics.impactScore);
  const ratingVariant = getRatingVariant(metrics.impactScore);
  const maintenanceRate = Math.max(
    0,
    100 - metrics.churnGauge.productive - metrics.churnGauge.refactoring
  );
  const visibleInsights = expanded
    ? metrics.insights
    : metrics.insights.slice(0, 2);

  return (
    <Card className={cn("flex h-full flex-col", className)}>
      <CardHeader
        icon={<Gauge className="size-4" />}
        title="Code impact"
        description="Productive work versus rework across analysed changes."
        action={
          <Badge variant={ratingVariant} size="sm">
            {impactRating.label}
          </Badge>
        }
      />

      <div className="grid items-center gap-5 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <p className="text-label">Impact score</p>
          <p className="mt-1.5 text-value">{metrics.impactScore}</p>
          <p className="mt-2 text-caption">
            Out of 100, weighted by change patterns
          </p>
        </div>

        <div className="flex flex-col items-center">
          <ChurnGauge churn={metrics.churnRate} />
          <p className="mt-1 text-label">Churn rate</p>
          <p className="mt-1 max-w-[24ch] text-center text-caption">
            Commits revisiting recently changed code
          </p>
        </div>
      </div>

      <div className="mt-6 border-t border-border-subtle pt-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-label">Change mix</p>
          <p className="text-caption">Share of analysed commits</p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <RateStat
            label="Productive"
            value={metrics.churnGauge.productive}
            tone="accent"
            detail="Features and fixes"
          />
          <RateStat
            label="Refactoring"
            value={metrics.churnGauge.refactoring}
            tone="neutral"
            detail="Restructuring and cleanup"
          />
          <RateStat
            label="Maintenance"
            value={maintenanceRate}
            tone="neutral"
            detail="Small tweaks under 10 lines"
          />
        </div>

        <p className="mt-4 text-caption">
          Churn is measured separately, so a commit can count as both
          productive and churn.
        </p>
      </div>

      {metrics.insights.length > 0 ? (
        <div className="mt-6 border-t border-border-subtle pt-5">
          <p className="text-label">Observations</p>
          <ul className="mt-3 space-y-2.5">
            {visibleInsights.map((insight, index) => (
              <li
                key={`${index}-${insight}`}
                className="flex items-start gap-2.5 text-caption text-text-2"
              >
                <Info
                  className="mt-0.5 size-3.5 shrink-0 text-text-3"
                  aria-hidden="true"
                />
                <span>{cleanInsight(insight)}</span>
              </li>
            ))}
          </ul>

          {metrics.insights.length > 2 ? (
            <Button
              variant="ghost"
              size="sm"
              className="mt-4 px-0"
              onClick={() => setExpanded((previous) => !previous)}
              aria-expanded={expanded}
            >
              {expanded
                ? "Show fewer observations"
                : `Show ${metrics.insights.length - 2} more ${
                    metrics.insights.length - 2 === 1
                      ? "observation"
                      : "observations"
                  }`}
            </Button>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}

// ===========================================
// Churn Gauge (semi-circle)
// ===========================================

function ChurnGauge({ churn }: { churn: number }) {
  const safeChurn = Math.min(Math.max(churn, 0), 100);
  const radius = 50;
  const circumference = Math.PI * radius;
  const churnLength = (safeChurn / 100) * circumference;

  return (
    <div
      className="relative h-28 w-48"
      role="img"
      aria-label={`Churn rate ${Math.round(
        safeChurn
      )}%. Share of analysed commits that revisit recently changed code.`}
    >
      <svg viewBox="0 0 120 70" className="size-full" aria-hidden="true">
        <path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none"
          stroke="rgba(240, 240, 250, 0.08)"
          strokeWidth={14}
        />

        <path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none"
          stroke="var(--danger)"
          strokeWidth={14}
          strokeDasharray={`${churnLength} ${circumference}`}
        />
      </svg>

      <div className="absolute inset-x-0 bottom-0 text-center">
        <p className="font-display text-2xl font-bold leading-none text-text tabular-nums">
          {Math.round(safeChurn)}%
        </p>
      </div>
    </div>
  );
}

// ===========================================
// Rate stat
// ===========================================

function RateStat({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: number;
  detail: string;
  tone: "accent" | "neutral" | "danger";
}) {
  const fill =
    tone === "accent"
      ? "bg-accent"
      : tone === "danger"
        ? "bg-danger"
        : "bg-white/35";

  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-label">{label}</p>
        <p className="font-mono text-sm tabular-nums text-text">{value}%</p>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-pill bg-white/10">
        <div
          className={cn("h-full rounded-pill", fill)}
          style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        />
      </div>
      <p className="mt-1.5 text-caption">{detail}</p>
    </div>
  );
}

function getRatingVariant(score: number): BadgeVariant {
  if (score >= 80) return "success";
  if (score >= 60) return "accent";
  if (score >= 40) return "warning";
  return "danger";
}

function cleanInsight(text: string): string {
  return text.replace(/^[^\p{L}\p{N}]+/u, "").trim();
}

// ===========================================
// Compact version
// ===========================================

export function CodeImpactCardCompact({
  metrics,
  className,
}: CodeImpactCardProps) {
  if (!metrics) return null;

  return (
    <div className={cn("border-t border-border-subtle py-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Gauge className="size-3.5 text-text-3" aria-hidden="true" />
          <span className="text-caption">Code impact</span>
        </div>
        <span className="font-mono text-xs tabular-nums text-text">
          {metrics.impactScore}
        </span>
      </div>
      <p className="mt-1 text-caption">
        {metrics.churnRate}% churn rate
      </p>
    </div>
  );
}
