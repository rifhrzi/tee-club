import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getToken } from 'next-auth/jwt';

const publicPaths = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/auth/[...nextauth]',
];

export async function middleware(request: NextRequest) {
  console.log('API Middleware - Processing request for:', request.nextUrl.pathname);

  if (publicPaths.includes(request.nextUrl.pathname) ||
      request.nextUrl.pathname.startsWith('/api/auth/')) {
    console.log('API Middleware - Public path, skipping auth check');
    return NextResponse.next();
  }

  // Log all cookies for debugging
  console.log('API Middleware - Request cookies:');
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      console.log(`  ${cookie.trim()}`);
    });
  } else {
    console.log('  No cookies found in request');
  }

  // First, try to get the NextAuth session token
  try {
    console.log('API Middleware - Checking for NextAuth session');
    const nextAuthToken = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production',
      cookieName: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
    });

    if (nextAuthToken) {
      console.log('API Middleware - Found NextAuth token for user:', nextAuthToken.email);
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', nextAuthToken.id as string);
      requestHeaders.set('x-auth-type', 'nextauth');

      // Add additional headers for debugging
      if (nextAuthToken.email) {
        requestHeaders.set('x-user-email', nextAuthToken.email as string);
      }
      if (nextAuthToken.name) {
        requestHeaders.set('x-user-name', nextAuthToken.name as string);
      }

      return NextResponse.next({
        request: {
          ...request,
          headers: requestHeaders,
        },
      });
    }

    console.log('API Middleware - No NextAuth token found, checking for Bearer token');
  } catch (error) {
    console.error('API Middleware - Error checking NextAuth token:', error);
    // Continue to check for Bearer token
  }

  // If no NextAuth token, check for Bearer token
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('API Middleware - No Bearer token found, returning 401');
    return NextResponse.json({
      error: 'Unauthorized',
      message: 'Authentication required. Please log in.'
    }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  if (!token || token.trim() === '') {
    console.log('API Middleware - Empty Bearer token, returning 401');
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  try {
    console.log('API Middleware - Verifying Bearer token');
    const decoded = await verifyToken(token, 'access');
    console.log('API Middleware - Valid Bearer token for user ID:', decoded.userId);

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.userId);
    requestHeaders.set('x-auth-type', 'bearer');

    return NextResponse.next({
      request: {
        ...request,
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('API Middleware - Bearer token verification error:', error);
    if (error instanceof Error) {
      if (error.name === 'TokenExpiredError') {
        return NextResponse.json(
          { error: 'Token expired', code: 'TOKEN_EXPIRED' },
          { status: 401 }
        );
      }
      return NextResponse.json({ error: `Invalid token: ${error.message}` }, { status: 401 });
    }
    return NextResponse.json({ error: 'Invalid token: Unknown error' }, { status: 401 });
  }
}

export const config = {
  matcher: '/api/:path*',
};