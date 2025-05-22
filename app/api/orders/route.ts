export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    console.log("API: /api/orders - Request received");

    // Get user ID from middleware-set header
    const userId = request.headers.get("x-user-id");
    console.log("API: /api/orders - x-user-id:", userId);

    if (!userId) {
      console.log("API: /api/orders - No user ID, returning 401");
      return NextResponse.json({
        error: "Unauthorized",
        message: "No valid authentication found. Please log in."
      }, { status: 401 });
    }

    // Verify user exists
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

    // Fetch orders
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
    console.error("API: /api/orders - Unexpected error:", error);
    return NextResponse.json({
      error: "Failed to fetch orders",
      message: error instanceof Error ? error.message : "Unknown error occurred"
    }, { status: 500 });
  }
}