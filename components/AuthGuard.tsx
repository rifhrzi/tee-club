"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import PageLoader from './PageLoader';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  fallback?: React.ReactNode;
  loadingMessage?: string;
}

export default function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login',
  fallback,
  loadingMessage = "Checking authentication..."
}: AuthGuardProps): JSX.Element {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();
  const router = useRouter();
  const [shouldRender, setShouldRender] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Only proceed when auth is fully initialized
    if (isInitialized && !isLoading) {
      if (requireAuth && !isAuthenticated) {
        console.log('AuthGuard - Redirecting unauthenticated user to:', redirectTo);
        setIsRedirecting(true);
        
        // Add current path as redirect parameter
        const currentPath = window.location.pathname + window.location.search;
        const redirectUrl = redirectTo.includes('?') 
          ? `${redirectTo}&redirect=${encodeURIComponent(currentPath)}`
          : `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
        
        router.push(redirectUrl);
      } else {
        // Allow rendering
        setShouldRender(true);
      }
    }
  }, [isInitialized, isLoading, isAuthenticated, requireAuth, redirectTo, router]);

  // Show loading while determining auth state
  if (isLoading || !isInitialized) {
    return (
      <div>
        {fallback || (
          <PageLoader 
            message={loadingMessage}
            variant="branded"
            fullScreen={true}
          />
        )}
      </div>
    );
  }

  // Show loading while redirecting
  if (isRedirecting) {
    return (
      <div>
        {fallback || (
          <PageLoader 
            message="Redirecting to login..."
            variant="branded"
            fullScreen={true}
          />
        )}
      </div>
    );
  }

  // Don't render if auth is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return (
      <div>
        {fallback || (
          <PageLoader 
            message="Redirecting..."
            variant="branded"
            fullScreen={true}
          />
        )}
      </div>
    );
  }

  // Don't render until we've determined it's safe to do so
  if (!shouldRender) {
    return (
      <div>
        {fallback || (
          <PageLoader 
            message="Loading..."
            variant="branded"
            fullScreen={true}
          />
        )}
      </div>
    );
  }

  return <div>{children}</div>;
}

// Higher-order component version
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<AuthGuardProps, 'children'> = {}
) {
  return function AuthGuardedComponent(props: P): JSX.Element {
    return (
      <AuthGuard {...options}>
        <Component {...props} />
      </AuthGuard>
    );
  };
}

// Hook for auth state with loading management
export function useAuthGuard(requireAuth = true) {
  const { isAuthenticated, isLoading, isInitialized, user } = useAuth();
  const router = useRouter();

  const checkAuth = (redirectTo = '/login') => {
    if (isInitialized && !isLoading && requireAuth && !isAuthenticated) {
      const currentPath = window.location.pathname + window.location.search;
      const redirectUrl = redirectTo.includes('?') 
        ? `${redirectTo}&redirect=${encodeURIComponent(currentPath)}`
        : `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
      
      router.push(redirectUrl);
      return false;
    }
    return isInitialized && !isLoading && (!requireAuth || isAuthenticated);
  };

  return {
    isAuthenticated,
    isLoading: isLoading || !isInitialized,
    isInitialized,
    user,
    checkAuth,
    canRender: isInitialized && !isLoading && (!requireAuth || isAuthenticated)
  };
}
