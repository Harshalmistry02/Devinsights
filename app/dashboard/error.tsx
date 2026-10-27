"use client";

import { useEffect } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
import { PageShell } from "@/components/ui/page-shell";
import { SpaceBackground } from "@/components/ui/space-background";

/**
 * Dashboard Error Boundary
 *
 * Displays a user-friendly error message when something goes wrong.
 * Accessibility: Uses proper ARIA attributes, focus management, and semantic HTML.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for debugging
    console.error("Dashboard Error:", error);
  }, [error]);

  return (
    <div role="alert" aria-live="assertive">
      <SpaceBackground variant="app" />

      <PageShell>
        <main
          id="main-content"
          className="flex min-h-[60vh] items-center justify-center py-8"
        >
          <Card className="w-full max-w-lg text-center">
            <div className="flex justify-center">
              <IconTile size="lg" tone="danger">
                <AlertTriangle className="size-5" />
              </IconTile>
            </div>

            <h1 className="mt-5 text-section-head text-3xl">
              Something went wrong
            </h1>

            <p className="mx-auto mt-3 max-w-[42ch] text-body">
              We encountered an error loading your dashboard. This might be a
              temporary issue.
            </p>

            {process.env.NODE_ENV === "development" ? (
              <div className="mt-6 rounded-card border border-danger/30 bg-danger-soft p-3 text-left">
                <p className="break-all font-mono text-[11px] leading-relaxed text-danger">
                  {error.message}
                </p>
                {error.digest ? (
                  <p className="mt-1 font-mono text-[11px] text-text-3">
                    Error ID: {error.digest}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                variant="primary"
                onClick={reset}
                leadingIcon={<RefreshCw className="size-4" />}
                aria-label="Try again to load the dashboard"
              >
                Try again
              </Button>

              <ButtonLink
                href="/"
                variant="secondary"
                leadingIcon={<Home className="size-4" />}
                aria-label="Go home to the landing page"
              >
                Go home
              </ButtonLink>
            </div>

            <p className="mt-6 text-caption">
              If this problem persists, please contact support.
            </p>
          </Card>
        </main>
      </PageShell>
    </div>
  );
}
