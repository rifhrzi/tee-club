import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";

export async function withPaymentAuth(
  request: Request,
  handler: (userId: string | null, user: any | null) => Promise<NextResponse>
) {
  try {
    // Check for authentication token
    let userId = null;
    let user = null;
    const token = request.headers.get("authorization")?.split(" ")[1];

    // If token exists, verify it and get the user
    if (token) {
      try {
        const decoded = await verifyToken(token);
        userId = decoded.userId;

        // Get user from database
        user = await db.user.findUnique({
          where: { id: userId },
        });

        console.log("Payment API - Authenticated request for user:", user?.email);
      } catch (error) {
        console.log("Payment API - Invalid token, proceeding as guest");
      }
    } else {
      console.log("Payment API - No token provided, proceeding as guest");
    }

    // Call the handler with the user ID and user object
    return await handler(userId, user);
  } catch (error) {
    console.error("Payment middleware error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
