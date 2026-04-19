import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { NextRequest } from "next/server";

/**
 * Middleware for route protection
 * Protects all routes except public ones
 */

// Public routes that don't require authentication
const publicRoutes = ["/login", "/api/auth"];

// Routes that require authentication
const protectedRoutes = ["/dashboard", "/profile", "/settings", "/insights"];

export default auth((req: NextRequest & { auth: any }) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isPublicRoute =
    publicRoutes.some((route) => nextUrl.pathname.startsWith(route)) ||
    nextUrl.pathname === "/";

  const isProtectedRoute = protectedRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  // Redirect to login if accessing protected route without authentication
  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if logged in and trying to access login page
  if (nextUrl.pathname === "/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

/**
 * Middleware configuration
 * Specify which routes should be processed by middleware
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
