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
 * Profile Content Component — SpaceX-inspired industrial aesthetic
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
            className="text-micro uppercase tracking-widest"
          >
            <ArrowLeft size={11} />
            DASHBOARD
          </Link>

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <p className="text-micro uppercase tracking-widest" style={{ marginBottom: "8px", opacity: 0.4 }}>ACCOUNT</p>
              <h1 className="text-section-head">PROFILE</h1>
            </div>
            <LogoutButton />
          </div>
        </header>

        {/* Profile identity & Information */}
        <div className="brutalist-glass p-8 space-y-12">
          {/* Hero row */}
          <div
            style={{
              paddingBottom: "28px",
              borderBottom: "1px solid rgba(240,240,250,0.05)",
              display: "flex",
              alignItems: "center",
              gap: "24px",
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
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  border: "1px solid rgba(240,240,250,0.15)",
                }}
                loading="lazy"
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
                <User size={38} style={{ opacity: 0.3 }} />
              </div>
            )}

            {/* Name + GH link */}
            <div>
              <h2
                className="text-section-head"
                style={{ fontSize: "clamp(1.5rem, 4vw, 2.25rem)", marginBottom: "8px" }}
              >
                {user.name || user.username || "ANONYMOUS USER"}
              </h2>
              {user.username && (
                <a
                  href={`https://github.com/${user.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    textDecoration: "none",
                    opacity: 0.4,
                  }}
                  className="text-micro uppercase tracking-widest"
                >
                  <Github size={12} />
                  GH/{user.username.toUpperCase()}
                </a>
              )}
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <section aria-labelledby="account-info-heading">
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px", opacity: 0.4 }}>
                <Shield size={12} />
                <h3 id="account-info-heading" className="text-micro uppercase tracking-widest">ACCOUNT DATA</h3>
              </div>
              <div className="space-y-4">
                <InfoRow
                  icon={<Mail size={12} />}
                  label="EMAIL"
                  value={user.email || "NOT PROVIDED"}
                />
                <InfoRow
                  icon={<Github size={12} />}
                  label="GITHUB ID"
                  value={user.username || "N/A"}
                />
                <InfoRow
                  icon={<Calendar size={12} />}
                  label="JOINED"
                  value={joinedDate.toUpperCase()}
                />
              </div>
            </section>

            <section aria-labelledby="github-status-heading">
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px", opacity: 0.4 }}>
                <Github size={12} />
                <h3 id="github-status-heading" className="text-micro uppercase tracking-widest">CONNECTION STATUS</h3>
              </div>
              {isLoading ? (
                <div className="animate-pulse space-y-4 pt-4">
                  <div className="h-4 bg-white/5 w-3/4" />
                  <div className="h-4 bg-white/5 w-1/2" />
                </div>
              ) : (
                <div className="space-y-4">
                  <InfoRow
                    icon={githubData?.isConnected
                      ? <CheckCircle2 size={12} style={{ color: "rgba(134,239,172,0.7)" }} />
                      : <AlertCircle size={12} style={{ color: "rgba(251,191,36,0.7)" }} />
                    }
                    label="STATUS"
                    value={githubData?.isConnected ? "VERIFIED" : "DISCONNECTED"}
                    valueColor={githubData?.isConnected ? "rgba(134,239,172,0.7)" : "rgba(251,191,36,0.7)"}
                  />
                  {githubData?.lastSync && (
                    <InfoRow
                      icon={<Clock size={12} />}
                      label="LAST SYNCED"
                      value={new Date(githubData.lastSync).toLocaleString("en-US", {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      }).toUpperCase()}
                    />
                  )}
                </div>
              )}
            </section>
          </div>
          
          {/* Account Status Badge */}
          <section>
            <h3 className="text-micro uppercase tracking-widest opacity-40 mb-4">SYSTEM STATUS</h3>
            <div className="flex flex-wrap gap-4">
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 14px",
                    background: "rgba(134,239,172,0.04)",
                    border: "1px solid rgba(134,239,172,0.14)",
                  }}
                  className="text-micro uppercase tracking-widest"
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "rgba(134,239,172,0.7)",
                      boxShadow: "0 0 8px rgba(134,239,172,0.5)"
                    }}
                  />
                  ACTIVE & AUTHENTICATED
                </span>
            </div>
          </section>
        </div>

        {/* Actions Section */}
        <div style={{ marginTop: "32px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link
            href="/settings"
            className="btn-ghost btn-ghost-sm"
          >
            <Settings size={13} />
            MANAGE SETTINGS
          </Link>

          {!githubData?.isConnected && !isLoading && (
            <button
              onClick={handleReconnectGitHub}
              disabled={isReconnecting}
              className="btn-ghost btn-ghost-sm"
            >
              <RefreshCw
                size={13}
                className={isReconnecting ? "animate-spin" : ""}
              />
              {isReconnecting ? "RECONNECTING..." : "RECONNECT GITHUB"}
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
    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
      <span style={{ opacity: 0.3, flexShrink: 0, marginTop: "2px" }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p className="text-micro uppercase tracking-widest" style={{ opacity: 0.3, marginBottom: "4px" }}>{label}</p>
        <p
          className="text-caption uppercase tracking-widest"
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
