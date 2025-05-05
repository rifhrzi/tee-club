import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Paths that require authentication
const PROTECTED_PATHS = ["/profile", "/orders"]; // Removed '/checkout' to allow guest checkout

// Paths that should redirect to dashboard if already authenticated
const AUTH_PATHS = ["/login", "/register"];

// Add paths that require admin access
const ADMIN_PATHS = ["/dashboard"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is protected
  const isProtectedPath = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  const isAuthPath = AUTH_PATHS.some((path) => pathname.startsWith(path));
  const isAdminPath = ADMIN_PATHS.some((path) => pathname.startsWith(path));

  // Check if user is authenticated using the simple auth cookie
  const simpleAuthCookie = request.cookies.get("simple-auth-storage")?.value;
  let isAuthenticated = false;
  let userRole = null;

  if (simpleAuthCookie) {
    try {
      const parsedStorage = JSON.parse(simpleAuthCookie);
      const state = parsedStorage.state || {};
      isAuthenticated = !!state.isAuthenticated;
      userRole = state.user?.role || null;
    } catch (error) {
      console.error("Error parsing simple auth storage:", error);
    }
  }

  userRole = userRole || "USER"; // Fallback to USER if userRole is undefined

  console.log("Middleware: Checking authentication state");
  console.log("Middleware: simple-auth-storage cookie:", simpleAuthCookie);
  console.log("Middleware: isAuthenticated:", isAuthenticated);
  console.log("Middleware: userRole:", userRole);

  // If it's a protected path and user is not authenticated, redirect to login
  if (isProtectedPath && !isAuthenticated) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // If it's an auth path and user is authenticated, redirect to home
  if (isAuthPath && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If it's an admin path and the user is not an admin, redirect to login
  if (isAdminPath && userRole !== "ADMIN") {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (they handle their own auth)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
};
