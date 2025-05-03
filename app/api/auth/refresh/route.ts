import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken, generateAuthTokens } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || "anonymous";
    const { success } = await rateLimit(ip, "auth");
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json({ error: "Refresh token is required" }, { status: 400 });
    }

    // Verify the refresh token
    let payload;
    try {
      payload = await verifyToken(refreshToken);
    } catch (error) {
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
    }

    // Check if the token exists in the database
    const storedToken = await db.refreshToken.findFirst({
      where: {
        token: refreshToken,
        userId: payload.userId,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!storedToken) {
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
    }

    // Delete the old refresh token
    try {
      await db.refreshToken.delete({
        where: {
          id: storedToken.id,
        },
      });
      console.log("Deleted old refresh token:", storedToken.id);
    } catch (error) {
      console.error("Error deleting refresh token:", error);
      // Continue even if deletion fails
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = await generateAuthTokens(
      payload.userId,
      payload.role
    );

    // Store the new refresh token
    try {
      // First, try to find and delete any existing tokens with the same value
      // This handles the case where a token might already exist
      try {
        const existingToken = await db.refreshToken.findFirst({
          where: { token: newRefreshToken },
        });

        if (existingToken) {
          console.log("Found existing token with same value, deleting it first");
          await db.refreshToken.delete({
            where: { id: existingToken.id },
          });
        }
      } catch (error) {
        console.error("Error checking for existing token:", error);
        // Continue even if this fails
      }

      // Now create the new token
      await db.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: payload.userId,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      console.log("Created new refresh token successfully");
    } catch (error) {
      console.error("Error creating refresh token:", error);
      // If we can't create a new token, we'll just return the tokens without storing them
      // This is not ideal but allows the user to continue using the app
    }

    // Get user data
    const user = await db.user.findUnique({
      where: {
        id: payload.userId,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    // Return new tokens
    return NextResponse.json({
      accessToken,
      refreshToken: newRefreshToken,
      user,
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json({ error: "Failed to refresh token" }, { status: 500 });
  }
}
