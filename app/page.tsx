"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  return (
    <main
      className="relative w-full overflow-hidden"
      style={{ height: "100vh" }}
    >
      <section
        className="relative w-full h-full flex flex-col justify-end"
        aria-label="Hero: DevInsight analytics platform"
      >
        {/* Photography layer */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/space-hero.png"
          alt="Earth from low orbit — the void of space"
          className="section-photo"
        />

        {/* Dark gradient overlay for legibility */}
        <div className="section-overlay" aria-hidden="true" />

        {/* Content Container */}
        <div className="relative z-20 w-full px-[clamp(24px,6vw,80px)] pb-[8vh] flex flex-col justify-between h-full pt-[20vh]">
          {/* Top Block: Hero Headline & CTA */}
          <div>
            {/* Mission label */}
            <p
              className="text-micro"
              style={{ marginBottom: "20px", letterSpacing: "1.5px" }}
            >
              Developer Intelligence Platform
            </p>

            {/* Hero headline */}
            <h1 className="text-display-hero" style={{ marginBottom: "24px", maxWidth: "640px" }}>
              Understand your code.{" "}
              <br />
              Grow as a developer.
            </h1>

            {/* Body text */}
            <p
              className="text-body text-dim"
              style={{ marginBottom: "36px", maxWidth: "480px" }}
            >
              AI-powered insights into your GitHub activity,
              productivity, and coding patterns.
            </p>

            {/* CTA */}
            {isAuthenticated ? (
              <Link href="/dashboard" className="btn-ghost" aria-label="Go to your dashboard">
                View Dashboard
              </Link>
            ) : (
              <Link href="/login" className="btn-ghost" aria-label="Sign in to DevInsight">
                Get Started
              </Link>
            )}
          </div>

          {/* Bottom Block: Three Capabilities */}
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-[60px] w-full"
            style={{ marginTop: "auto" }}
          >
            <div>
              <p className="text-micro" style={{ marginBottom: "12px" }}>Analytics</p>
              <h2 className="text-section-head" style={{ fontSize: "1.25rem", marginBottom: "12px" }}>
                Commit Intelligence
              </h2>
              <p className="text-body text-dim" style={{ fontSize: "0.875rem" }}>
                Track every commit, repository, and coding session. Surface patterns you never knew existed.
              </p>
            </div>
            <div>
              <p className="text-micro" style={{ marginBottom: "12px" }}>AI Insights</p>
              <h2 className="text-section-head" style={{ fontSize: "1.25rem", marginBottom: "12px" }}>
                Developer Persona
              </h2>
              <p className="text-body text-dim" style={{ fontSize: "0.875rem" }}>
                AI detects your coding archetype — Night Owl, Weekday Warrior, Sprint Specialist — based on real activity.
              </p>
            </div>
            <div>
              <p className="text-micro" style={{ marginBottom: "12px" }}>Productivity</p>
              <h2 className="text-section-head" style={{ fontSize: "1.25rem", marginBottom: "12px" }}>
                Streak & Growth
              </h2>
              <p className="text-body text-dim" style={{ fontSize: "0.875rem" }}>
                Monitor your coding streak, measure week-over-week progress, and hit personal milestones.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

