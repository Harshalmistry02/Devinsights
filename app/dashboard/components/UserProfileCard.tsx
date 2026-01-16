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
      className="lg:col-span-4 xl:col-span-3"
      aria-label="User profile and actions"
    >
      <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl overflow-hidden backdrop-blur-sm sticky top-24">
        {/* Profile Header with Gradient */}
        <div className="h-24 bg-linear-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 relative" aria-hidden="true">
          <div className="absolute inset-0 bg-linear-to-b from-transparent to-slate-900/50" />
        </div>

        {/* Avatar - Overlapping the gradient */}
        <div className="px-4 sm:px-6 -mt-12 relative">
          {user.image ? (
            <Image
              src={user.image}
              alt={`${user.name || user.username || 'User'} GitHub profile picture`}
              width={96}
              height={96}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-slate-900 shadow-xl ring-2 ring-cyan-500/30"
              priority={true}
            />
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-linear-to-br from-cyan-500/30 to-blue-500/30 border-4 border-slate-900 flex items-center justify-center shadow-xl ring-2 ring-cyan-500/30">
              <Github className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-400" />
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="px-4 sm:px-6 pt-3 sm:pt-4 pb-4 sm:pb-6">
          <h2 className="text-lg sm:text-xl font-bold text-slate-200 mb-1">
            {user.name || user.username || "Anonymous User"}
          </h2>
          {user.username && (
            <a
              href={`https://github.com/${user.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 transition-colors inline-flex items-center gap-1.5 text-xs sm:text-sm mb-2 sm:mb-3 group focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 rounded"
              aria-label={`Visit @${user.username} on GitHub (opens in new tab)`}
            >
              <Github className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:rotate-12 transition-transform" aria-hidden="true" />
              <span>@{user.username}</span>
              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
            </a>
          )}
          {user.email && (
            <p
              className="text-slate-400 text-xs sm:text-sm mb-3 sm:mb-4 truncate"
              title={user.email}
            >
              {user.email}
            </p>
          )}

          {/* Status Badge */}
          <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-6">
            <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-green-500/10 border border-green-500/30 rounded-full text-[10px] sm:text-xs text-green-400 flex items-center gap-1 sm:gap-1.5">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse" />
              Authenticated
            </span>
            {analytics?.isActiveToday && (
              <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-orange-500/10 border border-orange-500/30 rounded-full text-[10px] sm:text-xs text-orange-400 flex items-center gap-1 sm:gap-1.5">
                <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                Active Today
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <nav className="space-y-2" aria-label="Quick actions">
            <Link
              href="/profile"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300 text-cyan-400 hover:text-cyan-300 text-sm font-medium group focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 cursor-pointer"
              aria-label="View your full profile"
            >
              <User className="w-4 h-4 group-hover:scale-110 transition-transform" aria-hidden="true" />
              View Full Profile
            </Link>
            <Link
              href="/settings"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800/50 border border-slate-700/30 rounded-lg hover:bg-slate-800/80 hover:border-slate-600/50 transition-all duration-300 text-slate-300 hover:text-slate-200 text-sm font-medium group focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 cursor-pointer"
              aria-label="Manage account settings"
            >
              <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" aria-hidden="true" />
              Settings
            </Link>
          </nav>

          {/* Divider */}
          <div className="border-t border-slate-700/30 my-4" />

          {/* Data Sync Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Data Sync
            </h4>
            <SyncButtonComplete />
            
            {/* Sync Status / Last Synced */}
            {isSyncInProgress ? (
              <p 
                className="text-xs text-cyan-400 text-center flex items-center justify-center gap-1.5"
                role="status"
              >
                <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
                Syncing in progress...
              </p>
            ) : (
              <p className="text-xs text-slate-500 text-center">
                Last synced: {syncDate}
              </p>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
