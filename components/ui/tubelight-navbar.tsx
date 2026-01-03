"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { LucideIcon, Github } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  className?: string
}

export function NavBar({ items, className }: NavBarProps) {
  const [activeTab, setActiveTab] = useState(items[0].name)

  useEffect(() => {
    const handleResize = () => {
      // Handle responsive behavior
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div
      className={cn(
        "fixed bottom-0 sm:top-0 left-1/2 -translate-x-1/2 z-50 mb-6 sm:pt-6",
        className,
      )}
    >
      <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-700/30 backdrop-blur-xl py-1.5 px-2 rounded-full shadow-2xl shadow-cyan-500/10">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name

          return (
            <Link
              key={item.name}
              href={item.url}
              onClick={() => setActiveTab(item.name)}
              className={cn(
                "relative cursor-pointer text-sm font-semibold px-6 py-2.5 rounded-full transition-all duration-300",
                "text-slate-400 hover:text-slate-200",
                isActive && "text-slate-100",
              )}
            >
              <span className="hidden md:inline relative z-10">{item.name}</span>
              <span className="md:hidden relative z-10">
                <Icon size={18} strokeWidth={2.5} />
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full -z-0 border border-cyan-500/30"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-cyan-400 rounded-t-full shadow-[0_0_15px_rgba(34,211,238,0.6)]">
                    <div className="absolute w-12 h-6 bg-cyan-400/30 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-cyan-400/30 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-cyan-300/40 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </Link>
          )
        })}
        
        {/* GitHub Login Button */}
        <div className="w-px h-8 bg-slate-700/50 mx-1" />
        <Link
          href="/login"
          className={cn(
            "relative cursor-pointer text-sm font-semibold px-6 py-2.5 rounded-full transition-all duration-300",
            "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50",
            "flex items-center gap-2"
          )}
        >
          <Github size={18} strokeWidth={2.5} />
          <span className="hidden md:inline">Login</span>
        </Link>
      </div>
    </div>
  )
}
