import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";
import { db } from "@/lib/db";

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
    });

    if (order) {
      await db.order.update({
        where: { id: order.id },
        data: { status: orderStatus },
      });
    } else {
      console.error(`Order not found for notification: ${orderId}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Midtrans notification error:", error);
    return NextResponse.json({ error: "Failed to process notification" }, { status: 500 });
  }
}
