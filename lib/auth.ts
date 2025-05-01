import jwt from "jsonwebtoken";

// Get JWT configuration from environment variables with fallbacks
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

interface TokenPayload {
  userId: string;
  type?: "access" | "refresh";
}

export function signToken(payload: TokenPayload, type: "access" | "refresh" = "access"): string {
  const secret = type === "access" ? JWT_SECRET : JWT_REFRESH_SECRET;
  const expiresIn = type === "access" ? JWT_EXPIRES_IN : JWT_REFRESH_EXPIRES_IN;

  return jwt.sign({ ...payload, type }, secret, {
    expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
  });
}

export function verifyToken(token: string, type: "access" | "refresh" = "access"): TokenPayload {
  try {
    const secret = type === "access" ? JWT_SECRET : JWT_REFRESH_SECRET;
    const decoded = jwt.verify(token, secret) as TokenPayload;

    // Verify that the token type matches the expected type
    if (decoded.type !== type) {
      throw new Error(`Invalid token type: expected ${type}, got ${decoded.type}`);
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error(`${type.charAt(0).toUpperCase() + type.slice(1)} token expired`);
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error(`Invalid ${type} token`);
    }
    throw error;
  }
}

export function generateAuthTokens(userId: string) {
  return {
    accessToken: signToken({ userId }, "access"),
    refreshToken: signToken({ userId }, "refresh"),
  };
}
