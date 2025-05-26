import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const publicPaths = [
  "/api/auth/[...nextauth]",
  "/api/public",
  "/api/products", // Products should be publicly accessible
  "/api/profile", // Profile API handles its own authentication with getServerSession
  "/api/checkout", // Checkout API handles its own authentication with getServerSession
  // Guest order lookup removed - all order operations now require authentication
];

export async function middleware(request: NextRequest) {
  console.log("API Middleware - Processing request for:", request.nextUrl.pathname);

  if (
    publicPaths.includes(request.nextUrl.pathname) ||
    request.nextUrl.pathname.startsWith("/api/auth/")
  ) {
    console.log("API Middleware - Public path, skipping auth check");
    return NextResponse.next();
  }

  // Log all cookies for debugging
  console.log("API Middleware - Request cookies:");
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    cookieHeader.split(";").forEach((cookie) => {
      console.log(`  ${cookie.trim()}`);
    });
  } else {
    console.log("  No cookies found in request");
  }

  // Get the NextAuth session token
  try {
    console.log("API Middleware - Checking for NextAuth session");
    console.log("API Middleware - NEXTAUTH_SECRET exists:", !!process.env.NEXTAUTH_SECRET);
    console.log("API Middleware - NODE_ENV:", process.env.NODE_ENV);

    // Special handling for orders API
    const isOrdersApi = request.nextUrl.pathname === "/api/orders";
    if (isOrdersApi) {
      console.log("API Middleware - Processing orders API request");
    }

    // Get the session token from NextAuth
    const cookieName =
      process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token";

    // Log the cookie name we're looking for
    console.log("API Middleware - Looking for cookie:", cookieName);

    // Check if the cookie exists in the request
    let hasSessionCookie = false;
    if (cookieHeader) {
      const cookies = cookieHeader.split(";").map((c) => c.trim());
      hasSessionCookie = cookies.some((c) => c.startsWith(`${cookieName}=`));
      console.log("API Middleware - Session cookie found:", hasSessionCookie);

      // Log the actual session cookie value (first 20 chars for security)
      const sessionCookie = cookies.find((c) => c.startsWith(`${cookieName}=`));
      if (sessionCookie) {
        const cookieValue = sessionCookie.split("=")[1];
        console.log(
          "API Middleware - Session cookie value (first 20 chars):",
          cookieValue?.substring(0, 20) + "..."
        );
      }
    }

    const nextAuthToken = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production",
    });

    console.log("API Middleware - getToken result:", nextAuthToken ? "Token found" : "No token");

    if (nextAuthToken) {
      console.log("API Middleware - Found NextAuth token for user:", nextAuthToken.email);

      // Create a new request with the user information in headers
      const requestHeaders = new Headers(request.headers);

      // Set user information in headers for API routes (using NextAuth as primary)
      requestHeaders.set("x-nextauth-user-id", nextAuthToken.id as string);
      requestHeaders.set("x-nextauth-user-email", nextAuthToken.email as string);

      if (nextAuthToken.name) {
        requestHeaders.set("x-nextauth-user-name", nextAuthToken.name as string);
      }

      if (nextAuthToken.role) {
        requestHeaders.set("x-nextauth-user-role", nextAuthToken.role as string);
      }

      console.log("API Middleware - Set authentication headers:", {
        "x-nextauth-user-id": nextAuthToken.id,
        "x-nextauth-user-email": nextAuthToken.email,
        "x-nextauth-user-name": nextAuthToken.name,
        "x-nextauth-user-role": nextAuthToken.role,
      });

      // Create new request with updated headers
      const newRequest = new Request(request, {
        headers: requestHeaders,
      });

      // Continue to the API route with the authenticated user
      return NextResponse.next({
        request: newRequest,
      });
    }

    // No valid session found, return unauthorized
    console.log("API Middleware - No NextAuth session found, returning 401");
    return NextResponse.json(
      {
        error: "Unauthorized",
        message: "Authentication required. Please log in to access this resource.",
        code: "AUTH_REQUIRED",
      },
      {
        status: 401,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    // Error checking session
    console.error("API Middleware - Error checking NextAuth token:", error);
    return NextResponse.json(
      {
        error: "Authentication error",
        message: "An error occurred while checking authentication. Please try again.",
        code: "AUTH_ERROR",
      },
      {
        status: 401,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }
}

export const config = {
  matcher: "/api/:path*",
};
