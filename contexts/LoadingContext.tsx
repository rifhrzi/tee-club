'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import LoadingOverlay from '@/components/LoadingOverlay';

interface LoadingContextType {
  isLoading: boolean;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | undefined>(undefined);

  const startLoading = (message?: string) => {
    setLoadingMessage(message);
    setIsLoading(true);

    // Add automatic cleanup after 10 seconds as a fallback
    setTimeout(() => {
      console.log('LoadingContext: Auto-clearing loading state after timeout');
      setIsLoading(false);
      setLoadingMessage(undefined);
    }, 10000); // 10 second timeout
  };

  const stopLoading = () => {
    setIsLoading(false);
    setLoadingMessage(undefined);
  };

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
      <LoadingOverlay isLoading={isLoading} text={loadingMessage} transparent={true} />
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}
