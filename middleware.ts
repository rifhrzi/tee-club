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

  // Check if user is authenticated using multiple possible auth methods
  let isAuthenticated = false;
  let userRole = null;

  // Method 1: Check for auth-storage cookie (Zustand persist)
  // Try multiple possible cookie names and formats
  const authCookie = request.cookies.get("auth-storage")?.value;
  const authStorageCookie = request.cookies.get("auth_storage")?.value;
  const simpleAuthCookie = request.cookies.get("simple-auth-storage")?.value;

  // Method 2: Check for direct auth cookies
  const authTokenCookie = request.cookies.get("auth_token")?.value;
  const authUserCookie = request.cookies.get("auth_user")?.value;
  const debugTokenCookie = request.cookies.get("debug-token")?.value;

  // Method 3: Check for next-auth.session-token cookie
  const nextAuthCookie = request.cookies.get("next-auth.session-token")?.value;

  // Method 4: Check for JWT token in Authorization header
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

  // Method 5: Check for token in URL query parameter (for debugging)
  const url = new URL(request.url);
  const queryToken = url.searchParams.get("token");

  console.log("Middleware: Auth methods available:", {
    hasAuthCookie: !!authCookie,
    hasAuthStorageCookie: !!authStorageCookie,
    hasSimpleAuthCookie: !!simpleAuthCookie,
    hasAuthTokenCookie: !!authTokenCookie,
    hasAuthUserCookie: !!authUserCookie,
    hasDebugTokenCookie: !!debugTokenCookie,
    hasNextAuthCookie: !!nextAuthCookie,
    hasAuthHeader: !!authHeader,
    hasQueryToken: !!queryToken
  });

  // Try method 1: Zustand auth-storage (try all cookie formats)
  const allAuthCookies = [authCookie, authStorageCookie, simpleAuthCookie].filter(Boolean);

  for (const cookieValue of allAuthCookies) {
    if (isAuthenticated) break; // Stop if we've already authenticated

    try {
      console.log("Middleware: Trying to parse cookie:", cookieValue?.substring(0, 20) + "...");
      const parsedStorage = JSON.parse(cookieValue);
      const state = parsedStorage.state || parsedStorage;

      // Validate that we have all required fields for authentication
      if (state.isAuthenticated && state.user && state.user.id) {
        isAuthenticated = true;
        userRole = state.user.role || "USER";
        console.log("Middleware: Valid authentication data found in cookie");
        console.log("Middleware: User ID:", state.user.id);
        console.log("Middleware: User email:", state.user.email);
      } else if (state.token && state.user) {
        // Alternative structure
        isAuthenticated = true;
        userRole = state.user.role || "USER";
        console.log("Middleware: Valid authentication data found in alternative cookie structure");
      }
    } catch (error) {
      console.error("Error parsing auth cookie:", error);
    }
  }

  // If still not authenticated, try method 2: Direct auth cookies
  if (!isAuthenticated && authTokenCookie) {
    try {
      // If we have a direct auth token cookie, use it
      console.log("Middleware: Found direct auth token cookie");

      // Try to verify the token
      const parts = authTokenCookie.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        console.log("Middleware: Direct auth token payload:", payload);

        if (payload.userId || payload.sub || payload.id) {
          isAuthenticated = true;
          userRole = payload.role || "USER";
          console.log("Middleware: Valid direct auth token found");
        }
      }

      // If we also have user info, use that
      if (authUserCookie) {
        try {
          const userInfo = JSON.parse(decodeURIComponent(authUserCookie));
          console.log("Middleware: User info from cookie:", userInfo);

          if (userInfo.id) {
            isAuthenticated = true;
            userRole = userInfo.role || "USER";
            console.log("Middleware: Valid user info found in cookie");
          }
        } catch (userError) {
          console.error("Error parsing user info cookie:", userError);
        }
      }
    } catch (tokenError) {
      console.error("Error verifying direct auth token:", tokenError);
    }
  }

  // If still not authenticated, try method 3: NextAuth session
  if (!isAuthenticated && nextAuthCookie) {
    // The presence of a valid next-auth session cookie is enough to consider the user authenticated
    // In a production app, you'd verify this token properly
    isAuthenticated = true;
    userRole = "USER"; // Default role since we can't extract it from the cookie directly
    console.log("Middleware: Valid NextAuth session found");
  }

  // If still not authenticated, try method 3: JWT token from header or query
  const tokenToVerify = token || queryToken;

  if (!isAuthenticated && tokenToVerify) {
    try {
      // Basic JWT validation (in production, you'd verify the signature)
      const parts = tokenToVerify.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        console.log("Middleware: JWT payload:", payload);

        if (payload.userId || payload.sub || payload.id) {
          isAuthenticated = true;
          userRole = payload.role || "USER";
          console.log("Middleware: Valid JWT token found in " + (token ? "Authorization header" : "query parameter"));
          console.log("Middleware: User ID from token:", payload.userId || payload.sub || payload.id);
        }
      }
    } catch (error) {
      console.error("Error parsing JWT token:", error);
    }
  }

  // For debugging: If we're on a protected path and have a query token, add it to the auth cookie
  if (isProtectedPath && queryToken && !isAuthenticated) {
    console.log("Middleware: Adding query token to response cookies for debugging");
    const response = NextResponse.next();
    response.cookies.set("debug-token", queryToken, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      httpOnly: false,
      sameSite: "lax"
    });
    return response;
  }

  userRole = userRole || "USER"; // Fallback to USER if userRole is undefined

  // Double-check for NextAuth session cookie (in case previous checks missed it)
  const nextAuthSessionCookie = request.cookies.get("next-auth.session-token");
  if (nextAuthSessionCookie && !isAuthenticated) {
    console.log("Middleware: NextAuth session cookie found, considering user authenticated");
    isAuthenticated = true;
  }

  console.log("Middleware: Checking authentication state");
  console.log("Middleware: auth cookie:", authCookie ? "Present" : "Not present");
  console.log("Middleware: nextauth cookie:", nextAuthSessionCookie ? "Present" : "Not present");
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
