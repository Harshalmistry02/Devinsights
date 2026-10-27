import { Github, Loader2, Settings, User } from "lucide-react";
import Image from "next/image";
import type { Session } from "next-auth";
import { SyncButtonComplete } from "@/components/SyncButtonComplete";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface UserProfileCardProps {
  session: Session;
  githubStatus: {
    isConnected: boolean;
    lastSync: string | null;
    provider: string | null;
  };
  lastSync: {
    status?: string | null;
    completedAt?: string | Date | null;
  } | null;
  analytics?: {
    isActiveToday?: boolean;
  } | null;
}

export function UserProfileCard({
  session,
  githubStatus,
  lastSync,
  analytics,
}: UserProfileCardProps) {
  const { user } = session;

  const isSyncInProgress = lastSync?.status === "IN_PROGRESS";
  const provider = githubStatus.provider ?? "github";
  const providerLabel =
    provider.toLowerCase() === "github"
      ? "GitHub"
      : provider.charAt(0).toUpperCase() + provider.slice(1);

  const syncDate = lastSync?.completedAt
    ? new Date(lastSync.completedAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "Never";

  return (
    <aside
      aria-label="User profile and actions"
      className="min-w-0 self-start lg:sticky lg:top-[calc(var(--nav-height)+24px)]"
    >
      <Card>
        <div
          className="mb-6 h-px bg-border-strong"
          aria-hidden="true"
        />

        <div className="flex justify-center">
          {user.image ? (
            <Image
              src={user.image}
              alt={`${user.name || user.username || "User"} GitHub profile picture`}
              width={88}
              height={88}
              priority
              className="size-[88px] rounded-full border border-border object-cover"
            />
          ) : (
            <div className="flex size-[88px] items-center justify-center rounded-full border border-border bg-surface-hover">
              <Github className="size-8 text-text-3" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="pt-5 text-center">
          <h2 className="break-words text-section-head">
            {user.name || user.username || "Anonymous user"}
          </h2>

          {user.username ? (
            <a
              href={`https://github.com/${user.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring mt-2 inline-flex min-h-6 items-center gap-1.5 rounded-sm text-caption text-text-2 transition-colors duration-150 hover:text-accent"
            >
              <Github className="size-3.5" aria-hidden="true" />
              @{user.username}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : null}

          {user.email ? (
            <p
              className="mt-2 break-words text-caption"
              title={user.email}
            >
              {user.email}
            </p>
          ) : null}

          {analytics?.isActiveToday ? (
            <div className="mt-5 flex justify-center">
              <Badge variant="success" size="sm" dot>
                Active today
              </Badge>
            </div>
          ) : null}

          <nav
            className="mt-6 flex flex-col gap-2"
            aria-label="Quick actions"
          >
            <ButtonLink
              href="/profile"
              variant="secondary"
              size="sm"
              className="w-full"
              leadingIcon={<User className="size-3.5" />}
            >
              Profile
            </ButtonLink>
            <ButtonLink
              href="/settings"
              variant="secondary"
              size="sm"
              className="w-full"
              leadingIcon={<Settings className="size-3.5" />}
            >
              Settings
            </ButtonLink>
          </nav>

          <div
            className="my-6 h-px bg-border-subtle"
            aria-hidden="true"
          />

          <section aria-label="Sync status" className="space-y-3 text-left">
            <div className="flex items-center justify-between gap-3">
              <p className="text-label">System sync</p>
              <Badge
                variant={githubStatus.isConnected ? "success" : "neutral"}
                size="sm"
                dot
              >
                {githubStatus.isConnected ? "Connected" : "Not connected"}
              </Badge>
            </div>

            <p className="text-caption">
              Provider:{" "}
              <span className="text-text-2">{providerLabel}</span>
            </p>

            <SyncButtonComplete />

            {isSyncInProgress ? (
              <p
                className="flex items-center justify-center gap-2 text-caption"
                aria-live="polite"
              >
                <Loader2
                  className="size-3.5 animate-spin"
                  aria-hidden="true"
                />
                Sync in progress
              </p>
            ) : (
              <p className="text-center text-caption">
                Last sync: <span className="text-text-2">{syncDate}</span>
              </p>
            )}
          </section>
        </div>
      </Card>
    </aside>
  );
}
