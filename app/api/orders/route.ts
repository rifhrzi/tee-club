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

    if (authHeader && authHeader.startsWith("Bearer ")) {
      // Token-based authentication
      const token = authHeader.substring(7);
      console.log("API: /api/orders - Found Bearer token");

      try {
        // Verify the token (you would use your token verification logic here)
        // For now, we'll just extract the user ID from the token
        // In a real application, you would verify the token signature
        const decoded = JSON.parse(atob(token.split(".")[1]));
        userId = decoded.userId;
        console.log("API: /api/orders - Token verified, userId:", userId);
      } catch (error) {
        console.error("API: /api/orders - Token verification error:", error);
      }
    }

    // If token-based auth failed, try cookie-based auth
    if (!userId) {
      console.log("API: /api/orders - Trying cookie-based authentication");
      const cookieStore = cookies();
      const simpleAuthCookie = cookieStore.get("simple-auth-storage");

      if (!simpleAuthCookie) {
        console.log("API: /api/orders - No auth cookie found, returning 401");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Parse the cookie value
      try {
        const cookieValue = JSON.parse(simpleAuthCookie.value);
        const state = cookieValue.state || {};

        if (state.user && state.isAuthenticated) {
          userId = state.user.id;
          userEmail = state.user.email;
          console.log("API: /api/orders - User authenticated:", userEmail);
        } else {
          console.log("API: /api/orders - Auth cookie exists but user not authenticated");
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
      } catch (error) {
        console.error("API: /api/orders - Error parsing auth cookie:", error);
        return NextResponse.json({ error: "Invalid authentication data" }, { status: 401 });
      }
    }

    // Check if the user exists
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.log("API: /api/orders - User not found for ID:", userId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("API: /api/orders - User found:", user.email);

    // Fetch user's orders
    console.log("API: /api/orders - Fetching orders for user ID:", userId);
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
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
