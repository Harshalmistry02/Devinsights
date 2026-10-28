"use client";

import { useEffect } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
import { PageShell } from "@/components/ui/page-shell";
import { SpaceBackground } from "@/components/ui/space-background";

/**
 * Insights Error Boundary
 */
export default function InsightsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Insights Error:", error);
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
              Insights unavailable
            </h1>

            <p className="mx-auto mt-3 max-w-[42ch] text-body">
              We couldn&apos;t load your coding insights. This is usually
              temporary.
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
                aria-label="Try again to load coding insights"
              >
                Try again
              </Button>

              <ButtonLink
                href="/dashboard"
                variant="secondary"
                leadingIcon={<Home className="size-4" />}
                aria-label="Go to the dashboard"
              >
                Go to dashboard
              </ButtonLink>
            </div>

            <p className="mt-6 text-caption">
              If this keeps happening, sync your data again from the dashboard.
            </p>
          </Card>
        </main>
      </PageShell>
    </div>
  );
}
