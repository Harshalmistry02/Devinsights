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
 * Profile Content Component
 * Main profile display with user information and GitHub connection status
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

  // Format the creation date
  const joinedDate = user.email
    ? new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  // Fetch GitHub connection status
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
    // Redirect to GitHub OAuth flow
    window.location.href = "/api/auth/signin/github?callbackUrl=/profile";
  };

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <Link
              href="/dashboard"
              className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm mb-2 inline-flex items-center gap-2 group"
              aria-label="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Profile
            </h1>
          </div>
          <LogoutButton />
        </header>

        {/* Profile Card */}
        <main
          className="bg-slate-900/50 border border-slate-700/30 rounded-xl overflow-hidden backdrop-blur-sm shadow-2xl"
          role="main"
        >
          {/* Header Section */}
          <div className="bg-linear-to-r from-cyan-500/10 to-blue-500/10 border-b border-slate-700/30 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={user.name || "User avatar"}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-cyan-500/30 shadow-lg shadow-cyan-500/20 hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-linear-to-br from-cyan-500/20 to-blue-500/20 border-4 border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <User className="w-12 h-12 sm:w-16 sm:h-16 text-cyan-400" />
                </div>
              )}

              {/* User Info */}
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-200 mb-2">
                  {user.name || user.username || "Anonymous User"}
                </h2>
                {user.username && (
                  <a
                    href={`https://github.com/${user.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 transition-colors inline-flex items-center gap-2 text-base sm:text-lg group"
                    aria-label={`View ${user.username}'s GitHub profile`}
                  >
                    <Github className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    <span>@{user.username}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Account Information */}
            <section aria-labelledby="account-info-heading">
              <h3
                id="account-info-heading"
                className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2"
              >
                <Shield className="w-5 h-5 text-cyan-400" aria-hidden="true" />
                Account Information
              </h3>
              <div className="space-y-4">
                <InfoRow
                  icon={<Mail aria-hidden="true" />}
                  label="Email"
                  value={user.email || "Not provided"}
                />
                <InfoRow
                  icon={<Github aria-hidden="true" />}
                  label="GitHub Username"
                  value={user.username || "N/A"}
                />
                <InfoRow
                  icon={<Calendar aria-hidden="true" />}
                  label="Account Created"
                  value={joinedDate}
                />
              </div>
            </section>

            {/* GitHub Connection Status */}
            <section
              aria-labelledby="github-status-heading"
              className="border-t border-slate-700/30 pt-6"
            >
              <h3
                id="github-status-heading"
                className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2"
              >
                <Github className="w-5 h-5 text-cyan-400" aria-hidden="true" />
                GitHub Connection
              </h3>
              
              {isLoading ? (
                <div className="flex items-start gap-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/20">
                  <div className="w-10 h-10 bg-slate-800/50 rounded-lg animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 bg-slate-800/50 rounded animate-pulse" />
                    <div className="h-5 w-48 bg-slate-800/50 rounded animate-pulse" />
                  </div>
                </div>
              ) : githubData?.error ? (
                <div className="flex items-start gap-4 p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" aria-hidden="true" />
                  <div className="flex-1">
                    <p className="text-sm text-slate-500 mb-1">Status</p>
                    <p className="text-red-400 font-medium">Error loading GitHub status</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <InfoRow
                    icon={
                      githubData?.isConnected ? (
                        <CheckCircle2 className="text-green-400" aria-hidden="true" />
                      ) : (
                        <AlertCircle className="text-amber-400" aria-hidden="true" />
                      )
                    }
                    label="Connection Status"
                    value={
                      githubData?.isConnected
                        ? "Connected via GitHub OAuth"
                        : "Not connected"
                    }
                    valueClassName={
                      githubData?.isConnected ? "text-green-400" : "text-amber-400"
                    }
                  />
                  {githubData?.lastSync && (
                    <InfoRow
                      icon={<Clock aria-hidden="true" />}
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
            <section
              aria-labelledby="account-status-heading"
              className="border-t border-slate-700/30 pt-6"
            >
              <h3
                id="account-status-heading"
                className="text-lg font-semibold text-slate-300 mb-4"
              >
                Account Status
              </h3>
              <div className="flex flex-wrap gap-3">
                <span
                  className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-400 flex items-center gap-2"
                  role="status"
                  aria-label="Account is active and authenticated"
                >
                  <span
                    className="w-2 h-2 bg-green-400 rounded-full animate-pulse"
                    aria-hidden="true"
                  />
                  Active & Authenticated
                </span>
                {githubData?.isConnected && (
                  <span
                    className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-sm text-cyan-400 flex items-center gap-2"
                    role="status"
                    aria-label="Connected via GitHub OAuth"
                  >
                    <Github className="w-4 h-4" aria-hidden="true" />
                    GitHub OAuth
                  </span>
                )}
              </div>
            </section>

            {/* Developer Info (Development Only) */}
            {process.env.NODE_ENV === "development" && (
              <section
                aria-labelledby="dev-info-heading"
                className="border-t border-slate-700/30 pt-6"
              >
                <h3
                  id="dev-info-heading"
                  className="text-lg font-semibold text-slate-300 mb-4"
                >
                  Developer Info
                </h3>
                <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-700/30">
                  <div className="text-sm space-y-1">
                    <div>
                      <span className="text-slate-500">User ID:</span>
                      <span className="text-slate-300 ml-2 font-mono">{user.id}</span>
                    </div>
                    {githubData?.provider && (
                      <div>
                        <span className="text-slate-500">Provider:</span>
                        <span className="text-slate-300 ml-2 font-mono">
                          {githubData.provider}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}
          </div>
        </main>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <Link
            href="/settings"
            className="px-6 py-3 bg-slate-900/50 border border-slate-700/30 rounded-lg hover:bg-slate-800/50 hover:border-cyan-500/30 transition-all duration-300 text-slate-300 hover:text-cyan-400 flex items-center justify-center gap-2 group"
            aria-label="Manage account settings"
          >
            <Settings
              className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300"
              aria-hidden="true"
            />
            Manage Settings
          </Link>

          {!githubData?.isConnected && !isLoading && (
            <button
              onClick={handleReconnectGitHub}
              disabled={isReconnecting}
              className="px-6 py-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300 text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
              aria-label="Reconnect GitHub account"
            >
              <RefreshCw
                className={`w-4 h-4 group-hover:rotate-180 transition-transform duration-500 ${
                  isReconnecting ? "animate-spin" : ""
                }`}
                aria-hidden="true"
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
interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
}

function InfoRow({ icon, label, value, valueClassName = "text-slate-200" }: InfoRowProps) {
  return (
    <div className="flex items-start gap-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/20 hover:bg-slate-800/50 hover:border-slate-700/40 transition-all duration-300 group">
      <div className="p-2 bg-slate-900/50 rounded-lg border border-slate-700/30 text-cyan-400 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-500 mb-1">{label}</p>
        <p className={`font-medium wrap-break-word ${valueClassName}`}>{value}</p>
      </div>
    </div>
  );
}
