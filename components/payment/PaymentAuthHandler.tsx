'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * PaymentAuthHandler component
 * 
 * This component handles client-side payment authentication by:
 * 1. Checking for payment_auth_token in localStorage
 * 2. Adding the token to API requests to payment endpoints
 * 3. Cleaning up expired tokens
 */
const PaymentAuthHandler = () => {
  const pathname = usePathname();
  
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // Check if we're on a payment-related page
    const isPaymentPage = pathname?.includes('/payment') || pathname?.includes('/checkout');
    
    if (isPaymentPage) {
      console.log('PaymentAuthHandler: Active on payment page');
      
      // Check for payment auth token
      const paymentAuthToken = localStorage.getItem('payment_auth_token');
      
      if (paymentAuthToken) {
        console.log('PaymentAuthHandler: Found payment auth token');
        
        // Intercept fetch requests to add the auth token to payment API calls
        const originalFetch = window.fetch;
        window.fetch = function(input, init) {
          // Only modify payment-related API requests
          if (typeof input === 'string' && input.includes('/api/payment')) {
            const headers = init?.headers || {};
            const newInit = {
              ...init,
              headers: {
                ...headers,
                'Authorization': `Bearer ${paymentAuthToken}`
              }
            };
            
            console.log('PaymentAuthHandler: Adding auth token to payment API request');
            return originalFetch(input, newInit);
          }
          
          // Pass through other requests unchanged
          return originalFetch(input, init);
        };
        
        // Clean up function to restore original fetch
        return () => {
          window.fetch = originalFetch;
        };
      }
    } else if (pathname === '/') {
      // Clean up payment tokens when returning to home page
      // This helps prevent stale tokens from persisting
      if (localStorage.getItem('payment_auth_token')) {
        console.log('PaymentAuthHandler: Cleaning up payment auth token on home page');
        localStorage.removeItem('payment_auth_token');
      }
    }
  }, [pathname]);
  
  // This component doesn't render anything
  return null;
};

export default PaymentAuthHandler;
