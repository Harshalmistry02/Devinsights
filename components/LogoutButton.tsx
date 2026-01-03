"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { useState } from "react";

/**
 * Logout Button Component
 * Handles user sign out with loading state
 */
interface LogoutButtonProps {
  className?: string;
  variant?: "default" | "icon" | "minimal";
  redirectTo?: string;
}

export function LogoutButton({
  className = "",
  variant = "default",
  redirectTo = "/",
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut({
        callbackUrl: redirectTo,
        redirect: true,
      });
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoading(false);
    }
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className={`p-2 rounded-lg bg-slate-900/50 border border-slate-700/30 hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        aria-label="Sign out"
      >
        <LogOut
          className={`w-5 h-5 text-slate-400 hover:text-red-400 transition-colors ${
            isLoading ? "animate-pulse" : ""
          }`}
        />
      </button>
    );
  }

  if (variant === "minimal") {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className={`flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        <LogOut className="w-4 h-4" />
        <span className="text-sm">{isLoading ? "Signing out..." : "Sign out"}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900/50 border border-slate-700/30 hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <LogOut className="w-4 h-4 text-slate-400" />
      <span className="text-sm text-slate-300">
        {isLoading ? "Signing out..." : "Sign out"}
      </span>
    </button>
  );
}
