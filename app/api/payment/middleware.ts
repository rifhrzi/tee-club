export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function withPaymentAuth(
  request: Request,
  handler: (userId: string, user: any) => Promise<NextResponse>
) {
  try {
    const userId = request.headers.get("x-user-id");
    const authType = request.headers.get("x-auth-type") || "unknown";
    const nextAuthUserId = request.headers.get("X-NextAuth-User-ID");

    console.log("Payment API - Authentication info:", {
      "x-user-id": userId,
      "x-auth-type": authType,
      "X-NextAuth-User-ID": nextAuthUserId
    });

    if (!userId) {
      console.log("Payment API - No user ID, returning 401");
      return NextResponse.json({
        error: "Unauthorized",
        message: "Authentication required. Please log in to continue."
      }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.log("Payment API - User not found for ID:", userId);
      return NextResponse.json({
        error: "User not found",
        message: "The user associated with this authentication could not be found"
      }, { status: 404 });
    }

    console.log("Payment API - Authenticated request for user:", user.email, "using auth type:", authType);

    return await handler(userId, user);
  } catch (error) {
    console.error("Payment middleware error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Internal server error", message: errorMessage }, { status: 500 });
  }
}