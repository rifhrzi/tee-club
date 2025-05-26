"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { NAVIGATION } from "../../constants";

interface MobileMenuProps {
  isOpen: boolean;
  user?: any; // Pass user from parent
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, user: propUser }) => {
  // Use NextAuth session
  const { data: session, status } = useSession();
  const user = propUser || session?.user;
  const isAuthenticated = status === "authenticated" && !!session;
  const [isClient, setIsClient] = React.useState(false);

  // Set client-side rendering flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Debug: Log authentication state
  useEffect(() => {
    if (!isClient || !isOpen) return;

    console.log("MobileMenu - Auth State:", {
      status,
      isLoggedIn: isAuthenticated,
      user: user ? user.email : "not logged in",
    });
  }, [isOpen, user, isAuthenticated, status, isClient]);

  if (!isOpen) return null;

  return (
    <nav className="border-grunge-steel bg-grunge-charcoal/95 border-t py-6 backdrop-blur-md lg:hidden">
      <div className="flex flex-col space-y-4">
        {NAVIGATION.main.map((item) => (
          <Link key={item.name} href={item.href} className="nav-link px-2 py-1">
            {item.name}
          </Link>
        ))}
        {/* Only render auth UI on client side */}
        {isClient ? (
          status === "loading" ? (
            // Show loading state
            <div className="card-grunge text-grunge-fog w-full px-4 py-2 text-center">
              Loading...
            </div>
          ) : !isAuthenticated ? (
            <Link
              href="/login"
              className="block w-full"
              onClick={() => {
                console.log("MobileMenu: Login button clicked");
                // Force navigation to login page
                window.location.href = "/login";
              }}
            >
              <button className="btn-electric w-full">
                <i className="fas fa-sign-in-alt mr-2"></i>
                Sign In
              </button>
            </Link>
          ) : (
            <>
              <Link href="/profile" className="nav-link px-2 py-1">
                <i className="fas fa-user mr-2"></i>
                Profile
              </Link>
              <Link href="/orders" className="nav-link px-2 py-1">
                <i className="fas fa-receipt mr-2"></i>
                My Orders
              </Link>
              <button
                onClick={() => {
                  console.log("MobileMenu: Sign Out button clicked");

                  // Clear any checkout session data
                  if (typeof window !== "undefined") {
                    localStorage.removeItem("nextauth_checkout_session");
                    localStorage.removeItem("checkout_form_data");
                  }

                  // Call NextAuth signOut
                  signOut({ callbackUrl: "/" });
                }}
                className="btn-danger w-full"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
                Sign Out
              </button>
            </>
          )
        ) : null}
      </div>
    </nav>
  );
};
