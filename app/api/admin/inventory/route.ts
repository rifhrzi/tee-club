import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { increaseStockWithHistory, reduceStockWithHistory } from "@/lib/services/inventory";

export const dynamic = "force-dynamic";

// GET /api/admin/inventory - Get stock levels and history
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const url = new URL(request.url);
    const productId = url.searchParams.get("productId");
    const variantId = url.searchParams.get("variantId");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "50");

    if (productId) {
      // Get specific product/variant stock info
      const product = await db.product.findUnique({
        where: { id: productId },
        include: {
          variants: true,
          stockHistory: {
            orderBy: { createdAt: "desc" },
            take: 20,
            include: {
              user: { select: { name: true, email: true } },
            },
          },
        },
      });

      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }

      let variantInfo = null;
      if (variantId) {
        const variant = await db.variant.findUnique({
          where: { id: variantId },
          include: {
            stockHistory: {
              orderBy: { createdAt: "desc" },
              take: 20,
              include: {
                user: { select: { name: true, email: true } },
              },
            },
          },
        });
        variantInfo = variant;
      }

      return NextResponse.json({
        product,
        variant: variantInfo,
      });
    } else {
      // Get all products with stock info
      const products = await db.product.findMany({
        include: {
          variants: true,
          _count: {
            select: { stockHistory: true },
          },
        },
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      });

      const total = await db.product.count();

      return NextResponse.json({
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    }
  } catch (error) {
    console.error("Admin inventory GET error:", error);
    return NextResponse.json({ error: "Failed to fetch inventory data" }, { status: 500 });
  }
}

// POST /api/admin/inventory - Adjust stock levels
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { productId, variantId, adjustment, reason, type } = body;

    if (!productId || adjustment === undefined || !reason || !type) {
      return NextResponse.json(
        { error: "Missing required fields: productId, adjustment, reason, type" },
        { status: 400 }
      );
    }

    if (!["ADJUSTMENT", "RESTOCK", "DAMAGE"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Must be ADJUSTMENT, RESTOCK, or DAMAGE" },
        { status: 400 }
      );
    }

    const adjustmentAmount = parseInt(adjustment);
    if (isNaN(adjustmentAmount)) {
      return NextResponse.json({ error: "Adjustment must be a valid number" }, { status: 400 });
    }

    let result;
    if (adjustmentAmount > 0) {
      // Increase stock
      result = await increaseStockWithHistory(productId, adjustmentAmount, variantId || undefined, {
        userId: session.user.id,
        reason: `Admin adjustment: ${reason}`,
        type: type as any,
      });
    } else if (adjustmentAmount < 0) {
      // Decrease stock
      result = await reduceStockWithHistory(
        productId,
        Math.abs(adjustmentAmount),
        variantId || undefined,
        {
          userId: session.user.id,
          reason: `Admin adjustment: ${reason}`,
          type: type as any,
        }
      );
    } else {
      return NextResponse.json({ error: "Adjustment amount cannot be zero" }, { status: 400 });
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to adjust stock" },
        { status: 400 }
      );
    }

    // Get updated product/variant info
    const updatedProduct = await db.product.findUnique({
      where: { id: productId },
      include: {
        variants: true,
      },
    });

    console.log(
      `Admin stock adjustment: ${adjustmentAmount} for product ${productId}${
        variantId ? ` variant ${variantId}` : ""
      }`
    );

    return NextResponse.json({
      success: true,
      message: `Stock ${adjustmentAmount > 0 ? "increased" : "decreased"} by ${Math.abs(
        adjustmentAmount
      )}`,
      newStock: result.newStock,
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Admin inventory POST error:", error);
    return NextResponse.json(
      {
        error: "Failed to adjust stock",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
