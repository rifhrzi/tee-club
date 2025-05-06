import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "USER";
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  expiresAt: number | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => void;
  isSessionExpired: () => boolean;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      expiresAt: null,

      login: async (email: string, password: string, rememberMe = false) => {
        try {
          console.log("Auth: Attempting login for:", email, "Remember me:", rememberMe);

          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const error = await response.json();
            console.error("Auth: Login failed:", error);
            throw new Error(error.error || "Login failed");
          }

          const data = await response.json();
          console.log("Auth: Login successful");
          console.log("Auth: User data received:", data.user);

          // Set expiration to 7 days (matching server logic)
          const expirationTime = Date.now() + 7 * 24 * 60 * 60 * 1000;

          // Update auth state with user data and token
          set({
            isAuthenticated: true,
            user: data.user,
            token: data.accessToken,
            expiresAt: expirationTime,
          });

          // Update the auth-storage cookie to sync with the server
          document.cookie = `auth-storage=${JSON.stringify({
            state: {
              isAuthenticated: true,
              user: {
                ...data.user,
                role: data.user.role || "USER", // Ensure userRole is set
              },
            },
          })}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`; // 7 days expiration

          return true;
        } catch (error) {
          console.error("Auth: Login error:", error);
          set({ isAuthenticated: false, user: null, token: null, expiresAt: null });
          throw error;
        }
      },

      logout: () => {
        console.log("Auth: Logging out");

        // Clear the state
        set({ isAuthenticated: false, user: null, token: null, expiresAt: null });

        // Clear the cookie by setting it to expire in the past
        if (typeof document !== 'undefined') {
          // Clear the cookie in multiple ways to ensure it's removed
          document.cookie = "auth-storage=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
          document.cookie = "auth-storage=; path=/; max-age=0; SameSite=Lax";

          // Also clear localStorage
          localStorage.removeItem('auth-storage');

          // For backward compatibility, also clear the old cookie and localStorage
          document.cookie = "simple-auth-storage=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
          document.cookie = "simple-auth-storage=; path=/; max-age=0; SameSite=Lax";
          localStorage.removeItem('simple-auth-storage');

          console.log("Auth: Cookie and localStorage cleared");

          // Force a page reload to ensure all components update
          setTimeout(() => {
            console.log("Auth: Reloading page to refresh state");
            window.location.href = '/';
          }, 100);
        }
      },

      isSessionExpired: () => {
        const { expiresAt } = get();
        if (!expiresAt) return false;

        const now = Date.now();
        const isExpired = now > expiresAt;

        if (isExpired) {
          console.log("Auth: Session has expired");
          // Auto logout if session is expired
          set({ isAuthenticated: false, user: null, token: null, expiresAt: null });
        }

        return isExpired;
      },
    }),
    {
      name: "auth-storage", // Changed from simple-auth-storage for consistency
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
        expiresAt: state.expiresAt,
      }),
    }
  )
);

// For backward compatibility
export const useSimpleAuth = useAuth;
