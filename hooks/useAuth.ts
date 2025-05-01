import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: {
    id: string
    email: string
    name: string
  } | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshTokens: () => Promise<void>
}

// Helper to check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Helper to safely parse JSON with a fallback
const safelyParseJSON = (json: string | null, fallback = {}) => {
  if (!json) return fallback;
  try {
    return JSON.parse(json);
  } catch (e) {
    console.error('Failed to parse JSON:', e);
    return fallback;
  }
};

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,

      login: async (email: string, password: string) => {
        try {
          console.log('Auth: Attempting login for:', email);

          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const error = await response.json();
            console.error('Auth: Login failed:', error);
            throw new Error(error.error || 'Login failed');
          }

          const data = await response.json();
          console.log('Auth: Login successful');

          // Update the auth state
          set({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            user: data.user,
          });

          // Set a flag in localStorage to indicate successful login
          if (isBrowser) {
            localStorage.setItem('auth_timestamp', Date.now().toString());
            // Also store the tokens in localStorage as a backup
            localStorage.setItem('auth_tokens', JSON.stringify({
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
            }));
          }

          return data;
        } catch (error) {
          console.error('Auth: Login error:', error);
          set({ accessToken: null, refreshToken: null, user: null });
          throw error;
        }
      },

      logout: () => {
        console.log('Auth: Logging out');
        set({ accessToken: null, refreshToken: null, user: null });

        // Clear backup tokens from localStorage
        if (isBrowser) {
          localStorage.removeItem('auth_timestamp');
          localStorage.removeItem('auth_tokens');
        }
      },

      refreshTokens: async () => {
        // First try to get the refresh token from the store
        let { refreshToken } = get();

        // If no refresh token in the store, try to get it from localStorage
        if (!refreshToken && isBrowser) {
          const storedTokens = safelyParseJSON(localStorage.getItem('auth_tokens'), {});
          refreshToken = storedTokens.refreshToken || null;
        }

        if (!refreshToken) {
          console.log('Auth: No refresh token available');
          return;
        }

        try {
          console.log('Auth: Attempting to refresh tokens...');
          const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error('Auth: Token refresh failed:', errorData);
            throw new Error(errorData.error || 'Failed to refresh token');
          }

          const data = await response.json();
          console.log('Auth: Tokens refreshed successfully');

          // Update the auth state
          set({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            user: data.user || get().user, // Keep the user if not returned
          });

          // Update the backup tokens in localStorage
          if (isBrowser) {
            localStorage.setItem('auth_tokens', JSON.stringify({
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
            }));
          }

          return data;
        } catch (error) {
          console.error('Auth: Token refresh error:', error);

          // Only clear auth state for certain errors
          if (error instanceof Error &&
              (error.message.includes('Invalid token') ||
               error.message.includes('expired'))) {
            console.log('Auth: Clearing auth state due to invalid/expired token');
            set({ accessToken: null, refreshToken: null, user: null });

            // Clear backup tokens from localStorage
            if (isBrowser) {
              localStorage.removeItem('auth_timestamp');
              localStorage.removeItem('auth_tokens');
            }
          }

          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => {
        // Only use localStorage in browser environment
        return isBrowser ? localStorage : {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {}
        }
      }),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
      // Only rehydrate on client side
      skipHydration: true,
    }
  )
)