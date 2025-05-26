import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { processOrderPayment } from "@/lib/services/orderProcessing";

export async function POST(request: Request) {
  try {
    // Parse the notification data
    const notification = await request.json();

    console.log("Received payment notification:", notification);

    // Extract order ID and transaction status
    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // Find the order in the database with its items
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update order status based on transaction status
    let newStatus:
      | "PENDING"
      | "PAID"
      | "PROCESSING"
      | "SHIPPED"
      | "DELIVERED"
      | "CANCELLED"
      | "REFUND_REQUESTED"
      | "REFUNDED" = order.status;

    if (transactionStatus === "settlement" || transactionStatus === "capture") {
      newStatus = "PAID";
    } else if (transactionStatus === "pending") {
      newStatus = "PENDING";
    } else if (
      transactionStatus === "deny" ||
      transactionStatus === "cancel" ||
      transactionStatus === "expire"
    ) {
      newStatus = "CANCELLED";
    }

    // Update payment details first
    await db.order.update({
      where: { id: orderId },
      data: {
        paymentDetails: {
          upsert: {
            create: {
              provider: "midtrans",
              transactionId: notification.transaction_id || "",
              status: transactionStatus,
              amount: parseFloat(notification.gross_amount || "0"),
              rawResponse: JSON.stringify(notification),
            },
            update: {
              status: transactionStatus,
              rawResponse: JSON.stringify(notification),
            },
          },
        },
      },
    });

    // If payment is successful, process order payment with enhanced inventory management
    if (newStatus === "PAID") {
      console.log(`Order ${orderId} is paid, processing with enhanced inventory management`);

      try {
        const result = await processOrderPayment(orderId);

        if (result.success) {
          console.log(`Successfully processed payment and updated stock for order ${orderId}`);
        } else {
          console.error(`Failed to process order payment ${orderId}:`, result.message);
          // Log the error but don't fail the webhook response
          // The payment was successful, but stock management failed
          // This should be handled by admin intervention
        }
      } catch (stockError) {
        console.error(`Error processing order payment ${orderId}:`, stockError);
        // We don't want to fail the whole request if stock processing fails
        // Just log the error and continue
      }
    } else {
      // For non-payment statuses, just update the order status
      await db.order.update({
        where: { id: orderId },
        data: {
          status: newStatus,
          updatedAt: new Date(),
        },
      });
    }

    console.log(`Updated order ${orderId} status to ${newStatus}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Payment notification error:", error);
    return NextResponse.json({ error: "Failed to process payment notification" }, { status: 500 });
  }
}
