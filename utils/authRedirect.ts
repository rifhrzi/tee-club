/**
 * Utility functions for handling authentication redirects
 */

/**
 * Redirects unauthenticated users to the signup page
 * @param redirectPath - The path to redirect back to after signup/login
 * @returns boolean - Whether the user was redirected (true) or is authenticated (false)
 */
export const redirectToSignup = (redirectPath: string = window.location.pathname): boolean => {
  // Only run on client side
  if (typeof window === 'undefined') return false;
  
  // Store the current path for redirection after login
  localStorage.setItem('auth_redirect', redirectPath);
  
  // Redirect to signup page
  window.location.href = '/signup';
  
  return true;
};

/**
 * Checks if there's a stored redirect path and returns it
 * @returns string | null - The stored redirect path or null if none exists
 */
export const getStoredRedirectPath = (): string | null => {
  // Only run on client side
  if (typeof window === 'undefined') return null;
  
  return localStorage.getItem('auth_redirect');
};

/**
 * Clears the stored redirect path
 */
export const clearStoredRedirectPath = (): void => {
  // Only run on client side
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('auth_redirect');
};
