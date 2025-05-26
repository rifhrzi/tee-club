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
    console.log("Admin Product API - Update request body:", JSON.stringify(body, null, 2));

    // Extract variants data for separate handling
    const { variants, ...productData } = body;

    const updateData = { ...productData };
    delete updateData.id; // Remove id from update data
    delete updateData.createdAt; // Remove createdAt from update data
    delete updateData.updatedAt; // Remove updatedAt from update data
    delete updateData._count; // Remove _count from update data

    console.log("Admin Product API - Cleaned product data:", JSON.stringify(updateData, null, 2));
    console.log("Admin Product API - Variants data:", JSON.stringify(variants, null, 2));

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

    // Validate variants if provided
    if (variants && Array.isArray(variants)) {
      for (const variant of variants) {
        if (!variant.name || variant.name.trim() === "") {
          return NextResponse.json(
            { error: "Variant name is required" },
            { status: 400 }
          );
        }
        if (variant.price < 0) {
          return NextResponse.json(
            { error: "Variant price must be non-negative" },
            { status: 400 }
          );
        }
        if (variant.stock < 0) {
          return NextResponse.json(
            { error: "Variant stock must be non-negative" },
            { status: 400 }
          );
        }
      }
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

    // Update product and variants in a transaction
    console.log("Admin Product API - Attempting to update product with data:", updateData);

    const updatedProduct = await db.$transaction(async (tx) => {
      // Update the main product
      const product = await tx.product.update({
        where: {
          id: params.id,
        },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
      });

      // Handle variants if provided
      if (variants && Array.isArray(variants)) {
        console.log("Admin Product API - Processing variants update");

        // Get existing variants
        const existingVariants = await tx.variant.findMany({
          where: { productId: params.id },
        });

        // Delete variants that are no longer in the update
        const variantIdsToKeep = variants
          .filter(v => v.id)
          .map(v => v.id);

        const variantsToDelete = existingVariants.filter(
          v => !variantIdsToKeep.includes(v.id)
        );

        if (variantsToDelete.length > 0) {
          await tx.variant.deleteMany({
            where: {
              id: { in: variantsToDelete.map(v => v.id) },
            },
          });
          console.log(`Admin Product API - Deleted ${variantsToDelete.length} variants`);
        }

        // Update or create variants
        for (const variant of variants) {
          if (variant.id) {
            // Update existing variant
            await tx.variant.update({
              where: { id: variant.id },
              data: {
                name: variant.name,
                price: variant.price,
                stock: variant.stock,
                updatedAt: new Date(),
              },
            });
          } else {
            // Create new variant
            await tx.variant.create({
              data: {
                productId: params.id,
                name: variant.name,
                price: variant.price,
                stock: variant.stock,
              },
            });
          }
        }
        console.log(`Admin Product API - Processed ${variants.length} variants`);
      }

      // Return the updated product with variants
      return await tx.product.findUnique({
        where: { id: params.id },
        include: {
          variants: true,
          _count: {
            select: {
              orderItems: true,
            },
          },
        },
      });
    });

    console.log(`Admin Product API - Updated product ${params.id} successfully`);

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error("Admin Product API - Update error:", error);
    console.error("Admin Product API - Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown error type'
    });

    return NextResponse.json(
      {
        error: "Failed to update product",
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      },
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
