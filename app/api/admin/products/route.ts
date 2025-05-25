import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { AdminProductsResponse, CreateProductForm } from "@/types/admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    console.log("Admin Products API - Fetching products");

    // Get authentication headers from middleware
    const userEmail = request.headers.get("x-nextauth-user-email");
    const userRole = request.headers.get("x-nextauth-user-role");

    console.log("Admin Products API - Auth info:", { userEmail, userRole });

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

    // Parse query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const search = url.searchParams.get("search");
    const lowStock = url.searchParams.get("lowStock") === "true";
    const sortBy = url.searchParams.get("sortBy") || "createdAt";
    const sortOrder = url.searchParams.get("sortOrder") || "desc";

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (lowStock) {
      where.stock = {
        lt: 10,
      };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build order by clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Fetch products with pagination
    const [products, totalCount] = await Promise.all([
      db.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          variants: true,
          _count: {
            select: {
              orderItems: true,
            },
          },
        },
      }),
      db.product.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    console.log(`Admin Products API - Found ${products.length} products (page ${page}/${totalPages})`);

    const response: AdminProductsResponse = {
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Admin Products API - Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("Admin Products API - Creating new product");

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

    const body: CreateProductForm = await request.json();
    const { name, description, price, stock, images, variants } = body;

    // Validate required fields
    if (!name || !description || price === undefined || stock === undefined) {
      return NextResponse.json(
        { error: "Name, description, price, and stock are required" },
        { status: 400 }
      );
    }

    if (price < 0 || stock < 0) {
      return NextResponse.json(
        { error: "Price and stock must be non-negative" },
        { status: 400 }
      );
    }

    // Create product with variants
    const newProduct = await db.product.create({
      data: {
        name,
        description,
        price,
        stock,
        images: images || [],
        variants: variants ? {
          create: variants.map(variant => ({
            name: variant.name,
            price: variant.price,
            stock: variant.stock,
          }))
        } : undefined,
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

    console.log(`Admin Products API - Created product ${newProduct.id}: ${newProduct.name}`);

    return NextResponse.json({
      success: true,
      data: newProduct,
      message: "Product created successfully",
    });
  } catch (error) {
    console.error("Admin Products API - Create error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    console.log("Admin Products API - Updating product");

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
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

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

    // Update product
    const updatedProduct = await db.product.update({
      where: {
        id,
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

    console.log(`Admin Products API - Updated product ${id}`);

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error("Admin Products API - Update error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}
