import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";
import { db } from "@/lib/db";
import { reduceProductStock } from "@/lib/services/products";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Midtrans notification received:", JSON.stringify(body, null, 2));

    const core = new midtransClient.CoreApi({
      isProduction: process.env.NODE_ENV === "production",
      serverKey: process.env.MIDTRANS_SERVER_KEY!,
      clientKey: process.env.MIDTRANS_CLIENT_KEY!,
    });

    console.log("Midtrans notification - Processing with Core API...");
    const notificationJson = await core.transaction.notification(body);
    console.log("Midtrans notification - Processed notification:", JSON.stringify(notificationJson, null, 2));

    const orderId = notificationJson.order_id;
    const transactionStatus = notificationJson.transaction_status;
    const fraudStatus = notificationJson.fraud_status;

    let orderStatus: any = "PENDING" as any;

    if (transactionStatus === "capture") {
      if (fraudStatus === "challenge") {
        orderStatus = "PENDING" as any;
      } else if (fraudStatus === "accept") {
        orderStatus = "PAID" as any;
      }
    } else if (transactionStatus === "settlement") {
      orderStatus = "PAID" as any;
    } else if (
      transactionStatus === "cancel" ||
      transactionStatus === "deny" ||
      transactionStatus === "expire"
    ) {
      orderStatus = "CANCELLED" as any;
    } else if (transactionStatus === "pending") {
      orderStatus = "PENDING" as any;
    }

    console.log("Midtrans notification - Looking for order with:", {
      orderId,
      transactionId: notificationJson.transaction_id,
      searchCriteria: {
        paymentToken: notificationJson.transaction_id,
        idStartsWith: orderId.replace("ORDER-", "")
      }
    });

    const order = await db.order.findFirst({
      where: {
        OR: [
          { paymentToken: notificationJson.transaction_id },
          { id: { startsWith: orderId.replace("ORDER-", "") } },
        ],
      },
      include: {
        items: true
      }
    });

    console.log("Midtrans notification - Order found:", order ? `Yes (ID: ${order.id})` : "No");

    if (order) {
      // Update order status
      await db.order.update({
        where: { id: order.id },
        data: { status: orderStatus },
      });

      // If payment is successful, reduce stock for each item
      if (orderStatus === "PAID") {
        console.log(`Midtrans: Order ${order.id} is paid, reducing stock for ${order.items.length} items`);

        try {
          // Process each order item
          for (const item of order.items) {
            await reduceProductStock(
              item.productId,
              item.quantity,
              item.variantId || undefined
            );
          }
          console.log(`Midtrans: Successfully reduced stock for all items in order ${order.id}`);
        } catch (stockError) {
          console.error(`Midtrans: Error reducing stock for order ${order.id}:`, stockError);
          // We don't want to fail the whole request if stock reduction fails
          // Just log the error and continue
        }
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
