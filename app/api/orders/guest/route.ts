export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const orderId = url.searchParams.get("orderId");
    const email = url.searchParams.get("email");

    // Validate input
    if (!orderId && !email) {
      return NextResponse.json({ error: "Order ID or email is required" }, { status: 400 });
    }

    // Build the query
    let whereClause: any = {};

    if (orderId) {
      // If we have an order ID, use it directly
      whereClause.id = orderId;
    } else if (email) {
      // If we only have an email, search by shipping details
      // Since ShippingDetails is a 1:1 relation, we need to use a different approach
      whereClause = {
        shippingDetails: {
          email,
        },
      };
    }

    console.log("Guest order search with criteria:", JSON.stringify(whereClause, null, 2));

    try {
      // Find orders matching the criteria
      const orders = await db.order.findMany({
        where: whereClause,
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
        orderBy: {
          createdAt: "desc",
        },
      });

      console.log(`Found ${orders.length} orders for guest search`);

      // If no orders found with the given ID, provide a clear message
      if (orders.length === 0 && orderId) {
        console.log(`No order found with ID: ${orderId}`);
        return NextResponse.json(
          { error: `No order found with ID: ${orderId}`, orders: [] },
          { status: 404 }
        );
      }

      return NextResponse.json({ orders });
    } catch (error) {
      console.error("Error searching for guest orders:", error);
      return NextResponse.json({ error: "Failed to search for orders" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error in guest order route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
