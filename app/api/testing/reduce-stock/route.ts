import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reduceProductStock } from "@/lib/services/products";

/**
 * Endpoint for testing stock reduction
 * This endpoint should only be available in development mode
 */
export async function POST(request: Request) {
  // Only allow in development mode
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "This endpoint is only available in development mode" }, { status: 403 });
  }

  try {
    const { productId, variantId, quantity } = await request.json();

    // Validate input
    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    if (!quantity || quantity <= 0) {
      return NextResponse.json({ error: "Quantity must be a positive number" }, { status: 400 });
    }

    // Get current stock before reduction
    let currentStock = 0;
    
    if (variantId) {
      const variant = await db.variant.findUnique({
        where: { id: variantId }
      });
      
      if (!variant) {
        return NextResponse.json({ error: `Variant ${variantId} not found` }, { status: 404 });
      }
      
      currentStock = variant.stock;
    } else {
      const product = await db.product.findUnique({
        where: { id: productId }
      });
      
      if (!product) {
        return NextResponse.json({ error: `Product ${productId} not found` }, { status: 404 });
      }
      
      currentStock = product.stock;
    }

    // Reduce stock
    const result = await reduceProductStock(productId, quantity, variantId);
    
    return NextResponse.json({
      success: true,
      message: `Stock reduced successfully`,
      before: currentStock,
      after: variantId ? result.stock : result.stock,
      reduction: quantity
    });
  } catch (error) {
    console.error("Error reducing stock:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to reduce stock" 
    }, { status: 500 });
  }
}
