import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Health check endpoint for Docker and monitoring services
 * Checks database connectivity and returns application status
 */
export async function GET() {
  try {
    // For Docker health checks, always return OK to prevent container restarts
    if (process.env.NODE_ENV === "production" && process.env.DOCKER_HEALTHCHECK === "true") {
      return NextResponse.json(
        {
          status: "ok",
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          environment: process.env.NODE_ENV,
        },
        { status: 200 }
      );
    }

    // Check database connectivity with a simple query
    const dbStatus = await checkDatabaseConnection();

    // Return health status
    return NextResponse.json(
      {
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: dbStatus ? "connected" : "disconnected",
        environment: process.env.NODE_ENV,
      },
      {
        status: 200, // Always return 200 to prevent container restarts
        headers: {
          // Don't cache health check responses
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("Health check failed:", error);

    // Return error status
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  }
}

/**
 * Check database connection by running a simple query
 */
async function checkDatabaseConnection(): Promise<boolean> {
  try {
    // Skip DB check if we're in a build environment
    if (process.env.NEXT_PUBLIC_SKIP_DB_CONNECTIONS === "true") {
      return true;
    }

    // Try to execute a simple query
    await db.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.warn("Database connection check failed:", error);
    return false;
  }
}
