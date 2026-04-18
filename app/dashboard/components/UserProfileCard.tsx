import { Github, ExternalLink, User, Settings, Flame, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { SyncButtonComplete } from "@/components/SyncButtonComplete";

interface UserProfileCardProps {
  session: any;
  githubStatus: {
    isConnected: boolean;
    lastSync: string | null;
    provider: string;
  };
  lastSync: any;
  analytics?: any;
}

export function UserProfileCard({ session, githubStatus, lastSync, analytics }: UserProfileCardProps) {
  const { user } = session;

  const isSyncInProgress = lastSync?.status === "IN_PROGRESS";

  const syncDate = lastSync?.completedAt
    ? new Date(lastSync.completedAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Never";

  return (
    <aside
      aria-label="User profile and actions"
      style={{ alignSelf: "start", position: "sticky", top: "96px" }}
    >
      <div
        style={{
          background: "transparent",
          border: "none",
          borderRadius: 0,
        }}
      >
        {/* Profile header — thin spectral line instead of colored gradient */}
        <div
          style={{
            height: "1px",
            background: "rgba(240,240,250,0.35)",
          }}
          aria-hidden="true"
        />

        {/* Avatar row */}
        <div style={{ padding: "24px 0 0" }}>
          {user.image ? (
            <Image
              src={user.image}
              alt={`${user.name || user.username || 'User'} GitHub profile picture`}
              width={64}
              height={64}
              style={{
                borderRadius: "50%",
                border: "1px solid rgba(240,240,250,0.12)",
              }}
              priority={true}
            />
          ) : (
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "rgba(240,240,250,0.05)",
                border: "1px solid rgba(240,240,250,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Github size={28} style={{ opacity: 0.4 }} />
            </div>
          )}
        </div>

        {/* User info */}
        <div style={{ padding: "16px 0 24px" }}>
          <h2
            className="text-caption-bold uppercase tracking-widest"
            style={{ fontSize: "0.875rem", marginBottom: "4px" }}
          >
            {user.name || user.username || "ANONYMOUS USER"}
          </h2>
          {user.username && (
            <a
              href={`https://github.com/${user.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-caption"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                opacity: 0.45,
                marginBottom: "8px",
                textDecoration: "none",
                transition: "opacity 0.2s ease",
              }}
              aria-label={`Visit @${user.username} on GitHub (opens in new tab)`}
              
              
            >
              <Github size={11} />
              @{user.username}
              <ExternalLink size={9} />
            </a>
          )}
          {user.email && (
            <p
              className="text-micro"
              style={{ opacity: 0.3, marginBottom: "16px", overflow: "hidden", textOverflow: "ellipsis" }}
              title={user.email}
            >
              {user.email}
            </p>
          )}

          {/* Status badges — minimal */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                border: "1px solid rgba(240, 240, 250, 0.35)",
                borderRadius: "var(--radius-button)",
              }}
              className="text-micro"
            >
              AUTHENTICATED
            </span>
            {analytics?.isActiveToday && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 10px",
                  border: "1px solid rgba(240, 240, 250, 0.35)",
                  borderRadius: "var(--radius-button)",
                }}
                className="text-micro"
              >
                ACTIVE TODAY
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }} aria-label="Quick actions">
            <Link
              href="/profile"
              className="btn-ghost btn-ghost-sm"
              style={{ width: "100%", justifyContent: "center" }}
              aria-label="View your full profile"
            >
              <User size={13} />
              PROFILE
            </Link>
            <Link
              href="/settings"
              className="btn-ghost btn-ghost-sm"
              style={{ width: "100%", justifyContent: "center" }}
              aria-label="Manage account settings"
            >
              <Settings size={13} />
              SETTINGS
            </Link>
          </nav>

          {/* Divider */}
          <div style={{ height: "1px", background: "rgba(240,240,250,0.05)", margin: "20px 0" }} />

          {/* Data Sync Section */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <p className="text-micro uppercase tracking-widest" style={{ opacity: 0.4, letterSpacing: "1.5px" }}>DATA SYNC</p>
            <SyncButtonComplete />

            {/* Sync Status */}
            {isSyncInProgress ? (
              <p
                className="text-micro"
                role="status"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  opacity: 0.5,
                }}
              >
                <Loader2 size={10} style={{ animation: "spin 1s linear infinite" }} aria-hidden="true" />
                SYNCING IN PROGRESS...
              </p>
            ) : (
              <p
                className="text-micro uppercase tracking-widest"
                style={{ textAlign: "center", opacity: 0.3 }}
              >
                LAST SYNCED: {syncDate.toUpperCase()}
              </p>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
