import { create } from 'zustand';
import { persist, PersistStorage, StorageValue } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean; // Add loading state
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isSessionExpired: () => boolean;
  initializeAuth: () => Promise<void>; // Add initialization method
}

interface PersistedAuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
}

const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      isLoading: true, // Initialize as loading
      user: null,
      token: null,
      refreshToken: null,
      login: async (email: string, password: string) => {
        try {
          console.log('Attempting login with:', { email });
          set({ isLoading: true });

          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error('Login response error:', errorData);
            throw new Error(errorData.error || 'Login failed');
          }

          const data: { user: User; accessToken: string; refreshToken: string } = await response.json();
          console.log('Login successful, received data:', {
            user: data.user,
            hasAccessToken: !!data.accessToken,
            hasRefreshToken: !!data.refreshToken,
          });

          set({
            isAuthenticated: true,
            isLoading: false,
            user: data.user,
            token: data.accessToken,
            refreshToken: data.refreshToken,
          });
        } catch (error) {
          set({ isLoading: false });
          console.error('Login error:', error);
          throw error;
        }
      },
      logout: () => {
        if (typeof document !== 'undefined') {
          const cookiesToClear = ['auth-storage', 'auth_token', 'auth_user', 'debug-token'];
          cookiesToClear.forEach((name) => {
            document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`;
          });
          localStorage.removeItem('auth-storage');
          console.log('Auth: Cleared all auth cookies and localStorage');
        }

        set({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          token: null,
          refreshToken: null,
        });
      },
      isSessionExpired: () => {
        const { token } = get();
        if (!token) return true;

        try {
          const parts = token.split('.');
          if (parts.length !== 3) return true;

          const payload = JSON.parse(atob(parts[1]));
          const expiry = payload.exp * 1000;
          return Date.now() > expiry;
        } catch (e) {
          console.error('Error checking token expiry:', e);
          return true;
        }
      },
      initializeAuth: async () => {
        try {
          set({ isLoading: true });
          const storedState = get().refreshToken;
          if (storedState) {
            // Validate session with API
            const response = await fetch('/api/auth/session', {
              headers: { Authorization: `Bearer ${get().token}` },
            });

            if (response.ok) {
              const data = await response.json();
              set({
                isAuthenticated: true,
                isLoading: false,
                user: data.user,
                token: data.accessToken,
                refreshToken: data.refreshToken,
              });
            } else {
              set({ isAuthenticated: false, isLoading: false, user: null, token: null, refreshToken: null });
            }
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          set({ isAuthenticated: false, isLoading: false, user: null, token: null, refreshToken: null });
          console.error('Initialize auth error:', error);
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state: AuthState): PersistedAuthState => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
      }),
      storage: {
        getItem: (name: string): StorageValue<PersistedAuthState> | null => {
          if (typeof window !== 'undefined') {
            const item = localStorage.getItem(name);
            if (item) {
              return JSON.parse(item) as StorageValue<PersistedAuthState>;
            }
          }
          return null;
        },
        setItem: (name: string, value: StorageValue<PersistedAuthState>): void => {
          if (typeof window !== 'undefined') {
            const serializedValue = JSON.stringify(value);
            localStorage.setItem(name, serializedValue);
            const cookieValue = encodeURIComponent(serializedValue);
            document.cookie = `${name}=${cookieValue}; Path=/; Max-Age=2592000; SameSite=Strict; ${process.env.NODE_ENV === 'production' ? 'Secure' : ''}`;
            console.log('Auth: Set auth cookie and localStorage');
          }
        },
        removeItem: (name: string): void => {
          if (typeof window !== 'undefined') {
            localStorage.removeItem(name);
            document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`;
            console.log('Auth: Removed auth cookie and localStorage');
          }
        },
      } as PersistStorage<PersistedAuthState>,
    }
  )
);

export default useAuth;