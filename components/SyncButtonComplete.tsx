"use client";

import { useRef, useState } from "react";
import { Github, Loader2, RefreshCw } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { InlineNotice, type NoticeVariant } from "@/components/ui/inline-notice";

interface SyncResponse {
  success: boolean;
  message: string;
  data?: {
    syncJobId: string;
    totalRepos: number;
    totalCommits: number;
    processedCommits: number;
    duplicateCommits: number;
    syncErrors: number;
    syncDurationMs: number;
    syncDurationMin: number;
    timestamp: string;
    metrics: {
      totalRequests: number;
      rateLimitResets: number;
      errorsEncountered: number;
    };
  };
  error?: string;
  requiresReauth?: boolean;
  code?: string;
}

interface SyncErrorData {
  message: string;
  error?: string;
  status?: number;
  requiresReauth?: boolean;
  code?: string;
}

interface SyncStatus {
  status: "idle" | "syncing" | "success" | "error" | "warning";
  message: string;
  progress: number;
  details?: {
    totalRepos?: number;
    totalCommits?: number;
    syncDurationMin?: number;
  };
}

const NOTICE_VARIANTS: Record<SyncStatus["status"], NoticeVariant> = {
  idle: "info",
  syncing: "info",
  success: "success",
  warning: "warning",
  error: "error",
};

/**
 * Enhanced Sync Button with real-time progress tracking
 *
 * WCAG 2.1 AA Accessibility Features:
 * - ARIA live regions for screen reader announcements
 * - Proper focus indicators
 * - Keyboard accessible
 * - Status announcements for sync progress
 * - Clear disabled state communication
 */
export function SyncButtonComplete() {
  const [status, setStatus] = useState<SyncStatus>({
    status: "idle",
    message: "Ready to sync GitHub data",
    progress: 0,
  });
  const [requiresReauth, setRequiresReauth] = useState(false);

  // Reference for screen reader announcements
  const announcementRef = useRef<HTMLDivElement>(null);

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === "object" && error !== null && "message" in error) {
      const msg = (error as { message?: unknown }).message;
      if (typeof msg === "string") {
        return msg;
      }
    }

    if (typeof error === "string") {
      return error;
    }

    return "Unknown sync error";
  };

  const handleReauth = async () => {
    setStatus({
      status: "error",
      message:
        "Redirecting to sign out. Please sign back in to reconnect GitHub.",
      progress: 0,
    });

    try {
      await signOut({ callbackUrl: "/login", redirect: true });
    } catch (error) {
      console.error("Failed to sign out for GitHub reauthentication:", error);
      setStatus({
        status: "error",
        message:
          "Please use Sign out, then sign back in to reconnect GitHub.",
        progress: 0,
      });
    }
  };

  const handleSync = async (forceFullSync: boolean = false) => {
    setRequiresReauth(false);
    setStatus({
      status: "syncing",
      message: forceFullSync
        ? "Starting full GitHub re-sync…"
        : "Starting GitHub sync…",
      progress: 5,
    });

    // Simulate progress while waiting for the actual sync
    const progressMessages = [
      { progress: 10, message: "Connecting to GitHub…" },
      { progress: 20, message: "Fetching repositories…" },
      { progress: 35, message: "Analyzing commit history…" },
      { progress: 50, message: "Processing commits…" },
      { progress: 65, message: "Enriching data with statistics…" },
      { progress: 80, message: "Saving to database…" },
      { progress: 90, message: "Calculating analytics…" },
    ];

    let progressIndex = 0;
    const progressInterval = setInterval(() => {
      if (progressIndex < progressMessages.length) {
        const { progress, message } = progressMessages[progressIndex];
        setStatus((prev) => ({
          ...prev,
          progress,
          message,
        }));
        progressIndex++;
      }
    }, 3000);

    try {
      console.log(
        forceFullSync
          ? "Starting FULL GitHub sync (force)..."
          : "Starting complete GitHub sync..."
      );

      const response = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceFullSync }),
      });

      clearInterval(progressInterval);

      let data: Partial<SyncResponse> = {};
      try {
        data = (await response.json()) as Partial<SyncResponse>;
      } catch {
        data = {};
      }

      if (!response.ok) {
        const syncError: SyncErrorData = {
          message: data.message || data.error || `HTTP ${response.status}`,
          error: data.error,
          status: response.status,
          requiresReauth:
            data.requiresReauth === true || response.status === 401,
          code: data.code,
        };
        throw syncError;
      }

      if (!data.success) {
        const syncError: SyncErrorData = {
          message: data.message || "Sync failed",
          error: data.error,
          status: response.status,
          requiresReauth: data.requiresReauth,
          code: data.code,
        };
        throw syncError;
      }

      // Success
      const syncData = data.data;

      if (!syncData) {
        throw {
          message: "Sync succeeded but no sync payload was returned.",
          status: response.status,
        } as SyncErrorData;
      }

      console.log("Sync completed!", {
        totalRepos: syncData.totalRepos,
        totalCommits: syncData.totalCommits,
        syncDurationMin: syncData.syncDurationMin,
      });

      setStatus({
        status: syncData.syncErrors > 0 ? "warning" : "success",
        message:
          syncData.syncErrors > 0
            ? `Sync completed with ${syncData.syncErrors} errors. Most data synced successfully.`
            : `Successfully synced ${syncData.totalCommits.toLocaleString()} commits from ${syncData.totalRepos} repositories`,
        progress: 100,
        details: {
          totalRepos: syncData.totalRepos,
          totalCommits: syncData.totalCommits,
          syncDurationMin: syncData.syncDurationMin,
        },
      });

      // Log detailed stats
      if (syncData.duplicateCommits > 0) {
        console.log(`${syncData.duplicateCommits} duplicate commits skipped`);
      }

      // Reload page to show updated insights
      setTimeout(() => window.location.reload(), 2500);
    } catch (err: unknown) {
      clearInterval(progressInterval);
      console.error("Sync error:", getErrorMessage(err), err);

      let errorMessage = "Sync failed. Please try again.";
      const errorData =
        typeof err === "object" && err !== null && "message" in err
          ? (err as SyncErrorData)
          : null;
      const errorStr = errorData?.message || getErrorMessage(err);
      const normalizedError = errorStr.toLowerCase();

      // Check for authentication requirement flag
      if (errorData?.requiresReauth || errorData?.status === 401) {
        setRequiresReauth(true);
        errorMessage =
          errorData.message ||
          "GitHub authentication required. Please log out and log back in.";
        setStatus({
          status: "error",
          message: errorMessage,
          progress: 0,
        });

        console.log(
          "Tip: Log out and log back in to refresh your GitHub connection"
        );
        return;
      }

      setRequiresReauth(false);

      if (
        normalizedError.includes("rate limit") ||
        normalizedError.includes("429")
      ) {
        errorMessage =
          "GitHub rate limit exceeded. Please wait a few minutes and try again.";
      } else if (
        normalizedError.includes("authentication") ||
        normalizedError.includes("401") ||
        normalizedError.includes("unauthorized")
      ) {
        errorMessage =
          "GitHub authentication failed. Please reconnect your account by logging out and back in.";
      } else if (normalizedError.includes("not linked")) {
        errorMessage =
          "GitHub account not linked. Please connect your GitHub account first.";
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      }

      setStatus({
        status: "error",
        message: errorMessage,
        progress: 0,
      });
    }
  };

  const isSyncing = status.status === "syncing";
  const statusTitle =
    status.status === "syncing"
      ? "Syncing GitHub data"
      : status.status === "success"
        ? "Sync complete"
        : status.status === "warning"
          ? "Sync completed with warnings"
          : "Sync failed";

  return (
    <div className="space-y-3" role="region" aria-label="GitHub Data Sync">
      {/* Screen reader live region for status announcements */}
      <div
        ref={announcementRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {status.status === "syncing" &&
          "Syncing in progress. " + status.message}
        {status.status === "success" &&
          "Sync completed successfully. " + status.message}
        {status.status === "error" && "Sync failed. " + status.message}
        {status.status === "warning" &&
          "Sync completed with warnings. " + status.message}
      </div>

      <Button
        variant="primary"
        size="md"
        className="w-full"
        onClick={() => handleSync(false)}
        loading={isSyncing}
        loadingText="Syncing GitHub data"
        leadingIcon={<RefreshCw className="size-4" />}
        aria-label={
          isSyncing
            ? "Syncing GitHub data, please wait"
            : "Sync GitHub data from your linked repositories"
        }
        aria-describedby={status.status === "idle" ? undefined : "sync-status"}
      >
        Sync GitHub data
      </Button>

      {!isSyncing ? (
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => handleSync(true)}
          aria-label="Force full re-sync of all GitHub data"
          title="Use this if sync shows 0 commits but you have repos with commits"
          leadingIcon={<RefreshCw className="size-3" />}
        >
          Force full re-sync
        </Button>
      ) : null}

      {status.status !== "idle" ? (
        <InlineNotice
          id="sync-status"
          variant={NOTICE_VARIANTS[status.status]}
          role="status"
          icon={
            isSyncing ? <Loader2 className="animate-spin" /> : undefined
          }
          title={statusTitle}
        >
          <p>{status.message}</p>

          {isSyncing ? (
            <>
              <div
                className="progress-bar-track mt-3"
                role="progressbar"
                aria-label="Sync progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={status.progress}
              >
                <div
                  className="progress-bar-fill"
                  style={{ width: `${status.progress}%` }}
                />
              </div>
              <p className="mt-2">{status.progress}% complete</p>
            </>
          ) : null}

          {status.details &&
          (status.status === "success" || status.status === "warning") ? (
            <dl className="mt-3 grid grid-cols-3 divide-x divide-border-subtle overflow-hidden rounded-card border border-border-subtle">
              <div className="p-2.5">
                <dt className="text-label">Repositories</dt>
                <dd className="mt-1 font-mono text-sm tabular-nums text-text">
                  {(status.details.totalRepos ?? 0).toLocaleString("en-US")}
                </dd>
              </div>
              <div className="p-2.5">
                <dt className="text-label">Commits</dt>
                <dd className="mt-1 font-mono text-sm tabular-nums text-text">
                  {(status.details.totalCommits ?? 0).toLocaleString("en-US")}
                </dd>
              </div>
              <div className="p-2.5">
                <dt className="text-label">Duration</dt>
                <dd className="mt-1 font-mono text-sm tabular-nums text-text">
                  {(status.details.syncDurationMin ?? 0).toFixed(1)} min
                </dd>
              </div>
            </dl>
          ) : null}
        </InlineNotice>
      ) : null}

      {requiresReauth && status.status === "error" ? (
        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          onClick={handleReauth}
          aria-label="Log out and reconnect GitHub"
          leadingIcon={<Github className="size-3.5" />}
        >
          Log out and reconnect GitHub
        </Button>
      ) : null}
    </div>
  );
}
