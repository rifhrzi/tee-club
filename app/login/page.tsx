"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSimpleAuth } from "@/hooks/useSimpleAuth";
import Link from "next/link";
import SocialLoginButton from "@/components/SocialLoginButton";
import { Suspense } from "react";

export const dynamic = "force-dynamic"; // Force dynamic rendering

function LoginContent() {
  const searchParams = useSearchParams();
  const { login, isAuthenticated, user } = useSimpleAuth();
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [redirectPath, setRedirectPath] = useState("/");
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const redirect = searchParams.get("redirect") || "/";
    const accessDenied = searchParams.get("access_denied") === "true";

    setRedirectPath(redirect);
    console.log("Login: Loaded with redirect path:", redirect);

    // Check for access denied parameter
    if (accessDenied) {
      console.log("Login: Access denied parameter detected");
      setError("You don't have permission to access the admin area");
      return;
    }

    // Check if user is authenticated
    if (isAuthenticated && user) {
      // Check if trying to access admin page but user is not admin
      if (redirect.startsWith("/admin") && user.role !== "ADMIN") {
        console.log("Login: User is not admin, showing error message");
        setError("You don't have permission to access the admin area");
      } else {
        // User is authenticated and has proper permissions
        console.log("Login: User already logged in, redirecting to:", redirect);
        window.location.href = redirect;
      }
    } else {
      console.log("Login: User not logged in, showing login form");
    }
  }, [isAuthenticated, user, searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      console.log("Login: Attempting login for:", email, "Remember me:", rememberMe);
      await login(email, password, rememberMe);

      console.log("Login: Login successful, redirecting to:", redirectPath);
      window.location.href = redirectPath;
    } catch (error) {
      console.error("Login: Login error:", error);
      setError(error instanceof Error ? error.message : "Login failed");
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "facebook" | "github") => {
    try {
      setError("");
      setSocialLoading(provider);

      console.log(`Login: Attempting ${provider} login`);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockUserData = {
        id: "123456",
        email: `user@${provider}.com`,
        name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
      };

      await login(mockUserData.email, "social-auth-token", rememberMe);

      console.log(`Login: ${provider} login successful, redirecting to:`, redirectPath);
      window.location.href = redirectPath;
    } catch (error) {
      console.error(`Login: ${provider} login error:`, error);
      setError(`${provider} login failed. Please try again.`);
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>

        {error && (
          <div className="relative rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 space-y-6">
          <div className="grid grid-cols-1 gap-3">
            <SocialLoginButton
              provider="google"
              onClick={() => handleSocialLogin("google")}
              disabled={!!socialLoading}
            />
            <SocialLoginButton
              provider="facebook"
              onClick={() => handleSocialLogin("facebook")}
              disabled={!!socialLoading}
            />
            <SocialLoginButton
              provider="github"
              onClick={() => handleSocialLogin("github")}
              disabled={!!socialLoading}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-gray-50 px-2 text-gray-500">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="-space-y-px rounded-md shadow-sm">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="Email address"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  href="/forgot-password"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !!socialLoading}
                className={`group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  loading || socialLoading ? "cursor-not-allowed opacity-50" : ""
                }`}
              >
                {loading
                  ? "Signing in..."
                  : socialLoading
                    ? `Signing in with ${socialLoading}...`
                    : "Sign in"}
              </button>
            </div>

            <div className="text-center text-sm">
              <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                Don&apos;t have an account? Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}