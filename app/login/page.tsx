"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Github, Home, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InlineNotice } from "@/components/ui/inline-notice";
import { Skeleton } from "@/components/ui/skeleton";

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "You denied access to your GitHub account.",
  Verification: "The verification token has expired or has already been used.",
  Default: "An error occurred. Please try again.",
};

function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [isSigningIn, setIsSigningIn] = useState(false);
  const errorMessage = error
    ? ERROR_MESSAGES[error] || ERROR_MESSAGES.Default
    : null;

  const handleGithubLogin = async () => {
    setIsSigningIn(true);

    try {
      await signIn("github", {
        callbackUrl,
        redirect: true,
      });
    } catch (error) {
      console.error("Login error:", error);
      setIsSigningIn(false);
    }
  };

  return (
    <main
      id="main-content"
      className="relative flex min-h-[100svh] flex-col overflow-hidden"
    >
      <Image
        src="/space-hero.png"
        alt=""
        className="object-cover object-center"
        fill
        priority
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-black/55" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-black/45"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.55)_100%)]"
        aria-hidden="true"
      />

      <header className="relative z-10 flex items-center justify-between px-[clamp(20px,5vw,64px)] pb-4 pt-[max(16px,env(safe-area-inset-top))]">
        <div className="inline-flex min-h-11 items-center gap-2.5 text-nav tracking-[0.24em]">
          <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
          DEVINSIGHT
        </div>
        <Link
          href="/"
          className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-pill border border-border bg-surface-hover px-4 text-nav text-text-3 transition-colors duration-150 hover:border-border-strong hover:bg-white/10 hover:text-text"
          aria-label="Back to home"
        >
          <Home className="size-4" aria-hidden="true" />
          Home
        </Link>
      </header>

      <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-[440px] text-center">
          <p className="text-micro text-text-2">
            Developer intelligence platform
          </p>
          <h1 className="mt-5 text-page-title">Sign in to DevInsight</h1>
          <p className="mx-auto mt-4 max-w-[42ch] text-body">
            Analyze your GitHub activity and turn your commits into clear,
            personal insight.
          </p>

          <div className="mt-9">
            {errorMessage ? (
              <InlineNotice variant="error" className="mb-4 text-left">
                {errorMessage}
              </InlineNotice>
            ) : null}

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleGithubLogin}
              loading={isSigningIn}
              loadingText="Redirecting to GitHub…"
              leadingIcon={<Github className="size-4" />}
              aria-label="Continue with GitHub OAuth"
            >
              Continue with GitHub
            </Button>

            <p className="mt-5 inline-flex items-center justify-center gap-2 text-caption">
              <Lock className="size-3.5 text-text-3" aria-hidden="true" />
              Secure authentication via GitHub OAuth
            </p>
          </div>
        </div>
      </div>

      <footer className="relative z-10 px-6 pb-[max(24px,env(safe-area-inset-bottom))]">
        <p className="mx-auto max-w-[400px] text-center text-caption">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </footer>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-[100svh] items-center justify-center bg-black"
          role="status"
          aria-busy="true"
          aria-label="Loading sign in"
        >
          <Skeleton className="h-5 w-48" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
