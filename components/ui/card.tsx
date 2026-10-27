import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";
import { IconTile } from "./icon-tile";

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
} as const;

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: keyof typeof paddingClasses;
  interactive?: boolean;
}

/**
 * Base surface for every panel in DevInsight.
 * Near-sharp corners, one hairline border and a constant glass treatment.
 */
export function Card({
  children,
  padding = "md",
  interactive = false,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "relative rounded-card border border-border-subtle bg-surface-1 shadow-[var(--shadow-card)] backdrop-blur-xl",
        paddingClasses[padding],
        interactive &&
          "transition-[background-color,border-color] duration-150 hover:border-border-strong hover:bg-surface-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({
  title,
  description,
  icon,
  action,
  className,
}: CardHeaderProps) {
  return (
    <div className={cn("mb-4 flex items-start justify-between gap-4", className)}>
      <div className="flex min-w-0 items-start gap-3">
        {icon ? <IconTile>{icon}</IconTile> : null}
        <div className="min-w-0">
          <h3 className="text-card-title">{title}</h3>
          {description ? (
            <p className="mt-1 text-caption">{description}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function CardBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("min-w-0", className)}>{children}</div>;
}

export function CardFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mt-5 border-t border-border-subtle pt-4",
        className
      )}
    >
      {children}
    </div>
  );
}
