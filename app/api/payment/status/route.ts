import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withPaymentAuth } from "../middleware";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return withPaymentAuth(request, async (userId, user) => {
    try {
      // Get the order ID from the query parameters
      const url = new URL(request.url);
      const orderId = url.searchParams.get("order_id");

      if (!orderId) {
        return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
      }

      console.log("Checking payment status for order:", orderId);

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

      // If user is authenticated, check if the order belongs to them
      if (userId && order.userId !== userId) {
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
      console.error("Payment status check error:", error);
      return NextResponse.json({ error: "Failed to check payment status" }, { status: 500 });
    }
  });
}
