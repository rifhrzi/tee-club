import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DashboardStats, AdminDashboardResponse } from "@/types/admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    console.log("Admin Dashboard API - Fetching dashboard data");

    // Get authentication headers from middleware
    const userEmail = request.headers.get("x-nextauth-user-email");
    const userRole = request.headers.get("x-nextauth-user-role");

    console.log("Admin Dashboard API - Auth info:", { userEmail, userRole });

    // Check if user is authenticated and is admin
    if (!userEmail) {
      console.log("Admin Dashboard API - No user email found in headers");
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    if (userRole !== "ADMIN") {
      console.log("Admin Dashboard API - User is not admin:", userRole);
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Test database connection
    console.log("Admin Dashboard API - Testing database connection");
    try {
      await db.$connect();
      console.log("Admin Dashboard API - Database connection successful");
    } catch (dbError) {
      console.error("Admin Dashboard API - Database connection failed:", dbError);
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    // Calculate date ranges for comparison
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Fetch current month stats
    const [
      totalOrders,
      totalRevenue,
      newCustomers,
      productsSold,
      lastMonthOrders,
      lastMonthRevenue,
      lastMonthCustomers,
      lastMonthProductsSold,
      recentOrders,
      lowStockProducts,
      recentCustomers,
    ] = await Promise.all([
      // Current month orders
      db.order.count({
        where: {
          createdAt: {
            gte: startOfMonth,
          },
        },
      }),

      // Current month revenue
      db.order.aggregate({
        where: {
          createdAt: {
            gte: startOfMonth,
          },
          status: {
            in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"],
          },
        },
        _sum: {
          totalAmount: true,
        },
      }),

      // New customers this month
      db.user.count({
        where: {
          createdAt: {
            gte: startOfMonth,
          },
          role: "USER",
        },
      }),

      // Products sold this month
      db.orderItem.aggregate({
        where: {
          order: {
            createdAt: {
              gte: startOfMonth,
            },
            status: {
              in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"],
            },
          },
        },
        _sum: {
          quantity: true,
        },
      }),

      // Last month orders for comparison
      db.order.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
      }),

      // Last month revenue for comparison
      db.order.aggregate({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
          status: {
            in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"],
          },
        },
        _sum: {
          totalAmount: true,
        },
      }),

      // Last month customers for comparison
      db.user.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
          role: "USER",
        },
      }),

      // Last month products sold for comparison
      db.orderItem.aggregate({
        where: {
          order: {
            createdAt: {
              gte: startOfLastMonth,
              lte: endOfLastMonth,
            },
            status: {
              in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"],
            },
          },
        },
        _sum: {
          quantity: true,
        },
      }),

      // Recent orders (last 5) - include all required fields for AdminOrder type
      db.order.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                },
              },
              variant: true,
            },
          },
          shippingDetails: true,
          paymentDetails: true,
        },
      }),

      // Low stock products - get all products and filter by total stock
      db.product.findMany({
        include: {
          variants: true,
          _count: {
            select: {
              orderItems: true,
            },
          },
        },
      }),

      // Recent customers (last 5)
      db.user.findMany({
        where: {
          role: "USER",
        },
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          _count: {
            select: {
              orders: true,
            },
          },
        },
      }),
    ]);

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const stats: DashboardStats = {
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      newCustomers,
      productsSold: productsSold._sum.quantity || 0,
      ordersChange: calculateChange(totalOrders, lastMonthOrders),
      revenueChange: calculateChange(
        totalRevenue._sum.totalAmount || 0,
        lastMonthRevenue._sum.totalAmount || 0
      ),
      customersChange: calculateChange(newCustomers, lastMonthCustomers),
      productsSoldChange: calculateChange(
        productsSold._sum.quantity || 0,
        lastMonthProductsSold._sum.quantity || 0
      ),
    };

    console.log("Admin Dashboard API - Stats calculated:", stats);

    // Filter and sort low stock products based on total stock (including variants)
    const filteredLowStockProducts = lowStockProducts
      .map(product => {
        // Calculate total stock from variants if they exist, otherwise use main stock
        const totalStock = product.variants.length > 0
          ? product.variants.reduce((total, variant) => total + variant.stock, 0)
          : product.stock;

        return {
          ...product,
          totalStock, // Add calculated total stock for sorting
        };
      })
      .filter(product => product.totalStock < 10) // Filter by total stock < 10
      .sort((a, b) => a.totalStock - b.totalStock) // Sort by total stock ascending
      .slice(0, 5); // Take only first 5

    console.log("Admin Dashboard API - Low stock products filtered:", filteredLowStockProducts.length);

    const response: AdminDashboardResponse = {
      success: true,
      data: {
        stats,
        recentOrders,
        lowStockProducts: filteredLowStockProducts,
        recentCustomers,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Admin Dashboard API - Error:", error);

    // Provide more detailed error information
    let errorMessage = "Failed to fetch dashboard data";
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error("Admin Dashboard API - Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  }
}
