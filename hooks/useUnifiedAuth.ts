'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

/**
 * Unified Authentication Hook
 * 
 * This hook provides a single source of truth for authentication state
 * across the entire application, eliminating conflicts between different
 * authentication systems.
 */
export function useUnifiedAuth() {
  const { data: session, status } = useSession();
  const [isReady, setIsReady] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle authentication state changes
  useEffect(() => {
    if (!isClient) return;

    console.log('useUnifiedAuth: Session status changed:', status);
    
    if (status === 'loading') {
      setIsReady(false);
    } else if (status === 'authenticated') {
      // Add a small delay to ensure session is fully propagated
      setTimeout(() => setIsReady(true), 100);
    } else if (status === 'unauthenticated') {
      // Add a small delay to prevent immediate redirects
      setTimeout(() => setIsReady(true), 200);
    }
  }, [status, session, isClient]);

  // Clean up any legacy authentication data
  useEffect(() => {
    if (!isClient) return;

    // Clear any legacy auth storage that might conflict
    const legacyKeys = [
      'auth-storage',
      'auth_storage', 
      'simple-auth-storage'
    ];

    legacyKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        console.log('useUnifiedAuth: Cleaning up legacy auth data:', key);
        localStorage.removeItem(key);
      }
    });

    // Clear legacy cookies
    const legacyCookies = [
      'auth-storage',
      'auth_storage',
      'simple-auth-storage',
      'auth_token',
      'auth_user'
    ];

    legacyCookies.forEach(name => {
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
    });
  }, [isClient]);

  const authState = {
    // Core authentication state
    isAuthenticated: status === 'authenticated' && !!session,
    isLoading: status === 'loading' || !isReady,
    isReady: isReady && isClient,
    user: session?.user || null,
    session,
    status,

    // Helper methods
    isLoggedIn: status === 'authenticated' && !!session,
    isGuest: status === 'unauthenticated',
    
    // User information
    userId: session?.user?.id || null,
    userEmail: session?.user?.email || null,
    userName: session?.user?.name || null,
    userRole: session?.user?.role || null,
  };

  // Debug logging (only in development)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && isClient) {
      console.log('useUnifiedAuth: Auth state update:', {
        isAuthenticated: authState.isAuthenticated,
        isLoading: authState.isLoading,
        isReady: authState.isReady,
        status: authState.status,
        userEmail: authState.userEmail
      });
    }
  }, [authState.isAuthenticated, authState.isLoading, authState.isReady, authState.status, authState.userEmail, isClient]);

  return authState;
}

/**
 * Hook for pages that require authentication
 * Automatically handles redirects for unauthenticated users
 */
export function useRequireAuth(redirectTo: string = '/login') {
  const auth = useUnifiedAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!auth.isReady) return;

    if (!auth.isAuthenticated && auth.isReady) {
      console.log('useRequireAuth: User not authenticated, preparing redirect to:', redirectTo);
      setShouldRedirect(true);
    } else if (auth.isAuthenticated) {
      setShouldRedirect(false);
    }
  }, [auth.isAuthenticated, auth.isReady, redirectTo]);

  return {
    ...auth,
    shouldRedirect,
    redirectUrl: shouldRedirect ? `${redirectTo}?redirect=${encodeURIComponent(window.location.pathname)}` : null
  };
}

/**
 * Hook for checking if NextAuth cookies are present
 * Used for client-side authentication validation
 */
export function useNextAuthCookieCheck() {
  const [hasCookies, setHasCookies] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const checkCookies = () => {
      const cookies = document.cookie.split(';');
      const nextAuthCookiePatterns = [
        'next-auth.session-token',
        '__Secure-next-auth.session-token',
        '__Host-next-auth.session-token'
      ];

      const hasValidCookie = cookies.some(cookie => {
        const trimmedCookie = cookie.trim();
        return nextAuthCookiePatterns.some(pattern => 
          trimmedCookie.startsWith(`${pattern}=`) && trimmedCookie.length > pattern.length + 1
        );
      });

      setHasCookies(hasValidCookie);
    };

    checkCookies();
    
    // Check cookies periodically
    const interval = setInterval(checkCookies, 5000);
    return () => clearInterval(interval);
  }, [isClient]);

  return { hasCookies, isClient };
}
