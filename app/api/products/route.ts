import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export async function GET(request: Request) {
  try {
    // Add logging for debugging
    console.log("API: /api/products - Fetching products");

    // Add query parameter support for filtering and pagination
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!) : undefined;
    const skip = page && limit ? (page - 1) * limit : undefined;

    // Build query options
    const queryOptions: any = {
      include: {
        variants: true,
      },
    };

    // Add pagination if parameters are provided
    if (limit) {
      queryOptions.take = limit;
    }

    if (skip) {
      queryOptions.skip = skip;
    }

    // Execute query with proper error handling
    const products = await db.product.findMany(queryOptions);

    // Log success
    console.log(`API: /api/products - Successfully fetched ${products.length} products`);

    // Return products with proper headers
    return NextResponse.json(products, {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    // Handle specific Prisma errors
    if (error instanceof PrismaClientKnownRequestError) {
      console.error(`API: /api/products - Prisma error ${error.code}:`, error.message);

      // Handle specific error codes
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Database constraint violation", code: error.code },
          { status: 400 }
        );
      } else if (error.code === "P2025") {
        return NextResponse.json({ error: "Record not found", code: error.code }, { status: 404 });
      }
    }

    // Log the error for debugging
    console.error("API: /api/products - Failed to fetch products:", error);

    // Return a generic error response
    return NextResponse.json(
      {
        error: "Failed to fetch products",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
