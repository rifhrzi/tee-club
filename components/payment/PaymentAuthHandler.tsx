'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

/**
 * PaymentAuthHandler component
 *
 * This component handles client-side payment session management by:
 * 1. Storing checkout session data for returning from payment gateways
 * 2. Cleaning up stored session data when no longer needed
 */
const PaymentAuthHandler = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Check if we're on a payment-related page
    const isPaymentPage = pathname?.includes('/payment') || pathname?.includes('/checkout');

    if (isPaymentPage && status === 'authenticated' && session) {
      console.log('PaymentAuthHandler: Active on payment page with authenticated session');

      // Store session data for returning from payment gateway
      localStorage.setItem('nextauth_checkout_session', JSON.stringify({
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name
        },
        timestamp: new Date().toISOString()
      }));

      console.log('PaymentAuthHandler: Stored NextAuth session for payment return');
    } else if (pathname === '/') {
      // Clean up stored session data when returning to home page
      // This helps prevent stale data from persisting
      if (localStorage.getItem('nextauth_checkout_session')) {
        console.log('PaymentAuthHandler: Cleaning up stored session data on home page');
        localStorage.removeItem('nextauth_checkout_session');
      }
    }
  }, [pathname, session, status]);

  // This component doesn't render anything
  return null;
};

export default PaymentAuthHandler;
