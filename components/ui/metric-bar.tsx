import { cn } from "./cn";

interface MetricBarProps {
  label: string;
  value: number;
  max?: number;
  suffix?: string;
  showValue?: boolean;
  className?: string;
}

/** 6px metric track with semantic fill. Zero keeps the empty track visible. */
export function MetricBar({
  label,
  value,
  max = 100,
  suffix = "%",
  showValue = true,
  className,
}: MetricBarProps) {
  const safeMax = max > 0 ? max : 100;
  const clamped = Math.min(Math.max(value, 0), safeMax);
  const percent = (clamped / safeMax) * 100;

  const fill =
    percent >= 70
      ? "bg-success"
      : percent >= 40
        ? "bg-warning"
        : "bg-danger";

  return (
    <div className={cn("min-w-0", className)}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="truncate text-caption text-text-2">{label}</span>
        {showValue ? (
          <span className="shrink-0 font-mono text-xs tabular-nums text-text">
            {value.toLocaleString("en-US")}
            {suffix}
          </span>
        ) : null}
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-pill bg-white/10"
        role="progressbar"
        aria-label={label}
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={safeMax}
      >
        <div
          className={cn("h-full rounded-pill transition-[width] duration-300", fill)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
