'use client';

import React, { useEffect, useState } from 'react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import Link from 'next/link';

export default function SimpleAuthStatus() {
  const { isAuthenticated, user, logout, isSessionExpired } = useSimpleAuth();
  const [isClient, setIsClient] = useState(false);

  // Only run on client side
  useEffect(() => {
    setIsClient(true);

    // Check if session has expired
    const expired = isSessionExpired();

    console.log('SimpleAuthStatus - Auth State:', {
      isAuthenticated,
      user: user ? user.email : 'not logged in',
      sessionExpired: expired
    });
  }, [isAuthenticated, user, isSessionExpired]);

  // Don't render anything on server side
  if (!isClient) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50 text-sm">
      <h3 className="font-bold mb-2">Simple Auth Status</h3>
      {isAuthenticated && user ? (
        <div>
          <p className="text-green-600">Logged in as: {user.email}</p>
          <div className="mt-2 flex space-x-2">
            <Link href="/simple-orders" className="text-blue-600 hover:underline">
              My Orders
            </Link>
            <button
              onClick={logout}
              className="text-red-600 hover:underline"
            >
              Logout
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-red-600">Not logged in</p>
          <Link href="/simple-login" className="text-blue-600 hover:underline block mt-2">
            Login
          </Link>
        </div>
      )}
    </div>
  );
}
