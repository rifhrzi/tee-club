import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateAuthTokens } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'anonymous'
    const { success } = await rateLimit(ip, 'auth')
    if (!success) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { email, password } = body

    const user = await db.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateAuthTokens(user.id)

    // Store refresh token
    await db.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    })

    // Return user data and tokens
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      accessToken,
      refreshToken
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}

