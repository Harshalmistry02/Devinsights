"use client";

import { motion } from "framer-motion";
import { Github, Lock, Shield, Home, AlertCircle } from "lucide-react";
import Prism from "@/components/ui/Prism";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const handleGithubLogin = async () => {
    try {
      await signIn("github", {
        callbackUrl,
        redirect: true,
      });
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const errorMessages: Record<string, string> = {
    Configuration: "There is a problem with the server configuration.",
    AccessDenied: "You denied access to your GitHub account.",
    Verification: "The verification token has expired or has already been used.",
    Default: "An error occurred. Please try again.",
  };

  const errorMessage = error ? errorMessages[error] || errorMessages.Default : null;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 w-full">
      {/* Animated Background */}
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

      {/* Home Button */}
      <Link href="/">
        <motion.button
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="absolute top-6 left-6 z-20 p-2 rounded-lg bg-slate-950/40 border border-slate-700/30 backdrop-blur-sm hover:bg-slate-950/60 hover:border-cyan-500/50 transition-all duration-300 group"
        >
          <Home className="w-5 h-5 text-slate-300 group-hover:text-cyan-400 transition-colors duration-300" />
        </motion.button>
      </Link>

      {/* Login Card */}
      <div className="relative z-10 flex flex-col items-center px-4 max-w-sm mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.2,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="w-full bg-slate-950/60 border border-slate-700/30 backdrop-blur-xl rounded-2xl shadow-2xl shadow-cyan-500/10 p-6 sm:p-8"
        >
          {/* Lock Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.4,
              duration: 0.5,
              type: "spring",
              stiffness: 200,
            }}
            className="flex justify-center mb-4"
          >
            <div className="p-3 bg-linear-to-br from-cyan-500/20 to-blue-500/20 rounded-full border border-cyan-500/30">
              <Shield className="w-6 h-6 text-cyan-400" strokeWidth={2} />
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.5,
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="text-2xl sm:text-3xl font-bold text-center bg-linear-to-br from-slate-300 to-slate-500 bg-clip-text text-transparent mb-2"
          >
            Sign in to DevInsight
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.6,
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="text-center text-slate-400 mb-6 text-xs sm:text-sm"
          >
            Analyze your GitHub activity and coding insights
          </motion.p>

          {/* Error Message */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span className="text-sm text-red-400">{errorMessage}</span>
            </motion.div>
          )}

          {/* GitHub Login Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.7,
              duration: 0.8,
              ease: "easeInOut",
            }}
            onClick={handleGithubLogin}
            className="w-full relative group"
          >
          {/* Button Glow Effect */}
            <div className="absolute -inset-0.5 bg-linear-to-r from-cyan-500 to-blue-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            
            {/* Button Content */}
            <div className="relative flex items-center justify-center gap-2 px-5 py-3 bg-slate-950 border border-cyan-500/30 rounded-xl transition-all duration-300 group-hover:bg-slate-900 group-hover:border-cyan-500/50">
              <Github className="w-4 h-4 text-slate-300 group-hover:text-cyan-400 transition-colors duration-300" strokeWidth={2.5} />
              <span className="text-sm sm:text-base font-semibold text-slate-300 group-hover:text-cyan-400 transition-colors duration-300">
                Continue with GitHub
              </span>
            </div>
          </motion.button>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              delay: 0.9,
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="mt-5 pt-4 border-t border-slate-700/30"
          >
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <Lock className="w-3 h-3" />
              <span>Secure authentication via GitHub OAuth</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Footer Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: 1,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="mt-4 text-center text-xs text-slate-500"
        >
          By signing in, you agree to our Terms of Service and Privacy Policy
        </motion.p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <LoginForm />
    </Suspense>
  );
}
