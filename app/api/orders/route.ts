export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    console.log("API: /api/orders - Request received");

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.log("API: /api/orders - No session, returning 401");
      return NextResponse.json(
        {
          error: "Authentication required",
          message: "Please log in to view your orders.",
        },
        { status: 401 }
      );
    }

    console.log("API: /api/orders - User authenticated:", session.user.email);

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const status = url.searchParams.get("status");

    // Build where clause
    const where: any = {
      userId: session.user.id,
    };

    if (status) {
      where.status = status;
    }

    // Get orders with pagination
    console.log("API: /api/orders - Fetching orders for user ID:", session.user.id);
    const orders = await db.order.findMany({
      where,
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
            variant: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        shippingDetails: true,
        paymentDetails: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Get total count for pagination
    const total = await db.order.count({ where });

    console.log(`API: /api/orders - Found ${orders.length} orders (total: ${total})`);

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("API: /api/orders - Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch orders",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
