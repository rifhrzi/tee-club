import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { AdminOrdersResponse, AdminFilters } from "@/types/admin";
import { handleOrderStatusChange } from "@/lib/services/orderProcessing";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    console.log("Admin Orders API - Fetching orders");

    // Get authentication headers from middleware
    const userEmail = request.headers.get("x-nextauth-user-email");
    const userRole = request.headers.get("x-nextauth-user-role");

    console.log("Admin Orders API - Auth info:", { userEmail, userRole });

    // Check if user is authenticated and is admin
    if (!userEmail) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Parse query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");
    const sortBy = url.searchParams.get("sortBy") || "createdAt";
    const sortOrder = url.searchParams.get("sortOrder") || "desc";
    const dateFrom = url.searchParams.get("dateFrom");
    const dateTo = url.searchParams.get("dateTo");

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        {
          id: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          user: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          user: {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          shippingDetails: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build order by clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Fetch orders with pagination
    const [orders, totalCount] = await Promise.all([
      db.order.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
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
          paymentDetails: true,
        },
      }),
      db.order.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    console.log(`Admin Orders API - Found ${orders.length} orders (page ${page}/${totalPages})`);

    const response: AdminOrdersResponse = {
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Admin Orders API - Error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    console.log("Admin Orders API - Updating order status");

    // Get authentication headers from middleware
    const userEmail = request.headers.get("x-nextauth-user-email");
    const userRole = request.headers.get("x-nextauth-user-role");

    // Check if user is authenticated and is admin
    if (!userEmail) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { orderId, status, notes } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: "Order ID and status are required" }, { status: 400 });
    }

    // Validate status
    const validStatuses = [
      "PENDING",
      "PAID",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "REFUND_REQUESTED",
      "REFUNDED",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Use enhanced order processing service for status changes
    const result = await handleOrderStatusChange(orderId, status);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Failed to update order status",
          message: result.message,
        },
        { status: 400 }
      );
    }

    // Get updated order with all relations for response
    const updatedOrder = await db.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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
        paymentDetails: true,
      },
    });

    console.log(`Admin Orders API - Updated order ${orderId} status to ${status}`);

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: result.message,
      stockChanges: result.stockChanges,
    });
  } catch (error) {
    console.error("Admin Orders API - Update error:", error);
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
  }
}
