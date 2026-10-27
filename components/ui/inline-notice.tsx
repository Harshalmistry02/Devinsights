import type { ReactNode } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
} from "lucide-react";
import { cn } from "./cn";

export type NoticeVariant = "info" | "warning" | "error" | "success";

const variantConfig = {
  info: {
    icon: Info,
    container: "border-accent/25 bg-accent-soft",
    iconTone: "text-accent",
  },
  warning: {
    icon: AlertTriangle,
    container: "border-warning/30 bg-warning-soft",
    iconTone: "text-warning",
  },
  error: {
    icon: AlertCircle,
    container: "border-danger/30 bg-danger-soft",
    iconTone: "text-danger",
  },
  success: {
    icon: CheckCircle2,
    container: "border-success/30 bg-success-soft",
    iconTone: "text-success",
  },
} as const;

interface InlineNoticeProps {
  children: ReactNode;
  title?: ReactNode;
  variant?: NoticeVariant;
  icon?: ReactNode;
  action?: ReactNode;
  role?: "status" | "alert" | "none";
  id?: string;
  className?: string;
}

/** One notice treatment for sync status, AI availability and form feedback. */
export function InlineNotice({
  children,
  title,
  variant = "info",
  icon,
  action,
  role,
  id,
  className,
}: InlineNoticeProps) {
  const config = variantConfig[variant];
  const FallbackIcon = config.icon;
  const resolvedRole = role ?? (variant === "error" ? "alert" : "status");

  return (
    <div
      id={id}
      className={cn(
        "flex items-start gap-3 rounded-card border p-4",
        config.container,
        className
      )}
      role={resolvedRole === "none" ? undefined : resolvedRole}
      aria-live={resolvedRole === "alert" ? "assertive" : "polite"}
    >
      <span
        className={cn(
          "mt-0.5 inline-flex size-4 shrink-0 items-center justify-center [&>svg]:size-4",
          config.iconTone
        )}
        aria-hidden="true"
      >
        {icon ?? <FallbackIcon />}
      </span>
      <div className="min-w-0 flex-1">
        {title ? (
          <p className="text-sm font-semibold text-text">{title}</p>
        ) : null}
        <div className={cn("text-caption text-text-2", title && "mt-1")}>
          {children}
        </div>
        {action ? <div className="mt-3">{action}</div> : null}
      </div>
    </div>
  );
}
