"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Brain,
  CheckCircle2,
  Clock,
  Lightbulb,
  Sparkles,
  Target,
  Wand2,
  Zap,
} from "lucide-react";
import { AIAnalysisProgress } from "@/components/AIAnalysisProgress";
import { Badge, Chip } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { IconTile } from "@/components/ui/icon-tile";
import { InlineNotice } from "@/components/ui/inline-notice";

// Types for the insights API response
interface InsightResponse {
  patterns: string[];
  strengths: string[];
  suggestions: string[];
}

interface InsightMeta {
  dataQuality: {
    consistencyScore: number;
    languageDiversity: number;
    streakHealth: "excellent" | "good" | "warning" | "danger" | "inactive";
  };
  daysToMilestone: { milestone: number; daysRemaining: number } | null;
  tokensUsed?: number;
  quotaRemaining?: number;
}

interface AIInsightsHeroProps {
  analytics?: {
    totalCommits: number;
    currentStreak: number;
    longestStreak: number;
    isActiveToday: boolean;
    lastCommitDate: Date | string | null;
  };
}

/**
 * AI Insights Hero
 *
 * Full-width analysis panel at the top of the Insights page. Generation and
 * caching behaviour is unchanged; only the presentation is rebuilt.
 */
export function AIInsightsHero({ analytics }: AIInsightsHeroProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<InsightResponse | null>(null);
  const [meta, setMeta] = useState<InsightMeta | null>(null);
  const [isCached, setIsCached] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);
  const [analysisStep, setAnalysisStep] = useState(0);

  // Fetch existing insights on mount
  useEffect(() => {
    const fetchExistingInsights = async () => {
      try {
        const response = await fetch("/api/insights/generate");
        if (response.ok) {
          const data = await response.json();
          if (data.insights) {
            setInsights(data.insights);
            setMeta(data.meta);
            setIsCached(true);
            setGeneratedAt(data.generatedAt ? new Date(data.generatedAt) : null);
          }
        }
      } catch {
        // No cached insights yet.
      }
    };
    fetchExistingInsights();
  }, []);

  const generateInsights = useCallback(async () => {
    setLoading(true);
    setError(null);
    setAnalysisStep(0);

    const stepInterval = setInterval(() => {
      setAnalysisStep((previous) => Math.min(previous + 1, 3));
    }, 1500);

    try {
      const response = await fetch("/api/insights/generate", {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        if (data.code === "QUOTA_EXCEEDED") {
          setError("Daily AI quota exceeded. Try again tomorrow.");
          return;
        }
        throw new Error(data.error || "Failed to generate insights");
      }

      if (data.insights) {
        setInsights(data.insights);
        setMeta(data.meta);
        setIsCached(data.cached);
        setGeneratedAt(data.generatedAt ? new Date(data.generatedAt) : new Date());
      }
    } catch (caught) {
      console.error("Failed to generate insights:", caught);
      setError(
        caught instanceof Error ? caught.message : "Failed to generate insights"
      );
    } finally {
      clearInterval(stepInterval);
      setAnalysisStep(4);
      setTimeout(() => setLoading(false), 500);
    }
  }, []);

  return (
    <Card
      padding="none"
      role="region"
      aria-labelledby="ai-analysis-title"
      className="overflow-hidden"
    >
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border-subtle p-5 sm:p-6">
        <div className="flex min-w-0 items-start gap-3">
          <IconTile tone="accent">
            <Wand2 className="size-4" />
          </IconTile>
          <div className="min-w-0">
            <h2 id="ai-analysis-title" className="text-card-title">
              AI analysis
            </h2>
            <p className="mt-1 max-w-xl text-caption">
              Generate patterns, strengths and actionable suggestions from your
              indexed commit history.
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {analytics ? (
                <Chip>
                  {analytics.totalCommits.toLocaleString("en-US")} commits
                  indexed
                </Chip>
              ) : null}
              {generatedAt ? (
                <Chip icon={<Clock />}>
                  {isCached ? "Cached" : "Generated"}{" "}
                  <time dateTime={generatedAt.toISOString()}>
                    {generatedAt.toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </Chip>
              ) : null}
              {insights ? (
                <Badge variant="success" size="sm" dot>
                  Analysis ready
                </Badge>
              ) : null}
            </div>
          </div>
        </div>

        <Button
          variant={insights ? "secondary" : "primary"}
          onClick={generateInsights}
          loading={loading}
          loadingText="Analyzing…"
          leadingIcon={<Sparkles className="size-4" />}
        >
          {insights ? "Regenerate" : "Generate analysis"}
        </Button>
      </div>

      {loading ? (
        <div className="border-b border-border-subtle p-5 sm:p-6">
          <AIAnalysisProgress isAnalyzing={loading} currentStep={analysisStep} />
        </div>
      ) : null}

      {error ? (
        <div className="p-5 sm:p-6">
          <InlineNotice variant="error" title="Unable to generate insights">
            {error}
          </InlineNotice>
        </div>
      ) : null}

      {insights && !loading ? (
        <div className="space-y-5 p-5 sm:p-6">
          {meta?.daysToMilestone ? (
            <InlineNotice
              variant="info"
              icon={<Target />}
              title="Milestone approaching"
            >
              {meta.daysToMilestone.daysRemaining.toLocaleString("en-US")}{" "}
              {meta.daysToMilestone.daysRemaining === 1 ? "day" : "days"} until
              your {meta.daysToMilestone.milestone}-day commit milestone.
            </InlineNotice>
          ) : null}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <InsightPanel
              icon={<Brain className="size-4" />}
              title="Patterns"
              items={insights.patterns}
            />
            <InsightPanel
              icon={<Zap className="size-4" />}
              title="Strengths"
              items={insights.strengths}
            />
            <InsightPanel
              icon={<Lightbulb className="size-4" />}
              title="Suggestions"
              items={insights.suggestions}
            />
          </div>

          <p className="flex items-center gap-2 text-caption">
            <CheckCircle2 className="size-3.5 shrink-0" aria-hidden="true" />
            Scope: your indexed commit history
            {isCached && generatedAt
              ? `, generated ${generatedAt.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}`
              : null}
            . AI suggestions are directional, not definitive.
          </p>
        </div>
      ) : null}

      {!insights && !loading && !error ? (
        <div className="p-5 sm:p-6">
          <EmptyState
            icon={<Sparkles className="size-5" />}
            title="No analysis yet"
            description="Generate a first analysis to surface your coding patterns, strengths and practical suggestions."
          />
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <Chip>Pattern detection</Chip>
            <Chip>Strength analysis</Chip>
            <Chip>Practical suggestions</Chip>
          </div>
        </div>
      ) : null}
    </Card>
  );
}

// ===========================================
// Sub-Components
// ===========================================

function InsightPanel({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
}) {
  return (
    <article className="flex h-full min-w-0 flex-col rounded-card border border-border-subtle bg-white/[0.02] p-5">
      <div className="flex items-center gap-3">
        <IconTile size="sm" tone="neutral">
          {icon}
        </IconTile>
        <h3 className="text-card-title">{title}</h3>
      </div>

      {items.length > 0 ? (
        <ul className="mt-4 flex-1 space-y-3">
          {items.map((item, index) => (
            <li
              key={`${index}-${item}`}
              className="flex items-start gap-2.5 text-caption text-text-2"
            >
              <span
                className="mt-1.5 size-1 shrink-0 rounded-full bg-accent"
                aria-hidden="true"
              />
              <span>{cleanInsight(item)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-caption">No items returned in this category.</p>
      )}
    </article>
  );
}

/** Strip leading emoji or punctuation from AI-generated strings. */
function cleanInsight(text: string): string {
  return text.replace(/^[^\p{L}\p{N}]+/u, "").trim();
}
