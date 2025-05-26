"use client";

import React, { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function AuthStatus() {
  const { data: session, status } = useSession();
  const [isClient, setIsClient] = useState(false);

  // Move useRef to top level - this is the correct way to use hooks
  const prevStatus = React.useRef(status);

  // Only run on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Log authentication state only when status actually changes
  useEffect(() => {
    if (!isClient) return;

    // Only log when status actually changes (not on every render)
    if (prevStatus.current !== status) {
      console.log("AuthStatus - Auth State Changed:", {
        from: prevStatus.current,
        to: status,
        isAuthenticated: status === "authenticated",
        user: session?.user ? session.user.email : "not logged in",
      });
      prevStatus.current = status;
    }
  }, [status, session, isClient]);

  // Prevent hydration mismatch by not rendering anything on server
  if (!isClient) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-white p-4 text-sm shadow-lg">
      <h3 className="mb-2 font-bold">Auth Status</h3>

      {status === "loading" ? (
        // Show loading state
        <div>
          <p className="text-blue-600">Loading authentication...</p>
        </div>
      ) : status === "authenticated" && session?.user ? (
        // Authenticated state
        <div>
          <p className="text-green-600">Logged in as: {session.user.email}</p>
          <div className="mt-2 flex space-x-2">
            <Link href="/orders" className="text-blue-600 hover:underline">
              My Orders
            </Link>
            <button
              onClick={() => {
                console.log("AuthStatus: Logout button clicked");

                // Clear any checkout session data
                if (typeof window !== "undefined") {
                  localStorage.removeItem("nextauth_checkout_session");
                  localStorage.removeItem("checkout_form_data");
                }

                // Call NextAuth signOut
                signOut({ callbackUrl: "/" });
              }}
              className="text-red-600 hover:underline"
            >
              Logout
            </button>
          </div>
        </div>
      ) : (
        // Not authenticated state
        <div>
          <p className="text-red-600">Not logged in</p>
          <Link href="/login" className="mt-2 block text-blue-600 hover:underline">
            Login
          </Link>
        </div>
      )}
    </div>
  );
}
