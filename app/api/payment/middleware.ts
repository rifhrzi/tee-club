export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function withPaymentAuth(
  request: Request,
  handler: (userId: string, user: any) => Promise<NextResponse>
) {
  try {
    const userId = request.headers.get("x-nextauth-user-id");
    const userEmail = request.headers.get("x-nextauth-user-email");

    console.log("Payment API - Authentication info:", {
      "x-nextauth-user-id": userId,
      "x-nextauth-user-email": userEmail
    });

    if (!userId) {
      console.log("Payment API - No NextAuth user ID, returning 401");
      return NextResponse.json({
        error: "Unauthorized",
        message: "Authentication required. Please log in to continue.",
        code: "AUTH_REQUIRED"
      }, {
        status: 401,
        headers: {
          'Cache-Control': 'no-store, max-age=0'
        }
      });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.log("Payment API - User not found for ID:", userId);
      return NextResponse.json({
        error: "User not found",
        message: "The user associated with this authentication could not be found",
        code: "USER_NOT_FOUND"
      }, {
        status: 404,
        headers: {
          'Cache-Control': 'no-store, max-age=0'
        }
      });
    }

    console.log("Payment API - Authenticated request for user:", user.email);

    return await handler(userId, user);
  } catch (error) {
    console.error("Payment middleware error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Internal server error", message: errorMessage }, { status: 500 });
  }
}