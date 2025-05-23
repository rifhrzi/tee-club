export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    console.log("API: /api/orders - Request received");

    // Log all headers for debugging
    console.log("API: /api/orders - Request headers:");
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
      console.log(`  ${key}: ${value}`);
    });

    // Get user ID from NextAuth middleware-set header
    const nextAuthUserId = request.headers.get("x-nextauth-user-id");

    console.log("API: /api/orders - Authentication info:", {
      "x-nextauth-user-id": nextAuthUserId
    });

    if (!nextAuthUserId) {
      console.log("API: /api/orders - No NextAuth user ID, returning 401");
      return NextResponse.json({
        error: "Unauthorized",
        message: "No valid authentication found. Please log in."
      }, { status: 401 });
    }

    // Verify user exists
    const user = await db.user.findUnique({
      where: { id: nextAuthUserId },
    });

    if (!user) {
      console.log("API: /api/orders - User not found for ID:", nextAuthUserId);
      return NextResponse.json({
        error: "User not found",
        message: "The user associated with this authentication could not be found."
      }, { status: 404 });
    }

    console.log("API: /api/orders - User found:", user.email);

    // Fetch orders
    console.log("API: /api/orders - Fetching orders for user ID:", nextAuthUserId);
    const orders = await db.order.findMany({
      where: { userId: nextAuthUserId },
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
    console.error("API: /api/orders - Unexpected error:", error);
    return NextResponse.json({
      error: "Failed to fetch orders",
      message: error instanceof Error ? error.message : "Unknown error occurred"
    }, { status: 500 });
  }
}