import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    console.log("Admin Order Details API - Fetching order:", context.params.id);

    // Get authentication headers from middleware
    const userEmail = request.headers.get("x-nextauth-user-email");
    const userRole = request.headers.get("x-nextauth-user-role");

    console.log("Admin Order Details API - Auth info:", { userEmail, userRole });

    // Check if user is authenticated and is admin
    if (!userEmail) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Fetch the specific order with all related data
    const order = await db.order.findUnique({
      where: {
        id: context.params.id,
      },
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
    });

    if (!order) {
      console.log("Admin Order Details API - Order not found:", context.params.id);
      return NextResponse.json(
        { 
          error: "Order not found",
          message: "The requested order could not be found."
        }, 
        { status: 404 }
      );
    }

    console.log("Admin Order Details API - Order fetched successfully:", order.id);
    
    return NextResponse.json({ 
      success: true,
      order 
    });
  } catch (error) {
    console.error("Admin Order Details API - Error:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch order details",
        message: error instanceof Error ? error.message : "Unknown error occurred"
      }, 
      { status: 500 }
    );
  }
}
