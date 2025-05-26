import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("Admin Product API - Fetching product:", params.id);

    // Get authentication headers from middleware
    const userEmail = request.headers.get("x-nextauth-user-email");
    const userRole = request.headers.get("x-nextauth-user-role");

    // Check if user is authenticated and is admin
    if (!userEmail) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (userRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const product = await db.product.findUnique({
      where: {
        id: params.id,
      },
      include: {
        variants: true,
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

    console.log(`Admin Product API - Found product: ${product.name}`);

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Admin Product API - Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("Admin Product API - Updating product:", params.id);

    // Get authentication headers from middleware
    const userEmail = request.headers.get("x-nextauth-user-email");
    const userRole = request.headers.get("x-nextauth-user-role");

    // Check if user is authenticated and is admin
    if (!userEmail) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (userRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updateData = { ...body };
    delete updateData.id; // Remove id from update data

    // Validate numeric fields if provided
    if (updateData.price !== undefined && updateData.price < 0) {
      return NextResponse.json(
        { error: "Price must be non-negative" },
        { status: 400 }
      );
    }

    if (updateData.stock !== undefined && updateData.stock < 0) {
      return NextResponse.json(
        { error: "Stock must be non-negative" },
        { status: 400 }
      );
    }

    // Check if product exists
    const existingProduct = await db.product.findUnique({
      where: { id: params.id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Update product
    const updatedProduct = await db.product.update({
      where: {
        id: params.id,
      },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      include: {
        variants: true,
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
    });

    console.log(`Admin Product API - Updated product ${params.id}`);

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error("Admin Product API - Update error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("Admin Product API - Deleting product:", params.id);

    // Get authentication headers from middleware
    const userEmail = request.headers.get("x-nextauth-user-email");
    const userRole = request.headers.get("x-nextauth-user-role");

    // Check if user is authenticated and is admin
    if (!userEmail) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (userRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Check if product exists
    const existingProduct = await db.product.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check if product has associated orders
    if (existingProduct._count.orderItems > 0) {
      return NextResponse.json(
        { 
          error: "Cannot delete product with existing orders",
          message: "This product has been ordered and cannot be deleted. Consider marking it as out of stock instead."
        },
        { status: 400 }
      );
    }

    // Delete product (this will cascade delete variants)
    await db.product.delete({
      where: {
        id: params.id,
      },
    });

    console.log(`Admin Product API - Deleted product ${params.id}`);

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Admin Product API - Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
