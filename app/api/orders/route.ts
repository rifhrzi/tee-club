export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    console.log("API: /api/orders - Request received");

    // Check for token-based authentication first
    const authHeader = request.headers.get("authorization");
    let userId = null;
    let userEmail = null;

    console.log("API: /api/orders - Auth header:", authHeader ? "Present" : "Not present");

    if (authHeader && authHeader.startsWith("Bearer ")) {
      // Token-based authentication
      const token = authHeader.substring(7);
      console.log("API: /api/orders - Found Bearer token");

      try {
        // Import the token verification function
        const { verifyToken } = await import("@/lib/auth");

        // Properly verify the token
        try {
          const decoded = verifyToken(token);
          userId = decoded.userId;
          console.log("API: /api/orders - Token verified, userId:", userId);
        } catch (verifyError) {
          console.error("API: /api/orders - Token verification failed:", verifyError);

          // Fallback to manual decoding for debugging
          try {
            const manualDecoded = JSON.parse(atob(token.split(".")[1]));
            console.log("API: /api/orders - Manual token decode:", manualDecoded);
          } catch (decodeError) {
            console.error("API: /api/orders - Manual token decode failed:", decodeError);
          }
        }
      } catch (error) {
        console.error("API: /api/orders - Token verification error:", error);
      }
    }

    // If token-based auth failed, try cookie-based auth
    if (!userId) {
      console.log("API: /api/orders - Trying cookie-based authentication");
      const cookieStore = cookies();

      // Try all possible cookie names
      const authCookie = cookieStore.get("auth-storage");
      const authStorageCookie = cookieStore.get("auth_storage");
      const simpleAuthCookie = cookieStore.get("simple-auth-storage");
      const authTokenCookie = cookieStore.get("auth_token");
      const authUserCookie = cookieStore.get("auth_user");
      const debugTokenCookie = cookieStore.get("debug-token");
      const nextAuthSessionToken = cookieStore.get("next-auth.session-token");
      const nextAuthCallbackUrl = cookieStore.get("next-auth.callback-url");

      console.log("API: /api/orders - Cookies found:", {
        hasAuthStorage: !!authCookie,
        hasAuthStorageCookie: !!authStorageCookie,
        hasSimpleAuthCookie: !!simpleAuthCookie,
        hasAuthTokenCookie: !!authTokenCookie,
        hasAuthUserCookie: !!authUserCookie,
        hasDebugTokenCookie: !!debugTokenCookie,
        hasNextAuthSession: !!nextAuthSessionToken,
        hasNextAuthCallback: !!nextAuthCallbackUrl
      });

      // First try custom auth cookie
      if (authCookie) {
        console.log("API: /api/orders - Auth cookie found:", authCookie.name);

        try {
          // Log the raw cookie value for debugging (but mask sensitive parts)
          const maskedValue = authCookie.value.substring(0, 20) + "..." +
                             authCookie.value.substring(authCookie.value.length - 10);
          console.log("API: /api/orders - Auth cookie value (masked):", maskedValue);

          const cookieValue = JSON.parse(authCookie.value);
          console.log("API: /api/orders - Cookie parsed successfully");

          // Check for different possible structures
          const state = cookieValue.state || cookieValue;

          if (state.user && state.isAuthenticated) {
            userId = state.user.id;
            userEmail = state.user.email;
            console.log("API: /api/orders - User authenticated from cookie:", userEmail);
          } else if (state.token && state.user) {
            // Alternative structure
            userId = state.user.id;
            userEmail = state.user.email;
            console.log("API: /api/orders - User authenticated from alternative cookie structure:", userEmail);
          }
        } catch (error) {
          console.error("API: /api/orders - Error parsing auth cookie:", error);
        }
      }

      // Try other auth cookie formats if still no userId
      const otherAuthCookies = [authStorageCookie, simpleAuthCookie].filter(Boolean);
      for (const cookie of otherAuthCookies) {
        if (userId || !cookie) break; // Stop if we already have a userId or cookie is undefined

        try {
          console.log("API: /api/orders - Trying alternative auth cookie");
          const cookieValue = JSON.parse(cookie.value);
          const state = cookieValue.state || cookieValue;

          if (state.user && state.user.id) {
            userId = state.user.id;
            userEmail = state.user.email;
            console.log("API: /api/orders - User authenticated from alternative cookie");
          }
        } catch (error) {
          console.error("API: /api/orders - Error parsing alternative auth cookie:", error);
        }
      }

      // Try direct auth token cookie if still no userId
      if (!userId && authTokenCookie) {
        try {
          console.log("API: /api/orders - Trying direct auth token cookie");

          // Try to verify the token
          const parts = authTokenCookie.value.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            console.log("API: /api/orders - Direct auth token payload:", payload);

            if (payload.userId || payload.sub || payload.id) {
              userId = payload.userId || payload.sub || payload.id;
              console.log("API: /api/orders - User ID from direct auth token:", userId);
            }
          }
        } catch (error) {
          console.error("API: /api/orders - Error parsing direct auth token:", error);
        }
      }

      // Try user info cookie if still no userId
      if (!userId && authUserCookie) {
        try {
          console.log("API: /api/orders - Trying user info cookie");
          const userInfo = JSON.parse(decodeURIComponent(authUserCookie.value));

          if (userInfo.id) {
            userId = userInfo.id;
            userEmail = userInfo.email;
            console.log("API: /api/orders - User authenticated from user info cookie:", userEmail);
          }
        } catch (error) {
          console.error("API: /api/orders - Error parsing user info cookie:", error);
        }
      }

      // If still no userId, try to get it from NextAuth session
      if (!userId && nextAuthSessionToken) {
        try {
          // For NextAuth, we need to decode the JWT token
          // In a production app, you'd use the proper NextAuth getToken function
          // This is a simplified version for debugging
          console.log("API: /api/orders - Trying to use NextAuth session token");

          // For NextAuth in App Router, we need to use a different approach
          // Let's try to decode the token directly
          try {
            // Basic JWT decoding (not secure, but for debugging)
            const tokenParts = nextAuthSessionToken.value.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              console.log("API: /api/orders - Decoded NextAuth token payload:", payload);

              // Extract user info from the token
              if (payload.sub) {
                // In NextAuth, 'sub' is the user ID
                userId = payload.sub;
                console.log("API: /api/orders - Found user ID in NextAuth token:", userId);
              }
            }
          } catch (decodeError) {
            console.error("API: /api/orders - Error decoding NextAuth token:", decodeError);
          }

          // If we found a userId from the token, try to get the user's email
          if (userId) {
            try {
              // Look up the user in the database to get their email
              const user = await db.user.findUnique({
                where: { id: userId },
                select: { email: true }
              });

              if (user) {
                userEmail = user.email;
                console.log("API: /api/orders - User authenticated from NextAuth token:", userEmail);
              } else {
                console.log("API: /api/orders - User ID from NextAuth token not found in database");
              }
            } catch (dbError) {
              console.error("API: /api/orders - Error looking up user from NextAuth token:", dbError);
            }
          } else {
            console.log("API: /api/orders - Could not extract user ID from NextAuth token");
          }
        } catch (error) {
          console.error("API: /api/orders - Error getting NextAuth session:", error);
        }
      }

      // If we still don't have a userId, return unauthorized
      if (!userId) {
        console.log("API: /api/orders - No valid authentication found, returning 401");
        return NextResponse.json({
          error: "Unauthorized",
          message: "No valid authentication found. Please log in."
        }, { status: 401 });
      }
    }

    // Check if the user exists
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        console.log("API: /api/orders - User not found for ID:", userId);
        return NextResponse.json({
          error: "User not found",
          message: "The user associated with this authentication could not be found."
        }, { status: 404 });
      }

      console.log("API: /api/orders - User found:", user.email);

      // Fetch user's orders
      console.log("API: /api/orders - Fetching orders for user ID:", userId);
      try {
        const orders = await db.order.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    images: true,
                  },
                },
              },
            },
            shippingDetails: true,
          },
        });

        console.log(`API: /api/orders - Found ${orders.length} orders`);
        return NextResponse.json({ orders });
      } catch (dbError) {
        console.error("API: /api/orders - Database error fetching orders:", dbError);
        return NextResponse.json({
          error: "Database error",
          message: "Failed to fetch orders from database"
        }, { status: 500 });
      }
    } catch (userError) {
      console.error("API: /api/orders - Error finding user:", userError);
      return NextResponse.json({
        error: "Database error",
        message: "Failed to verify user in database"
      }, { status: 500 });
    }
  } catch (error) {
    console.error("API: /api/orders - Unexpected error:", error);
    return NextResponse.json({
      error: "Failed to fetch orders",
      message: error instanceof Error ? error.message : "Unknown error occurred"
    }, { status: 500 });
  }
}
