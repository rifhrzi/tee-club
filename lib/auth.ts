import { SignJWT, jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

interface DbUser {
  id: string;
  email: string;
  name: string;
  role: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

interface JwtPayload {
  userId: string;
  role: string;
}

export async function generateAuthTokens(userId: string, role: string) {
  const accessToken = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(JWT_SECRET);

  const refreshToken = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { accessToken, refreshToken };
}

export async function verifyToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET);
  return payload as unknown as JwtPayload;
}

export async function verifyAuth(request: NextRequest) {
  const token = request.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    return null;
  }

  try {
    const payload = await verifyToken(token);
    const user = (await prisma.user.findUnique({
      where: { id: payload.userId },
    })) as DbUser | null;

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  } catch (error) {
    return null;
  }
}

export async function refreshAccessToken(refreshToken: string) {
  try {
    const payload = await verifyToken(refreshToken);
    const token = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!token || token.expiresAt < new Date()) {
      return null;
    }

    const user = (await prisma.user.findUnique({
      where: { id: payload.userId },
    })) as DbUser | null;

    if (!user) {
      return null;
    }

    const { accessToken } = await generateAuthTokens(user.id, user.role);
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  } catch (error) {
    return null;
  }
}
