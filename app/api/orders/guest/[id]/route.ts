import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const orderId = params.id;
  
  console.log(`API: Fetching guest order with ID: ${orderId}`);

  if (!orderId) {
    return NextResponse.json(
      { error: "Order ID is required" },
      { status: 400 }
    );
  }

  try {
    // Find the order by ID
    const order = await db.order.findUnique({
      where: {
        id: orderId,
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
          },
        },
        shippingDetails: true,
      },
    });

    console.log(`API: Guest order fetch result:`, order ? "Found" : "Not found");

    if (!order) {
      return NextResponse.json(
        { error: `No order found with ID: ${orderId}` },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error(`API: Error fetching guest order:`, error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
