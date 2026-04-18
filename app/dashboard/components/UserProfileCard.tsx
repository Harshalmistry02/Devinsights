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
      style={{ alignSelf: "start", position: "sticky", top: "120px" }}
      className="brutalist-glass p-8"
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
            marginBottom: "24px"
          }}
          aria-hidden="true"
        />

        {/* Avatar row */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          {user.image ? (
            <Image
              src={user.image}
              alt={`${user.name || user.username || 'User'} GitHub profile picture`}
              width={80}
              height={80}
              style={{
                borderRadius: "50%",
                border: "1px solid rgba(240,240,250,0.15)",
              }}
              priority={true}
            />
          ) : (
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "rgba(240,240,250,0.05)",
                border: "1px solid rgba(240,240,250,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Github size={32} style={{ opacity: 0.4 }} />
            </div>
          )}
        </div>

        {/* User info */}
        <div style={{ padding: "24px 0 24px", textAlign: "center" }}>
          <h2
            className="text-caption-bold uppercase tracking-widest text-lg"
            style={{ marginBottom: "8px" }}
          >
            {user.name || user.username || "ANONYMOUS USER"}
          </h2>
          {user.username && (
            <a
              href={`https://github.com/${user.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-micro uppercase tracking-widest"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                opacity: 0.45,
                marginBottom: "8px",
                textDecoration: "none",
              }}
            >
              <Github size={11} />
              GH/{user.username.toUpperCase()}
            </a>
          )}
          {user.email && (
            <p
              className="text-micro opacity-30 mt-2 truncate max-w-full"
              title={user.email}
            >
              {user.email.toUpperCase()}
            </p>
          )}

          {/* Status badges — minimal */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px", margin: "24px 0" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "4px 10px",
                border: "1px solid rgba(240, 240, 250, 0.15)",
              }}
              className="text-micro uppercase tracking-widest"
            >
              VERIFIED
            </span>
            {analytics?.isActiveToday && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "4px 10px",
                  border: "1px solid rgba(240, 240, 250, 0.15)",
                  background: "rgba(240,240,250,0.05)"
                }}
                className="text-micro uppercase tracking-widest"
              >
                ONLINE
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }} aria-label="Quick actions">
            <Link
              href="/profile"
              className="btn-ghost btn-ghost-sm uppercase tracking-widest"
              style={{ width: "100%", justifyContent: "center" }}
            >
              <User size={13} />
              PROFILE
            </Link>
            <Link
              href="/settings"
              className="btn-ghost btn-ghost-sm uppercase tracking-widest"
              style={{ width: "100%", justifyContent: "center" }}
            >
              <Settings size={13} />
              SETTINGS
            </Link>
          </nav>

          {/* Divider */}
          <div style={{ height: "1px", background: "rgba(240,240,250,0.05)", margin: "32px 0" }} />

          {/* Data Sync Section */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <p className="text-micro uppercase tracking-widest opacity-40">SYSTEM SYNC</p>
            <SyncButtonComplete />

            {/* Sync Status */}
            {isSyncInProgress ? (
              <p
                className="text-micro uppercase tracking-widest opacity-50 flex items-center justify-center gap-2"
              >
                <Loader2 size={10} className="animate-spin" />
                SYNC IN PROGRESS
              </p>
            ) : (
              <p
                className="text-micro uppercase tracking-widest opacity-30 text-center"
              >
                LAST: {syncDate.toUpperCase()}
              </p>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
