"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MobileMenu } from "./MobileMenu";
import { SITE_CONFIG, NAVIGATION } from "../../constants";
import { useSimpleAuth } from "@/hooks/useSimpleAuth";

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useSimpleAuth();

  // Debug: Log authentication state
  useEffect(() => {
    console.log('Header - Auth State:', {
      isLoggedIn: isAuthenticated,
      user: user ? user.email : 'not logged in'
    });
  }, [user, isAuthenticated]);

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
              {!isAuthenticated ? (
                <Link
                  href="/simple-login"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                >
                  Sign In
                </Link>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/simple-orders"
                    className="text-gray-700 transition-colors hover:text-gray-900"
                  >
                    My Orders
                  </Link>
                  <button
                    onClick={() => logout()}
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
          logout={logout}
        />
      </div>
    </header>
  );
};
