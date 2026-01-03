"use client";
import Prism from "@/components/ui/Prism";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowRight, BarChart3 } from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 w-full">
      <div className="absolute inset-0 z-0" style={{ height: '100vh' }}>
        <Prism
          animationType="rotate"
          timeScale={0.5}
          height={3.5}
          baseWidth={5.5}
          scale={3.6}
          hueShift={0}
          colorFrequency={1}
          noise={0.5}
          glow={1}
        />
      </div>
      
      <div className="relative z-10 flex flex-col items-center px-5 max-w-4xl mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="mt-8 bg-linear-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl"
        >
          Understand your code. <br /> Grow as a developer.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.5,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="mt-6 text-center text-base text-slate-400 md:text-xl max-w-2xl"
        >
          AI-powered insights into your GitHub activity, productivity, and coding patterns.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.7,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4"
        >
          {isLoading ? (
            <div className="h-12 w-48 bg-slate-800/50 rounded-lg animate-pulse" />
          ) : isAuthenticated ? (
            <Link
              href="/dashboard"
              className="group relative px-8 py-3 bg-linear-to-r from-cyan-500 to-blue-500 rounded-lg font-semibold text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              <BarChart3 className="w-5 h-5" />
              Go to Dashboard
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <Link
              href="/login"
              className="group relative px-8 py-3 bg-linear-to-r from-cyan-500 to-blue-500 rounded-lg font-semibold text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
          
          <Link
            href="#features"
            className="px-8 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg font-semibold text-slate-300 hover:bg-slate-800/80 hover:border-slate-600/50 transition-all duration-300"
          >
            Learn More
          </Link>
        </motion.div>

        {/* User Welcome Message */}
        {isAuthenticated && session?.user && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="mt-6 text-slate-400 text-sm"
          >
            Welcome back, <span className="text-cyan-400 font-semibold">{session.user.name?.split(' ')[0] || session.user.username}</span>! 👋
          </motion.p>
        )}
      </div>
    </div>
  );
}
