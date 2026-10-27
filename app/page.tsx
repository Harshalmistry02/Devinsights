"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  ArrowUpRight,
  BarChart3,
  Flame,
  Github,
  RefreshCw,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";

const CAPABILITIES = [
  {
    label: "Analytics",
    title: "Commit intelligence",
    description:
      "Track commits, repositories and the rhythm of your coding sessions.",
    icon: BarChart3,
  },
  {
    label: "AI insights",
    title: "Developer persona",
    description:
      "See the working style your activity reveals, from night owl to sprint specialist.",
    icon: Sparkles,
  },
  {
    label: "Productivity",
    title: "Streak and growth",
    description:
      "Follow your streak and the week-over-week momentum behind your progress.",
    icon: Flame,
  },
] as const;

const STEPS = [
  {
    title: "Connect GitHub",
    description:
      "Sign in with GitHub OAuth to link your account. No separate password needed.",
    icon: Github,
  },
  {
    title: "Sync your activity",
    description:
      "Pull in repositories, commits and languages whenever you choose.",
    icon: RefreshCw,
  },
  {
    title: "Read the signal",
    description:
      "Explore your dashboard and insights to see how you work over time.",
    icon: TrendingUp,
  },
] as const;

export default function Home() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const primaryHref = isAuthenticated ? "/dashboard" : "/login";
  const primaryLabel = isAuthenticated ? "View dashboard" : "Get started";

  return (
    <main id="main-content">
      <section
        className="relative flex min-h-[100svh] flex-col overflow-hidden"
        aria-label="Hero: DevInsight analytics platform"
      >
        <Image
          src="/space-hero.png"
          alt=""
          className="object-cover object-center"
          fill
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/35" aria-hidden="true" />
        <div
          className="absolute inset-0 bg-linear-to-r from-black via-black/55 to-transparent"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-linear-to-t from-black via-transparent to-black/40"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto flex w-full max-w-[var(--container)] flex-1 flex-col px-[clamp(20px,5vw,64px)] pb-6 pt-[calc(var(--nav-height)+32px)] sm:pb-8">
          <div className="flex flex-1 flex-col justify-center py-8 sm:py-10">
            <p className="flex items-center gap-3 text-micro text-text-2">
              <span className="h-px w-8 bg-accent" aria-hidden="true" />
              Developer intelligence platform
            </p>

            <h1 className="mt-6 max-w-[640px] text-display-hero">
              Understand your code.
              <br />
              <span className="text-text-2">Grow as a developer.</span>
            </h1>

            <p className="mt-6 max-w-[48ch] text-body">
              AI-powered insights into your GitHub activity, productivity and
              coding patterns.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <ButtonLink
                href={primaryHref}
                variant="primary"
                size="lg"
                leadingIcon={<ArrowUpRight className="size-4" />}
                aria-label={
                  isAuthenticated
                    ? "View your dashboard"
                    : "Get started with DevInsight"
                }
              >
                {primaryLabel}
              </ButtonLink>
              {isAuthenticated ? (
                <ButtonLink href="/insights" variant="secondary" size="lg">
                  Explore insights
                </ButtonLink>
              ) : (
                <p className="text-caption">Built from your GitHub activity.</p>
              )}
            </div>
          </div>

          <ul className="mt-8 grid list-none gap-x-8 gap-y-8 border-t border-border-subtle pt-6 md:grid-cols-3">
            {CAPABILITIES.map((capability, index) => {
              const Icon = capability.icon;

              return (
                <li key={capability.title} className="min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-micro text-text-3">
                      <span className="font-mono">0{index + 1}</span>
                      <span
                        className="h-px w-5 bg-border-strong"
                        aria-hidden="true"
                      />
                      {capability.label}
                    </div>
                    <Icon
                      className="size-4 shrink-0 text-accent"
                      aria-hidden="true"
                    />
                  </div>
                  <h2 className="mt-3 text-section-head text-[clamp(1.05rem,1.4vw,1.25rem)]">
                    {capability.title}
                  </h2>
                  <p className="mt-2 max-w-[40ch] text-[13px] leading-relaxed text-text-2">
                    {capability.description}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section
        className="relative overflow-hidden border-t border-border-subtle bg-black"
        aria-labelledby="how-it-works-title"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(108,180,255,0.07),transparent_55%)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto w-full max-w-[var(--container)] px-[clamp(20px,5vw,64px)] py-20 sm:py-28">
          <div className="max-w-[620px]">
            <p className="text-micro text-text-3">How it works</p>
            <h2 id="how-it-works-title" className="mt-3 text-page-title">
              From sign-in to signal.
            </h2>
            <p className="mt-4 max-w-[52ch] text-body">
              Three steps take you from your GitHub account to a clear view of
              your development patterns.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            {STEPS.map((step, index) => {
              const Icon = step.icon;

              return (
                <Card key={step.title} className="flex h-full flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <IconTile size="lg">
                      <Icon className="size-5" />
                    </IconTile>
                    <span className="font-mono text-xs tabular-nums text-text-3">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 text-card-title">{step.title}</h3>
                  <p className="mt-2 text-body">{step.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section
        className="relative overflow-hidden border-t border-border-subtle bg-black"
        aria-labelledby="home-cta-title"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(108,180,255,0.08),transparent_58%)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto w-full max-w-[860px] px-[clamp(20px,5vw,64px)] py-20 text-center sm:py-28">
          <p className="text-micro text-accent">Get started</p>
          <h2 id="home-cta-title" className="mt-4 text-page-title">
            A clearer view of how you work.
          </h2>
          <p className="mx-auto mt-4 max-w-[52ch] text-body">
            Connect your GitHub account and explore the patterns behind your
            commits, languages and streaks.
          </p>
          <div className="mt-8 flex justify-center">
            <ButtonLink
              href={primaryHref}
              variant="primary"
              size="lg"
              leadingIcon={<ArrowUpRight className="size-4" />}
            >
              {primaryLabel}
            </ButtonLink>
          </div>
        </div>
      </section>
    </main>
  );
}
