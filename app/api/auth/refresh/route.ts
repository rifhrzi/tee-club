import { NextResponse } from "next/server";
import { verifyToken, generateAuthTokens } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      );
    }

    // Verify the refresh token
    const decoded = verifyToken(refreshToken, 'refresh');
    
    // Check if token exists in database
    const storedToken = await db.refreshToken.findUnique({
      where: { token: refreshToken }
    });

    if (!storedToken) {
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Generate new tokens
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = 
      generateAuthTokens(decoded.userId);

    // Update refresh token in database
    await db.refreshToken.update({
      where: { id: storedToken.id },
      data: { token: newRefreshToken }
    });

    return NextResponse.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid refresh token' },
      { status: 401 }
    );
  }
}