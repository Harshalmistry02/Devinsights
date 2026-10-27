import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "./cn";

export interface KeyValueItem {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  href?: string;
  mono?: boolean;
  valueClassName?: string;
}

interface KeyValueListProps {
  items: KeyValueItem[];
  className?: string;
  dense?: boolean;
}

/** Label/value rows for Profile, Settings and weekly highlights. */
export function KeyValueList({
  items,
  className,
  dense = false,
}: KeyValueListProps) {
  return (
    <dl
      className={cn(
        "divide-y divide-border-subtle",
        className
      )}
    >
      {items.map((item) => {
        const value = (
          <span
            className={cn(
              "min-w-0 break-words text-right text-sm text-text",
              item.mono && "font-mono text-[13px]",
              item.valueClassName
            )}
          >
            {item.value}
          </span>
        );

        return (
          <div
            key={item.label}
            className={cn(
              "flex items-start justify-between gap-4",
              dense ? "py-2" : "py-3"
            )}
          >
            <dt className="flex min-w-0 items-center gap-2 text-caption">
              {item.icon ? (
                <span
                  className="inline-flex size-3.5 shrink-0 items-center justify-center text-text-3 [&>svg]:size-3.5"
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
              ) : null}
              <span className="truncate">{item.label}</span>
            </dt>
            <dd className="min-w-0 max-w-[62%]">
              {item.href ? (
                <Link
                  href={item.href}
                  className="transition-colors duration-150 hover:text-accent"
                >
                  {value}
                </Link>
              ) : (
                value
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
