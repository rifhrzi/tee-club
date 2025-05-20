"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useAuth from "@/hooks/useAuth";

// Admin sidebar navigation items
const ADMIN_NAV = [
  { name: "Dashboard", href: "/admin", icon: "chart-line" },
  { name: "Products", href: "/admin/products", icon: "tshirt" },
  { name: "Orders", href: "/admin/orders", icon: "shopping-cart" },
  { name: "Users", href: "/admin/users", icon: "users" },
  { name: "Settings", href: "/admin/settings", icon: "cog" },
];

// Development tools - only shown in development mode
const DEV_TOOLS =
  process.env.NODE_ENV !== "production"
    ? [
        { name: "Test Stock", href: "/admin/test-stock", icon: "flask" },
        { name: "Create Admin", href: "/admin/create-admin", icon: "user-shield" },
      ]
    : [];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check if user is admin
  useEffect(() => {
    if (isClient) {
      if (!isAuthenticated || !user) {
        // Not authenticated, redirect to login
        console.log("AdminLayout: User not authenticated, redirecting to login");
        window.location.href = `/login?redirect=${pathname}`;
      } else if (user.role !== "ADMIN") {
        // Authenticated but not admin, redirect to login with a specific message
        console.log("AdminLayout: User not admin, redirecting to login");
        // Add a query parameter to indicate access denied
        window.location.href = `/login?redirect=${pathname}&access_denied=true`;
      }
    }
  }, [isClient, isAuthenticated, user, pathname]);

  // If not on client side yet, show nothing to prevent hydration mismatch
  if (!isClient) {
    return null;
  }

  // If not authenticated or not admin, show nothing (will redirect)
  if (!isAuthenticated || !user || user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-gray-900 text-white ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:translate-x-0`}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-800 px-4">
          <Link href="/admin" className="text-xl font-bold">
            Teelite Admin
          </Link>
          <button
            className="rounded-md p-1 hover:bg-gray-800 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>
        <div className="px-2 py-4">
          <ul className="space-y-1">
            {ADMIN_NAV.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center rounded-md px-4 py-2 text-sm ${
                    pathname === item.href
                      ? "bg-gray-800 text-white"
                      : "text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  <i className={`fas fa-${item.icon} mr-3 h-5 w-5`}></i>
                  {item.name}
                </Link>
              </li>
            ))}

            {DEV_TOOLS.length > 0 && (
              <>
                <li className="pb-2 pt-4">
                  <div className="px-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Development Tools
                  </div>
                </li>
                {DEV_TOOLS.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center rounded-md px-4 py-2 text-sm ${
                        pathname === item.href
                          ? "bg-gray-800 text-white"
                          : "text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      <i className={`fas fa-${item.icon} mr-3 h-5 w-5`}></i>
                      {item.name}
                    </Link>
                  </li>
                ))}
              </>
            )}
          </ul>
        </div>
        <div className="absolute bottom-0 w-full border-t border-gray-800">
          <div className="px-4 py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700">
                  <i className="fas fa-user text-gray-300"></i>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="mt-3 flex w-full items-center rounded-md px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
            >
              <i className="fas fa-sign-out-alt mr-3 h-5 w-5"></i>
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navbar */}
        <div className="sticky top-0 z-10 flex h-16 items-center justify-between bg-white px-4 shadow-sm">
          <button className="p-1 text-gray-700 lg:hidden" onClick={() => setIsSidebarOpen(true)}>
            <i className="fas fa-bars text-lg"></i>
          </button>
          <div className="flex items-center">
            <Link href="/" className="mr-4 text-gray-700 hover:text-gray-900">
              <i className="fas fa-home mr-1"></i> View Site
            </Link>
            <div className="relative">
              <button className="p-1 text-gray-700 hover:text-gray-900">
                <i className="fas fa-bell text-lg"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
