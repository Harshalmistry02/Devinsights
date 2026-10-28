import { requireAuth } from "@/lib/auth-helpers";
import {
  AlertTriangle,
  Bell,
  ExternalLink,
  Github,
  KeyRound,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
import { KeyValueList } from "@/components/ui/key-value-list";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { SpaceBackground } from "@/components/ui/space-background";

/**
 * Settings Page
 *
 * Read-only account details, session security and unavailable preferences.
 */
export default async function SettingsPage() {
  const session = await requireAuth();
  const { user } = session;

  return (
    <>
      <SpaceBackground variant="app" />

      <PageShell width="narrow">
        <main id="main-content" role="main" aria-label="Settings">
          <PageHeader
            eyebrow="Account"
            title="Settings"
            subtitle="Account details, security and workspace preferences."
            back={{ href: "/dashboard", label: "Dashboard" }}
          />

          <div className="space-y-5">
            <Card>
              <CardHeader
                headingLevel={2}
                icon={<User className="size-4" />}
                title="Account"
                description="Read-only details from your GitHub identity."
              />

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

              <CardFooter>
                <a
                  href="https://github.com/settings/profile"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring inline-flex min-h-11 items-center gap-2 text-caption text-accent transition-colors hover:text-text"
                >
                  Edit profile on GitHub
                  <ExternalLink className="size-3" aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader
                headingLevel={2}
                icon={<ShieldCheck className="size-4" />}
                title="Security"
                description="How you sign in and the state of this session."
                action={
                  <Badge variant="success" size="sm" dot>
                    Secure
                  </Badge>
                }
              />

              <KeyValueList
                items={[
                  {
                    label: "Authentication",
                    value: "GitHub OAuth",
                    icon: <KeyRound />,
                  },
                  {
                    label: "Session",
                    value: "Active in this browser",
                    icon: <ShieldCheck />,
                  },
                ]}
              />

              <CardFooter>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-caption">
                    Signing out ends this browser session. Your synced data stays
                    intact.
                  </p>
                  <LogoutButton className="shrink-0" />
                </div>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader
                headingLevel={2}
                icon={<Bell className="size-4" />}
                title="Notifications"
                description="Delivery preferences for sync and analysis updates."
                action={
                  <Badge variant="warning" size="sm">
                    Coming soon
                  </Badge>
                }
              />

              <p className="text-caption">
                Notification settings are not available yet. Sync results and AI
                analysis updates currently appear inside the app.
              </p>
            </Card>

            <Card className="border-danger/25">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <IconTile tone="danger">
                    <AlertTriangle className="size-4" />
                  </IconTile>
                  <div className="min-w-0">
                    <h2 className="text-card-title">Danger zone</h2>
                    <p className="mt-1 max-w-xl text-caption">
                      Permanently remove your DevInsight account and synced
                      data. This action cannot be undone.
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Badge variant="danger" size="sm">
                    Unavailable
                  </Badge>
                  <Button variant="danger" disabled>
                    Delete account
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </PageShell>
    </>
  );
}
