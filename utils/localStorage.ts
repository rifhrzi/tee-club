/**
 * Utility functions for working with localStorage safely
 */

// Check if we're in a browser environment
export const isBrowser = typeof window !== 'undefined';

/**
 * Safely get an item from localStorage
 * @param key The key to get from localStorage
 * @param defaultValue The default value to return if the key doesn't exist or there's an error
 * @returns The value from localStorage or the default value
 */
export function getItem<T>(key: string, defaultValue: T): T {
  if (!isBrowser) return defaultValue;

  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;

    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error getting item ${key} from localStorage:`, error);
    return defaultValue;
  }
}

/**
 * Safely set an item in localStorage
 * @param key The key to set in localStorage
 * @param value The value to set
 * @returns true if successful, false otherwise
 */
export function setItem<T>(key: string, value: T): boolean {
  if (!isBrowser) return false;

  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error setting item ${key} in localStorage:`, error);
    return false;
  }
}

/**
 * Safely remove an item from localStorage
 * @param key The key to remove from localStorage
 * @returns true if successful, false otherwise
 */
export function removeItem(key: string): boolean {
  if (!isBrowser) return false;

  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing item ${key} from localStorage:`, error);
    return false;
  }
}

/**
 * Check if localStorage is available and working
 * @returns true if localStorage is available and working, false otherwise
 */
export function isLocalStorageAvailable(): boolean {
  if (!isBrowser) return false;

  try {
    const testKey = '__test__';
    localStorage.setItem(testKey, testKey);
    const result = localStorage.getItem(testKey) === testKey;
    localStorage.removeItem(testKey);
    return result;
  } catch (error) {
    console.error('localStorage is not available:', error);
    return false;
  }
}

/**
 * Check if the user is authenticated with NextAuth
 * @returns true if authenticated, false otherwise
 */
export function isNextAuthAuthenticated(): boolean {
  if (!isBrowser) return false;

  try {
    // Check for any NextAuth related cookies
    const cookies = document.cookie.split(';');
    const nextAuthCookiePatterns = [
      'next-auth.session-token',
      '__Secure-next-auth.session-token',
      '__Host-next-auth.session-token',
      'next-auth.callback-url',
      '__Host-next-auth.csrf-token',
      'next-auth.csrf-token'
    ];

    // Log all cookies for debugging
    console.log('Checking cookies for NextAuth authentication');
    for (const cookie of cookies) {
      const trimmedCookie = cookie.trim();

      // Check if any cookie starts with a NextAuth pattern
      for (const pattern of nextAuthCookiePatterns) {
        if (trimmedCookie.startsWith(`${pattern}=`)) {
          console.log('Found NextAuth cookie:', pattern);
          return true;
        }
      }
    }

    // Check sessionStorage and localStorage
    if (typeof sessionStorage !== 'undefined') {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.includes('next-auth')) {
          console.log('Found NextAuth in sessionStorage:', key);
          return true;
        }
      }
    }

    // Check localStorage for NextAuth session
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('next-auth')) {
        console.log('Found NextAuth in localStorage:', key);
        return true;
      }
    }

    // Check for stored checkout session
    const storedCheckoutSession = localStorage.getItem('nextauth_checkout_session');
    if (storedCheckoutSession) {
      try {
        const sessionData = JSON.parse(storedCheckoutSession);
        const timestamp = new Date(sessionData.timestamp);
        const now = new Date();
        const sessionAge = now.getTime() - timestamp.getTime();

        // If the stored session is less than 30 minutes old, consider it valid
        if (sessionAge < 30 * 60 * 1000) {
          console.log('Found valid stored NextAuth checkout session');
          return true;
        } else {
          console.log('Found expired stored NextAuth checkout session');
          localStorage.removeItem('nextauth_checkout_session');
        }
      } catch (error) {
        console.error('Error parsing stored NextAuth checkout session:', error);
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking NextAuth authentication:', error);
    return false;
  }
}

/**
 * Debug localStorage by logging all keys and values
 */
export function debugLocalStorage(): void {
  if (!isBrowser) return;

  try {
    console.log('--- localStorage Debug ---');
    console.log('localStorage available:', isLocalStorageAvailable());
    console.log('NextAuth authenticated:', isNextAuthAuthenticated());

    if (isLocalStorageAvailable()) {
      console.log('localStorage keys:');
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          try {
            const value = localStorage.getItem(key);
            console.log(`${key}:`, value);
          } catch (error) {
            console.error(`Error getting value for key ${key}:`, error);
          }
        }
      }
    }

    console.log('------------------------');
  } catch (error) {
    console.error('Error debugging localStorage:', error);
  }
}
