'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function PaymentAuthHandler() {
  const { accessToken, refreshTokens } = useAuth();

  useEffect(() => {
    // Check if there's a stored payment auth token
    const storedPaymentToken = localStorage.getItem('payment_auth_token');
    
    if (storedPaymentToken && !accessToken) {
      console.log('PaymentAuthHandler - Found stored payment token, attempting to restore auth state');
      
      // Try to refresh tokens
      refreshTokens().then(() => {
        console.log('PaymentAuthHandler - Successfully restored auth state');
      }).catch(error => {
        console.error('PaymentAuthHandler - Failed to restore auth state:', error);
      });
    }
  }, [accessToken, refreshTokens]);

  // This component doesn't render anything
  return null;
}
