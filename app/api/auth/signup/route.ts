import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  try {
    console.log('Signup API: Received signup request');

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'anonymous'
    const { success } = await rateLimit(ip, 'auth')
    if (!success) {
      console.log('Signup API: Rate limit exceeded for IP:', ip);
      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { name, email, password } = body
    console.log('Signup API: Received signup request for email:', email);

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('Signup API: Email already registered:', email);
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    console.log('Signup API: Hashing password');
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    console.log('Signup API: Creating new user');
    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'USER' // Default role for new users
      }
    })
    console.log('Signup API: User created successfully:', user.id);

    console.log('Signup API: Returning success response');
    return NextResponse.json({
      message: 'Account created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })

  } catch (error) {
    console.error('Signup API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Signup API error details:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to create account', message: errorMessage },
      { status: 500 }
    )
  }
}