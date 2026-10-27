"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "./cn";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Lightweight accessible tooltip. Renders in a portal so card overflow does
 * not clip it, and opens on hover or focus.
 */
export function Tooltip({ content, children, className }: TooltipProps) {
  const id = useId();
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const updatePosition = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition({
      top: rect.top - 8,
      left: rect.left + rect.width / 2,
    });
  }, []);

  useEffect(() => {
    if (!open) return;

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, updatePosition]);

  const show = () => {
    setOpen(true);
    updatePosition();
  };

  return (
    <>
      <span
        ref={triggerRef}
        className={cn("inline-flex max-w-full", className)}
        onMouseEnter={show}
        onMouseLeave={() => setOpen(false)}
        onFocusCapture={show}
        onBlurCapture={() => setOpen(false)}
        aria-describedby={open ? id : undefined}
      >
        {children}
      </span>

      {open
        ? createPortal(
            <span
              role="tooltip"
              id={id}
              style={{ top: position.top, left: position.left }}
              className="pointer-events-none fixed z-[100] max-w-[280px] -translate-x-1/2 -translate-y-full rounded-card border border-border bg-surface-2 px-3 py-2 text-caption text-text shadow-[0_12px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl"
            >
              {content}
            </span>,
            document.body
          )
        : null}
    </>
  );
}

/** Expose the tooltip trigger as focusable for non-interactive truncated text. */
export function TooltipFocusable({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      tabIndex={0}
      className={cn(
        "rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        className
      )}
    >
      {children}
    </span>
  );
}
