"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import AuthLoadingScreen from './AuthLoadingScreen';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  session: any;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  session: null,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
  showLoadingScreen?: boolean;
}

export default function AuthProvider({ children, showLoadingScreen = true }: AuthProviderProps) {
  const { data: session, status } = useSession();
  const [isInitialized, setIsInitialized] = useState(false);
  const [showLoading, setShowLoading] = useState(true);

  // Determine authentication state
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated' && !!session;

  useEffect(() => {
    // Mark as initialized once we have a definitive auth state
    if (status !== 'loading') {
      setIsInitialized(true);
      
      // Add a minimum loading time for better UX (prevent flash)
      const minLoadingTime = 1000; // 1 second minimum
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, minLoadingTime);

      return () => clearTimeout(timer);
    }
  }, [status]);

  // Handle loading screen animation completion
  const handleAnimationComplete = () => {
    console.log('Auth loading animation completed');
  };

  const contextValue: AuthContextType = {
    isAuthenticated,
    isLoading: isLoading || !isInitialized,
    user: session?.user || null,
    session,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {/* Show loading screen during auth initialization */}
      {showLoadingScreen && (isLoading || !isInitialized || showLoading) && (
        <AuthLoadingScreen 
          isLoading={isLoading || !isInitialized}
          onAnimationComplete={handleAnimationComplete}
        />
      )}
      
      {/* Main content - only render when auth state is determined */}
      {(!showLoadingScreen || (!isLoading && isInitialized && !showLoading)) && (
        <div className="min-h-screen">
          {children}
        </div>
      )}
    </AuthContext.Provider>
  );
}
