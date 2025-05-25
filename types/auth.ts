export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
}

export interface PersistedAuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
}

export interface TokenPayload {
  userId?: string; // Allow userId from JWT
  id?: string; // Allow id as fallback
  role?: string; // Optional role
  type?: string; // Seen in logs (e.g., 'access')
  iat?: number; // Issued at
  exp?: number; // Expiration
}