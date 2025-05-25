'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export function useAuthSync() {
  const { data: session, status } = useSession();
  const [isReady, setIsReady] = useState(false);
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isLoading: true,
    user: null as any
  });

  useEffect(() => {
    console.log('useAuthSync: Session status changed:', status);
    
    if (status === 'loading') {
      setAuthState({
        isAuthenticated: false,
        isLoading: true,
        user: null
      });
      setIsReady(false);
    } else if (status === 'authenticated') {
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user: session?.user || null
      });
      // Add a small delay to ensure session is fully propagated
      setTimeout(() => setIsReady(true), 500);
    } else if (status === 'unauthenticated') {
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null
      });
      // Add a small delay to prevent immediate redirects
      setTimeout(() => setIsReady(true), 1000);
    }
  }, [status, session]);

  return {
    ...authState,
    isReady,
    status,
    session
  };
}
