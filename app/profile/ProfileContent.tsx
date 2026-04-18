"use client";

import { useState, useEffect } from "react";
import { LogoutButton } from "@/components/LogoutButton";
import {
  Mail,
  Github,
  Calendar,
  Shield,
  RefreshCw,
  Settings,
  AlertCircle,
  CheckCircle2,
  Clock,
  User,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import type { Session } from "next-auth";

/**
 * Profile Content Component — SpaceX-inspired aesthetic
 */

interface ProfileContentProps {
  session: Session;
}

interface GitHubConnectionData {
  isConnected: boolean;
  lastSync: string | null;
  provider: string | null;
  error?: string;
}

export function ProfileContent({ session }: ProfileContentProps) {
  const { user } = session;
  const [githubData, setGithubData] = useState<GitHubConnectionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);

  const joinedDate = user.email
    ? new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  useEffect(() => {
    async function fetchGitHubStatus() {
      try {
        const response = await fetch("/api/profile/github-status");
        if (response.ok) {
          const data = await response.json();
          setGithubData(data);
        } else {
          setGithubData({
            isConnected: false,
            lastSync: null,
            provider: null,
            error: "Failed to fetch GitHub status",
          });
        }
      } catch (error) {
        console.error("Error fetching GitHub status:", error);
        setGithubData({
          isConnected: false,
          lastSync: null,
          provider: null,
          error: "Network error",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchGitHubStatus();
  }, []);

  const handleReconnectGitHub = async () => {
    setIsReconnecting(true);
    window.location.href = "/api/auth/signin/github?callbackUrl=/profile";
  };

  return (
    <div className="section-cinematic bg-black">
      <div 
        className="section-photo" 
        style={{ 
          backgroundImage: "url('/space-hero.png')", 
          backgroundSize: "cover", 
          backgroundPosition: "center",
          position: "fixed"
        }} 
      />
      <div className="section-overlay" style={{ position: "fixed" }} />
      <div className="section-content relative z-20 w-full" style={{ padding: "120px clamp(24px, 6vw, 80px) 40px", maxWidth: "800px", margin: "0 auto" }}>
        {/* Header */}
        <header style={{ marginBottom: "40px" }}>
          <Link
            href="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
              marginBottom: "20px",
              opacity: 0.4,
              transition: "opacity 0.2s ease",
            }}
            className="text-micro"
            aria-label="Back to Dashboard"
            
            
          >
            <ArrowLeft size={11} />
            Dashboard
          </Link>

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <p className="text-micro" style={{ marginBottom: "8px", opacity: 0.4 }}>Account</p>
              <h1 className="text-section-head">Profile</h1>
            </div>
            <LogoutButton />
          </div>
        </header>

        {/* Profile identity */}
        <div
          style={{
            background: "transparent",
            border: "none",
            borderRadius: "0",
            overflow: "visible",
          }}
        >
          {/* Hero row */}
          <div
            style={{
              padding: "28px 0",
              borderBottom: "1px solid rgba(240,240,250,0.05)",
              display: "flex",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            {/* Avatar */}
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name || "User avatar"}
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  border: "1px solid rgba(240,240,250,0.12)",
                }}
                loading="lazy"
              />
            ) : (
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  background: "rgba(240,240,250,0.05)",
                  border: "1px solid rgba(240,240,250,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <User size={32} style={{ opacity: 0.3 }} />
              </div>
            )}

            {/* Name + GH link */}
            <div>
              <h2
                className="text-section-head"
                style={{ fontSize: "clamp(1.25rem, 3vw, 1.75rem)", marginBottom: "6px" }}
              >
                {user.name || user.username || "Anonymous User"}
              </h2>
              {user.username && (
                <a
                  href={`https://github.com/${user.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    textDecoration: "none",
                    opacity: 0.4,
                    transition: "opacity 0.2s ease",
                  }}
                  className="text-caption"
                  aria-label={`View ${user.username}'s GitHub profile`}
                  
                  
                >
                  <Github size={12} />
                  @{user.username}
                </a>
              )}
            </div>
          </div>

          {/* Account information */}
          <div style={{ padding: "24px 0" }}>
            <section aria-labelledby="account-info-heading">
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", opacity: 0.4 }}>
                <Shield size={12} />
                <h3 id="account-info-heading" className="text-micro">Account Information</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "24px", background: "transparent", borderRadius: "0", overflow: "visible" }}>
                <InfoRow
                  icon={<Mail size={12} />}
                  label="Email"
                  value={user.email || "Not provided"}
                />
                <InfoRow
                  icon={<Github size={12} />}
                  label="GitHub Username"
                  value={user.username || "N/A"}
                />
                <InfoRow
                  icon={<Calendar size={12} />}
                  label="Account Created"
                  value={joinedDate}
                />
              </div>
            </section>

            {/* GitHub Connection Status */}
            <section
              aria-labelledby="github-status-heading"
              style={{ marginTop: "28px" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", opacity: 0.4 }}>
                <Github size={12} />
                <h3 id="github-status-heading" className="text-micro">GitHub Connection</h3>
              </div>

              {isLoading ? (
                <div style={{ display: "flex", gap: "12px", padding: "16px", background: "rgba(240,240,250,0.02)", border: "1px solid rgba(240,240,250,0.05)", borderRadius: "var(--radius-sharp)" }}>
                  <div className="skeleton" style={{ width: "40px", height: "40px", borderRadius: "50%", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ width: "100px", height: "10px", marginBottom: "6px" }} />
                    <div className="skeleton" style={{ width: "160px", height: "14px" }} />
                  </div>
                </div>
              ) : githubData?.error ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    padding: "16px",
                    background: "rgba(252,165,165,0.04)",
                    border: "1px solid rgba(252,165,165,0.12)",
                    borderRadius: "var(--radius-sharp)",
                  }}
                  role="alert"
                >
                  <AlertCircle size={14} style={{ color: "rgba(252,165,165,0.6)", flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <p className="text-micro" style={{ opacity: 0.35, marginBottom: "4px" }}>Status</p>
                    <p className="text-caption" style={{ color: "rgba(252,165,165,0.7)" }}>Error loading GitHub status</p>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "24px", background: "transparent", borderRadius: "0", overflow: "visible" }}>
                  <InfoRow
                    icon={githubData?.isConnected
                      ? <CheckCircle2 size={12} style={{ color: "rgba(134,239,172,0.7)" }} />
                      : <AlertCircle size={12} style={{ color: "rgba(251,191,36,0.7)" }} />
                    }
                    label="Connection Status"
                    value={githubData?.isConnected ? "Connected via GitHub OAuth" : "Not connected"}
                    valueColor={githubData?.isConnected ? "rgba(134,239,172,0.7)" : "rgba(251,191,36,0.7)"}
                  />
                  {githubData?.lastSync && (
                    <InfoRow
                      icon={<Clock size={12} />}
                      label="Last Synced"
                      value={new Date(githubData.lastSync).toLocaleString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    />
                  )}
                </div>
              )}
            </section>

            {/* Account Status */}
            <section aria-labelledby="account-status-heading" style={{ marginTop: "28px" }}>
              <h3 id="account-status-heading" className="text-micro" style={{ opacity: 0.4, marginBottom: "12px" }}>
                Account Status
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 14px",
                    background: "rgba(134,239,172,0.04)",
                    border: "1px solid rgba(134,239,172,0.14)",
                    borderRadius: "var(--radius-button)",
                  }}
                  className="text-micro"
                  role="status"
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "rgba(134,239,172,0.7)",
                      animation: "pulse 2s ease infinite",
                    }}
                    aria-hidden="true"
                  />
                  Active & Authenticated
                </span>
                {githubData?.isConnected && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "6px 14px",
                      background: "rgba(240,240,250,0.03)",
                      border: "1px solid rgba(240,240,250,0.08)",
                      borderRadius: "var(--radius-button)",
                    }}
                    className="text-micro"
                  >
                    <Github size={10} />
                    GitHub OAuth
                  </span>
                )}
              </div>
            </section>

            {/* Dev info (development only) */}
            {process.env.NODE_ENV === "development" && (
              <section aria-labelledby="dev-info-heading" style={{ marginTop: "28px" }}>
                <h3 id="dev-info-heading" className="text-micro" style={{ opacity: 0.3, marginBottom: "8px" }}>DEV INFO</h3>
                <div
                  style={{
                    padding: "12px 0",
                    background: "transparent",
                    border: "none",
                    borderBottom: "1px solid rgba(240,240,250,0.05)",
                    borderRadius: "0",
                  }}
                >
                  <p className="text-micro" style={{ opacity: 0.3 }}>
                    User ID: <span style={{ fontFamily: "monospace", letterSpacing: 0 }}>{user.id}</span>
                  </p>
                  {githubData?.provider && (
                    <p className="text-micro" style={{ opacity: 0.3, marginTop: "4px" }}>
                      Provider: <span style={{ fontFamily: "monospace", letterSpacing: 0 }}>{githubData.provider}</span>
                    </p>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Actions */}
        <div
          style={{
            marginTop: "24px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/settings"
            className="btn-ghost btn-ghost-sm"
            aria-label="Manage account settings"
          >
            <Settings size={13} />
            Manage Settings
          </Link>

          {!githubData?.isConnected && !isLoading && (
            <button
              onClick={handleReconnectGitHub}
              disabled={isReconnecting}
              className="btn-ghost btn-ghost-sm"
              aria-label="Reconnect GitHub account"
              style={{ opacity: isReconnecting ? 0.5 : 1 }}
            >
              <RefreshCw
                size={13}
                style={{
                  animation: isReconnecting ? "spin 1s linear infinite" : "none",
                }}
              />
              {isReconnecting ? "Reconnecting..." : "Reconnect GitHub"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Info Row Component
function InfoRow({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        padding: "14px 0",
        background: "transparent",
        transition: "background 0.2s ease",
      }}
      
      
    >
      <span style={{ opacity: 0.3, flexShrink: 0, marginTop: "2px" }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p className="text-micro" style={{ opacity: 0.3, marginBottom: "3px" }}>{label}</p>
        <p
          className="text-caption"
          style={{
            color: valueColor || "var(--spectral-white)",
            opacity: valueColor ? 1 : 0.65,
            overflowWrap: "break-word",
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
