import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateAuthTokens } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Define the schema for the request body using zod
const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
});

// Infer the TypeScript type from the schema
type LoginRequestBody = z.infer<typeof loginSchema>;

export async function POST(request: Request) {
  try {
    // Apply rate limiting based on IP
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const { success } = await rateLimit(ip, 'auth');
    if (!success) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse and validate the request body
    const rawBody = await request.json();
    let body: LoginRequestBody;
    try {
      body = loginSchema.parse(rawBody);
    } catch (validationError) {
      return NextResponse.json(
        { error: 'Invalid input', details: (validationError as z.ZodError).errors },
        { status: 400 }
      );
    }

    // Extract validated email and password
    const { email, password } = body;

    // Find the user in the database
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify the password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate authentication tokens
    const { accessToken, refreshToken } = generateAuthTokens(user.id);

    // Store the refresh token in the database
    await db.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Return success response with user data and tokens
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}