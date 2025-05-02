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

export const useSimpleAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      expiresAt: null,

      login: async (email: string, password: string, rememberMe = false) => {
        try {
          console.log("SimpleAuth: Attempting login for:", email, "Remember me:", rememberMe);

          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const error = await response.json();
            console.error("SimpleAuth: Login failed:", error);
            throw new Error(error.error || "Login failed");
          }

          const data = await response.json();
          console.log("SimpleAuth: Login successful");
          console.log("SimpleAuth: User data received:", data.user);

          // Calculate expiration time based on remember me option
          const now = Date.now();
          // If remember me is checked, set expiration to 30 days, otherwise 1 day
          const expirationTime = now + (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000;

          // Update auth state with user data and token
          set({
            isAuthenticated: true,
            user: data.user,
            token: data.accessToken,
            expiresAt: expirationTime,
          });

          return true;
        } catch (error) {
          console.error("SimpleAuth: Login error:", error);
          set({ isAuthenticated: false, user: null, token: null, expiresAt: null });
          throw error;
        }
      },

      logout: () => {
        console.log("SimpleAuth: Logging out");
        set({ isAuthenticated: false, user: null, token: null, expiresAt: null });
      },

      isSessionExpired: () => {
        const { expiresAt } = get();
        if (!expiresAt) return false;

        const now = Date.now();
        const isExpired = now > expiresAt;

        if (isExpired) {
          console.log("SimpleAuth: Session has expired");
          // Auto logout if session is expired
          set({ isAuthenticated: false, user: null, token: null, expiresAt: null });
        }

        return isExpired;
      },
    }),
    {
      name: "simple-auth-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
        expiresAt: state.expiresAt,
      }),
    }
  )
);
