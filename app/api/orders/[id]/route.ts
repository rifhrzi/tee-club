export const dynamic = "force-dynamic";

import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const userId = request.headers.get("x-user-id");
    console.log("Orders API - x-user-id:", userId);

    if (!userId) {
      console.log("Orders API - No user ID, returning 401");
      return NextResponse.json({ error: "Unauthorized", message: "Authentication required" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.log("Orders API - User not found for ID:", userId);
      return NextResponse.json({ error: "User not found", message: "The user associated with this authentication could not be found" }, { status: 404 });
    }

    const order = await db.order.findUnique({
      where: {
        id: context.params.id,
        userId: user.id,
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
      console.log("Orders API - Order not found for ID:", context.params.id);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    console.log("Orders API - Order fetched for user:", user.email);
    return NextResponse.json({ order });
  } catch (error) {
    console.error("Orders API - Error fetching order:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to fetch order", message: errorMessage }, { status: 500 });
  }
}