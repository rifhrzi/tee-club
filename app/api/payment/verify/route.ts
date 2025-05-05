export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    // Get the order ID from the query parameters
    const url = new URL(request.url);
    const orderId = url.searchParams.get("order_id");

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    console.log("Verifying payment for order:", orderId);

    // Check for authentication token (optional)
    let user = null;
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

    // If token exists, verify it and get the user
    if (token) {
      try {
        const decoded = verifyToken(token);
        user = await db.user.findUnique({
          where: { id: decoded.userId },
        });
        console.log("Authenticated payment verification for user:", user?.email);
      } catch (error) {
        console.log("Invalid token, proceeding with guest verification");
      }
    }

    // Find the order in the database
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        shippingDetails: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if the user is authorized to view this order
    if (user && order.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Return the order details
    return NextResponse.json({
      order: {
        id: order.id,
        status: order.status,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        items: order.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingDetails: order.shippingDetails,
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 });
  }
}
