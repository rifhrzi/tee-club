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
  const isAuthenticated = status === 'authenticated' && !!session;
  const user = session?.user;

  // Set client-side rendering flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Debug: Log authentication state only on client side and when status changes
  useEffect(() => {
    if (!isClient) return;

    console.log('Header - Auth State:', {
      status,
      isLoggedIn: isAuthenticated,
      user: user ? user.email : 'not logged in'
    });
  }, [status, user, isAuthenticated, isClient]);

  // Always show loading state until client is ready and auth is resolved
  const showAuthLoading = !isClient || status === 'loading';

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            <Link href="/" className="flex items-center space-x-2">
              <i className="fas fa-tshirt text-blue-600"></i>
              <span>{SITE_CONFIG.name}</span>
            </Link>
          </h1>

          {/* Desktop Navigation */}
          <div className="flex items-center">
            <nav className="mr-4 hidden items-center space-x-8 lg:flex">
              {NAVIGATION.main.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 transition-colors hover:text-gray-900"
                >
                  {item.name}
                </Link>
              ))}

              {/* Auth UI with immediate loading state */}
              {showAuthLoading ? (
                // Show loading state immediately
                <div className="rounded-lg bg-gray-100 px-4 py-2 text-gray-500">
                  Loading...
                </div>
              ) : !isAuthenticated ? (
                // Not authenticated
                <Link
                  href="/login"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                  onClick={() => {
                    console.log('Header: Login button clicked');
                  }}
                >
                  Sign In
                </Link>
              ) : (
                // Authenticated
                <div className="flex items-center space-x-4">
                  <Link
                    href="/orders"
                    className="text-gray-700 transition-colors hover:text-gray-900"
                  >
                    My Orders
                  </Link>
                  <button
                    onClick={() => {
                      console.log('Header: Sign Out button clicked');

                      // Clear any checkout session data
                      if (typeof window !== 'undefined') {
                        localStorage.removeItem('nextauth_checkout_session');
                        localStorage.removeItem('checkout_form_data');
                      }

                      // Call NextAuth signOut
                      signOut({ callbackUrl: '/' });
                    }}
                    className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-300"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="block rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <i className={`fas ${isMobileMenuOpen ? "fa-times" : "fa-bars"} text-2xl`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <MobileMenu
          isOpen={isMobileMenuOpen}
          user={user}
        />
      </div>
    </header>
  );
};
