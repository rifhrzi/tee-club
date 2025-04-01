import { NextResponse } from "next/server";
import { signToken } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  
  const user = await db.user.findUnique({
    where: { email }
  });

  if (!user || user.password !== password) { // Note: Use proper password hashing in production
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }

  const token = signToken({ userId: user.id });
  return NextResponse.json({ token });
}
