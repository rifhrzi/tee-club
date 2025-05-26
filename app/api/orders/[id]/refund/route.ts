import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { processOrderRefund } from "@/lib/services/orderProcessing";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const orderId = params.id;
    const body = await request.json();
    const { reason } = body;

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json({ error: "Refund reason is required" }, { status: 400 });
    }

    console.log(`API: Processing refund request for order ${orderId} by user ${session.user.id}`);

    // Find the order and verify ownership
    const order = await db.order.findUnique({
      where: {
        id: orderId,
        userId: session.user.id, // Ensure user owns the order
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
        paymentDetails: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found or you don't have permission to refund this order" },
        { status: 404 }
      );
    }

    // Check if order is eligible for refund
    const eligibleStatuses = ["PROCESSING", "PAID"];
    if (!eligibleStatuses.includes(order.status)) {
      return NextResponse.json(
        {
          error: "This order is not eligible for refund",
          message: `Orders with status "${order.status}" cannot be refunded. Only orders with status "PROCESSING" can be refunded.`,
        },
        { status: 400 }
      );
    }

    // Check if refund was already requested
    if (order.status === "REFUND_REQUESTED" || order.status === "REFUNDED") {
      return NextResponse.json(
        {
          error: "Refund already processed",
          message: "A refund has already been requested or processed for this order.",
        },
        { status: 400 }
      );
    }

    // Update order status to REFUND_REQUESTED (not processing refund yet)
    const updatedOrder = await db.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: "REFUND_REQUESTED",
        updatedAt: new Date(),
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
        paymentDetails: true,
      },
    });

    // Create stock history record for refund request
    await db.stockHistory.create({
      data: {
        orderId,
        type: "REFUND",
        quantity: 0, // Placeholder - actual stock restoration happens when admin processes refund
        previousStock: 0,
        newStock: 0,
        reason: `Refund requested - ${reason.trim()}`,
        userId: session.user.id,
      },
    });

    // Log the refund request
    console.log(`Refund requested for order ${orderId}:`, {
      orderId,
      userId: session.user.id,
      amount: order.totalAmount,
      reason: reason.trim(),
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message:
        "Refund request submitted successfully. An admin will review and process your request.",
      order: {
        id: updatedOrder.id,
        status: updatedOrder.status,
        totalAmount: updatedOrder.totalAmount,
        refundReason: reason.trim(),
        refundRequestedAt: updatedOrder.updatedAt,
      },
    });
  } catch (error) {
    console.error("Refund request error:", error);
    return NextResponse.json(
      {
        error: "Failed to process refund request",
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
