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
const protectedRoutes = ["/dashboard", "/profile", "/settings"];

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
    return NextResponse.redirect(new URL("/login", nextUrl));
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
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - API routes that don't need protection
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
  runtime: "experimental-edge",
};
