"use client";
import Prism from "@/components/ui/Prism";
import { motion } from "framer-motion";
// import MagicBento from "@/components/MagicBento";

export default function Home() {
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
          className="mt-8 bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl"
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
      </div>
    </div>
  );
}
