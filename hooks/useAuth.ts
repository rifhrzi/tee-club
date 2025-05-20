import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isSessionExpired: () => boolean;
}

interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      refreshToken: null,
      login: async (email: string, password: string) => {
        try {
          console.log("Attempting login with:", { email });

          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error("Login response error:", errorData);
            throw new Error(errorData.error || "Login failed");
          }

          const data: LoginResponse = await response.json();
          console.log("Login successful, received data:", {
            user: data.user,
            hasAccessToken: !!data.accessToken,
            hasRefreshToken: !!data.refreshToken,
          });

          // Set the state
          set({
            isAuthenticated: true,
            user: data.user,
            token: data.accessToken,
            refreshToken: data.refreshToken,
          });

          // Also set cookies directly for middleware access
          if (typeof document !== "undefined") {
            // Store token in a cookie that middleware can access
            const tokenCookie = `auth_token=${data.accessToken}; path=/; max-age=604800; SameSite=Lax`;
            document.cookie = tokenCookie;

            // Store user info in a cookie
            const userInfo = JSON.stringify({
              id: data.user.id,
              email: data.user.email,
              role: data.user.role || "USER",
            });
            const userCookie = `auth_user=${encodeURIComponent(
              userInfo
            )}; path=/; max-age=604800; SameSite=Lax`;
            document.cookie = userCookie;

            console.log("Auth: Set direct auth cookies for middleware access");
          }
        } catch (error) {
          console.error("Login error:", error);
          throw error;
        }
      },
      logout: () => {
        // Clear all auth-related cookies and localStorage
        if (typeof document !== "undefined") {
          // Clear all possible cookie variations
          const cookiesToClear = [
            "auth-storage",
            "auth_storage",
            "simple-auth-storage",
            "auth_token",
            "auth_user",
            "debug-token",
          ];

          cookiesToClear.forEach((name) => {
            document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
            document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
          });

          // Clear localStorage
          localStorage.removeItem("auth-storage");
          localStorage.removeItem("auth_storage");
          localStorage.removeItem("simple-auth-storage");

          console.log("Auth: Cleared all auth cookies and localStorage");
        }

        set({
          isAuthenticated: false,
          user: null,
          token: null,
          refreshToken: null,
        });
      },
      isSessionExpired: () => {
        const { token } = get();
        if (!token) return true;

        try {
          // Simple check - in a real app you'd verify the token
          // This just checks if there's a token that looks valid
          const parts = token.split(".");
          if (parts.length !== 3) return true;

          // Check expiration by decoding the payload
          const payload = JSON.parse(atob(parts[1]));
          const expiry = payload.exp * 1000; // Convert to milliseconds
          return Date.now() > expiry;
        } catch (e) {
          console.error("Error checking token expiry:", e);
          return true;
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
      }),
      // Ensure cookies are properly set with appropriate options
      storage: {
        getItem: (name) => {
          if (typeof window !== "undefined") {
            const item = localStorage.getItem(name);
            return item ? JSON.parse(item) : null;
          }
          return null;
        },
        setItem: (name, value) => {
          if (typeof window !== "undefined") {
            // Store in localStorage
            localStorage.setItem(name, JSON.stringify(value));

            // Also set as a cookie for middleware access
            document.cookie = `${name}=${encodeURIComponent(
              JSON.stringify(value)
            )}; path=/; max-age=2592000; SameSite=Lax`;
            console.log("Auth: Set auth cookie and localStorage");
          }
        },
        removeItem: (name) => {
          if (typeof window !== "undefined") {
            localStorage.removeItem(name);
            document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
            console.log("Auth: Removed auth cookie and localStorage");
          }
        },
      },
    }
  )
);

export default useAuth;
