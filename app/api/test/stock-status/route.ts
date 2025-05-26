import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    console.log(`Test API - Checking stock for product: ${productId}`);

    // Get product with variants and recent stock changes
    const product = await db.product.findUnique({
      where: { id: productId },
      include: {
        variants: {
          select: {
            id: true,
            name: true,
            stock: true,
          },
        },
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Get recent stock changes
    const recentStockChanges = await db.stockChange.findMany({
      where: {
        OR: [
          { productId: productId },
          { 
            variantId: { 
              in: product.variants.map(v => v.id) 
            } 
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        product: {
          select: { name: true },
        },
        variant: {
          select: { name: true },
        },
      },
    });

    // Get recent orders for this product
    const recentOrders = await db.orderItem.findMany({
      where: { productId: productId },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        variant: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const response = {
      product: {
        id: product.id,
        name: product.name,
        stock: product.stock,
        totalOrderItems: product._count.orderItems,
      },
      variants: product.variants,
      totalVariantStock: product.variants.reduce((sum, v) => sum + v.stock, 0),
      recentStockChanges: recentStockChanges.map(change => ({
        id: change.id,
        type: change.type,
        quantity: change.quantity,
        reason: change.reason,
        createdAt: change.createdAt,
        productName: change.product?.name,
        variantName: change.variant?.name,
      })),
      recentOrders: recentOrders.map(item => ({
        orderId: item.order.id,
        orderStatus: item.order.status,
        quantity: item.quantity,
        variantName: item.variant?.name,
        orderCreated: item.order.createdAt,
        orderUpdated: item.order.updatedAt,
      })),
    };

    console.log(`Test API - Stock status response:`, JSON.stringify(response, null, 2));

    return NextResponse.json(response);

  } catch (error) {
    console.error("Test API - Error checking stock status:", error);
    return NextResponse.json(
      { 
        error: "Failed to check stock status",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
