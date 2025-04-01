import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key'

interface TokenPayload {
  userId: string
  type?: 'access' | 'refresh'
}

export function signToken(payload: TokenPayload, type: 'access' | 'refresh' = 'access'): string {
  const secret = type === 'access' ? JWT_SECRET : JWT_REFRESH_SECRET
  const expiresIn = type === 'access' ? '15m' : '7d'
  
  return jwt.sign({ ...payload, type }, secret, { expiresIn })
}

export function verifyToken(token: string, type: 'access' | 'refresh' = 'access'): TokenPayload {
  const secret = type === 'access' ? JWT_SECRET : JWT_REFRESH_SECRET
  return jwt.verify(token, secret) as TokenPayload
}

export function generateAuthTokens(userId: string) {
  return {
    accessToken: signToken({ userId }, 'access'),
    refreshToken: signToken({ userId }, 'refresh')
  }
}
