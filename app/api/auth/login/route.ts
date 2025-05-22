import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { generateAuthTokens } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    console.log('Login API: Received login request');
    const body = await request.json();
    console.log('Login API: Received body:', body);

    const { email, password } = body;
    if (!email || !password) {
      console.log('Login API: Missing email or password');
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    console.log('Login API: Looking up user with email:', email);
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('Login API: User not found');
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    console.log('Login API: Verifying password');
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('Login API: Invalid password');
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    console.log(`Login API: Authentication successful for user: ${user.email}`);
    const { accessToken, refreshToken } = await generateAuthTokens(user.id);

    console.log('Login API: Tokens generated successfully');
    const response = NextResponse.json({ accessToken, refreshToken });
    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login API: Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Internal server error', message: errorMessage }, { status: 500 });
  }
}