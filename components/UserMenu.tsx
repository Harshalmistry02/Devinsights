"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";
import { User, Loader2 } from "lucide-react";

/**
 * User Menu Component
 * Displays user info and logout button
 * Shows loading state while session is being fetched
 */
export function UserMenu() {
  const { data: session, status } = useSession({
    refetchInterval: 0,
    refetchOnWindowFocus: false,
  });

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900/50 border border-slate-700/30">
        <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
        <span className="text-sm text-slate-400">Loading...</span>
      </div>
    );
  }

  if (!session) {
    return (
      <Link
        href="/login"
        className="px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all duration-300"
      >
        <span className="text-sm text-cyan-400 font-semibold">Sign in</span>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* User Info */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-700/30">
        {session.user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.user.image}
            alt={session.user.name || "User"}
            className="w-6 h-6 rounded-full border border-cyan-500/30"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
            <User className="w-3 h-3 text-cyan-400" />
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-sm text-slate-300 font-medium leading-none">
            {session.user.name || session.user.username}
          </span>
          {session.user.username && (
            <span className="text-xs text-slate-500 leading-none mt-0.5">
              @{session.user.username}
            </span>
          )}
        </div>
      </div>

      {/* Logout Button */}
      <LogoutButton variant="icon" />
    </div>
  );
}
