'use client';

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';

interface DirectLoginLinkProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onNavigationStart?: () => void;
  onNavigationComplete?: () => void;
}

export default function DirectLoginLink({ children, className = '', href = '/checkout', onNavigationStart, onNavigationComplete }: DirectLoginLinkProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check authentication status
  useEffect(() => {
    if (!isClient) return;

    // Only set authenticated if we have a session and we're not in the loading state
    const authState = status === 'authenticated' && !!session;
    setIsAuthenticated(authState);

    console.log('DirectLoginLink - Auth state:', {
      status,
      isAuthenticated: authState,
      user: session?.user ? session.user.email : 'not logged in'
    });

    // If we're authenticated and we were previously redirecting, navigate to the checkout page
    if (authState && isRedirecting) {
      console.log('DirectLoginLink: Authentication detected, navigating to:', href);
      setIsRedirecting(false);
      router.push(href);
    }
  }, [status, session, isClient, href, router, isRedirecting]);

  // Add navigation completion detection
  useEffect(() => {
    if (isRedirecting) {
      // Set a timeout to call navigation complete callback
      // This ensures loading state is cleared even if navigation takes time
      const timer = setTimeout(() => {
        console.log('DirectLoginLink: Navigation timeout, calling completion callback');
        setIsRedirecting(false);
        if (onNavigationComplete) {
          onNavigationComplete();
        }
      }, 3000); // 3 second timeout

      return () => clearTimeout(timer);
    }
  }, [isRedirecting, onNavigationComplete]);

  // Don't render anything during server-side rendering
  if (!isClient) {
    return <span className={className}>{children}</span>;
  }

  // Show loading state while checking authentication
  if (status === 'loading' || isRedirecting) {
    return (
      <span className={`${className} opacity-70 cursor-wait`}>
        {React.cloneElement(children as React.ReactElement, {
          disabled: true,
          children: status === 'loading' ? 'Checking auth...' : 'Redirecting...'
        })}
      </span>
    );
  }

  // If authenticated, render a direct link to the checkout page
  if (isAuthenticated) {
    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      console.log('DirectLoginLink: User is authenticated, navigating to:', href);
      console.log('DirectLoginLink: Authentication state at click:', {
        status,
        isAuthenticated,
        sessionExists: !!session
      });

      // Add visual feedback
      setIsRedirecting(true);
      console.log('DirectLoginLink: Navigating to checkout...');

      // Call the navigation start callback if provided
      if (onNavigationStart) {
        onNavigationStart();
      }

      // Use a small delay to ensure state updates
      setTimeout(() => {
        router.push(href);
        // Call navigation complete after a short delay
        setTimeout(() => {
          setIsRedirecting(false);
          if (onNavigationComplete) {
            onNavigationComplete();
          }
        }, 500); // 500ms delay to allow navigation to start
      }, 100);
    };

    return (
      <a
        href="#"
        className={className}
        onClick={handleClick}
        style={{
          opacity: isRedirecting ? 0.7 : 1,
          pointerEvents: isRedirecting ? 'none' : 'auto'
        }}
      >
        {children}
      </a>
    );
  }

  // If not authenticated, render a link to login with checkout as the redirect
  return (
    <a
      href="#"
      className={className}
      onClick={(e) => {
        e.preventDefault();

        console.log('DirectLoginLink: Unauthenticated click handler called');
        console.log('DirectLoginLink: Authentication state at click:', {
          status,
          isAuthenticated,
          sessionExists: !!session
        });

        // Prevent multiple clicks
        if (isRedirecting) {
          console.log('DirectLoginLink: Already redirecting, ignoring click');
          return;
        }

        setIsRedirecting(true);
        console.log('DirectLoginLink: User not authenticated, redirecting to login');

        // Call the navigation start callback if provided
        if (onNavigationStart) {
          onNavigationStart();
        }

        // Store the current path for redirection after login
        if (typeof window !== 'undefined') {
          // Store the redirect path
          localStorage.setItem('auth_redirect', href);
          console.log('DirectLoginLink: Stored redirect path:', href);

          // Store cart data for restoration after login
          const cartData = localStorage.getItem('cart-storage');
          if (cartData) {
            localStorage.setItem('pending_cart_data', cartData);
            console.log('DirectLoginLink: Stored cart data for restoration after login');
          }
        }

        // Navigate to login using the router for a smoother transition
        router.push(`/login?redirect=${encodeURIComponent(href)}`);

        // Call navigation complete after a short delay
        setTimeout(() => {
          setIsRedirecting(false);
          if (onNavigationComplete) {
            onNavigationComplete();
          }
        }, 500); // 500ms delay to allow navigation to start
      }}
    >
      {children}
    </a>
  );
}

