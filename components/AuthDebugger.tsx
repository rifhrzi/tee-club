'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';

interface AuthDebuggerProps {
  show?: boolean;
}

export default function AuthDebugger({ show = false }: AuthDebuggerProps) {
  const { data: session, status } = useSession();
  const [isVisible, setIsVisible] = useState(show);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-gray-800 text-white px-3 py-2 rounded text-sm"
        >
          Debug Auth
        </button>
      </div>
    );
  }

  const getCookieInfo = () => {
    if (typeof window === 'undefined') return 'Server-side';
    
    const cookies = document.cookie.split(';').map(c => c.trim());
    const nextAuthCookies = cookies.filter(c => c.includes('next-auth'));
    
    return {
      allCookies: cookies.length,
      nextAuthCookies: nextAuthCookies,
      rawCookies: document.cookie
    };
  };

  const cookieInfo = getCookieInfo();

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm">Auth Debug</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
      
      <div className="text-xs space-y-2">
        <div>
          <strong>Status:</strong> {status}
        </div>
        <div>
          <strong>Authenticated:</strong> {status === 'authenticated' ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>User:</strong> {session?.user?.email || 'None'}
        </div>
        <div>
          <strong>Session ID:</strong> {session?.user?.id || 'None'}
        </div>
        <div>
          <strong>Total Cookies:</strong> {typeof cookieInfo === 'object' ? cookieInfo.allCookies : cookieInfo}
        </div>
        {typeof cookieInfo === 'object' && (
          <>
            <div>
              <strong>NextAuth Cookies:</strong> {cookieInfo.nextAuthCookies.length}
            </div>
            {cookieInfo.nextAuthCookies.length > 0 && (
              <div className="max-h-20 overflow-y-auto">
                <strong>NextAuth Cookie Names:</strong>
                <ul className="list-disc list-inside">
                  {cookieInfo.nextAuthCookies.map((cookie, index) => (
                    <li key={index} className="truncate">
                      {cookie.split('=')[0]}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
