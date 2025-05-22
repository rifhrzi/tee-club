'use client';

import { Session } from 'next-auth';
import useAuth from '@/hooks/useAuth';
import * as ls from '@/utils/localStorage';

/**
 * Synchronizes authentication state between NextAuth and the custom auth system
 *
 * @param session NextAuth session
 * @param status NextAuth status
 * @returns Object with synchronized authentication state
 */
export function syncAuthState(session: Session | null, status: 'loading' | 'authenticated' | 'unauthenticated') {
  // Get custom auth state
  const customAuth = useAuth();

  // Debug current state
  console.log('AuthSync - Current state:', {
    nextAuth: {
      status,
      session: session ? {
        user: session.user ? {
          id: session.user.id,
          email: session.user.email
        } : null
      } : null
    },
    customAuth: {
      isAuthenticated: customAuth.isAuthenticated,
      user: customAuth.user ? {
        id: customAuth.user.id,
        email: customAuth.user.email
      } : null
    },
    nextAuthCookies: ls.isNextAuthAuthenticated()
  });

  // Synchronize authentication state between NextAuth and custom auth
  if (typeof window !== 'undefined') {
    // If NextAuth is authenticated but custom auth is not, sync custom auth
    if (status === 'authenticated' && session?.user && !customAuth.isAuthenticated) {
      console.log('AuthSync - Syncing NextAuth session to custom auth');

      // We can't directly set the custom auth state, but we can store the data
      // for the next page load
      const authData = {
        state: {
          isAuthenticated: true,
          user: {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name || '',
            role: session.user.role || 'USER'
          },
          token: 'synced-from-nextauth',
          refreshToken: null
        }
      };

      localStorage.setItem('auth-storage', JSON.stringify(authData));
      console.log('AuthSync - Stored NextAuth session in auth-storage');
    }

    // Check if we have stored NextAuth session from checkout
    const storedNextAuthSession = localStorage.getItem('nextauth_checkout_session');
    if (storedNextAuthSession && status !== 'authenticated') {
      try {
        const sessionData = JSON.parse(storedNextAuthSession);
        const timestamp = new Date(sessionData.timestamp);
        const now = new Date();
        const sessionAge = now.getTime() - timestamp.getTime();

        // If the stored session is less than 30 minutes old, use it
        if (sessionAge < 30 * 60 * 1000) {
          console.log('AuthSync - Found stored NextAuth session from checkout, using it');

          // Store in custom auth for next page load
          const authData = {
            state: {
              isAuthenticated: true,
              user: {
                id: sessionData.user.id,
                email: sessionData.user.email,
                name: sessionData.user.name || '',
                role: sessionData.user.role || 'USER'
              },
              token: 'restored-from-checkout',
              refreshToken: null
            }
          };

          localStorage.setItem('auth-storage', JSON.stringify(authData));
          console.log('AuthSync - Restored session from checkout to auth-storage');
        } else {
          console.log('AuthSync - Stored NextAuth session is too old, not using it');
          localStorage.removeItem('nextauth_checkout_session');
        }
      } catch (error) {
        console.error('AuthSync - Error parsing stored NextAuth session:', error);
        localStorage.removeItem('nextauth_checkout_session');
      }
    }
  }

  // Return the combined auth state
  return {
    isAuthenticated: status === 'authenticated' || customAuth.isAuthenticated,
    user: status === 'authenticated' && session?.user ? session.user : customAuth.user,
    token: customAuth.token,
    authSource: status === 'authenticated' ? 'nextauth' : customAuth.isAuthenticated ? 'custom' : 'none'
  };
}

/**
 * Checks if the user is authenticated with either NextAuth or custom auth
 *
 * @returns true if authenticated with either system, false otherwise
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;

  // Check NextAuth
  const nextAuthAuthenticated = ls.isNextAuthAuthenticated();

  // Check custom auth
  let customAuthAuthenticated = false;
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const authData = JSON.parse(authStorage);
      customAuthAuthenticated = authData.state?.isAuthenticated || false;
    }
  } catch (e) {
    console.error('Error checking custom auth:', e);
  }

  return nextAuthAuthenticated || customAuthAuthenticated;
}
