'use client';

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';

interface CheckoutButtonProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export default function CheckoutButton({ children, className = '', disabled = false }: CheckoutButtonProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // Don't proceed if disabled or already redirecting
    if (disabled || isRedirecting) {
      return;
    }

    // Don't proceed if session is still loading
    if (status === 'loading') {
      console.log('CheckoutButton: Session still loading, please wait...');
      return;
    }

    const isAuthenticated = status === 'authenticated' && !!session;

    console.log('CheckoutButton: Authentication state:', {
      status,
      isAuthenticated,
      sessionExists: !!session,
      userEmail: session?.user?.email || 'none',
    });

    if (!isAuthenticated) {
      console.log('CheckoutButton: User not authenticated, redirecting to login');
      setIsRedirecting(true);
      
      // Store the current path for redirection after login
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_redirect', '/checkout');
        console.log('CheckoutButton: Stored redirect path: /checkout');
      }

      // Navigate to login with checkout as the redirect
      router.push('/login?redirect=' + encodeURIComponent('/checkout'));
      return;
    }

    console.log('CheckoutButton: User is authenticated, proceeding to checkout');
    setIsRedirecting(true);
    
    // Navigate directly to checkout
    router.push('/checkout');
  };

  // Show loading state while checking authentication or redirecting
  if (status === 'loading' || isRedirecting) {
    return (
      <button
        disabled={true}
        className={`${className} opacity-70 cursor-wait`}
      >
        {status === 'loading' ? 'Checking auth...' : 'Redirecting...'}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  );
}
