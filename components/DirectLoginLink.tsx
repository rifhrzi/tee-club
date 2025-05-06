'use client';

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from 'next/link';

interface DirectLoginLinkProps {
  children: React.ReactNode;
  className?: string;
}

export default function DirectLoginLink({ children, className = '' }: DirectLoginLinkProps) {
  const { token, user } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check authentication status
  useEffect(() => {
    setIsAuthenticated(!!token && !!user);
  }, [token, user]);
  
  // If authenticated, render children directly
  // If not authenticated, render a link to login with current page as redirect
  return isAuthenticated ? (
    <Link href="/checkout" className={className}>
      {children}
    </Link>
  ) : (
    <a 
      href="#" 
      className={className}
      onClick={(e) => {
        e.preventDefault();
        // Store the redirect path
        localStorage.setItem('login_redirect', '/checkout');
        // Navigate to login
        window.location.href = '/login';
      }}
    >
      {children}
    </a>
  );
}

