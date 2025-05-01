'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const { accessToken, user, refreshTokens } = useAuth();

  // Wait for hydration to complete
  useEffect(() => {
    setIsHydrated(true);
    console.log('Auth provider hydrated');
  }, []);

  // Check authentication state whenever it changes
  useEffect(() => {
    if (!isHydrated) return;

    console.log('Auth provider - Auth state:', {
      isLoggedIn: !!accessToken,
      user: user ? user.email : null
    });

    // Try to refresh tokens if we have no access token but we're in a browser environment
    // This helps recover from expired tokens
    if (!accessToken && typeof window !== 'undefined') {
      console.log('Auth provider - No access token, checking for refresh token');

      // Attempt to refresh tokens
      refreshTokens()
        .then(() => {
          console.log('Auth provider - Tokens refreshed successfully');
        })
        .catch(err => {
          console.error('Auth provider - Failed to refresh tokens:', err);
          // The refreshTokens function already handles clearing storage on certain errors
        });
    }

    // Clear any redirect flags on initial load
    if (typeof window !== 'undefined') {
      // Set a global flag to indicate auth is ready
      window.__authReady = true;
    }
  }, [isHydrated, accessToken, user, refreshTokens]);

  // Set up automatic token refresh
  useEffect(() => {
    if (!accessToken || !isHydrated) return;

    // Parse the JWT to get expiration time
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const expiresAt = payload.exp * 1000; // Convert to milliseconds
      const timeUntilExpiry = expiresAt - Date.now();

      // Refresh 1 minute before expiry
      const refreshTime = Math.max(timeUntilExpiry - 60000, 0);

      console.log(`Token expires in ${Math.round(timeUntilExpiry / 1000)} seconds, will refresh in ${Math.round(refreshTime / 1000)} seconds`);

      const refreshTimer = setTimeout(() => {
        console.log('Refreshing token before expiry...');
        refreshTokens().catch(err => {
          console.error('Failed to refresh token:', err);
        });
      }, refreshTime);

      return () => clearTimeout(refreshTimer);
    } catch (error) {
      console.error('Error parsing token:', error);
    }

    // Add a global flag to indicate that auth is ready
    if (typeof window !== 'undefined') {
      window.__authReady = true;
    }
  }, [accessToken, user, refreshTokens]);

  // Show nothing until hydration completes to avoid hydration mismatch
  if (!isHydrated) {
    return null;
  }

  return <>{children}</>;
}
