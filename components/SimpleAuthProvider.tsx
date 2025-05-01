'use client';

import React, { useEffect } from 'react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';

export default function SimpleAuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, isSessionExpired } = useSimpleAuth();

  // Check if the session is expired on initial load and when auth state changes
  useEffect(() => {
    console.log('SimpleAuthProvider: Checking authentication state');
    console.log('SimpleAuthProvider: isAuthenticated =', isAuthenticated);
    console.log('SimpleAuthProvider: user =', user ? user.email : 'null');
    
    // Check if the session is expired
    const expired = isSessionExpired();
    console.log('SimpleAuthProvider: Session expired =', expired);
    
    // Additional debugging for localStorage
    if (typeof window !== 'undefined') {
      try {
        const authStorage = localStorage.getItem('simple-auth-storage');
        console.log('SimpleAuthProvider: Auth storage exists =', !!authStorage);
        
        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          console.log('SimpleAuthProvider: Parsed storage =', {
            hasState: !!parsed.state,
            isAuthenticated: parsed.state?.isAuthenticated,
            hasUser: !!parsed.state?.user
          });
        }
      } catch (error) {
        console.error('SimpleAuthProvider: Error checking localStorage:', error);
      }
    }
  }, [isAuthenticated, user, isSessionExpired]);

  return <>{children}</>;
}
