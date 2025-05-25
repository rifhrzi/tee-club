"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { MobileMenu } from "./MobileMenu";
import { SITE_CONFIG, NAVIGATION } from "../../constants";

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { data: session, status } = useSession();

  // Only consider authenticated if we have a session and we're not in the loading state
  const isAuthenticated = status === "authenticated" && !!session;
  const user = session?.user;

  // Set client-side rendering flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Debug: Log authentication state only on client side and when status changes
  useEffect(() => {
    if (!isClient) return;

    console.log("Header - Auth State:", {
      status,
      isLoggedIn: isAuthenticated,
      user: user ? user.email : "not logged in",
    });
  }, [status, user, isAuthenticated, isClient]);

  // Always show loading state until client is ready and auth is resolved
  const showAuthLoading = !isClient || status === "loading";

  return (
    <header className="nav sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <h1 className="logo">
            <Link href="/" className="group flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
                <span className="text-sm font-bold text-white">T</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">{SITE_CONFIG.name}</span>
            </Link>
          </h1>

          {/* Desktop Navigation */}
          <div className="flex items-center">
            <nav className="mr-6 hidden items-center space-x-1 lg:flex">
              {NAVIGATION.main.map((item) => (
                <Link key={item.name} href={item.href} className="nav-link">
                  {item.name}
                </Link>
              ))}

              {/* Auth UI with immediate loading state */}
              {showAuthLoading ? (
                // Show loading state immediately
                <div className="px-4 py-2 text-gray-500">Loading...</div>
              ) : !isAuthenticated ? (
                // Not authenticated
                <Link
                  href="/login"
                  className="btn btn-primary"
                  onClick={() => {
                    console.log("Header: Login button clicked");
                  }}
                >
                  Sign In
                </Link>
              ) : (
                // Authenticated
                <div className="flex items-center space-x-4">
                  <Link href="/orders" className="nav-link">
                    My Orders
                  </Link>
                  <button
                    onClick={() => {
                      console.log("Header: Sign Out button clicked");

                      // Clear any checkout session data
                      if (typeof window !== "undefined") {
                        localStorage.removeItem("nextauth_checkout_session");
                        localStorage.removeItem("checkout_form_data");
                      }

                      // Call NextAuth signOut
                      signOut({ callbackUrl: "/" });
                    }}
                    className="btn btn-outline"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="block rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <MobileMenu isOpen={isMobileMenuOpen} user={user} />
      </div>
    </header>
  );
};
