"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { useState } from "react";

/**
 * Logout Button Component — SpaceX ghost button style
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
      await signOut({ callbackUrl: redirectTo, redirect: true });
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
        style={{
          background: "none",
          border: "none",
          color: "var(--spectral-white)",
          opacity: isLoading ? 0.3 : 0.45,
          cursor: isLoading ? "not-allowed" : "pointer",
          padding: "6px",
          display: "flex",
          alignItems: "center",
          transition: "opacity 0.2s ease",
        }}
        className={className}
        aria-label="Sign out"
        
        
      >
        <LogOut size={18} />
      </button>
    );
  }

  if (variant === "minimal") {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className={`btn-ghost btn-ghost-sm ${className}`}
        style={{ opacity: isLoading ? 0.5 : 1 }}
        aria-label="Sign out"
      >
        <LogOut size={13} />
        {isLoading ? "Signing out..." : "Sign out"}
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`btn-ghost btn-ghost-sm ${className}`}
      style={{ opacity: isLoading ? 0.5 : 1 }}
      aria-label="Sign out of your account"
    >
      <LogOut size={13} />
      {isLoading ? "Signing out..." : "Sign out"}
    </button>
  );
}
