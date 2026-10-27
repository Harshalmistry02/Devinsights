import Image from "next/image";
import { cn } from "./cn";

interface SpaceBackgroundProps {
  /** Hero is lighter for landing content; app keeps a constant contrast floor. */
  variant?: "hero" | "app";
  priority?: boolean;
  className?: string;
}

/**
 * Fixed Earth photography shared by every page.
 * Content scrolls over a constant background instead of a moving photo.
 */
export function SpaceBackground({
  variant = "app",
  priority = false,
  className,
}: SpaceBackgroundProps) {
  return (
    <div
      className={cn("pointer-events-none fixed inset-0 z-0 overflow-hidden", className)}
      aria-hidden="true"
    >
      <Image
        src="/space-hero.png"
        alt=""
        fill
        priority={priority}
        sizes="100vw"
        className={cn(
          "object-cover object-center",
          variant === "hero" ? "opacity-90" : "opacity-70"
        )}
      />
      <div
        className={cn(
          "absolute inset-0",
          variant === "hero" ? "space-overlay-hero" : "space-overlay-app"
        )}
      />
    </div>
  );
}
