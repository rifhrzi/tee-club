import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '@/lib/db';
import { z } from 'zod';

// Validation schema for signup
const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(request: Request) {
  try {
    console.log('Signup API: Processing signup request');

    const body = await request.json();
    console.log('Signup API: Request body received for email:', body.email);

    // Validate input
    const validatedData = signupSchema.parse(body);
    const { name, email, password } = validatedData;

    console.log('Signup API: Validation passed for:', email);

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('Signup API: User already exists:', email);
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    console.log('Signup API: User does not exist, creating new user:', email);

    // Hash password
    const hashedPassword = await hash(password, 12);
    console.log('Signup API: Password hashed successfully');

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    console.log('Signup API: User created successfully:', user.id);

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error('Signup API: Error during signup:', error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      console.log('Signup API: Validation error:', error.errors);
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    // Handle database errors
    if (error instanceof Error) {
      console.error('Signup API: Database error:', error.message);
      
      // Check for unique constraint violation (duplicate email)
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 400 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}
