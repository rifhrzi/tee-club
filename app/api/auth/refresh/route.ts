export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken, generateAuthTokens } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

interface RefreshRequestBody {
  refreshToken: string;
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "anonymous";
    const { success } = await rateLimit(ip, 'auth');
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body: RefreshRequestBody = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token is required" },
        { status: 400 }
      );
    }

    let payload;
    try {
      payload = await verifyToken(refreshToken, 'refresh');
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid refresh token" },
        { status: 401 }
      );
    }

    const storedToken = await db.refreshToken.findFirst({
      where: {
        token: refreshToken,
        userId: payload.userId,
        expiresAt: { gt: new Date() },
      },
    });

    if (!storedToken) {
      return NextResponse.json(
        { error: "Invalid refresh token" },
        { status: 401 }
      );
    }

    await db.refreshToken.delete({
      where: { id: storedToken.id },
    });

    const { accessToken, refreshToken: newRefreshToken } = await generateAuthTokens(payload.userId);

    await db.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: payload.userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true },
    });

    return NextResponse.json({
      accessToken,
      refreshToken: newRefreshToken,
      user,
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to refresh token", message: errorMessage },
      { status: 500 }
    );
  }
}