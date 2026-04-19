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
import Image from "next/image";
import type { Session } from "next-auth";
import { cn } from "@/lib/utils";

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
    <div className="section-cinematic bg-black items-start">
      <div 
        className="section-photo grayscale opacity-40 transition-opacity duration-1000" 
        style={{ 
          backgroundImage: "url('/profile-hero.png')", 
          backgroundSize: "cover", 
          backgroundPosition: "center"
        }} 
      />
      <div className="section-overlay" />
      
      <div className="section-content relative z-20 w-full" style={{ padding: "clamp(88px, 14vh, 120px) clamp(24px, 6vw, 80px) 40px", maxWidth: "900px", margin: "0 auto" }}>
        {/* Header */}
        <header className="mb-8 sm:mb-12">
          <Link
            href="/dashboard"
            className="text-micro uppercase tracking-[4px] opacity-40 hover:opacity-100 transition-all inline-flex items-center gap-3 sm:gap-4 mb-6 sm:mb-10"
          >
            <ArrowLeft size={11} />
            BACK TO MISSION CONTROL
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 sm:gap-8 border-b border-white/10 pb-8 sm:pb-10">
            <div>
              <p className="text-micro uppercase tracking-[5px] opacity-20 mb-4 font-bold">PERSONNEL ARCHIVE</p>
              <h1 className="text-display-hero font-bold opacity-80 tracking-tighter">PROFILE</h1>
            </div>
            <LogoutButton />
          </div>
        </header>

        {/* Profile identity & Information */}
        <div className="brutalist-glass p-5 sm:p-10 space-y-10 sm:space-y-16">
          {/* Identity row */}
          <div className="flex items-center gap-6 sm:gap-10 flex-wrap sm:flex-nowrap border-b border-white/5 pb-8 sm:pb-12">
            {/* Avatar block */}
            <div className="relative group">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || "User avatar"}
                  width={96}
                  height={96}
                  className="w-24 h-24 grayscale border border-white/20 group-hover:grayscale-0 transition-all duration-500"
                />
              ) : (
                <div className="w-24 h-24 border border-white/10 bg-white/5 flex items-center justify-center">
                  <User size={40} className="opacity-20" />
                </div>
              )}
               <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-white flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-black" />
               </div>
            </div>

            <div className="flex-1">
              <h2 className="text-section-head text-3xl font-bold opacity-80 tracking-widest uppercase mb-4">
                {user.name || user.username || "STATION_USER_00"}
              </h2>
              {user.username && (
                <a
                  href={`https://github.com/${user.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-micro uppercase tracking-[3px] opacity-30 hover:opacity-100 transition-all inline-flex items-center gap-3"
                >
                  <Github size={12} />
                  GITHUB_REF: {user.username.toUpperCase()}
                </a>
              )}
            </div>
          </div>

          {/* Detailed Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-16">
            <section>
              <div className="flex items-center gap-3 mb-8 opacity-20 group">
                <Shield size={12} />
                <h3 className="text-micro uppercase tracking-[4px] font-bold">CORE CREDENTIALS</h3>
              </div>
              <div className="space-y-6">
                <InfoRow
                  icon={<Mail size={12} />}
                  label="REGISTRATION"
                  value={user.email || "UNSPECIFIED"}
                />
                <InfoRow
                  icon={<Github size={12} />}
                  label="EXTERNAL_ID"
                  value={user.username || "NULL"}
                />
                <InfoRow
                  icon={<Calendar size={12} />}
                  label="COMMISSIONED"
                  value={joinedDate.toUpperCase()}
                />
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-8 opacity-20">
                <Github size={12} />
                <h3 className="text-micro uppercase tracking-[4px] font-bold">OPERATIONAL STATUS</h3>
              </div>
              {isLoading ? (
                <div className="space-y-6 animate-pulse pt-4">
                  <div className="h-4 bg-white/5 w-full" />
                  <div className="h-4 bg-white/5 w-2/3" />
                </div>
              ) : (
                <div className="space-y-6">
                  <InfoRow
                    icon={githubData?.isConnected
                      ? <CheckCircle2 size={12} className="opacity-60" />
                      : <AlertCircle size={12} className="opacity-40" />
                    }
                    label="NETWORK_SYNC"
                    value={githubData?.isConnected ? "LINKED / ACTIVE" : "LINK_TERMINATED"}
                    isStatus
                  />
                  {githubData?.lastSync && (
                    <InfoRow
                      icon={<Clock size={12} />}
                      label="ARCHIVE_UPDATE"
                      value={new Date(githubData.lastSync).toLocaleString("en-US", {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      }).toUpperCase()}
                    />
                  )}
                </div>
              )}
            </section>
          </div>
          
          {/* Hardware/System Status */}
          <section className="pt-6 sm:pt-8 border-t border-white/5">
             <div className="flex items-center gap-4 text-micro uppercase tracking-[3px] opacity-20 mb-6 font-bold">
               SYSTEM VALIDATION
             </div>
             <div className="flex flex-wrap gap-6">
                <div className="px-6 py-2 border border-white/10 bg-white/5 text-micro uppercase tracking-[4px] opacity-60 flex items-center gap-3">
                   <div className="w-1.5 h-1.5 bg-white shadow-[0_0_10px_white]" />
                   SESSION_VERIFIED_NOMINAL
                </div>
                <div className="px-6 py-2 border border-white/5 text-micro uppercase tracking-[4px] opacity-30 flex items-center gap-3">
                   V6/ENCRYPTION_ACTIVE
                </div>
             </div>
          </section>
        </div>

        {/* Action Controls */}
        <div className="mt-8 sm:mt-12 flex gap-3 sm:gap-4 flex-wrap">
          <Link
            href="/settings"
            className="btn-ghost flex items-center justify-center gap-4 px-8 py-3 text-micro uppercase tracking-[3px] w-full sm:w-auto"
          >
            <Settings size={13} className="opacity-40" />
            PROTOCOL_SETTINGS
          </Link>

          {!githubData?.isConnected && !isLoading && (
            <button
              onClick={handleReconnectGitHub}
              disabled={isReconnecting}
              className="btn-ghost flex items-center justify-center gap-4 px-8 py-3 text-micro uppercase tracking-[3px] w-full sm:w-auto"
            >
              <RefreshCw
                size={13}
                className={cn("opacity-40", isReconnecting && "animate-spin")}
              />
              {isReconnecting ? "ESTABLISHING..." : "INITIALIZE_LINK"}
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
  isStatus = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  isStatus?: boolean;
}) {
  return (
    <div className="flex items-start gap-5 group">
      <div className="mt-1 opacity-20 group-hover:opacity-60 transition-opacity shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-micro uppercase tracking-[3px] opacity-20 font-bold mb-1">{label}</p>
        <p className={cn(
          "text-caption-bold text-sm uppercase tracking-widest break-words",
          isStatus ? "opacity-100" : "opacity-60 group-hover:opacity-80 transition-opacity"
        )}>
          {value}
        </p>
      </div>
    </div>
  );
}
