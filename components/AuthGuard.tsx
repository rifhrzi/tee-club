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
}

export default function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login',
  fallback 
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        // Redirect to login if authentication is required but user is not authenticated
        router.push(redirectTo);
      } else {
        // Allow rendering
        setShouldRender(true);
      }
    }
  }, [isLoading, isAuthenticated, requireAuth, redirectTo, router]);

  // Show loading while determining auth state
  if (isLoading) {
    return fallback || <PageLoader message="Checking authentication..." />;
  }

  // Don't render if auth is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return fallback || <PageLoader message="Redirecting to login..." />;
  }

  // Don't render until we've determined it's safe to do so
  if (!shouldRender) {
    return fallback || <PageLoader message="Loading..." />;
  }

  return <>{children}</>;
}

// Higher-order component version
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<AuthGuardProps, 'children'> = {}
) {
  return function AuthGuardedComponent(props: P) {
    return (
      <AuthGuard {...options}>
        <Component {...props} />
      </AuthGuard>
    );
  };
}

// Hook for auth state
export function useAuthGuard(requireAuth = true) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  const checkAuth = (redirectTo = '/login') => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      router.push(redirectTo);
      return false;
    }
    return !isLoading && (!requireAuth || isAuthenticated);
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    checkAuth,
    canRender: !isLoading && (!requireAuth || isAuthenticated)
  };
}
