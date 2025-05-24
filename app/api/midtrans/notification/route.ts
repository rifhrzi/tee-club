import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";
import { db } from "@/lib/db";
import { createOrderFromCheckout } from "@/lib/services/products";
import { getCheckoutSession, removeCheckoutSession } from "@/lib/checkout-session";

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

    // Determine if payment was successful
    let isPaymentSuccessful = false;

    if (transactionStatus === "capture") {
      isPaymentSuccessful = fraudStatus === "accept";
    } else if (transactionStatus === "settlement") {
      isPaymentSuccessful = true;
    }

    console.log(`Midtrans: Payment status for ${orderId}: ${transactionStatus}, Success: ${isPaymentSuccessful}`);

    // Only create order if payment was successful
    if (isPaymentSuccessful) {
      console.log(`Midtrans: Payment successful for ${orderId}, creating order...`);

      try {
        // Check if order already exists (prevent duplicate creation)
        const existingOrder = await db.order.findUnique({
          where: { id: orderId }
        });

        if (existingOrder) {
          console.log(`Midtrans: Order ${orderId} already exists, skipping creation`);
          return NextResponse.json({ success: true, message: "Order already exists" });
        }

        // Retrieve checkout session data
        const checkoutSession = getCheckoutSession(orderId);

        if (!checkoutSession) {
          console.error(`Midtrans: No checkout session found for order ${orderId}`);
          return NextResponse.json({
            error: "Checkout session not found",
            message: "The checkout session has expired or was not found"
          }, { status: 404 });
        }

        console.log(`Midtrans: Found checkout session for ${orderId}, creating order with ${checkoutSession.items.length} items`);

        // Create order from checkout session data
        const orderResult = await createOrderFromCheckout(checkoutSession);

        if (orderResult.success) {
          console.log(`Midtrans: Successfully created order ${orderId} with PAID status and reduced stock`);

          // Remove the checkout session since order was created successfully
          removeCheckoutSession(orderId);

          return NextResponse.json({
            success: true,
            message: "Order created successfully",
            orderId: orderResult.order?.id
          });
        } else {
          console.error(`Midtrans: Failed to create order ${orderId}:`, orderResult.error);

          if (orderResult.needsRefund) {
            console.error(`Midtrans: CRITICAL: Payment successful but order creation failed for ${orderId} - REFUND NEEDED`);
          }

          return NextResponse.json({
            error: "Failed to create order",
            details: orderResult.error,
            needsRefund: orderResult.needsRefund
          }, { status: 500 });
        }

      } catch (orderCreationError) {
        console.error(`Midtrans: Critical error during order creation for ${orderId}:`, orderCreationError);
        return NextResponse.json({
          error: "Critical error during order creation",
          details: orderCreationError instanceof Error ? orderCreationError.message : 'Unknown error'
        }, { status: 500 });
      }
    } else {
      console.log(`Midtrans: Payment not successful for ${orderId}, status: ${transactionStatus}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Midtrans notification error:", error);
    return NextResponse.json({ error: "Failed to process notification" }, { status: 500 });
  }
}
