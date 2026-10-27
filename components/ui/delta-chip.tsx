import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "./cn";

interface DeltaChipProps {
  value: number;
  /** Colour by whether the change is desirable, not merely by direction. */
  isImprovement?: boolean;
  suffix?: string;
  label?: string;
  className?: string;
}

export function DeltaChip({
  value,
  isImprovement,
  suffix = "",
  label,
  className,
}: DeltaChipProps) {
  const rounded = Math.round(value * 100) / 100;
  const isFlat = rounded === 0;
  const isUp = rounded > 0;
  const isPositive = isImprovement ?? isUp;

  const tone = isFlat
    ? "border-border bg-white/[0.04] text-text-3"
    : isPositive
      ? "border-success/25 bg-success-soft text-success"
      : "border-danger/25 bg-danger-soft text-danger";

  const Icon = isFlat ? Minus : isUp ? ArrowUp : ArrowDown;
  const sign = isUp ? "+" : "";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill border px-2 py-1 font-mono text-[11px] leading-none tabular-nums",
        tone,
        className
      )}
      title={label}
    >
      <Icon className="size-3" aria-hidden="true" />
      <span>
        {sign}
        {rounded.toLocaleString("en-US")}
        {suffix}
      </span>
      {label ? <span className="sr-only"> {label}</span> : null}
    </span>
  );
}
