"use client"

import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import {
  LucideIcon,
  ChevronDown,
  Github,
  Loader2,
  LogOut,
  Menu,
  Settings,
  User,
  X,
} from "lucide-react"
import { cn } from "./cn"

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

function isActivePath(pathname: string, url: string) {
  if (url === "/") return pathname === "/"
  return pathname === url || pathname.startsWith(`${url}/`)
}

export function NavBar({ items, className }: NavBarProps) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const mobileTriggerRef = useRef<HTMLButtonElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30)
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (!mobileOpen) return

    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const focusFrame = requestAnimationFrame(() => {
      mobileMenuRef.current
        ?.querySelector<HTMLElement>('a[href], button:not([disabled])')
        ?.focus()
    })

    const menuItems = () =>
      Array.from(
        mobileMenuRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])'
        ) ?? []
      )

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        setMobileOpen(false)
        mobileTriggerRef.current?.focus()
        return
      }

      if (event.key !== "Tab") return

      const items = menuItems()
      if (items.length === 0) return

      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement

      // Keep focus inside the open menu and its close trigger.
      if (active === mobileTriggerRef.current) {
        event.preventDefault()
        const target = event.shiftKey ? last : first
        target.focus()
      } else if (event.shiftKey && active === first) {
        event.preventDefault()
        mobileTriggerRef.current?.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        mobileTriggerRef.current?.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      cancelAnimationFrame(focusFrame)
      document.body.style.overflow = previous
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [mobileOpen])

  const isAuthenticated = status === "authenticated"
  const isLoading = status === "loading"

  return (
    <nav
      className={cn("nav-overlay", isScrolled && "scrolled", className)}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Wordmark */}
      <Link
        href="/"
        className="focus-ring inline-flex min-h-11 items-center gap-2.5 rounded-sm text-nav tracking-[0.24em]"
        aria-label="DevInsight — Home"
      >
        <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
        DEVINSIGHT
      </Link>

      {/* Desktop links */}
      <div className="hidden items-center gap-7 md:flex lg:gap-9">
        {items.map((item) => {
          if (item.authRequired && !isAuthenticated) return null
          const active = isActivePath(pathname, item.url)

          return (
            <Link
              key={item.name}
              href={item.url}
              className={cn(
                "focus-ring relative inline-flex min-h-11 items-center rounded-sm text-nav transition-colors duration-150",
                active ? "text-text" : "text-text-3 hover:text-text"
              )}
              aria-current={active ? "page" : undefined}
            >
              {item.name}
              {active ? (
                <span
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-accent"
                  aria-hidden="true"
                />
              ) : null}
            </Link>
          )
        })}
      </div>

      {/* Desktop auth */}
      <div className="hidden items-center gap-4 md:flex">
        {isLoading ? (
          <div className="skeleton h-9 w-28 rounded-pill" aria-hidden="true" />
        ) : isAuthenticated && session?.user ? (
          <UserMenu
            pathname={pathname}
            name={session.user.name}
            username={session.user.username}
            email={session.user.email}
            image={session.user.image}
          />
        ) : (
          <Link
            href="/login"
            className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-pill border border-border bg-surface-hover px-4 text-nav transition-colors hover:border-border-strong hover:bg-white/10"
          >
            <Github className="size-4" aria-hidden="true" />
            Login
          </Link>
        )}
      </div>

      {/* Mobile trigger */}
      <button
        ref={mobileTriggerRef}
        className="focus-ring inline-flex size-11 items-center justify-center rounded-pill text-text-2 transition-colors hover:bg-surface-hover hover:text-text md:hidden"
        onClick={() => setMobileOpen((open) => !open)}
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        aria-expanded={mobileOpen}
        aria-controls="mobile-navigation"
      >
        {mobileOpen ? (
          <X className="size-5" aria-hidden="true" />
        ) : (
          <Menu className="size-5" aria-hidden="true" />
        )}
      </button>

      {/* Mobile menu */}
      {mobileOpen ? (
        <div
          id="mobile-navigation"
          ref={mobileMenuRef}
          className="fixed inset-x-0 bottom-0 top-[var(--nav-height)] z-40 flex flex-col overflow-y-auto overscroll-contain border-t border-border-subtle bg-black/95 px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-6 backdrop-blur-xl"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
        >
          <div className="flex flex-col gap-1">
            {items.map((item) => {
              if (item.authRequired && !isAuthenticated) return null
              const active = isActivePath(pathname, item.url)
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  href={item.url}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "focus-ring flex min-h-14 items-center gap-3 rounded-card border-l-2 px-4 text-section-head transition-colors",
                    active
                      ? "border-accent bg-accent-soft text-text"
                      : "border-transparent text-text-3 hover:bg-surface-hover hover:text-text"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="size-5" aria-hidden="true" />
                  {item.name}
                </Link>
              )
            })}
          </div>

          <div className="mt-auto border-t border-border-subtle pt-5">
            {isAuthenticated && session?.user ? (
              <div className="space-y-2">
                <div className="mb-4 flex items-center gap-3 px-1">
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt=""
                      width={36}
                      height={36}
                      className="size-9 rounded-full border border-border"
                    />
                  ) : (
                    <span className="flex size-9 items-center justify-center rounded-full border border-border bg-surface-hover">
                      <User className="size-4" aria-hidden="true" />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text">
                      {session.user.name || session.user.username || "User"}
                    </p>
                    {session.user.email ? (
                      <p className="truncate text-caption">
                        {session.user.email}
                      </p>
                    ) : null}
                  </div>
                </div>

                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "focus-ring flex min-h-12 items-center gap-3 rounded-card px-4 text-sm transition-colors hover:bg-surface-hover hover:text-text",
                    pathname === "/profile"
                      ? "bg-accent-soft text-text"
                      : "text-text-2"
                  )}
                  aria-current={pathname === "/profile" ? "page" : undefined}
                >
                  <User className="size-4" aria-hidden="true" />
                  Profile
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "focus-ring flex min-h-12 items-center gap-3 rounded-card px-4 text-sm transition-colors hover:bg-surface-hover hover:text-text",
                    pathname === "/settings"
                      ? "bg-accent-soft text-text"
                      : "text-text-2"
                  )}
                  aria-current={pathname === "/settings" ? "page" : undefined}
                >
                  <Settings className="size-4" aria-hidden="true" />
                  Settings
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false)
                    void signOut({ callbackUrl: "/" })
                  }}
                  className="focus-ring flex min-h-12 w-full items-center gap-3 rounded-card px-4 text-sm text-text-2 transition-colors hover:bg-danger-soft hover:text-danger"
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="focus-ring flex min-h-12 w-full items-center justify-center gap-2 rounded-pill border border-border bg-surface-hover px-4 text-nav transition-colors hover:border-border-strong hover:bg-white/10"
              >
                <Github className="size-4" aria-hidden="true" />
                Login with GitHub
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </nav>
  )
}

interface UserMenuProps {
  pathname: string
  name?: string | null
  username?: string | null
  email?: string | null
  image?: string | null
}

function UserMenu({ pathname, name, username, email, image }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const displayName = name?.split(" ")[0] || username || "User"

  useEffect(() => {
    if (!open) return

    const menu = menuRef.current
    const getItems = () =>
      Array.from(
        menu?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]):not([aria-disabled="true"])'
        ) ?? []
      )

    getItems()[0]?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        setOpen(false)
        triggerRef.current?.focus()
        return
      }

      if (event.key !== "Tab") return
      const focusable = getItems()
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement

      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (
        !menuRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("pointerdown", handlePointerDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("pointerdown", handlePointerDown)
    }
  }, [open])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    setOpen(false)
    try {
      await signOut({ callbackUrl: "/" })
    } catch (error) {
      console.error("Logout error:", error)
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "focus-ring flex min-h-11 items-center gap-2.5 rounded-pill border border-transparent px-2.5 pr-3 transition-colors hover:border-border hover:bg-surface-hover",
          open && "border-border bg-surface-hover"
        )}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="account-menu"
        aria-label={`${displayName} account menu`}
      >
        {image ? (
          <Image
            src={image}
            alt=""
            width={28}
            height={28}
            className="size-7 rounded-full border border-border"
          />
        ) : (
          <span className="flex size-7 items-center justify-center rounded-full border border-border bg-surface-hover">
            <User className="size-3.5" aria-hidden="true" />
          </span>
        )}
        <span className="max-w-[100px] truncate text-nav text-text-2">
          {displayName}
        </span>
        <ChevronDown
          className={cn(
            "size-3.5 text-text-3 transition-transform duration-150",
            open && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div
          id="account-menu"
          ref={menuRef}
          role="menu"
          aria-label="Account menu"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-60 overflow-hidden rounded-panel border border-border bg-surface-2 p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl"
        >
          <div className="border-b border-border-subtle px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-text">
              {name || username || "User"}
            </p>
            {email ? <p className="mt-0.5 truncate text-caption">{email}</p> : null}
          </div>

          <div className="py-1">
            <Link
              href="/profile"
              role="menuitem"
              onClick={() => setOpen(false)}
              aria-current={pathname === "/profile" ? "page" : undefined}
              className={cn(
                "focus-ring flex min-h-10 items-center gap-2.5 rounded-card px-3 text-sm transition-colors hover:bg-surface-hover hover:text-text",
                pathname === "/profile"
                  ? "bg-accent-soft text-text"
                  : "text-text-2"
              )}
            >
              <User className="size-4" aria-hidden="true" />
              Profile
            </Link>
            <Link
              href="/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              aria-current={pathname === "/settings" ? "page" : undefined}
              className={cn(
                "focus-ring flex min-h-10 items-center gap-2.5 rounded-card px-3 text-sm transition-colors hover:bg-surface-hover hover:text-text",
                pathname === "/settings"
                  ? "bg-accent-soft text-text"
                  : "text-text-2"
              )}
            >
              <Settings className="size-4" aria-hidden="true" />
              Settings
            </Link>
          </div>

          <div className="border-t border-border-subtle pt-1">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="focus-ring flex min-h-10 w-full items-center gap-2.5 rounded-card px-3 text-left text-sm text-text-2 transition-colors hover:bg-danger-soft hover:text-danger disabled:text-text-disabled"
            >
              {isLoggingOut ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <LogOut className="size-4" aria-hidden="true" />
              )}
              {isLoggingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
