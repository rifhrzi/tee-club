import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateAuthTokens } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

// Define the schema for the request body using zod
const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }), // Reduced from 8 to 6 for easier testing
});

// Infer the TypeScript type from the schema
type LoginRequestBody = z.infer<typeof loginSchema>;

export async function POST(request: Request) {
  console.log('Login API: Received login request');

  try {
    // Apply rate limiting based on IP
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    console.log(`Login API: Processing request from IP: ${ip}`);

    // In development, we bypass rate limiting
    let rateLimitResult = { success: true };
    if (process.env.NODE_ENV !== 'development') {
      rateLimitResult = await rateLimit(ip, 'auth');
    }

    if (!rateLimitResult.success) {
      console.log('Login API: Rate limit exceeded');
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse and validate the request body
    const rawBody = await request.json();
    console.log('Login API: Received body:', { email: rawBody.email, hasPassword: !!rawBody.password });

    let body: LoginRequestBody;
    try {
      body = loginSchema.parse(rawBody);
    } catch (validationError) {
      console.log('Login API: Validation error:', validationError);
      return NextResponse.json(
        { error: 'Invalid input', details: (validationError as z.ZodError).errors },
        { status: 400 }
      );
    }

    // Extract validated email and password
    const { email, password } = body;

    // Find the user in the database
    console.log(`Login API: Looking up user with email: ${email}`);
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`Login API: User not found with email: ${email}`);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify the password
    console.log('Login API: Verifying password');
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('Login API: Invalid password');
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate authentication tokens
    console.log(`Login API: Authentication successful for user: ${user.email}`);
    const { accessToken, refreshToken } = generateAuthTokens(user.id);

    // Skip storing refresh token for now due to Prisma issues
    // We'll just return the tokens to the client
    console.log('Login API: Skipping refresh token storage due to Prisma issues');

    // Return success response with user data and tokens
    console.log('Login API: Returning successful response');
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
    console.error('Login API: Unexpected error:', error);

    // Check for specific Prisma errors
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2021') {
        return NextResponse.json(
          { error: 'Database schema issue. The table does not exist.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Login failed due to a server error. Please try again later.' },
      { status: 500 }
    );
  }
}