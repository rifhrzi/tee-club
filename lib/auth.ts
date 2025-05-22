
import * as jose from 'jose';
import { AuthOptions, Session } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { JWT } from 'next-auth/jwt';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

interface CustomUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface TokenPayload {
  userId: string;
  role?: string;
  [key: string]: any;
}

export async function verifyToken(token: string, type: 'access' | 'refresh'): Promise<TokenPayload> {
  try {
    const secret = type === 'access' ? process.env.JWT_ACCESS_SECRET : process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      throw new Error('JWT secret not configured');
    }
    const { payload } = await jose.jwtVerify(token, new TextEncoder().encode(secret));
    return payload as TokenPayload;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Invalid ${type} token: ${errorMessage}`);
  }
}

export async function generateAuthTokens(userId: string): Promise<{ accessToken: string; refreshToken: string }> {
  try {
    const accessSecret = process.env.JWT_ACCESS_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;

    if (!accessSecret || !refreshSecret) {
      throw new Error('JWT secrets not configured');
    }

    const accessToken = await new jose.SignJWT({ userId })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(new TextEncoder().encode(accessSecret));

    const refreshToken = await new jose.SignJWT({ userId })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(new TextEncoder().encode(refreshSecret));

    return { accessToken, refreshToken };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to generate tokens: ${errorMessage}`);
  }
}

export const authOptions: AuthOptions = {
  debug: process.env.NODE_ENV === 'development',
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: Record<string, string> | undefined) {
        try {
          console.log('NextAuth: authorize called with credentials', credentials ? credentials.email : 'none');

          if (!credentials || !credentials.email || !credentials.password) {
            console.log('NextAuth: Missing credentials');
            return null;
          }

          const user = await db.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            console.log('NextAuth: User not found');
            return null;
          }

          const isValidPassword = await bcrypt.compare(credentials.password, user.password);

          if (!isValidPassword) {
            console.log('NextAuth: Invalid password');
            return null;
          }

          console.log('NextAuth: Authentication successful for user:', user.email);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error('NextAuth: Authentication error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          throw new Error(`Authentication failed: ${errorMessage}`);
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log('NextAuth: Setting JWT token with user data', user.email);
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        console.log('NextAuth: Setting session with token data', token.email);
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
