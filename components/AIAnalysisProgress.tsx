"use client";

import { CheckCircle2, Circle, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/components/ui/cn";
import { IconTile } from "@/components/ui/icon-tile";

interface AnalysisStep {
  id: string;
  label: string;
  status: "pending" | "active" | "complete";
}

interface AIAnalysisProgressProps {
  isAnalyzing: boolean;
  currentStep?: number;
}

const analysisSteps: AnalysisStep[] = [
  { id: "patterns", label: "Analyzing coding patterns", status: "pending" },
  { id: "consistency", label: "Checking consistency", status: "pending" },
  { id: "languages", label: "Evaluating language diversity", status: "pending" },
  { id: "drafting", label: "Drafting suggestions", status: "pending" },
];

export function AIAnalysisProgress({
  isAnalyzing,
  currentStep = 0,
}: AIAnalysisProgressProps) {
  if (!isAnalyzing) return null;

  const steps = analysisSteps.map((step, index) => ({
    ...step,
    status:
      index < currentStep
        ? ("complete" as const)
        : index === currentStep
          ? ("active" as const)
          : ("pending" as const),
  }));

  const percent = Math.round(((currentStep + 1) / steps.length) * 100);

  return (
    <div className="rounded-card border border-border-subtle bg-white/[0.02] p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <IconTile tone="accent">
          <Sparkles className="size-4" />
        </IconTile>
        <div>
          <p className="text-card-title">Analyzing your history</p>
          <p className="mt-1 text-caption">
            Generating patterns, strengths and suggestions.
          </p>
        </div>
      </div>

      <ol className="mt-5 space-y-3" aria-label="Analysis progress">
        {steps.map((step) => (
          <li key={step.id} className="flex items-center gap-3">
            <span
              className={cn(
                "inline-flex size-4 shrink-0 items-center justify-center [&>svg]:size-4",
                step.status === "complete" && "text-success",
                step.status === "active" && "text-accent",
                step.status === "pending" && "text-text-3"
              )}
              aria-hidden="true"
            >
              {step.status === "complete" ? (
                <CheckCircle2 />
              ) : step.status === "active" ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Circle />
              )}
            </span>
            <span
              className={cn(
                "text-caption",
                step.status === "active" && "font-medium text-text"
              )}
            >
              {step.label}
            </span>
            <span className="ml-auto text-[11px] text-text-3">
              {step.status === "complete"
                ? "Done"
                : step.status === "active"
                  ? "In progress"
                  : "Queued"}
            </span>
          </li>
        ))}
      </ol>

      <div
        className="progress-bar-track mt-5"
        role="progressbar"
        aria-label="Analysis progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
