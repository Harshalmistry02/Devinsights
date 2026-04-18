"use client";

import { Github, Lock, Home, AlertCircle } from "lucide-react";
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
    <div
      className="section-cinematic"
      style={{ justifyContent: "center", alignItems: "center" }}
    >
      {/* Photography background */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/space-hero.png"
        alt="Space background"
        className="section-photo"
      />

      {/* Dark overlay */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          zIndex: 1,
        }}
      />

      {/* Home link — top-left */}
      <Link
        href="/"
        style={{
          position: "absolute",
          top: "20px",
          left: "30px",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          opacity: 0.6,
          transition: "opacity 0.2s ease",
          textDecoration: "none",
        }}
        className="text-nav"
        aria-label="Back to home"
        onMouseOver={(e) => (e.currentTarget.style.opacity = "1")}
        onMouseOut={(e) => (e.currentTarget.style.opacity = "0.6")}
      >
        <Home size={14} />
        Home
      </Link>

      {/* Login Content — centered, text on image, NO card/panel */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "0 24px",
          maxWidth: "420px",
          width: "100%",
        }}
      >
        {/* Label */}
        <p
          className="text-micro"
          style={{ marginBottom: "24px", letterSpacing: "2px" }}
        >
          Developer Intelligence Platform
        </p>

        {/* Headline — text on image */}
        <h1
          className="text-display-hero"
          style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", marginBottom: "16px" }}
        >
          Sign in to DevInsight
        </h1>

        {/* Subtitle */}
        <p
          className="text-body"
          style={{
            opacity: 0.55,
            marginBottom: "48px",
            fontSize: "0.875rem",
          }}
        >
          Analyze your GitHub activity and coding insights
        </p>

        {/* Error Message */}
        {errorMessage && (
          <div
            role="alert"
            aria-live="assertive"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "14px 20px",
              background: "rgba(252,165,165,0.1)",
              border: "1px solid rgba(252,165,165,0.25)",
              borderRadius: "var(--radius-button)",
              marginBottom: "24px",
              width: "100%",
            }}
          >
            <AlertCircle size={16} style={{ color: "rgba(252,165,165,0.8)", flexShrink: 0 }} />
            <span
              className="text-caption"
              style={{ color: "rgba(252,165,165,0.8)", textAlign: "left" }}
            >
              {errorMessage}
            </span>
          </div>
        )}

        {/* GitHub Login — Ghost Button */}
        <button
          onClick={handleGithubLogin}
          className="btn-ghost"
          style={{ width: "100%", justifyContent: "center", marginBottom: "32px" }}
          aria-label="Continue with GitHub OAuth"
        >
          <Github size={16} />
          Continue with GitHub
        </button>

        {/* Trust indicator */}
        <p
          className="text-micro"
          style={{ display: "flex", alignItems: "center", gap: "8px", opacity: 0.35 }}
        >
          <Lock size={10} />
          Secure authentication via GitHub OAuth
        </p>

        {/* Footer */}
        <p
          className="text-micro"
          style={{ marginTop: "48px", opacity: 0.25, maxWidth: "300px" }}
        >
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            background: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="skeleton"
            style={{ width: "200px", height: "20px" }}
          />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
