export const dynamic = "force-dynamic";

import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    console.log("API: /api/orders/[id] - Request received for order ID:", context.params.id);

    // Log all headers for debugging
    console.log("API: /api/orders/[id] - Request headers:");
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
      console.log(`  ${key}: ${value}`);
    });

    // Get user ID from NextAuth middleware-set header
    const nextAuthUserId = request.headers.get("x-nextauth-user-id");

    console.log("API: /api/orders/[id] - Authentication info:", {
      "x-nextauth-user-id": nextAuthUserId
    });

    if (!nextAuthUserId) {
      console.log("API: /api/orders/[id] - No NextAuth user ID, returning 401");
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
      console.log("API: /api/orders/[id] - User not found for ID:", nextAuthUserId);
      return NextResponse.json({
        error: "User not found",
        message: "The user associated with this authentication could not be found."
      }, { status: 404 });
    }

    console.log("API: /api/orders/[id] - User found:", user.email);

    console.log("API: /api/orders/[id] - Fetching order for user ID:", nextAuthUserId);
    const order = await db.order.findUnique({
      where: {
        id: context.params.id,
        userId: nextAuthUserId,
      },
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
            variant: true,
          },
        },
        shippingDetails: true,
      },
    });

    if (!order) {
      console.log("API: /api/orders/[id] - Order not found for ID:", context.params.id);
      return NextResponse.json({
        error: "Order not found",
        message: "The requested order could not be found or does not belong to your account."
      }, { status: 404 });
    }

    console.log("API: /api/orders/[id] - Order fetched successfully for user:", user.email);
    return NextResponse.json({ order });
  } catch (error) {
    console.error("API: /api/orders/[id] - Error fetching order:", error);
    return NextResponse.json({
      error: "Failed to fetch order",
      message: error instanceof Error ? error.message : "Unknown error occurred"
    }, { status: 500 });
  }
}