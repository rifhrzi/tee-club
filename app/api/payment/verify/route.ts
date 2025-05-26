export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const nextAuthUserId = request.headers.get("x-nextauth-user-id");
    console.log("Payment Verify API - x-nextauth-user-id:", nextAuthUserId);

    if (!nextAuthUserId) {
      console.log("Payment Verify API - No NextAuth user ID, returning 401");
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: nextAuthUserId },
    });

    if (!user) {
      console.log("Payment Verify API - User not found for ID:", nextAuthUserId);
      return NextResponse.json(
        {
          error: "User not found",
          message: "The user associated with this authentication could not be found",
        },
        { status: 404 }
      );
    }

    const url = new URL(request.url);
    const orderId = url.searchParams.get("order_id");

    if (!orderId) {
      console.log("Payment Verify API - Order ID missing");
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    console.log("Payment Verify API - Verifying payment for order:", orderId);

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        shippingDetails: true,
      },
    });

    if (!order) {
      console.log("Payment Verify API - Order not found:", orderId);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.userId !== nextAuthUserId) {
      console.log("Payment Verify API - Unauthorized access to order:", orderId);
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    console.log("Payment Verify API - Order verified for user:", user.email);

    return NextResponse.json({
      order: {
        id: order.id,
        status: order.status,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        items: order.items.map((item: any) => ({
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
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to verify payment", message: errorMessage },
      { status: 500 }
    );
  }
}
