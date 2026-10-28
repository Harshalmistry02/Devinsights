"use client";

import { signOut } from "next-auth/react";
import { Loader2, LogOut } from "lucide-react";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";

/**
 * Sign-out control used by Profile and Settings.
 * Behaviour is unchanged; the presentation now uses the shared button system.
 */
interface LogoutButtonProps {
  className?: string;
  variant?: "default" | "icon" | "minimal";
  redirectTo?: string;
}

export function LogoutButton({
  className,
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
        type="button"
        onClick={handleLogout}
        disabled={isLoading}
        className={cn(
          buttonVariants({ variant: "ghost", size: "md" }),
          "size-11 px-0 disabled:opacity-100",
          className
        )}
        aria-label="Sign out"
      >
        {isLoading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <LogOut className="size-4" aria-hidden="true" />
        )}
      </button>
    );
  }

  return (
    <Button
      variant={variant === "minimal" ? "ghost" : "secondary"}
      size="sm"
      onClick={handleLogout}
      loading={isLoading}
      loadingText="Signing out…"
      leadingIcon={<LogOut className="size-3.5" aria-hidden="true" />}
      className={cn("disabled:opacity-100", className)}
    >
      Sign out
    </Button>
  );
}
