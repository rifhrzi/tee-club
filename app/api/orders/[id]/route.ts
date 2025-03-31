import { NextResponse } from "next/server";
import { orderService } from "@/services/orderServiceFactory";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const order = await orderService.getOrderById(params.id);
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Terjadi kesalahan" },
      { status: 404 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { status, trackingNumber } = body;

    const order = await orderService.updateOrderStatus(params.id, status, trackingNumber);
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Terjadi kesalahan" },
      { status: 404 }
    );
  }
}
