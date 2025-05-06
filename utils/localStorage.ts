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
 * Debug localStorage by logging all keys and values
 */
export function debugLocalStorage(): void {
  if (!isBrowser) return;
  
  try {
    console.log('--- localStorage Debug ---');
    console.log('localStorage available:', isLocalStorageAvailable());
    
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
