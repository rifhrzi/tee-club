import { NextRequest, NextResponse } from "next/server";
import { processOrderPayment } from "@/lib/services/orderProcessing";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    console.log(`Test API - Processing order payment for: ${orderId}`);

    const result = await processOrderPayment(orderId);

    console.log(`Test API - Processing result:`, result);

    return NextResponse.json({
      success: result.success,
      message: result.message,
      orderId: result.orderId,
      stockChanges: result.stockChanges,
    });

  } catch (error) {
    console.error("Test API - Error processing order:", error);
    return NextResponse.json(
      { 
        error: "Failed to process order",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
