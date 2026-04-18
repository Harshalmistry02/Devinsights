'use client';

import { FileText, TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CommitQualityMetrics,
  getGradeColor,
  getGradeBgColor,
  getGradeDescription,
} from "@/lib/analytics/commit-quality-analyzer";

interface CommitQualityCardProps {
  metrics: CommitQualityMetrics | null;
  className?: string;
}

/**
 * Commit Quality Card — SpaceX-inspired minimal aesthetic
 */
export function CommitQualityCard({ metrics, className }: CommitQualityCardProps) {
  if (!metrics || metrics.totalAnalyzed === 0) {
    return (
      <div
        style={{
          background: "transparent",
          border: "none",
          padding: "0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
          <FileText size={14} style={{ opacity: 0.3 }} />
          <p className="text-caption-bold" style={{ fontSize: "0.75rem" }}>Commit Quality</p>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "32px 0",
            textAlign: "center",
          }}
        >
          <Info size={24} style={{ opacity: 0.15, marginBottom: "12px" }} />
          <p className="text-caption" style={{ opacity: 0.35 }}>No commit data available</p>
          <p className="text-micro" style={{ marginTop: "4px", opacity: 0.2 }}>
            Sync your repositories to see quality metrics
          </p>
        </div>
      </div>
    );
  }

  // Map grade colors to spectral-appropriate opacity variants
  const getSpectralGradeStyle = (grade: string) => {
    const grades: Record<string, { text: string; border: string}> = {
      A: { text: "rgba(134,239,172,0.8)", border: "rgba(134,239,172,0.2)" },
      B: { text: "rgba(147,197,253,0.8)", border: "rgba(147,197,253,0.2)" },
      C: { text: "rgba(251,191,36,0.8)", border: "rgba(251,191,36,0.2)" },
      D: { text: "rgba(252,165,165,0.7)", border: "rgba(252,165,165,0.2)" },
      F: { text: "rgba(252,165,165,0.6)", border: "rgba(252,165,165,0.15)" },
    };
    return grades[grade] || grades.F;
  };

  const gradeStyle = getSpectralGradeStyle(metrics.qualityGrade);
  const gradeDesc = getGradeDescription(metrics.qualityGrade);

  return (
    <div
      style={{
        background: "transparent",
        border: "none",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 0",
          borderBottom: "1px solid rgba(240,240,250,0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <FileText size={14} style={{ opacity: 0.35 }} aria-hidden="true" />
          <div>
            <p className="text-caption-bold" style={{ fontSize: "0.75rem" }}>Commit Quality</p>
            <p className="text-micro" style={{ opacity: 0.3, marginTop: "2px" }}>
              {metrics.totalAnalyzed} commits analyzed
            </p>
          </div>
        </div>

        {/* Grade badge */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "var(--radius-sharp)",
              border: `1px solid ${gradeStyle.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `${gradeStyle.border}`,
            }}
          >
            <span
              className="text-section-head"
              style={{ fontSize: "1.5rem", color: gradeStyle.text }}
            >
              {metrics.qualityGrade}
            </span>
          </div>
          <p className="text-micro" style={{ marginTop: "4px", color: gradeStyle.text, opacity: 0.8 }}>
            {gradeDesc}
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "20px 0" }}>
        {/* Score Breakdown */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
          <MetricBar label="Conventional Commits" value={metrics.conventionalCommitScore} tooltip="% of commits following conventional format" />
          <MetricBar label="Ticket References" value={metrics.hasTicketReferences} tooltip="% of commits linking to issues" />
          <MetricBar label="Subject Quality" value={metrics.subjectLineScore} tooltip="% of commits with good subject length" />
          <MetricBar label="Multi-line Messages" value={metrics.hasBodyText} tooltip="% of commits with detailed body text" />
        </div>

        {/* Common Prefixes */}
        {metrics.commonPrefixes.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <p className="text-micro" style={{ opacity: 0.35, marginBottom: "8px", letterSpacing: "1px" }}>
              Common Prefixes
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {metrics.commonPrefixes.map((prefix, i) => (
                <span
                  key={i}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 10px",
                    background: "rgba(240,240,250,0.03)",
                    border: "1px solid rgba(240,240,250,0.08)",
                    borderRadius: "2px",
                  }}
                >
                  <span
                    className="text-micro"
                    style={{ color: "var(--spectral-white)", opacity: 0.7, fontFamily: "monospace", letterSpacing: 0 }}
                  >
                    {prefix.prefix}
                  </span>
                  <span className="text-micro" style={{ opacity: 0.3 }}>×{prefix.count}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Insights */}
        {metrics.insights.length > 0 && (
          <div style={{ borderTop: "1px solid rgba(240,240,250,0.05)", paddingTop: "16px" }}>
            <p className="text-micro" style={{ opacity: 0.35, marginBottom: "10px", letterSpacing: "1px" }}>Insights</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {metrics.insights.map((insight, i) => {
                const chars = [...insight];
                const emoji = chars[0];
                const text = chars.slice(1).join('').trim();
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                    }}
                  >
                    <span style={{ flexShrink: 0, fontSize: "0.875rem" }}>{emoji}</span>
                    <span className="text-caption" style={{ opacity: 0.55 }}>{text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Trend */}
        {metrics.trend && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginTop: "16px",
              paddingTop: "14px",
              borderTop: "1px solid rgba(240,240,250,0.05)",
            }}
          >
            {metrics.trend.direction === 'improving' ? (
              <>
                <TrendingUp size={14} style={{ color: "rgba(134,239,172,0.6)" }} />
                <span className="text-caption" style={{ color: "rgba(134,239,172,0.6)" }}>
                  Improving from {metrics.trend.previousGrade}
                </span>
              </>
            ) : metrics.trend.direction === 'declining' ? (
              <>
                <TrendingDown size={14} style={{ color: "rgba(252,165,165,0.6)" }} />
                <span className="text-caption" style={{ color: "rgba(252,165,165,0.6)" }}>
                  Declining from {metrics.trend.previousGrade}
                </span>
              </>
            ) : (
              <>
                <Minus size={14} style={{ opacity: 0.3 }} />
                <span className="text-caption" style={{ opacity: 0.3 }}>Stable quality</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricBar({
  label,
  value,
  tooltip,
}: {
  label: string;
  value: number;
  tooltip?: string;
}) {
  const getStatusColor = () => {
    if (value >= 70) return "rgba(134,239,172,0.6)";
    if (value >= 40) return "rgba(251,191,36,0.6)";
    return "rgba(252,165,165,0.5)";
  };

  return (
    <div title={tooltip}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
        <p className="text-micro" style={{ opacity: 0.4 }}>{label}</p>
        <span
          className="text-micro"
          style={{ color: getStatusColor(), opacity: 1 }}
        >
          {value}%
        </span>
      </div>
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{
            width: `${Math.min(100, Math.max(0, value))}%`,
            background: getStatusColor(),
          }}
        />
      </div>
    </div>
  );
}

/**
 * Compact version for dashboard grid
 */
export function CommitQualityCardCompact({ metrics, className }: CommitQualityCardProps) {
  if (!metrics || metrics.totalAnalyzed === 0) {
    return (
      <div
        style={{
          background: "transparent",
          border: "none",
          padding: "14px 0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          <FileText size={12} style={{ opacity: 0.3 }} />
          <span className="text-caption" style={{ opacity: 0.5 }}>Commit Quality</span>
        </div>
        <p className="text-micro" style={{ opacity: 0.25 }}>No data</p>
      </div>
    );
  }

  const getGradeColorStyle = (grade: string): string => {
    const map: Record<string, string> = {
      A: "rgba(134,239,172,0.8)",
      B: "rgba(147,197,253,0.8)",
      C: "rgba(251,191,36,0.8)",
      D: "rgba(252,165,165,0.7)",
      F: "rgba(252,165,165,0.5)",
    };
    return map[grade] || "var(--spectral-white)";
  };

  return (
    <div
      style={{
        background: "transparent",
        border: "none",
        padding: "14px 0",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FileText size={12} style={{ opacity: 0.3 }} />
          <span className="text-caption" style={{ opacity: 0.6 }}>Commit Quality</span>
        </div>
        <span
          className="text-section-head"
          style={{ fontSize: "1.25rem", color: getGradeColorStyle(metrics.qualityGrade) }}
        >
          {metrics.qualityGrade}
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span className="text-micro" style={{ opacity: 0.3 }}>Conventional</span>
          <span className="text-micro" style={{ opacity: 0.6 }}>{metrics.conventionalCommitScore}%</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span className="text-micro" style={{ opacity: 0.3 }}>Tickets</span>
          <span className="text-micro" style={{ opacity: 0.6 }}>{metrics.hasTicketReferences}%</span>
        </div>
      </div>
    </div>
  );
}
