"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import type { Session } from "next-auth";
import {
  AlertCircle,
  Clock,
  ExternalLink,
  Github,
  KeyRound,
  Mail,
  RefreshCw,
  Settings,
  ShieldCheck,
  User,
} from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";
import { Badge, Chip } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import {
  Card,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
import { InlineNotice } from "@/components/ui/inline-notice";
import { KeyValueList } from "@/components/ui/key-value-list";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfileContentProps {
  session: Session;
}

interface GitHubConnectionData {
  isConnected: boolean;
  lastSync: string | null;
  provider: string | null;
  requiresReauth?: boolean;
  error?: string;
}

/**
 * Profile content: identity, GitHub connection and the current session.
 */
export function ProfileContent({ session }: ProfileContentProps) {
  const { user } = session;
  const [githubData, setGithubData] = useState<GitHubConnectionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [statusError, setStatusError] = useState(false);

  const loadGitHubStatus = useCallback(async () => {
    setIsLoading(true);
    setStatusError(false);

    try {
      const response = await fetch("/api/profile/github-status");
      if (!response.ok) {
        throw new Error("GitHub status request failed");
      }
      const data = (await response.json()) as GitHubConnectionData;
      setGithubData(data);
    } catch {
      setGithubData({
        isConnected: false,
        lastSync: null,
        provider: null,
        error: "GitHub status is temporarily unavailable.",
      });
      setStatusError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadGitHubStatus();
  }, [loadGitHubStatus]);

  const handleReconnectGitHub = () => {
    setIsReconnecting(true);
    window.location.href = "/api/auth/signin/github?callbackUrl=/profile";
  };

  const displayName = user.name || user.username || "Signed-in user";
  const needsReconnect =
    !isLoading &&
    !statusError &&
    githubData !== null &&
    (githubData.requiresReauth === true || !githubData.isConnected);

  const connectionState = statusError
    ? "Unavailable"
    : isLoading
      ? "Checking"
      : githubData?.requiresReauth
        ? "Reconnect required"
        : githubData?.isConnected
          ? "Connected"
          : "Not connected";

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Profile"
        subtitle="Your identity, GitHub connection and current session."
        back={{ href: "/dashboard", label: "Dashboard" }}
        actions={
          <ButtonLink
            href="/settings"
            variant="secondary"
            size="sm"
            leadingIcon={<Settings className="size-3.5" />}
          >
            Settings
          </ButtonLink>
        }
      />

      <div className="space-y-5">
        <Card padding="lg">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name ? `${user.name}'s avatar` : "GitHub avatar"}
                width={96}
                height={96}
                className="size-20 shrink-0 rounded-card border border-border object-cover sm:size-24"
              />
            ) : (
              <IconTile
                size="xl"
                tone="neutral"
                className="size-20 rounded-card sm:size-24"
              >
                <User className="size-8" aria-hidden="true" />
              </IconTile>
            )}

            <div className="min-w-0 flex-1">
              <p className="text-label">Signed in as</p>
              <h2 className="mt-1.5 break-words font-display text-2xl font-bold leading-tight tracking-[0.02em] text-text sm:text-3xl">
                {displayName}
              </h2>

              {user.username ? (
                <a
                  href={`https://github.com/${user.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring mt-2 inline-flex min-h-11 items-center gap-1.5 text-caption text-accent transition-colors hover:text-text"
                >
                  @{user.username}
                  <ExternalLink className="size-3" aria-hidden="true" />
                  <span className="sr-only">on GitHub (opens in a new tab)</span>
                </a>
              ) : (
                <p className="mt-2 text-caption">
                  No GitHub username is attached to this session.
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Chip>GitHub account</Chip>
                {!isLoading && githubData?.isConnected && !statusError ? (
                  <Badge variant="success" size="sm" dot>
                    Connected
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card className="flex h-full flex-col">
            <CardHeader
              icon={<User className="size-4" />}
              title="Account"
              description="Read-only details from your GitHub identity."
            />

            <div className="flex-1">
              <KeyValueList
                items={[
                  {
                    label: "Email",
                    value: user.email || "Not provided",
                    icon: <Mail />,
                  },
                  {
                    label: "GitHub username",
                    value: user.username ? (
                      <a
                        href={`https://github.com/${user.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="focus-ring inline-flex min-h-11 items-center gap-1 text-accent transition-colors hover:text-text"
                      >
                        @{user.username}
                        <ExternalLink className="size-3" aria-hidden="true" />
                        <span className="sr-only">
                          on GitHub (opens in a new tab)
                        </span>
                      </a>
                    ) : (
                      "Not linked"
                    ),
                    icon: <Github />,
                  },
                  {
                    label: "Display name",
                    value: user.name || "Not set",
                    icon: <User />,
                  },
                  {
                    label: "Authentication",
                    value: "GitHub OAuth",
                    icon: <KeyRound />,
                  },
                ]}
              />
            </div>

            <CardFooter>
              <p className="text-caption">
                Profile details come from your GitHub account.
              </p>
            </CardFooter>
          </Card>

          <Card className="flex h-full flex-col">
            <CardHeader
              icon={<Github className="size-4" />}
              title="GitHub connection"
              description="Sync access and the last archive update."
              action={
                isLoading ? (
                  <Skeleton className="h-5 w-24 rounded-pill" />
                ) : (
                  <Badge
                    variant={
                      statusError
                        ? "warning"
                        : githubData?.requiresReauth
                          ? "warning"
                          : githubData?.isConnected
                            ? "success"
                            : "danger"
                    }
                    size="sm"
                    dot
                  >
                    {connectionState}
                  </Badge>
                )
              }
            />

            <div className="flex-1">
              {isLoading ? (
                <div className="space-y-3" aria-hidden="true">
                  <Skeleton className="h-11 w-full rounded-card" />
                  <Skeleton className="h-11 w-full rounded-card" />
                  <Skeleton className="h-16 w-full rounded-card" />
                </div>
              ) : statusError ? (
                <InlineNotice
                  variant="warning"
                  title="GitHub status unavailable"
                  icon={<AlertCircle />}
                  action={
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => void loadGitHubStatus()}
                    >
                      Retry
                    </Button>
                  }
                >
                  We could not read your GitHub connection state. Retry, or
                  reconnect GitHub if syncing still fails.
                </InlineNotice>
              ) : githubData ? (
                <>
                  <KeyValueList
                    items={[
                      {
                        label: "Provider",
                        value: formatProvider(githubData.provider),
                        icon: <ShieldCheck />,
                      },
                      {
                        label: "Last sync",
                        value: formatLastSync(githubData.lastSync),
                        icon: <Clock />,
                      },
                    ]}
                  />

                  {githubData.requiresReauth ? (
                    <InlineNotice
                      variant="warning"
                      className="mt-4"
                      title="Reconnect required"
                    >
                      GitHub access needs to be renewed before syncing can
                      continue.
                    </InlineNotice>
                  ) : !githubData.isConnected ? (
                    <InlineNotice
                      variant="info"
                      className="mt-4"
                      title="GitHub is not connected"
                    >
                      Reconnect GitHub to resume syncing repositories and
                      commits.
                    </InlineNotice>
                  ) : null}

                  {needsReconnect ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleReconnectGitHub}
                      loading={isReconnecting}
                      loadingText="Redirecting…"
                      leadingIcon={<RefreshCw className="size-3.5" />}
                      className="mt-4 disabled:opacity-100"
                    >
                      Reconnect GitHub
                    </Button>
                  ) : null}
                </>
              ) : null}
            </div>

            <CardFooter>
              <p className="text-caption">
                Connection state is read from your GitHub account.
              </p>
            </CardFooter>
          </Card>
        </div>

        <Card>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <IconTile tone="success">
                <ShieldCheck className="size-4" />
              </IconTile>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-card-title">Session</h2>
                  <Badge variant="success" size="sm" dot>
                    Active
                  </Badge>
                </div>
                <p className="mt-1 max-w-xl text-caption">
                  Signed in with GitHub OAuth. Signing out ends this browser
                  session; your synced data stays intact.
                </p>
              </div>
            </div>

            <LogoutButton className="shrink-0" />
          </div>
        </Card>
      </div>
    </>
  );
}

function formatLastSync(value: string | null): string {
  if (!value) return "Not synced yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function formatProvider(provider: string | null): string {
  if (!provider) return "GitHub OAuth";
  return provider.toLowerCase() === "github" ? "GitHub OAuth" : provider;
}
