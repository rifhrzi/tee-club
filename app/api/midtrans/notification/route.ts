import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";
import { db } from "@/lib/db";
import { processOrderPayment } from "@/lib/services/orderProcessing";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const core = new midtransClient.CoreApi({
      isProduction: process.env.NODE_ENV === "production",
      serverKey: process.env.MIDTRANS_SERVER_KEY!,
      clientKey: process.env.MIDTRANS_CLIENT_KEY!,
    });

    const notificationJson = await core.transaction.notification(body);

    const orderId = notificationJson.order_id;
    const transactionStatus = notificationJson.transaction_status;
    const fraudStatus = notificationJson.fraud_status;

    let orderStatus: "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" =
      "PENDING";

    if (transactionStatus === "capture") {
      if (fraudStatus === "challenge") {
        orderStatus = "PENDING";
      } else if (fraudStatus === "accept") {
        orderStatus = "PAID";
      }
    } else if (transactionStatus === "settlement") {
      orderStatus = "PAID";
    } else if (
      transactionStatus === "cancel" ||
      transactionStatus === "deny" ||
      transactionStatus === "expire"
    ) {
      orderStatus = "CANCELLED";
    } else if (transactionStatus === "pending") {
      orderStatus = "PENDING";
    }

    const order = await db.order.findFirst({
      where: {
        OR: [
          { paymentToken: notificationJson.transaction_id },
          { id: { startsWith: orderId.replace("ORDER-", "") } },
        ],
      },
      include: {
        items: true,
      },
    });

    if (order) {
      // If payment is successful, process order payment with enhanced inventory management
      if (orderStatus === "PAID") {
        console.log(
          `Midtrans: Order ${order.id} is paid, processing with enhanced inventory management`
        );

        try {
          const result = await processOrderPayment(order.id);

          if (result.success) {
            console.log(
              `Midtrans: Successfully processed payment and updated stock for order ${order.id}`
            );
          } else {
            console.error(`Midtrans: Failed to process order payment ${order.id}:`, result.message);
            // Log the error but don't fail the webhook response
            // The payment was successful, but stock management failed
            // This should be handled by admin intervention
          }
        } catch (stockError) {
          console.error(`Midtrans: Error processing order payment ${order.id}:`, stockError);
          // We don't want to fail the whole request if stock processing fails
          // Just log the error and continue
        }
      } else {
        // For non-payment statuses, just update the order status
        await db.order.update({
          where: { id: order.id },
          data: {
            status: orderStatus,
            updatedAt: new Date(),
          },
        });
      }
    } else {
      console.error(`Order not found for notification: ${orderId}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Midtrans notification error:", error);
    return NextResponse.json({ error: "Failed to process notification" }, { status: 500 });
  }
}
