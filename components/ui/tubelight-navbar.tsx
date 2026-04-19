"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { LucideIcon, Github, User, LogOut, Menu, X } from "lucide-react"
import { signOut } from "next-auth/react"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
  authRequired?: boolean
}

interface NavBarProps {
  items: NavItem[]
  className?: string
}

export function NavBar({ items, className }: NavBarProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const activeTab = items.find((item) => item.url === pathname)?.name ?? items[0]?.name ?? ""

  // Detect scroll to adjust nav appearance
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (!mobileOpen) return

    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = previous
    }
  }, [mobileOpen])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut({ callbackUrl: "/" })
    } catch (error) {
      console.error("Logout error:", error)
      setIsLoggingOut(false)
    }
  }

  const isAuthenticated = status === "authenticated"
  const isLoading = status === "loading"

  return (
    <nav
      className={`nav-overlay ${isScrolled ? "scrolled" : ""} ${className ?? ""}`}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* WORDMARK */}
      <Link
        href="/"
        className="text-nav tracking-[3px] text-sm"
        aria-label="DevInsight — Home"
      >
        DEVINSIGHT
      </Link>

      {/* DESKTOP NAV LINKS */}
      <div className="hidden md:flex items-center gap-7 lg:gap-9">
        {items.map((item) => {
          const isActive = activeTab === item.name
          if (item.authRequired && !isAuthenticated) return null

          return (
            <Link
              key={item.name}
              href={item.url}
              className="text-nav transition-opacity duration-200"
              style={{
                opacity: isActive ? 1 : 0.55,
                borderBottom: isActive ? "1px solid rgba(240,240,250,0.6)" : "none",
                paddingBottom: isActive ? "2px" : "3px",
              }}
              aria-current={isActive ? "page" : undefined}
            >
              {item.name}
            </Link>
          )
        })}
      </div>

      {/* AUTH SECTION — DESKTOP */}
      <div className="hidden md:flex items-center gap-5">
        {isLoading ? (
          <div
            className="skeleton"
            style={{ width: "80px", height: "16px" }}
          />
        ) : isAuthenticated && session?.user ? (
          <>
            <Link
              href="/profile"
              className="flex items-center gap-2.5 transition-opacity duration-200"
              style={{ opacity: 0.7 }}
              title={`Profile — ${session.user.name || session.user.username || 'User'}`}
            >
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  width={24}
                  height={24}
                  className="rounded-full border border-[rgba(240,240,250,0.2)]"
                />
              ) : (
                <User size={16} />
              )}
              <span
                className="text-nav"
                style={{
                  opacity: 0.7,
                  fontSize: "0.75rem",
                  maxWidth: "100px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {session.user.name?.split(" ")[0] || session.user.username || "User"}
              </span>
            </Link>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="transition-opacity duration-200"
              style={{ opacity: 0.55, background: "none", border: "none", cursor: "pointer", color: "var(--spectral-white)" }}
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut size={16} style={{ opacity: isLoggingOut ? 0.3 : 1 }} />
            </button>
          </>
        ) : (
          <Link href="/login" className="btn-ghost btn-ghost-sm">
            <Github size={14} />
            Login
          </Link>
        )}
      </div>

      {/* MOBILE HAMBURGER */}
      <button
        className="md:hidden inline-flex min-h-11 min-w-11 items-center justify-center"
        style={{
          background: "none",
          border: "none",
          color: "var(--spectral-white)",
          cursor: "pointer",
          padding: "10px",
        }}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            top: "var(--nav-height)",
            background: "rgba(0,0,0,0.95)",
            backdropFilter: "blur(8px)",
            zIndex: 200,
            display: "flex",
            flexDirection: "column",
            padding: "24px",
            gap: "24px",
            maxHeight: "calc(100dvh - var(--nav-height))",
            overflowY: "auto",
            overscrollBehavior: "contain",
            borderTop: "1px solid rgba(240,240,250,0.08)",
          }}
          role="dialog"
          aria-label="Mobile navigation menu"
        >
          {items.map((item) => {
            if (item.authRequired && !isAuthenticated) return null
            const isActive = activeTab === item.name
            return (
              <Link
                key={item.name}
                href={item.url}
                onClick={() => { setMobileOpen(false); }}
                className="text-section-head"
                style={{
                    fontSize: "clamp(1.125rem, 5.8vw, 1.5rem)",
                  opacity: isActive ? 1 : 0.4,
                  textDecoration: "none",
                    minHeight: "44px",
                    display: "inline-flex",
                    alignItems: "center",
                }}
              >
                {item.name}
              </Link>
            )
          })}

          <div style={{ marginTop: "auto", paddingTop: "32px", borderTop: "1px solid rgba(240,240,250,0.08)" }}>
            {isAuthenticated && session?.user ? (
              <button
                onClick={handleLogout}
                className="btn-ghost"
                style={{ width: "100%", justifyContent: "center" }}
                disabled={isLoggingOut}
              >
                <LogOut size={16} />
                {isLoggingOut ? "Signing out..." : "Sign Out"}
              </button>
            ) : (
              <Link href="/login" className="btn-ghost" style={{ width: "100%", justifyContent: "center" }}>
                <Github size={16} />
                Login with GitHub
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
