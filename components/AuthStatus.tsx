'use client';

import React, { useEffect, useState } from 'react';
import useAuth from '@/hooks/useAuth';
import Link from 'next/link';

export default function AuthStatus() {
  const { isAuthenticated, user, logout} = useAuth();
  const [isClient, setIsClient] = useState(false);

  // Only run on client side
  useEffect(() => {
    setIsClient(true);

    console.log('AuthStatus - Auth State:', {
      isAuthenticated,
      user: user ? user.email : 'not logged in',
    });
  }, [isAuthenticated, user]);

  // Don't render anything on server side
  if (!isClient) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50 text-sm">
      <h3 className="font-bold mb-2">Auth Status</h3>
      {isAuthenticated && user ? (
        <div>
          <p className="text-green-600">Logged in as: {user.email}</p>
          <div className="mt-2 flex space-x-2">
            <Link href="/orders" className="text-blue-600 hover:underline">
              My Orders
            </Link>
            <button
              onClick={() => {
                console.log('AuthStatus: Logout button clicked');

                // Clear cookies manually before calling logout
                document.cookie = "auth-storage=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
                document.cookie = "auth-storage=; path=/; max-age=0; SameSite=Lax";

                // Also clear localStorage
                localStorage.removeItem('auth-storage');

                // For backward compatibility, also clear the old cookie and localStorage
                document.cookie = "simple-auth-storage=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
                document.cookie = "simple-auth-storage=; path=/; max-age=0; SameSite=Lax";
                localStorage.removeItem('simple-auth-storage');

                // Call the logout function
                logout();

                // Force reload after a short delay
                setTimeout(() => {
                  window.location.href = '/';
                }, 100);
              }}
              className="text-red-600 hover:underline"
            >
              Logout
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-red-600">Not logged in</p>
          <Link href="/login" className="text-blue-600 hover:underline block mt-2">
            Login
          </Link>
        </div>
      )}
    </div>
  );
}
